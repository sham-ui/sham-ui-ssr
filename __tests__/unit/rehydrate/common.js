import { compile } from 'sham-ui-test-helpers';
import { ssrAndRehydrate } from '../../../src/testing';

it( 'should render simple DOM', async() => {
    expect.assertions( 2 );
    const meta = await ssrAndRehydrate(
        compile`<div>Content</div>`
    );
    expect( meta.html ).toBe( '<div>Content</div>' );
    expect( meta.toJSON() ).toMatchSnapshot();
} );

it( 'should insert variable in attributes', async() => {
    expect.assertions( 3 );
    const meta = await ssrAndRehydrate(
        compile`<input type="text" value="{{ value }}">`,
        {
            value: 'Value'
        }
    );
    expect( meta.component.nodes[ 0 ].value ).toEqual( 'Value' );
    expect( meta.html ).toBe( '<input type="text" value="Value">' );
    expect( meta.toJSON() ).toMatchSnapshot();
} );

it( 'should properly work with text constants in text nodes', async() => {
    expect.assertions( 2 );
    const meta = await ssrAndRehydrate(
        compile`<p>foo {{ bar }} baz</p>`,
        {
            bar: 'bar'
        }
    );
    expect( meta.html ).toBe( '<p>foo <!--0-->bar<!--1--> baz</p>' );
    expect( meta.toJSON() ).toMatchSnapshot();
} );

it( 'should properly work with text constants in attributes', async() => {
    expect.assertions( 2 );
    const meta = await ssrAndRehydrate(
        compile`<div class="foo {{ bar }} baz"></div>`,
        {
            bar: 'bar'
        }
    );
    expect( meta.html ).toBe( '<div class="foo baz bar"></div>' );
    expect( meta.toJSON() ).toMatchSnapshot();
} );

it( 'should save value for variables in complex cases', async() => {
    expect.assertions( 4 );
    const meta = await ssrAndRehydrate(
        compile`<div class="{{ foo }} {{ bar }}"></div>`,
        {
            foo: 'first',
            bar: 'second'
        }
    );
    expect( meta.html ).toBe( '<div class="first second"></div>' );
    expect( meta.toJSON() ).toMatchSnapshot();
    meta.component.update( {
        foo: 'updated'
    } );
    expect( meta.ctx.container.innerHTML ).toBe( '<div class="updated second"></div>' );
    expect( meta.toJSON() ).toMatchSnapshot();
} );

it( 'should properly work with more then one node on topmost level', async() => {
    expect.assertions( 2 );
    const meta = await ssrAndRehydrate(
        compile`
        <p>first</p>

        <p>second</p>
        `
    );
    expect( meta.html ).toBe( '<p>first</p><p>second</p>' );
    expect( meta.toJSON() ).toMatchSnapshot();
} );

it( 'should optimize "if"/"for" tag, if it is only child', async() => {
    expect.assertions( 2 );
    const meta = await ssrAndRehydrate(
        compile`
        <div>
            <p>
                {% if a %}a{% endif %}
            </p>

            <p>
                {% for b %}b{% endfor %}
            </p>
        </div>
        `,
        {
            a: true,
            b: [ 1 ]
        }
    );
    expect( meta.html ).toBe( '<div><p>a</p><p>b</p></div>' );
    expect( meta.toJSON() ).toMatchSnapshot();
} );

it( 'should place placeholders for multiply "if" tags', async() => {
    expect.assertions( 2 );
    const meta = await ssrAndRehydrate(
        compile`
        <div>
            {% if a %}a{% endif %}
            {% if b %}b{% endif %}
        </div>
        `
    );
    expect( meta.html ).toBe( '<div><!--0--><!--1--></div>' );
    expect( meta.toJSON() ).toMatchSnapshot();
} );

it( 'should place placeholders for multiply "if" and "for" tags', async() => {
    expect.assertions( 2 );
    const meta = await ssrAndRehydrate(
        compile`
        <div>
            {% if a %}a{% endif %}
            {% for b %}i{% endfor %}
        </div>
        `
    );
    expect( meta.html ).toBe( '<div><!--0--><!--1--></div>' );
    expect( meta.toJSON() ).toMatchSnapshot();
} );

