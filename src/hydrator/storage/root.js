import TextNode from '../dom/text';

/**
 * @inner
 */
export default class Root {
    constructor() {
        this.childNodes = [];
    }

    appendChild( node ) {
        this.childNodes.push( node );
        node.parentNode = this;
    }

    insertBefore( node, beforeNode ) {
        const index = this.childNodes.indexOf( beforeNode );
        this.childNodes.splice( index, 0, node );
        node.parentNode = this;
    }

    removeChild( node ) {
        node.parentNode = null;
        const index = this.childNodes.indexOf( node );
        this.childNodes.splice( index, 1 );
    }

    hydrate( storage ) {
        let result = '';
        let fakeCommentsCount = 0;
        let lastNodeIsText = false;
        this.childNodes.forEach( ( node, i ) => {
            if ( node instanceof TextNode ) {
                if ( lastNodeIsText ) {

                    // Add fake comment between for `{{foo}} {{bar}}` case
                    result +=  `<!--${fakeCommentsCount}-->`;
                    fakeCommentsCount++;
                }
                lastNodeIsText = true;
            } else {
                lastNodeIsText = false;
            }
            result += node.hydrate( storage, [ i + fakeCommentsCount ] );
        } );
        return result;
    }
}
