import { compile } from 'sham-ui-test-helpers';
import { ssrAndRehydrate } from '../../../src/testing';

beforeEach( () => {
    window.Custom = compile`
        <div id="custom" :ref={{name}}>{{name}}</div>
    `;
    window.Ref = class {
        constructor( component ) {
            this.component = component;
            this.node = null;
            this.name = null;
        }

        bind( node ) {
            this.node = node;
        }

        unbind() {
            this.node = null;
            if ( this.name ) {
                delete this.component[ this.name ];
            }
            this.name = null;
        }

        update( name ) {
            this.name = name;
            this.component[ name ] = this.node;
        }
    };
} );

afterEach( () => {
    delete window.Custom;
    delete window.Ref;
} );

it( 'should be trimmed from html', async() =>{
    expect.assertions( 2 );

    function directiveMock() {
        return function() {
            this.bind = function() {};
            this.update = function() {};
            this.unbind = function() {};
        };
    }

    const directives = {
        fade: directiveMock(),
        show: directiveMock(),
        content: directiveMock()
    };

    const meta = await ssrAndRehydrate(
        compile`
            <div :fade/>
            <div :show={{ visible }}/>
            <div :content="come {{ text }}"/>
        `,
        {
            directives
        }
    );
    expect( meta.html ).toBe( '<div></div><div></div><div></div>' );
    expect( meta.toJSON() ).toMatchSnapshot();
} );

it( 'methods bind, update, unbind should be called', async() => {
    expect.assertions( 5 );

    const directive = jest.fn();
    directive.prototype.bind = jest.fn();
    directive.prototype.update = jest.fn();
    directive.prototype.unbind = jest.fn();

    const directives = { directive };

    const meta = await ssrAndRehydrate(
        compile`<div :directive={{ value }}/>`,
        {
            directives,
            value: true
        }
    );
    expect( directive ).toHaveBeenCalledWith( meta.component );
    expect( directive.prototype.bind ).toHaveBeenCalledWith( meta.component.nodes[ 0 ] );
    expect( directive.prototype.update ).toHaveBeenCalledWith( true );

    meta.component.remove();

    expect( directive.prototype.unbind ).toHaveBeenCalledWith( meta.component.nodes[ 0 ] );
    expect( meta.toJSON() ).toMatchSnapshot();
} );

it( 'ref directive', async() => {
    expect.assertions( 10 );

    const meta = await ssrAndRehydrate(
        compile`
            <div>
                <div id="foo" :ref="foo">
                    {% if test %}
                        <div id="test-true" :ref={{ test + "Inner"}}></div>
                    {% else %}
                        <div id="test-false" :ref={{ test + "Inner"}}></div>
                    {% endif %}
                </div>            
            </div>
        `,
        {
            directives: {
                ref: window.Ref
            },
            test: true
        }
    );
    expect( meta.component.foo.id ).toBe( 'foo' );
    expect( meta.component.trueInner.id ).toBe( 'test-true' );
    expect( meta.component.falseInner ).toBe( undefined );

    meta.component.update( { test: false } );

    expect( meta.component.foo.id ).toBe( 'foo' );
    expect( meta.component.trueInner ).toBe( undefined );
    expect( meta.component.falseInner.id ).toBe( 'test-false' );

    meta.component.remove();

    expect( meta.component.foo ).toBe( undefined );
    expect( meta.component.trueInner ).toBe( undefined );
    expect( meta.component.falseInner ).toBe( undefined );
    expect( meta.toJSON() ).toMatchSnapshot();
} );

it( 'ref directive with custom tag', async() => {
    expect.assertions( 6 );

    const meta = await ssrAndRehydrate(
        compile`
            <div>
                <div id="foo" :ref="foo">
                    {% if test %}
                        <Custom name="foo"/>
                    {% else %}
                        <Custom name="bar"/>
                    {% endif %}
                </div>            
            </div>
        `,
        {
            directives: {
                ref: window.Ref
            },
            test: true
        }
    );
    expect( meta.html ).toBe(
        '<div><div id="foo"><div id="custom">foo</div><!--0--></div></div>'
    );
    expect( meta.component.foo.id ).toBe( 'foo' );
    expect( meta.component.bar ).toBe( undefined );

    meta.component.update( { test: false } );

    expect( meta.component.foo.id ).toBe( 'foo' );
    expect( meta.component.bar ).toBe( undefined );
    expect( meta.toJSON() ).toMatchSnapshot();
} );

