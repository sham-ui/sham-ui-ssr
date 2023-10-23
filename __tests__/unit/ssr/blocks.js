import { compile, compileAsSFC } from 'sham-ui-test-helpers';
import { ssr } from '../../../src/testing';

beforeEach( () => {
    window.LinkTo = compile`
        <a href={{url}}>
            {% defblock %}
        </a>
    `;

    window.DisplayContent = compile`
        {% if condition %}
            {% defblock %}
        {% endif %}
    `;
    window.TextContent = compile`
        <span>
            {% defblock %}
        </span>
    `;
} );

afterEach( () => {
    delete window.LinkTo;
    delete window.DisplayContent;
    delete window.TextContent;
} );

it( 'should work with {% block "default" %}', async() => {
    expect.assertions( 2 );
    const meta = await ssr(
        compile`
            <div>
                <LinkTo>
                    {% default %}
                        Text for content
                    {% end default %}
                </LinkTo>
            </div>
        `,
        {}
    );
    expect( meta.html ).toBe(
        '<div><a> Text for content <!--0--></a></div>'
    );
    expect( meta.toJSON() ).toMatchSnapshot();
} );

it( 'should work with two named blocks', async() => {
    expect.assertions( 2 );
    window.CustomPanel = compile`
        <div>
            <div class="title">
                {% defblock title %}
            </div>
            <div class="content">
                {% defblock %}
            </div>
        </div>
    `;
    const meta = await ssr(
        compile`
            <div>
                <CustomPanel>
                    {% title %}
                        Text for title
                    {% end title %}

                    {% default %}
                        Text for content
                    {% end default %}
                </CustomPanel>
            </div>
        `,
        {}
    );
    expect( meta.html ).toBe(
        // eslint-disable-next-line max-len
        '<div><div><div class="title"> Text for title <!--0--></div><div class="content"> Text for content <!--1--></div></div></div>'
    );
    expect( meta.toJSON() ).toMatchSnapshot();
    delete window.CustomPanel;
} );

it( 'should work with component arguments', async() => {
    expect.assertions( 2 );
    const meta = await ssr(
        compile`
            <div>
                <LinkTo url={{url}}>
                    {% default %}
                        Text for {{url}}
                    {% end default %}
                </LinkTo>
            </div>
        `,
        {
            url: 'http://example.com'
        }
    );
    expect( meta.html ).toBe(
        // eslint-disable-next-line max-len
        '<div><a href="http://example.com"> Text for <!--0-->http://example.com<!--1--> <!--0--></a></div>'
    );
    expect( meta.toJSON() ).toMatchSnapshot();
} );

it( 'should work with component default block', async() => {
    expect.assertions( 2 );
    const meta = await ssr(
        compile`
            <div>
                <LinkTo url={{url}}>
                    Text for {{url}}
                </LinkTo>
            </div>
        `,
        {
            url: 'http://example.com'
        }
    );
    expect( meta.html ).toBe(
        // eslint-disable-next-line max-len
        '<div><a href="http://example.com"> Text for <!--0-->http://example.com<!--0--></a></div>'
    );
    expect( meta.toJSON() ).toMatchSnapshot();
} );

it( 'should remove block in if', async() => {
    expect.assertions( 2 );
    window.VisibleBlock = compile`
        {% if visible %}
            <div class="content">
                {% defblock %}
            </div>
        {% endif %}
    `;
    const meta = await ssr(
        compile`
            <VisibleBlock visible={{visible}}>
                Text content for {{data}}
            </VisibleBlock>
        `,
        {
            visible: true,
            data: 'foo'
        }
    );
    expect( meta.html ).toBe(
        // eslint-disable-next-line max-len
        '<div class="content"> Text content for <!--0-->foo<!--0--></div><!--0--><!--0-->'
    );
    expect( meta.toJSON() ).toMatchSnapshot();
    delete window.VisibleBlock;
} );

