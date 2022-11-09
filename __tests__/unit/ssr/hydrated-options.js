import { compileAsSFC } from 'sham-ui-test-helpers';
import { ssr } from '../../../src/testing';

it( 'hydrated options', async() => {
    expect.assertions( 2 );

    const meta = await ssr(
        compileAsSFC`
            <template>
                {{adminID}}
            </template>
            
            <script>
                export default Component( Template, function( options, didMount ) {
                    const adminID = $();
                    
                    const state = options( {
                        [ adminID ]: 'n/a'
                    } );
                    
                    didMount( () => {
                        const hydratedOptions = Object.assign( {}, state, {
                            extraData: 42
                        } );
                        delete hydratedOptions.adminID;
                        this.hydratedOptions = hydratedOptions;
                    } );
                } );
            </script>`,
        {
            adminID: 'real admin ID'
        }
    );
    expect( meta.html ).toBe( 'real admin ID' );
    expect( meta.toJSON() ).toMatchSnapshot();
} );
