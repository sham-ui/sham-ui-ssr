import { compile, compileAsSFC } from 'sham-ui-test-helpers';
import { ssrAndRehydrate } from '../../../src/testing';

it( 'should single file component work', async() => {
    expect.assertions( 3 );
    const meta = await ssrAndRehydrate(
        compileAsSFC`
        <template>
            {% if loaded %}
                Loaded!
            {% endif %}
        </template>
        
        <script>
            export default Component( Template );
        </script>
        `,
        {
            loaded: false
        }
    );
    expect( meta.html ).toBe( '<!--0-->' );
    meta.component.update( { loaded: true } );
    expect( meta.ctx.container.innerHTML ).toBe( ' Loaded! <!--0-->' );
    expect( meta.toJSON() ).toMatchSnapshot();
} );

it( 'should single file component correct work with options', async() => {
    expect.assertions( 3 );
    const meta = await ssrAndRehydrate(
        compileAsSFC`
        <template>
            {% if loaded %}
                {{text}}
            {% endif %}
        </template>
        
        <script>
            export default Component( Template, function( options ) {
                const text = $(); 
                options( {
                    [ text ]: {
                        get() {
                            return 'Text for content'
                        }
                    }
                } );
            } );
        </script>
        `,
        {
            loaded: false
        }
    );
    expect( meta.html ).toBe( '<!--0-->' );
    meta.component.update( { loaded: true } );
    expect( meta.ctx.container.innerHTML ).toBe( 'Text for content<!--0-->' );
    expect( meta.toJSON() ).toMatchSnapshot();
} );

it( 'should single file component correct work with context in blocks', async() => {
    expect.assertions( 2 );
    window.CustomPanel = compile`
        <div>
            <div class="title">
                {% defblock 'title' %}
            </div>
        </div>
    `;
    const meta = await ssrAndRehydrate(
        compileAsSFC`
        <template>
            <CustomPanel>
                {% block 'title' %}
                    {{this.title()}}
                {% endblock %}
            </CustomPanel>
        </template>
        
        <script>
            export default Component( Template, function() {
                this.title = () => {
                    return 'Title text'
                };
            } );
        </script>
        `
    );
    expect( meta.html ).toBe(
        // eslint-disable-next-line max-len
        '<div><div class="title"> <!--0-->Title text<!--1--> <!--0--></div></div><!--0-->'
    );
    expect( meta.toJSON() ).toMatchSnapshot();
    delete window.CustomPanel;
} );

it( 'should work with class getters in expressions', async() => {
    expect.assertions( 2 );
    const meta = await ssrAndRehydrate(
        compileAsSFC`
        <template>
            <span>{{this.user}}</span>
        </template>
        
        <script>
            export default Component( Template, function() {
                this.user = 'John Smith'; 
            } );
        </script>
        `
    );
    expect( meta.html ).toBe( '<span>John Smith</span>' );
    expect( meta.toJSON() ).toMatchSnapshot();
} );

it( 'should work with class getters in if', async() => {
    expect.assertions( 2 );
    const meta = await ssrAndRehydrate(
        compileAsSFC`
        <template>
            {% if this.isVisible %}
                <span>{{user}}</span>
            {% endif %}
        </template>
        
        <script>
            export default Component( Template, function() {
                this.isVisible = true;
            } );
        </script>
        `,
        {
            user: 'Joh Smith'
        }
    );
    expect( meta.html ).toBe( '<span>Joh Smith</span><!--0-->' );
    expect( meta.toJSON() ).toMatchSnapshot();
} );

it( 'should work with class property in for', async() => {
    expect.assertions( 2 );
    const meta = await ssrAndRehydrate(
        compileAsSFC`
        <template>
            <ul>
                {% for user of userList %}
                    <li>{{user}}</li>
                {% endfor %}
            </ul>
        </template>
        
        <script>
            export default Component( Template, function( options ) {
                const userList = $(); 
                options( {
                    [ userList ]: [ 
                        'John Smith',
                        'Adam Mock'
                     ]
                } );
            } );
        </script>
        `
    );
    expect( meta.html ).toBe(
        '<ul><li>John Smith</li><li>Adam Mock</li></ul>'
    );
    expect( meta.toJSON() ).toMatchSnapshot();
} );
