import { compileAsSFC, compile } from 'sham-ui-test-helpers';
import { ssrAndRehydrate } from '../../../src/testing';

it( 'should single file component work', async() => {
    expect.assertions( 2 );
    const { component, html } = await ssrAndRehydrate(
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
    expect( html ).toBe( '<ul><li>3</li><li>2</li><li>1</li></ul>' );
    component.update( { a: 3 } );
    expect( component.container.innerHTML ).toBe( '<ul><li>5</li><li>2</li><li>3</li></ul>' );
} );

it( 'should single file component and methods work', async() => {
    expect.assertions( 2 );
    const { component, html } = await ssrAndRehydrate(
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
    expect( html ).toBe( '<ul><li>3</li><li>2</li><li>1</li></ul>' );
    component.update( { a: 3 } );
    expect( component.container.innerHTML ).toBe( '<ul><li>5</li><li>2</li><li>3</li></ul>' );
} );

it( 'should work in for loop', async() => {
    expect.assertions( 3 );
    const { component, html } = await ssrAndRehydrate(
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
    expect( html ).toBe( '<ul><li>5</li><li>4</li><li>3</li></ul>' );
    component.update( { arr: [ 1, 2 ] } );
    expect( component.container.innerHTML ).toBe( '<ul><li>2</li><li>1</li></ul>' );
    component.update( { arr: [ 1, 2, 3, 4 ] } );
    expect( component.container.innerHTML ).toBe(
        '<ul><li>9</li><li>8</li><li>7</li><li>6</li></ul>'
    );
} );

it( 'should work with const', async() => {
    expect.assertions( 1 );
    const { html } = await ssrAndRehydrate(
        compile`
            {% let sum = 42 %}
            {{ sum * 2 }}
        `
    );
    expect( html ).toBe( '84' );
} );

it( 'should\'t update let vars', async() => {
    expect.assertions( 2 );
    const { component, html } = await ssrAndRehydrate(
        compile`
            {% let sum = 42 %}
            {{ sum * 2 }}
        `
    );
    expect( html ).toBe( '84' );
    component.update( { sum: 2 } );
    expect( component.container.innerHTML ).toBe( '84' );
} );

it( 'should correct build spots order', async() => {
    expect.assertions( 2 );
    const { component, html } = await ssrAndRehydrate(
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
    expect( html ).toBe( '<ul><li>6</li><li>5</li><li>3</li></ul>' );
    component.update( { a: 4 } );
    expect( component.container.innerHTML ).toBe( '<ul><li>9</li><li>5</li><li>6</li></ul>' );
} );
