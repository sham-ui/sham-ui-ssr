import TextNode from './text';

const singleElements = [ 'input', 'hr', 'br' ];
const booleanAttributes = [ 'checked', 'selected' ];
const plainAttributes = [ 'id', 'value', 'checked', 'selected' ];

/**
 * @inner
 */
export default class Element {
    constructor( component, tagName ) {
        this.component = component;
        this.tagName = tagName;
        this.attributes = {};
        this.childNodes = [];
        this.innerHTML = '';
        plainAttributes.forEach( attr => {
            Object.defineProperty( this, attr, {
                get() {
                    return this.attributes[ attr ];
                },
                set( value ) {
                    this.attributes[ attr ] = value;
                }
            } );
        } );
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

    setAttribute( attrName, value ) {
        this.attributes[ attrName ] = value;
    }

    addEventListener() {}

    removeEventListener() {}

    hydrate( storage, index ) {
        const component = this.component;
        if ( 1 === index.length ) {
            storage.addNode( component.ID, index[ 0 ] );
        } else {
            storage.addNode( component.ID, index );
        }
        let result = `<${this.tagName}`;
        for ( let attrName in this.attributes ) {
            if ( booleanAttributes.includes( attrName ) ) {
                result += ` ${attrName}=${this.attributes[ attrName ]}`;
            } else {
                result += ` ${attrName}="${this.attributes[ attrName ]}"`;
            }
        }
        result += '>';

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
            if ( node.component === component ) {
                result += node.hydrate( storage, [ ...index, i + fakeCommentsCount ] );
            } else {
                result += node.hydrate( storage, [ i + fakeCommentsCount ] );
            }
        } );
        if (
            lastNodeIsText &&
            1 === this.childNodes.length &&
            '' === this.childNodes[ 0 ].textContent
        ) {

            // It's element with empty text content, then replace with ' ' for correct
            // transfer through network & rehydrate
            result += ' ';
        }
        result += this.innerHTML;
        if ( singleElements.includes( this.tagName ) ) {
            return result;
        }
        return result + `</${this.tagName}>`;
    }
}
