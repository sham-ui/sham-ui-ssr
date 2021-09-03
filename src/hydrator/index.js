import Storage from './storage/service';
import ServerSideHooks from './hooks/service';
import ServerSideDOM from './dom/service';

const HOOKS_DI_KEY = 'sham-ui:hooks';
const DOM_DI_KEY = 'sham-ui:dom';

/**
 * Main function for setup hydrating components
 * @param {Object} DI App DI container
 */
export function setup( DI ) {
    const storage = new Storage();

    // Override default hooks service
    DI.bind(
        HOOKS_DI_KEY,
        new ServerSideHooks( storage )
    );

    // Override default dom service
    DI.bind(
        DOM_DI_KEY,
        new ServerSideDOM( storage )
    );

    return storage.root;
}


/**
 * Hydrate all components
 * @param {Object} DI App DI container
 * @return {Promise}
 *
 * @example
 * import { createDI, start } from 'sham-ui';
 * import { setupHydrator, hydrate } from 'sham-ui-ssr/hydrator';
 *
 * const DI = createDI();
 * const root = setupHydrator( DI );
 * mainInitializer( DI, root );
 * start( DI );
 * hydrate( DI ).then( storage => {
 *     const { html, data } = storage.hydrate();
 * } )
 */
export function hydrate( DI ) {
    return DI.resolve( HOOKS_DI_KEY ).hydrating();
}