it( 'should work with two nested if', async() => {
    expect.assertions( 2 );
    window.BigRedButton = compile`
        {% if big %}
            {% if red %}
                <button class="big red">This button big={{big}}, red={{red}}{% defblock %}</button>
            {% endif %}
        {% endif %}
    `;
    const meta = await ssr(
        compile`
            <BigRedButton big={{big}} red={{red}}>
                big && red
            </BigRedButton>
        `,
        {
            big: false,
            red: false
        }
    );
    expect( meta.html ).toBe( '<!--0--><!--0-->' );
    expect( meta.toJSON() ).toMatchSnapshot();
    delete window.BigRedButton;
} );

it( 'should work with defblock nested in useblock', async() => {
    expect.assertions( 2 );
    window.LoadedContainer = compile`
        {% if loaded %}
            {% defblock %}
        {% endif %}
    `;
    window.LoadedVisibleContainer = compile`
        <LoadedContainer loaded={{loaded}}>
            {% if visible %}
                {% defblock %}
            {% endif %}
        </LoadedContainer>
    `;
    window.RedLoadedVisibleContainer = compile`
        <LoadedVisibleContainer loaded={{loaded}} visible={{visible}}>
            {% if red %}
                {% defblock %}
            {% endif %}
        </LoadedVisibleContainer>
    `;
    const meta = await ssr(
        compile`
            <RedLoadedVisibleContainer loaded={{loaded}} visible={{visible}} red={{red}}>
                red && loaded & visible
            </RedLoadedVisibleContainer>
        `,
        {
            red: false,
            loaded: false,
            visible: false
        }
    );
    expect( meta.html ).toBe(
        // eslint-disable-next-line max-len
        '<!--0--><!--0--><!--0--><!--0-->'
    );
    expect( meta.toJSON() ).toMatchSnapshot();
    delete window.LoadedContainer;
    delete window.LoadedVisibleContainer;
    delete window.RedLoadedVisibleContainer;
} );

it( 'should work with for', async() => {
    expect.assertions( 2 );
    const meta = await ssr(
        compile`
            <ul>
                {% for url of links %}
                    <li>
                        <LinkTo url={{url}}>Text for {{url}}</LinkTo>
                    </li>
                {% endfor %}
            </ul>
            <LinkTo url="http://example.com">Home</LinkTo>
        `,
        {
            links: [
                'http://foo.example.com',
                'http://bar.example.com',
                'http://baz.example.com'
            ]
        }
    );
    expect( meta.html ).toBe(
        '<ul>' +
            // eslint-disable-next-line max-len
            '<li><a href="http://foo.example.com">Text for <!--0-->http://foo.example.com<!--0--></a></li>' +
            // eslint-disable-next-line max-len
            '<li><a href="http://bar.example.com">Text for <!--0-->http://bar.example.com<!--0--></a></li>' +
            // eslint-disable-next-line max-len
            '<li><a href="http://baz.example.com">Text for <!--0-->http://baz.example.com<!--0--></a></li>' +
        '</ul>' +
        '<a href="http://example.com">Home<!--0--></a><!--0-->'
    );
    expect( meta.toJSON() ).toMatchSnapshot();
} );

it( 'should work useblock if was update from block component', async() => {
    expect.assertions( 1 );
    const meta = await ssr(
        compile`
            <DisplayContent>
                Content
            </DisplayContent>
        `,
        {

        }
    );
    expect( meta.toJSON() ).toMatchSnapshot();
} );

it( 'should correct resolve owner', async() => {
    expect.assertions( 1 );
    const meta = await ssr(
        compileAsSFC`
            <template>
                <TextContent>
                    <TextContent>
                        {{this._text()}}
                    </TextContent>
                </TextContent>
            </template>

            <script>
                export default Component( Template, function( options ) {
                    const state = options( {
                        text() {
                            return 'Text for content'    
                        }
                    } );
                    this._text = () => state.text(); 
                } );
            </script>
        `
    );
    expect( meta.toJSON() ).toMatchSnapshot();
} );


