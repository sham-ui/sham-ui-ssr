import { compileAsSFC, compile } from 'sham-ui-test-helpers';
import { ssrAndRehydrate } from '../../../src/testing';

it( 'defer hydrating with hydrateReady', async() => {
    expect.assertions( 2 );

    const meta = await ssrAndRehydrate(
        compileAsSFC( {
            Loader: compile`Loading...`
        } )`
            <template>
                {% if dataLoaded %}
                    Data loaded!
                {% else %}
                    <Loader/>
                {% endif %}
            </template>
            
            <script>
                export default Component( Template, function( options, didMount ) {
                    const dataLoaded = $();
                    
                    const state = options( {
                        [ dataLoaded ]: false
                    } );
                    
                    didMount( () => {
                        if ( !state[ dataLoaded ] ) {
                            this.hydrateReady = loadData().then(
                                loadDataSuccess    
                            );
                        }
                    } );
                    
                    function loadData() {
                        return new Promise( resolve => {
                            setTimeout( resolve, 100 );
                        } )
                    }
                    
                    const loadDataSuccess = () => state[ dataLoaded ] = true;
                } );
            </script>
        `
    );
    expect( meta.html ).toBe( ' Data loaded! <!--0-->' );
    expect( meta.toJSON() ).toMatchSnapshot();
} );


it( 'defer hydrating with hydrateReady with element wrapper', async() => {
    expect.assertions( 2 );

    const meta = await ssrAndRehydrate(
        compileAsSFC( {
            Loader: compile`Loading...`
        } )`
            <template>
                <div>
                    <p>Page state</p>                
                    {% if dataLoaded %}
                        <p>Data loaded!</p>
                    {% else %}
                        <p>
                            <Loader/>
                        </p>
                    {% endif %}
                </div>
            </template>
            
            <script>
                export default Component( Template, function( options, didMount ) {
                    const dataLoaded = $();
                    
                    const state = options( {
                        [ dataLoaded ]: false
                    } );
                    
                    didMount( () => {
                        if ( !state[ dataLoaded ] ) {
                            this.hydrateReady = loadData().then(
                                loadDataSuccess    
                            );
                        }
                    } );
                    
                    function loadData() {
                        return new Promise( resolve => {
                            setTimeout( resolve, 100 );
                        } )
                    }
                    
                    const loadDataSuccess = () => state[ dataLoaded ] = true;
                } );
            </script>
        `
    );
    expect( meta.html ).toBe( '<div><p>Page state</p><p>Data loaded!</p><!--0--></div>' );
    expect( meta.toJSON() ).toMatchSnapshot();
} );
