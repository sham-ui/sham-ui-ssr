/**
 * Server side wrapper for comment node
 * @inner
 */
export default class CommentNode {

    /**
     * @param {Object} component
     * @param {string} textContent
     */
    constructor( component, textContent ) {
        this.nodeType = 8;
        this.component = component;
        this.textContent = textContent;
    }

    /**
     * Hydrate node
     * @param {Storage} storage
     * @param {Array<number>|number} i
     * @return {string}
     */
    hydrate( storage, i ) {
        if ( 1 === i.length ) {
            i = i[ 0 ];
        }
        storage.addNode( this.component.ID, i );
        return `<!--${this.textContent}-->`;
    }
}
