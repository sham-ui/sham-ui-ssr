/**
 * Service for server side component hooks
 * @ignore
 */
export default class ServerSideHooks {
    constructor( storage ) {
        this.storage = storage;
        this._promises = [];
        this.idCounter = 0;
    }

    create( component ) {

        // Make fast snapshot for default options
        component.defaultOptions = Object.assign( {}, component.options );
    }

    /**
     * Hook for mark root component as ready for hydrating
     * @param {sham-ui#Component} component
     */
    hydrate( component ) {
        this._promises.push(
            this.hydrateComponent( component )
        );
    }

    /**
     * Hydrate
     * @param {sham-ui#Component} component
     * @return {Promise<>}
     * @private
     */
    hydrateComponent( component ) {

        // Property hydrateReady is undefined by default, but component can set it as promise
        // for defer hydrating (waiting finish async operation for example)
        return Promise.resolve( component.hydrateReady ).then(
            () => Promise.all(

                // Hydrate all nested component after current ready
                component.nested.map(
                    nested => this.hydrateComponent( nested )
                )
            )
        ).then(

            // Override original promise result with `component`
            () => component
        );
    }

    rehydrate() {

        // Ignore rehydrate on hydrating
    }

    /**
     * Hook for resolve ID for component
     * @param {sham-ui#Component} component
     */
    resolveID( component ) {
        const ID = component.options.ID;
        return 'string' === typeof ID ?
            ID :
            ( this.idCounter++ ).toString()
        ;
    }

    /**
     * Recursion step
     * @param {Promise} promise
     * @return {Promise}
     * @private
     */
    _waitRootComponentHydrating( promise ) {
        return promise.then(
            ::this._rootComponentReadyForHydrating
        );
    }

    /**
     * Process one root component hydrationg
     * @param {sham-ui#Component} component
     * @return {Promise}
     * @private
     */
    _rootComponentReadyForHydrating( component ) {
        this._processComponent( component );

        // After resolve current promise, process next (its's async recursion analog)
        return this.hydrating();
    }

    /**
     * Process component & all nested
     * @param {sham-ui#Component} component
     * @private
     */
    _processComponent( component ) {
        this.storage.process( component );
        component.nested.forEach(
            nested => this._processComponent( nested )
        );
    }

    /**
     * Hook for wait all `component.hydrateReady` promises resolved
     * @return {Promise}
     */
    hydrating() {
        return this._promises.length > 0 ?

            // Has unresolved promise, process:
            this._waitRootComponentHydrating( this._promises.shift() ) :

            // All promise resolved
            Promise.resolve(

                // Return Storage as promise result
                this.storage
            )
        ;
    }
}
