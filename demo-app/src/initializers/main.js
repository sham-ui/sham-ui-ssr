import { createRootContext } from 'sham-ui';
import App from '../components/App.sht';


class EventListener {
    constructor( type ) {
        this.type = type;
        this.handler = null;
        this.callback = this.callback.bind( this );
    }

    callback( event ) {
        this.handler( event );
    }

    bind( node ) {
        node.addEventListener( this.type, this.callback );
    }

    unbind( node ) {
        node.removeEventListener( this.type, this.callback );
    }

    update( handler ) {
        this.handler = handler;
    }
}

export default function( DI, container ) {
    new App(
        createRootContext( {
            DI,
            ID: 'app',
            container,
            text: 'Hello!',
            directives: {
                onclick: class onclick extends EventListener {
                    constructor() {
                        super( 'click' );
                    }
                },
                oninput: class onclick extends EventListener {
                    constructor() {
                        super( 'input' );
                    }
                },
                ref: class ref {
                    constructor( component ) {
                        this.component = component;
                        this.node = null;
                        this.name = null;
                    }

                    bind( node ) {
                        this.node = node;
                    }

                    unbind() {
                        this.node = null;
                        if ( this.name ) {
                            delete this.component[ this.name ];
                        }
                        this.name = null;
                    }

                    update( name ) {
                        this.name = name;
                        this.component[ name ] = this.node;
                    }
                }
            }
        } )
    );
}