it( 'should properly for with filters', async() => {
    expect.assertions( 2 );
    const filters = {
        append: function( value, text ) {
            return value + text;
        },
        upperCase: function( value ) {
            return value.toUpperCase();
        }
    };
    const meta = await ssrAndRehydrate(
        compile`<p>{{ text | append('case') | upperCase }}</p>`,
        { text: 'upper_' },
        { filters }
    );
    expect( meta.html ).toBe( '<p>UPPER_CASE</p>' );
    expect( meta.toJSON() ).toMatchSnapshot();
} );

it( 'should work with expressions', async() => {
    expect.assertions( 2 );
    const meta = await ssrAndRehydrate(
        compile`
        <a title="{{ (a + b) * c / d }}">{{ more.amazing + features[0] + features[1] }}</a>
        `,
        {
            a: 1,
            b: 2,
            c: 100,
            d: 2,
            more: {
                amazing: 'a'
            },
            features: [ 'b', 'c' ]
        }
    );
    expect( meta.html ).toBe( '<a title="150">abc</a>' );
    meta.component.update( { more: { amazing: 'Amazing!' } } );
    expect( meta.ctx.container.innerHTML ).toBe( '<a title="150">Amazing!bc</a>' );
} );

it( 'should render empty attributes', async() => {
    expect.assertions( 3 );
    const meta = await ssrAndRehydrate(
        compile`<input type="checkbox" value="" checked>`
    );
    expect( meta.html ).toBe( '<input type="checkbox" value="" checked>' );
    expect( meta.component.nodes[ 0 ].checked ).toEqual( true );
    expect( meta.toJSON() ).toMatchSnapshot();
} );

it( 'should render attributes without quotes', async() => {
    expect.assertions( 2 );
    const meta = await ssrAndRehydrate(
        compile`<div class={{ name }}></div>`,
        {
            name: 'name'
        }
    );
    expect( meta.html ).toBe( '<div class="name"></div>' );
    expect( meta.toJSON() ).toMatchSnapshot();
} );

it( 'should support global variables', async() => {
    expect.assertions( 4 );
    const first = await ssrAndRehydrate(
        compile`
        <i>
            {{ host == window.location.host ? 'expr' : '' }},
            {% if host == window.location.host %}if{% endif %},
            {% for i of [host == window.location.host] %}{{ i ? 'for' : '' }}{% endfor %},
            <i class="{{ host == window.location.host ? 'attr' : '' }}"></i>
        </i>
        `,
        {
            host: window.location.host
        }
    );
    expect( first.html ).toBe(
        '<i>expr<!--0-->, <!--1-->if<!--0-->, <!--2-->for<!--1-->, <i class="attr"></i></i>'
    );
    expect( first.toJSON() ).toMatchSnapshot();

    const second = await ssrAndRehydrate(
        compile`
            {{ Array.isArray(array) ? 'array' : '' }},
            {{ Math.pow(2, 2) }},
            {{ Object.keys(obj).join(';') }},
            {{ JSON.stringify(obj) }}
        `,
        {
            array: [ 1, 2, 3 ],
            obj: { a: 1, b: 2 }
        }
    );
    expect( second.html ).toBe(
        // eslint-disable-next-line max-len
        'array<!--0-->, <!--1-->4<!--2-->, <!--3-->a;b<!--4-->, <!--5-->{&quot;a&quot;:1,&quot;b&quot;:2}'
    );
    expect( second.toJSON() ).toMatchSnapshot();
} );

it( 'should support expressions without variables', async() => {
    expect.assertions( 2 );
    const meta = await ssrAndRehydrate(
        compile`{{ 1 + 2 * 3 }}`
    );
    expect( meta.html ).toBe( '7' );
    expect( meta.toJSON() ).toMatchSnapshot();
} );

