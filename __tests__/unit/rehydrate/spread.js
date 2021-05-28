import { compile } from 'sham-ui-test-helpers';
import { ssrAndRehydrate } from '../../../src/testing';

beforeEach( () => {
    window.SpreadCustom = compile`
        <i>{{ foo }}</i>
        <i>{{ boo }}</i>
        <i>{{ bar }}</i>
    `;
} );

afterEach( () => {
    delete window.SpreadCustom;
} );

it( 'should render arrays', async() => {
    expect.assertions( 4 );
    const meta = await ssrAndRehydrate(
        compile`
            <ul>
                {% for key, value of list %}
                    <li>{{ key }}:{{ value }}</li>
                {% endfor %}
            </ul>
        `,
        {
            list: [ 1, 2, 3 ]
        }
    );
    expect( meta.html ).toBe(
        // eslint-disable-next-line max-len
        '<ul><li>0<!--0-->:<!--1-->1</li><li>1<!--0-->:<!--1-->2</li><li>2<!--0-->:<!--1-->3</li></ul>'
    );

    meta.component.update( { list: [ 1, 3 ] } );
    expect( meta.component.container.innerHTML ).toBe(
        '<ul><li>0<!--0-->:<!--1-->1</li><li>1<!--0-->:<!--1-->3</li></ul>'
    );

    meta.component.update( { list: [ 'a', 'b', 'c', 'd' ] } );
    expect( meta.component.container.innerHTML ).toBe(
        '<ul><li>0<!--0-->:<!--1-->a</li><li>1<!--0-->:<!--1-->b</li><li>2:c</li><li>3:d</li></ul>'
    );
    expect( meta.toJSON() ).toMatchSnapshot();
} );

it( 'should work for html elements', async() => {
    expect.assertions( 2 );
    const meta = await ssrAndRehydrate(
        compile`
            <div {{...attr}}></div>
        `,
        {
            attr: {
                id: 'id',
                'data-attr': 'data',
                'class': 'foo'
            }
        }
    );
    expect( meta.html ).toBe( '<div id="id" data-attr="data" class="foo"></div>' );
    expect( meta.toJSON() ).toMatchSnapshot();
} );

it( 'should override default attributes', async() => {
    expect.assertions( 3 );
    const meta = await ssrAndRehydrate(
        compile`<div id="foo" {{...attr}}></div>`
    );
    expect( meta.html ).toBe( '<div id="foo"></div>' );

    meta.component.update( {
        attr: {
            id: 'boo'
        }
    } );
    expect( meta.component.container.innerHTML ).toBe( '<div id="boo"></div>' );
    expect( meta.toJSON() ).toMatchSnapshot();
} );

it( 'should override variables attributes', async() => {
    expect.assertions( 4 );
    const meta = await ssrAndRehydrate(
        compile`
            <div id="{{ id }}" {{...attr}}></div>
        `,
        {
            id: 'foo'
        }
    );
    expect( meta.html ).toBe( '<div id="foo"></div>' );

    meta.component.update( {
        attr: {
            id: 'boo'
        }
    } );
    expect( meta.component.container.innerHTML ).toBe( '<div id="boo"></div>' );

    meta.component.update( { id: 'bar', attr: {} } );
    expect( meta.component.container.innerHTML ).toBe( '<div id="bar"></div>' );
    expect( meta.toJSON() ).toMatchSnapshot();
} );

it( 'should work for custom tags', async() => {
    expect.assertions( 3 );
    const meta = await ssrAndRehydrate(
        compile`
            <div>
                <SpreadCustom {{...attr}}/>
            </div>
        `,
        {
            attr: {
                foo: 'foo',
                boo: 'boo',
                bar: 'bar'
            }
        }
    );
    expect( meta.html ).toBe( '<div><i>foo</i><i>boo</i><i>bar</i></div>' );

    meta.component.update( {
        attr: {
            boo: 'Boo-Ya'
        }
    } );
    expect( meta.component.container.innerHTML ).toBe(
        // eslint-disable-next-line max-len
        '<div><i>foo</i><i>Boo-Ya</i><i>bar</i></div>'
    );
    expect( meta.toJSON() ).toMatchSnapshot();
} );

it( 'should work for custom tags with constant attributes values', async() => {
    expect.assertions( 4 );
    const meta = await ssrAndRehydrate(
        compile`
            <div>
                <SpreadCustom {{...attr}} foo="foo"/>
            </div>
        `
    );
    expect( meta.html ).toBe( '<div><i>foo</i><i> </i><i> </i></div>' );

    meta.component.update( {
        attr: {
            boo: 'boo',
            bar: 'bar'
        }
    } );
    expect( meta.component.container.innerHTML ).toBe(
        '<div><i>foo</i><i>boo</i><i>bar</i></div>'
    );

    meta.component.update( {
        attr: {
            foo: 'over foo'
        }
    } );
    expect( meta.component.container.innerHTML ).toBe(
        '<div><i>over foo</i><i>boo</i><i>bar</i></div>'
    );
    expect( meta.toJSON() ).toMatchSnapshot();
} );

it( 'should work for custom tags with attributes with values', async() => {
    expect.assertions( 5 );
    const meta = await ssrAndRehydrate(
        compile`
            <div>
                <SpreadCustom {{...attr}} foo="{{ foo }}"/>
            </div>
        `
    );
    expect( meta.html ).toBe( '<div></div>' );

    meta.component.update( {
        attr: {
            boo: 'boo',
            bar: 'bar'
        }
    } );
    expect( meta.component.container.innerHTML ).toBe( '<div><i></i><i>boo</i><i>bar</i></div>' );

    meta.component.update( {
        foo: 'foo'
    } );
    expect( meta.component.container.innerHTML ).toBe(
        '<div><i>foo</i><i>boo</i><i>bar</i></div>'
    );

    meta.component.update( {
        attr: {
            foo: 'over foo'
        },
        foo: 'for'
    } );
    expect( meta.component.container.innerHTML ).toBe(
        '<div><i>for</i><i>boo</i><i>bar</i></div>'
    );
    expect( meta.toJSON() ).toMatchSnapshot();
} );

it( 'should work for custom tags proxy __data__', async() => {
    expect.assertions( 3 );
    const meta = await ssrAndRehydrate(
        compile`
            <div>
                <SpreadCustom {{...this.__data__}}/>
            </div>
        `,
        {
            foo: 'foo',
            boo: 'boo',
            bar: 'bar'
        }
    );
    expect( meta.html ).toBe( '<div><i>foo</i><i>boo</i><i>bar</i></div>' );

    meta.component.update( {
        boo: 'Boo-Ya'
    } );
    expect( meta.component.container.innerHTML ).toBe(
        '<div><i>foo</i><i>Boo-Ya</i><i>bar</i></div>'
    );
    expect( meta.toJSON() ).toMatchSnapshot();
} );
