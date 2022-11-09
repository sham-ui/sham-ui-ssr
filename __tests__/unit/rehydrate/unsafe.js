import { compile } from 'sham-ui-test-helpers';
import { ssrAndRehydrate } from '../../../src/testing';

it( 'should insert constants as HTML', async() => {
    expect.assertions( 2 );
    const meta = await ssrAndRehydrate(
        compile`
            <div>
                {% unsafe "<br>" %}
            </div>
        `
    );
    expect( meta.html ).toBe( '<div><br></div>' );
    expect( meta.toJSON() ).toMatchSnapshot();
} );

it( 'should insert variables as HTML', async() => {
    expect.assertions( 3 );
    const meta = await ssrAndRehydrate(
        compile`
            <div>
                {% unsafe html %}
            </div>
        `
    );
    expect( meta.html ).toBe( '<div></div>' );

    meta.component.update( { html: '<a href="javascript:XSS;">Link</a>' } );
    expect( meta.ctx.container.innerHTML ).toBe(
        '<div><a href="javascript:XSS;">Link</a></div>'
    );
    expect( meta.toJSON() ).toMatchSnapshot();
} );

it( 'should remove old DOM nodes and insert new', async() => {
    expect.assertions( 5 );
    const meta = await ssrAndRehydrate(
        compile`
            <div>
                {% unsafe html %}
            </div>
        `,
        {
            html: '<div>foo</div><br>'
        }
    );
    expect( meta.html ).toBe( '<div><div>foo</div><br></div>' );

    meta.component.update( { html: '<input type="datetime"><hr><div>baz</div>' } );
    expect( meta.ctx.container.innerHTML ).toBe(
        '<div><input type="datetime"><hr><div>baz</div></div>'
    );

    meta.component.update( { html: '' } );
    expect( meta.ctx.container.innerHTML ).toBe( '<div></div>' );

    meta.component.update( { html: '<!-- comment -->' } );
    expect( meta.ctx.container.innerHTML ).toBe( '<div><!-- comment --></div>' );
    expect( meta.toJSON() ).toMatchSnapshot();
} );

it( 'should insert unsafe with placeholders', async() => {
    expect.assertions( 3 );
    const meta = await ssrAndRehydrate(
        compile`
            <div>
                {% unsafe "<br>" %}
            </div>
            <div>
                {% unsafe html %}
            </div>
        `,
        {
            html: '<hr>'
        }
    );
    expect( meta.html ).toBe( '<div><br></div><div><hr></div>' );

    meta.component.update( { html: '<br><!-- comment --><link href="http://ShamUIView.js.org">' } );
    expect( meta.ctx.container.innerHTML ).toBe(

        // eslint-disable-next-line max-len
        '<div><br></div><div><br><!-- comment --><link href="http://ShamUIView.js.org"></div>'
    );
    expect( meta.toJSON() ).toMatchSnapshot();
} );

it( 'if with unsafe tag', async() => {
    expect.assertions( 4 );
    const meta = await ssrAndRehydrate(
        compile`
            <div>
                {% if test %}
                    <div>
                        {% unsafe "<i>unsafe</i>" %}
                    </div>
                {% endif %}
            </div>
        `,
        {
            test: true
        }
    );
    expect( meta.html ).toBe( '<div><div><i>unsafe</i></div></div>' );

    meta.component.update( { test: false } );
    expect( meta.ctx.container.innerHTML ).toBe( '<div></div>' );

    meta.component.update( { test: true } );
    expect( meta.ctx.container.innerHTML ).toBe( '<div><div><i>unsafe</i></div></div>' );
    expect( meta.toJSON() ).toMatchSnapshot();
} );

it( 'should work with first level non-elements', async() => {
    expect.assertions( 2 );
    const meta = await ssrAndRehydrate(
        compile`
            text
            {% if cond1 %}
                <div class="if">ok</div>
            {% endif %}
            {% for loop1 %}
                <div class="for">ok</div>
            {% endfor %}
            <div on="{{ tag }}">
                <div class="custom">ok</div>
            </div>
            <div>
                {% unsafe "<i class='unsafe'>" + xss + "</i>" %}
            </div>
        `,
        {
            cond1: true,
            loop1: [ 1, 2, 3 ],
            tag: true,
            xss: 'ok'
        }
    );
    expect( meta.html ).toBe(
        //eslint-disable-next-line max-len
        'text <div class="if">ok</div><!--0--><div class="for">ok</div><div class="for">ok</div><div class="for">ok</div><!--1--><div on="true"><div class="custom">ok</div></div><div><i class=\'unsafe\'>ok</i></div>'
    );
    expect( meta.toJSON() ).toMatchSnapshot();
} );
