/**
 * Service for server side component hooks
 * @ignore
 */
export default class ServerSideHooks {
    constructor( originalService, storage ) {
        this.original = originalService;
        this.storage = storage;
        this._promises = [];
        this.idCounter = 0;
    }

    create( component ) {

        // Make fast snapshot for default options
        component.defaultOptions = Object.assign( {}, component.options );
    }

    /**
     * Hook for mark component as ready for hydrating
     * @param {sham-ui#Component} component
     */
    hydrate( component ) {
        this._promises.push(

            // Property hydrateReady is undefined by default, but component can set it as promise
            // for defer hydrating (waiting finish async operation for example)
            Promise.resolve( component.hydrateReady )

                // Override original promise result with `component`
                .then( () => component )
        );
    }

    rehydrate() {

        // Ignore rehydrate on hydrating
    }

    /**
     * Hook for resolve ID for component
     * @param {Component} component
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
    _waitComponentHydrating( promise ) {
        return promise.then(
            ::this._componentReadyForHydrating
        );
    }

    /**
     * Process one component hydrationg
     * @param component
     * @return {Promise}
     * @private
     */
    _componentReadyForHydrating( component ) {
        this.storage.process( component );

        // After resolve current promise, process next (its's async recursion analog)
        return this.hydrating();
    }

    /**
     * Hook for wait all `component.hydrateReady` promises resolved
     * @return {Promise}
     */
    hydrating() {
        return this._promises.length > 0 ?

            // Has unresolved promise, process:
            this._waitComponentHydrating( this._promises.shift() ) :

            // All promise resolved
            Promise.resolve(

                // Return Storage as promise result
                this.storage
            )
        ;
    }
}
