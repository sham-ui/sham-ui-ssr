import { compile } from 'sham-ui-test-helpers';
import { ssrAndRehydrate } from '../../../src/testing';

beforeEach( () => {
    window.CustomPanel = compile`
        <h1>{{ title }}</h1>
        <div>
            {{ content }}
        </div>
    `;
} );

afterEach( () => {
    delete window.CustomPanel;
} );

it( 'should properly work with attributes', async() => {
    expect.assertions( 2 );
    const meta = await ssrAndRehydrate(
        compile`
            <div>
                <CustomPanel title="string" content="text"/>
                <CustomPanel title="{{ value }}" content="{{ text }}"/>
            </div>
        `,
        {
            value: 'title',
            text: 'content'
        }
    );
    expect( meta.html ).toBe(
        '<div><h1>string</h1><div>text</div><!--0--><h1>title</h1><div>content</div><!--1--></div>'
    );
    meta.component.update( { value: 'updated' } );
    expect( meta.ctx.container.innerHTML ).toBe(
        // eslint-disable-next-line max-len
        '<div><h1>string</h1><div>text</div><!--0--><h1>updated</h1><div>content</div><!--1--></div>'
    );
} );
