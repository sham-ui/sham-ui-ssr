import { compile } from 'sham-ui-test-helpers';
import { ssr } from '../../../src/testing';

it( 'should insert constants as HTML', async() => {
    expect.assertions( 2 );
    const meta = await ssr(
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
    expect.assertions( 2 );
    const meta = await ssr(
        compile`
            <div>
                {% unsafe html %}
            </div>
        `
    );
    expect( meta.html ).toBe( '<div></div>' );
    expect( meta.toJSON() ).toMatchSnapshot();
} );

it( 'should remove old DOM nodes and insert new', async() => {
    expect.assertions( 2 );
    const meta = await ssr(
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
    expect( meta.toJSON() ).toMatchSnapshot();
} );

it( 'should insert unsafe with placeholders', async() => {
    expect.assertions( 2 );
    const meta = await ssr(
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
    expect( meta.toJSON() ).toMatchSnapshot();
} );

it( 'if with unsafe tag', async() => {
    expect.assertions( 2 );
    const meta = await ssr(
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
    expect( meta.toJSON() ).toMatchSnapshot();
} );

it( 'should work with first level non-elements', async() => {
    expect.assertions( 2 );
    const meta = await ssr(
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
