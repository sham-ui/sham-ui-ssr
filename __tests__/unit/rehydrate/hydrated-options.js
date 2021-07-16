import { compileAsSFC } from 'sham-ui-test-helpers';
import { ssrAndRehydrate } from '../../../src/testing';

it( 'hydrated options', async() => {
    expect.assertions( 3 );

    const meta = await ssrAndRehydrate(
        compileAsSFC`
            <template>
                {{adminID}}
            </template>
            
            <script>
                export default Component( Template, function( options, update, didMount ) {
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
    expect( meta.component.container.innerHTML ).toBe( 'real admin ID' );
    expect( meta.toJSON() ).toMatchSnapshot();
} );