it( 'should ignore all html comments', async() => {
    expect.assertions( 2 );
    const meta = await ssrAndRehydrate(
        compile`
            <!-- comment with <tags> and {{ expr }}, {% tags %}, --, #, //, >. (c). -->
            <span>Moon</span>
        `
    );
    expect( meta.html ).toBe( '<span>Moon</span>' );
    expect( meta.toJSON() ).toMatchSnapshot();
} );

it( 'should replace HTML entities with Unicode symbols', async() => {
    expect.assertions( 2 );
    const meta = await ssrAndRehydrate(
        compile`&quot;&amp;&apos;&lt;&gt;&copy;&pound;&plusmn;&para;&ensp;&mdash;&emsp;&euro;&thinsp;&hearts;&notExists;`
    );
    expect( meta.html ).toBe( '&quot;&amp;&#39;&lt;&gt;©£±¶ — € ♥&amp;notExists;' );
    expect( meta.toJSON() ).toMatchSnapshot();
} );

it( 'should ignore script tag content', async() => {
    expect.assertions( 2 );
    const meta = await ssrAndRehydrate(
        compile`<script> var result = 2 < 5;</script>`
    );
    expect( meta.html ).toBe( '<script> var result = 2 < 5;</script>' );
    expect( meta.toJSON() ).toMatchSnapshot();
} );

it( 'should support style attribute', async() => {
    expect.assertions( 2 );
    const meta = await ssrAndRehydrate(
        compile`<div \\style="background-color: red">DANGER</div>`
    );
    expect( meta.html ).toBe( '<div style="background-color: red">DANGER</div>' );
    expect( meta.toJSON() ).toMatchSnapshot();
} );

it( 'should support render checked == true attr', async() => {
    expect.assertions( 2 );
    const meta = await ssrAndRehydrate(
        compile`<input type="checkbox" checked={{true}}/>`
    );
    expect( meta.html ).toBe( '<input type="checkbox" checked>' );
    expect( meta.toJSON() ).toMatchSnapshot();
} );

it( 'should support don\'t render checked == false attr', async() => {
    expect.assertions( 2 );
    const meta = await ssrAndRehydrate(
        compile`<input type="checkbox" checked={{false}}/>`
    );
    expect( meta.html ).toBe( '<input type="checkbox">' );
    expect( meta.toJSON() ).toMatchSnapshot();
} );

it( 'should escape textContent', async() => {
    expect.assertions( 2 );
    const meta = await ssrAndRehydrate(
        compile`{{content}}`,
        {
            content: '<sciprt>alert(1)</script>'
        }
    );
    expect( meta.html ).toBe( '&lt;sciprt&gt;alert(1)&lt;/script&gt;' );
    expect( meta.toJSON() ).toMatchSnapshot();
} );

it( 'should escape attribute value', async() => {
    expect.assertions( 2 );
    const meta = await ssrAndRehydrate(
        compile`<button color={{value}}></button>`,
        {
            value: '" onclick="alert(1)"'
        }
    );
    expect( meta.html ).toBe(
        '<button color="&quot; onclick=&quot;alert(1)&quot;"></button>'
    );
    expect( meta.toJSON() ).toMatchSnapshot();
} );


it( 'should escape class atrribute', async() => {
    expect.assertions( 2 );
    const meta = await ssrAndRehydrate(
        compile`<button class={{value}}></button>`,
        {
            value: '" onclick="alert(1)"'
        }
    );
    expect( meta.html ).toBe(
        '<button class="&quot; onclick=&quot;alert(1)&quot;"></button>'
    );
    expect( meta.toJSON() ).toMatchSnapshot();
} );

it( 'should pass real onclick atrribute', async() => {
    expect.assertions( 2 );
    const meta = await ssrAndRehydrate(
        compile`<button onclick={{value}}></button>`,
        {
            value: 'alert(1)'
        }
    );
    expect( meta.html ).toBe(
        '<button onclick="alert(1)"></button>'
    );
    expect( meta.toJSON() ).toMatchSnapshot();
} );
