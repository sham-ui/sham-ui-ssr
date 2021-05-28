import Root from './root';

/**
 * Internal storage for component hydrating
 * @inner
 */
export default class Storage {
    constructor() {
        this.byId = {};
        this._ignoredKeys = new Set( [
            'ID',
            'container',
            'parent',
            'owner',
            'blocks',
            'directives',
            'filters',
            'DI'
        ] );
        this.root = new Root();
    }

    process( component ) {
        const data = this.byId[ component.ID ] || {};
        this._hydrateOptions( data, component );
        if ( component.nested.length > 0 ) {
            data.C = component.nested.map( ( child ) => child.ID );
        }
        if ( Object.keys( data ).length > 0 ) {
            this.byId[ component.ID ] = data;
        }
    }

    _hydrateOptions( data, component ) {
        const sourceOptions = component.isRoot ?
            ( component.hydratedOptions || component.options ) :
            {};
        const options = Object.assign( {}, sourceOptions );
        const hydratedOptions = {};
        let count = 0;
        for ( let key in options ) {
            if ( this._hydrateOption( component, hydratedOptions, key, options[ key ] ) ) {
                count++;
            }
        }
        if ( count > 0 ) {
            data.O = hydratedOptions;
        }
    }

    _hydrateOption( component, data, key, value ) {
        if ( this._ignoredKeys.has( key ) ) {

            // Ignore internal options
            return false;
        }
        if ( 'function' === typeof value ) {

            // Ignore functions
            return false;
        }
        if ( component.defaultOptions[ key ] === value ) {

            // Ignore don't changed default options
            return false;
        }
        data[ key ] = value;
        return true;
    }

    addNode( id, nodeIndex ) {
        if ( !this.byId.hasOwnProperty( id ) ) {
            this.byId[ id ] = {};
        }
        const data = this.byId[ id ];
        if ( !data.hasOwnProperty( 'N' ) ) {
            data.N = [];
        }
        data.N.push( nodeIndex );
    }

    hydrate() {
        const html = this.root.hydrate( this );
        return {
            html,
            data: JSON.stringify( this.byId, null, 0 )
        };
    }
}
