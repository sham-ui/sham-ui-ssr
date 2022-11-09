import { start, createDI, createRootContext } from 'sham-ui';
import setupUnsafe from 'sham-ui-unsafe';
import pretty from 'pretty';
import { setup as setupHydrator, hydrate } from '../../src/hydrator/index';
import { setup as setupRehydrator } from '../../src/rehydrator/index';

const HOOKS_DI_KEY = 'sham-ui:hooks';
const DOM_DI_KEY = 'sham-ui:dom';
const DEFAULT_SELECTOR = 'body';
const DEFAULT_ID = 'component';

/**
 * Make restore function for hooks & dom
 * @param {Object} DI App DI container
 * @return {Function}
 */
export function makeRestore( DI ) {
    const originalHooks = DI.resolve( HOOKS_DI_KEY );
    const originalDom = DI.resolve( DOM_DI_KEY );
    return function() {
        DI.bind( HOOKS_DI_KEY, originalHooks );
        DI.bind( DOM_DI_KEY, originalDom );
    };
}

/**
 * @inner
 * @param {string} html
 * @return {string}
 */
function prettyHTML( html ) {
    html = pretty( html, {
        inline: [ 'code', 'pre', 'em', 'strong', 'span' ]
    } );
    if ( html.indexOf( '\n' ) !== -1 ) {
        html = `\n${html}\n`;
    }
    return html;
}


/**
 * sham-ui component
 * @external Component
 * @see https://github.com/sham-ui/sham-ui#component
 */

/**
 * Result of server side renderer
 * @typedef {Object} SSRRenderResult
 * @property {Component} component Rendered component instance
 * @property {string} html Rendered html
 * @property {string} data Data for component rehydrating
 * @property {SSRToJSON} toJSON Dump to JSON for jest's snapshot testing
 */

/**
 * Function for dump server side render result (using for jest-snapshots)
 * @typedef {Function} SSRToJSON
 * @return {SSRRenderResultSnapshot}
 */

/**
 * @typedef {Object} SSRRenderResultSnapshot
 * @property {string} html Rendered html
 * @property {string} data Data for rehydrating
 */


/**
 * Server side render for component
 * @example
 * import Label from './Label.sht';
 * import { ssr } from 'sham-ui-ssr/testing';
 *
 * it( 'renders correctly', () => {
 *     const meta = ssr( Label );
 *
 *     expect( meta.component.ID ).toEqual( 'component' );
 *     expect( meta.toJSON() ).toMatchSnapshot();
 * } );
 *
 * @param {Class<Component>} componentClass Component class for rendering
 * @param {Object} [componentOptions={}] Options
 * @param {Object} [context={}] Extra root context parameters
 * @return {SSRRenderResult}
 */
export async function ssr(
    componentClass,
    componentOptions = {},
    context = {}
) {
    const DI = 'DI' in context ?
        context.DI :
        createDI()
    ;

    DI.resolve( 'sham-ui:store' ).byId.clear();

    // Save original services
    const restore = makeRestore( DI );

    // Setup hydrator services & create storage
    const root = setupHydrator( DI );

    // Override resolveID with dummy implementation
    let idCounter = 1;
    DI.resolve( HOOKS_DI_KEY ).resolveID = ( component ) => {
        const ID = component.ctx.ID;
        return 'string' === typeof ID ?
            ID :
            ( idCounter++ ).toString()
        ;
    };

    const ctx = createRootContext( {
        DI,
        ID: DEFAULT_ID,
        container: root,
        ...context
    } );

    const component = new componentClass( ctx, componentOptions );

    // Render component
    start( DI );

    // Wait component hydrating
    const storage = await hydrate( DI );

    // Dump storage data to transferable format
    let { html, data } = storage.hydrate();

    // Parse data
    data = JSON.parse( data );

    // Restore original services
    restore();

    return {
        DI,
        ctx,
        component,
        html,
        data,
        toJSON() {
            return {
                html: prettyHTML( html ),
                data: JSON.stringify( data, null, 4 )
            };
        }
    };
}

/**
 * Prepare options for snapshot
 * @inner
 * @param {Options} options
 * @return {Object}
 */
function prepareOptions( options ) {
    return {
        ...Object.getPrototypeOf( options ),
        ...options
    };
}


/**
 * @typedef {Object} RenderResultSnapshot
 * @property {string} html Rendered html
 * @property {Object} Options Component options
 */

/**
 * @inner
 * @param {Object} ctx
 * @param {Component} component
 * @return {RenderResultSnapshot}
 */
function toJSON( ctx, component ) {
    let html = null;
    const container = ctx.container;
    if ( container !== undefined ) {
        html = pretty( container.innerHTML, {
            inline: [ 'code', 'pre', 'em', 'strong', 'span' ]
        } );
        if ( html.indexOf( '\n' ) !== -1 ) {
            html = `\n${html}\n`;
        }
    }
    return {
        html,
        Options: prepareOptions( component.options )
    };
}

/**
 * Result of renderer
 * @typedef {Object} RenderResult
 * @property {Object} DI App DI container
 * @property {Component} component Rendered component instance
 * @property {string} html SSR html string
 * @property {string} data Data for rehydrating
 * @property {ToJSON} toJSON Dump to JSON for jest's snapshot testing
 */

/**
 * Function for dump render result (using for jest-snapshots)
 * @typedef {Function} ToJSON
 * @return {RenderResultSnapshot}
 */

/**
 * Render component with SSR & rehydrating
 * @example
 * import Label from './Label.sht';
 * import { ssrAndRehydrate } from 'sham-ui-ssr/testing';
 *
 * it( 'renders correctly', () => {
 *     const meta = ssrAndRehydrate( Label );
 *
 *     expect( meta.component.ID ).toEqual( 'component' );
 *     expect( meta.toJSON() ).toMatchSnapshot();
 * } );
 *
 * @param {Class<Component>} componentClass Component class for rendering
 * @param {Object} [componentOptions={}] Options
 * @param {Object} [context={}] Extra root context parameters
 * @return {RenderResult}
 */
export async function ssrAndRehydrate(
    componentClass,
    componentOptions = {},
    context = {}
) {
    let DI = 'DI' in context ?
        context.DI :
        createDI()
    ;

    DI.resolve( 'sham-ui:store' ).byId.clear();

    // Save original services
    const restore = makeRestore( DI );

    // Setup hydrator services & create storage
    const root = setupHydrator( DI );
    let ctx = createRootContext( {
        DI,
        ID: DEFAULT_ID,
        container: root,
        ...context
    } );

    new componentClass( ctx, componentOptions );

    // Render component
    start( DI );

    // Wait component hydrating
    const storage = await hydrate( DI );

    // Dump storage data to transferable format
    const { html, data } = storage.hydrate();

    // Restore original services
    restore();

    // Clear store (on browser store is empty on load page)
    DI.resolve( 'sham-ui:store' ).byId.clear();

    DI = 'DI' in context ?
        context.DI :
        createDI()
    ;

    ctx = createRootContext( {
        DI,
        ID: DEFAULT_ID,
        container: document.querySelector( DEFAULT_SELECTOR ),
        ...context
    } );

    // Set ssr html string to container
    ctx.container.innerHTML = html;

    const disableRehydrating = setupRehydrator( DI, JSON.parse( data ) );
    const component = new componentClass( ctx, { ...componentOptions } );
    start( DI );
    disableRehydrating();
    setupUnsafe( DI );

    return {
        DI,
        ctx,
        component,
        html,
        data: JSON.stringify( JSON.parse( data ), null, 4 ),
        toJSON() {
            return toJSON( ctx, component );
        }
    };
}
