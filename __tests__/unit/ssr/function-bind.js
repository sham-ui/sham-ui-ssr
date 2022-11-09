import { compileAsSFC } from 'sham-ui-test-helpers';
import { ssr } from '../../../src/testing';

it( 'function bind correctly work with directives', async() => {
    expect.assertions( 2 );

    class OnClickEventListener {
        constructor() {
            this.handler = null;
            this.callback = this.callback.bind( this );
        }

        callback( event ) {
            this.handler( event );
        }

        bind( node ) {
            node.addEventListener( 'click', this.callback );
        }

        unbind( node ) {
            node.removeEventListener( 'click', this.callback );
        }

        update( handler ) {
            this.handler = handler;
        }
    }

    const handler = jest.fn();
    const meta = await ssr(
        compileAsSFC`
        <template>
            <button :onclick={{this.click}}>click me</button>
        </template>
        
        <script>
            export default Component( Template, function() {
                this.click = ( e ) => {
                    this.options.handler( this, e.type );
                }
            } );
        </script>
        `,
        {
            handler
        },
        {
            directives: {
                onclick: OnClickEventListener
            }
        }
    );
    expect( meta.html ).toBe(
        '<button>click me</button>'
    );
    expect( meta.toJSON() ).toMatchSnapshot();
} );
