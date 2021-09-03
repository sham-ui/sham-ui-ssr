import Element from './element';
import TextNode from './text';
import CommenNode from './comment';

/**
 * DOM hooks implementation for hydrate dom
 * @ignore
 */
export default class ServerSideDOM {
    constructor( storage ) {
        this.storage = storage;
    }

    /**
     * Construct dom enabled
     * @param {Component} component
     * @return {boolean}
     */
    //eslint-disable-next-line no-unused-vars
    build( component ) {
        return true;
    }

    /**
     * Create element
     * @param {Component} component
     * @param {string} tagName
     * @return {HTMLElement}
     */
    el( component, tagName ) {
        return new Element( component, tagName );
    }

    /**
     * Create a text node
     * @param {Component} component
     * @param {string} data
     * @return {Text}
     */
    text( component, data ) {
        return new TextNode( component, data );
    }

    /**
     * Create comment node
     * @param {Component} component
     * @param {string} data
     * @return {CommentNode}
     */
    comment( component, data ) {
        return new CommenNode( component, data );
    }

    /**
     * @param {Comment} component
     * @param root {Element} Node there to insert unsafe html.
     * @param nodes {Array} List of already inserted html nodes for remove.
     * @param html {string} Unsafe html to insert.
     */
    unsafe( component, root, nodes, html ) {
        if ( 8 === root.nodeType ) {
            throw new Error( 'Can\'t use {% unsafe ... %} without container for SSR' );
        }
        root.innerHTML = html;
    }
}
