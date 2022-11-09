/**
 * DOM hooks implementation for rehydrating component DOM
 * @ignore
 */
export default class RestoreDom {
    constructor( storage ) {
        this.storage = storage;
    }

    /**
     * Construct dom enabled
     * @param {Component} component
     * @return {boolean}
     */
    build( component ) {

        // Build dom only for rehydrated/not hydrated components
        return !( component.ID in this.storage );
    }

    /**
     * Create element
     * @param {Component} component
     * @param {string} tagName
     * @return {HTMLElement}
     */
    // eslint-disable-next-line no-unused-vars
    el( component, tagName ) {
        return this._getElement( component );
    }

    /**
     * Create a text node
     * @param {Component} component
     * @return {Text}
     */
    text( component ) {
        return this._getElement( component );
    }

    /**
     * Create comment node
     * @param {Component} component
     * @return {Comment}
     */
    comment( component ) {
        return this._getElement( component );
    }

    /**
     *
     * @param {Comment} component
     * @param root {Element} Node there to insert unsafe html.
     * @param nodes {Array} List of already inserted html nodes for remove.
     */
    unsafe( component, root, nodes ) {

        // Restore nodes
        let i = root.childNodes.length;
        while ( i-- > 0 ) {
            nodes[ i ] = root.childNodes[ i ];
        }
    }

    _getElement( component ) {
        let container = component.ctx.container;
        if ( 8 === container.nodeType ) {

            // Container is a comment, user parent
            container = container.parentNode;
        }
        const anchors = [].concat(
            this.storage[ component.ID ].N.shift()
        );
        while ( anchors.length > 0 ) {
            const anchor = anchors.shift();
            container = container.childNodes[ anchor ];
        }
        return container;
    }
}
