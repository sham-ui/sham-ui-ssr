/**
 * Hooks implementation for rehydrate component
 * @ignore
 */
export default class RehydrateHooks {
    constructor( storage ) {
        this.storage = storage;
    }

    create() {

        // Ignore create on rehydrating
    }

    hydrate() {

        // Ignore hydrate on rehydrating
    }

    /**
     * Hook for mark rehydrating component
     * @param {Component} component
     */
    rehydrate( component ) {
        const options = this.storage[ component.ID ].O;
        if ( undefined === options ) {
            return;
        }
        Object.defineProperties(
            component.options,
            Object.getOwnPropertyDescriptors( options )
        );
    }

    /**
     * Hook for resolve ID for component
     * @param {Component} component
     */
    resolveID( component ) {
        const ID = component.ctx.ID;
        return 'string' === typeof ID ?
            ID :
            this.storage[ component.ctx.parent.ID ].C.shift()
        ;
    }
}
