import RestoreDom from './dom/service';
import RehydrateHooks from './hooks/service';

const HOOKS_DI_KEY = 'sham-ui:hooks';
const DOM_DI_KEY = 'sham-ui:dom';

/**
 * Save hooks & dom services for restore after rehydrating
 * @param {Object} DI App DI container
 * @return {Function}
 */
function makeRestore( DI ) {
    const originalHooks = DI.resolve( HOOKS_DI_KEY );
    const originalDom = DI.resolve( DOM_DI_KEY );
    return function() {
        DI.bind( HOOKS_DI_KEY, originalHooks );
        DI.bind( DOM_DI_KEY, originalDom );
    };
}

/**
 * Main function for rehydrating
 * @param {Object} DI App DI container
 * @param {Object} storage
 * @return {Function} Restore function for disable rehydrating and switch to default behavior
 *
 * @example
 * import { createDI, start } from 'sham-ui';
 * import setupUnsafe from 'sham-ui-unsafe';
 * import { setupRehydrator } from 'sham-ui-ssr/rehydrator';
 *
 * const DI = createDI();
 * const data = JSON.parse( document.getElementById( 'data' ).innerText );
 * const disableRehydrating = setupRehydrator( DI, data );
 * mainInitializer( DI, root );
 * start( DI );
 * disableRehydrating();
 * setupUnsafe( DI );
 */
export function setup( DI, storage ) {
    const restore = makeRestore( DI );
    DI.bind( HOOKS_DI_KEY, new RehydrateHooks( storage ) );
    DI.bind( DOM_DI_KEY, new RestoreDom( storage ) );
    return restore;
}
