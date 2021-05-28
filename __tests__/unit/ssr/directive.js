import { compile } from 'sham-ui-test-helpers';
import { ssr } from '../../../src/testing';

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

    const meta = await ssr(
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
    expect.assertions( 4 );

    const directive = jest.fn();
    directive.prototype.bind = jest.fn();
    directive.prototype.update = jest.fn();

    const directives = { directive };

    const meta = await ssr(
        compile`<div :directive={{ value }}/>`,
        {
            directives,
            value: true
        }
    );
    expect( directive ).toHaveBeenCalledWith( meta.component );
    expect( directive.prototype.bind ).toHaveBeenCalledWith( meta.component.nodes[ 0 ] );
    expect( directive.prototype.update ).toHaveBeenCalledWith( true );

    expect( meta.toJSON() ).toMatchSnapshot();
} );

it( 'ref directive', async() => {
    expect.assertions( 1 );

    const meta = await ssr(
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
    expect( meta.toJSON() ).toMatchSnapshot();
} );

it( 'ref directive with custom tag', async() => {
    expect.assertions( 2 );

    const meta = await ssr(
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
    expect( meta.toJSON() ).toMatchSnapshot();
} );

