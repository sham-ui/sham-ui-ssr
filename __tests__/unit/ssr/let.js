import { compileAsSFC, compile } from 'sham-ui-test-helpers';
import { ssr } from '../../../src/testing';

it( 'should single file component work', async() => {
    expect.assertions( 2 );
    const meta = await ssr(
        compileAsSFC`
        <template>
            {% let sum = a + b %}
            <ul>
                <li>{{ sum }}</li>
                <li>{{ sum - a }}</li>
                <li>{{ sum - b }}</li>
            </ul>
        </template>
        
        <script>
            export default Component( Template );
        </script>
        `,
        {
            a: 1,
            b: 2
        }
    );
    expect( meta.html ).toBe( '<ul><li>3</li><li>2</li><li>1</li></ul>' );
    expect( meta.toJSON() ).toMatchSnapshot();
} );

it( 'should single file component and methods work', async() => {
    expect.assertions( 2 );
    const meta = await ssr(
        compileAsSFC`
        <template>
            {% let sum = this.sum( a, b ) %}
            <ul>
                <li>{{ sum }}</li>
                <li>{{ sum - a }}</li>
                <li>{{ sum - b }}</li>
            </ul>
        </template>
        
        <script>
            export default Component( Template, function() {
                this.sum = function( a, b ) {
                    return a + b;
                }
            } );
        </script>
        `,
        {
            a: 1,
            b: 2
        }
    );
    expect( meta.html ).toBe( '<ul><li>3</li><li>2</li><li>1</li></ul>' );
    expect( meta.toJSON() ).toMatchSnapshot();
} );

it( 'should work in for loop', async() => {
    expect.assertions( 2 );
    const meta = await ssr(
        compileAsSFC`
        <template>
            {% let sum = this.sum( arr ) %}
            <ul>
                {% for item of arr %}
                    <li>{{ sum - item }}</li>
                {% endfor %}
            </ul>
        </template>
        
        <script>
            export default Component( Template, function() {
                this.sum = function( arr ) {
                    return arr.reduce( ( acc, x ) => acc + x, 0 );
                }
            } )
        </script>
        `,
        {
            arr: [ 1, 2, 3 ]
        }
    );
    expect( meta.html ).toBe( '<ul><li>5</li><li>4</li><li>3</li></ul>' );
    expect( meta.toJSON() ).toMatchSnapshot();
} );

it( 'should work with const', async() => {
    expect.assertions( 2 );
    const meta = await ssr(
        compile`
            {% let sum = 42 %}
            {{ sum * 2 }}
        `
    );
    expect( meta.html ).toBe( '84' );
    expect( meta.toJSON() ).toMatchSnapshot();
} );

it( 'should\'t update let vars', async() => {
    expect.assertions( 2 );
    const meta = await ssr(
        compile`
            {% let sum = 42 %}
            {{ sum * 2 }}
        `
    );
    expect( meta.html ).toBe( '84' );
    expect( meta.toJSON() ).toMatchSnapshot();
} );

it( 'should correct build spots order', async() => {
    expect.assertions( 2 );
    const meta = await ssr(
        compile`
            {% let sum = a + b + c %}
            <ul>
                <li>{{ sum }}</li>
                <li>{{ sum - a }}</li>
                <li>{{ a + b }}</li>
            </ul>
        `,
        {
            a: 1,
            b: 2,
            c: 3
        }
    );
    expect( meta.html ).toBe( '<ul><li>6</li><li>5</li><li>3</li></ul>' );
    expect( meta.toJSON() ).toMatchSnapshot();
} );
