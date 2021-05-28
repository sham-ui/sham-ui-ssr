import { compile } from 'sham-ui-test-helpers';
import { ssr } from '../../../src/testing';

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
    expect.assertions( 2 );
    const meta = await ssr(
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
    expect( meta.toJSON() ).toMatchSnapshot();
} );

it( 'should work for html elements', async() => {
    expect.assertions( 2 );
    const meta = await ssr(
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
    expect.assertions( 2 );
    const meta = await ssr(
        compile`<div id="foo" {{...attr}}></div>`
    );
    expect( meta.html ).toBe( '<div id="foo"></div>' );

    meta.component.update( {
        attr: {
            id: 'boo'
        }
    } );
    expect( meta.toJSON() ).toMatchSnapshot();
} );

it( 'should override variables attributes', async() => {
    expect.assertions( 2 );
    const meta = await ssr(
        compile`
            <div id="{{ id }}" {{...attr}}></div>
        `,
        {
            id: 'foo'
        }
    );
    expect( meta.html ).toBe( '<div id="foo"></div>' );
    expect( meta.toJSON() ).toMatchSnapshot();
} );

it( 'should work for custom tags', async() => {
    expect.assertions( 2 );
    const meta = await ssr(
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
    expect( meta.toJSON() ).toMatchSnapshot();
} );

it( 'should work for custom tags with constant attributes values', async() => {
    expect.assertions( 2 );
    const meta = await ssr(
        compile`
            <div>
                <SpreadCustom {{...attr}} foo="foo"/>
            </div>
        `
    );
    expect( meta.html ).toBe( '<div><i>foo</i><i> </i><i> </i></div>' );
    expect( meta.toJSON() ).toMatchSnapshot();
} );

it( 'should work for custom tags with attributes with values', async() => {
    expect.assertions( 2 );
    const meta = await ssr(
        compile`
            <div>
                <SpreadCustom {{...attr}} foo="{{ foo }}"/>
            </div>
        `
    );
    expect( meta.html ).toBe( '<div></div>' );
    expect( meta.toJSON() ).toMatchSnapshot();
} );

it( 'should work for custom tags proxy __data__', async() => {
    expect.assertions( 2 );
    const meta = await ssr(
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
    expect( meta.toJSON() ).toMatchSnapshot();
} );

