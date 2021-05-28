import './styles/main.scss';
import setupUnsafe from 'sham-ui-unsafe';
import { createDI, start } from 'sham-ui';
import { setup as setupHydrator, hydrate } from '../../src/hydrator/index';
import { setup as setupRehydrator } from '../../src/rehydrator/index';
import mainInitializer from './initializers/main';

const HOOKS_DI_KEY = 'sham-ui:hooks';
const DOM_DI_KEY = 'sham-ui:dom';

function makeRestore( DI ) {
    const originalHooks = DI.resolve( HOOKS_DI_KEY );
    const originalDom = DI.resolve( DOM_DI_KEY );
    return function() {
        DI.bind( HOOKS_DI_KEY, originalHooks );
        DI.bind( DOM_DI_KEY, originalDom );
    };
}

const DI = createDI();
const restoreOriginal = makeRestore( DI );

const root = setupHydrator( DI );
mainInitializer( DI, root );
start( DI );
hydrate( DI ).then(
    ( storage ) => {
        const getById = document.getElementById.bind( document );
        // eslint-disable-next-line no-console
        console.dir( storage );
        try {
            const { html, data } = storage.hydrate();
            getById( 'ssr-rendered' ).innerHTML = html;
            getById( 'raw-html' ).innerText = html;
            getById( 'data' ).innerText = JSON.stringify( JSON.parse( data ), null, 4 );
        } catch ( e ) {
            // eslint-disable-next-line no-console
            console.error( e );
            // eslint-disable-next-line no-debugger
            debugger;
        }
        try {
            DI.resolve( 'sham-ui:store' ).byId.clear();
            const root = getById( 'client' );
            root.innerHTML = getById( 'ssr-rendered' ).innerHTML;
            restoreOriginal();
            const data = JSON.parse( document.getElementById( 'data' ).innerText );
            const disableRehydrating = setupRehydrator( DI, data );
            mainInitializer( DI, root );
            start( DI );
            disableRehydrating();
            setupUnsafe( DI );
            // eslint-disable-next-line no-console
            console.dir( DI.resolve( 'sham-ui:store' ).byId.keys() );
        } catch ( e ) {
            // eslint-disable-next-line no-console
            console.error( e );
            // eslint-disable-next-line no-debugger
            debugger;
        }
    }
);

