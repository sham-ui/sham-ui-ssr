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

        this._classList = [];
        const classList = this._classList;

        this.classList = {
            add( className ) {
                if ( !classList.includes( className ) ) {
                    classList.push( className );
                }
            },
            remove( className ) {
                const index = classList.indexOf( className );
                if ( index !== -1 ) {
                    classList.splice( index, 1 );
                }
            },
            toggle( className ) {
                const index = classList.indexOf( className );
                if ( index === -1 ) {
                    classList.push( className );
                } else {
                    classList.splice( index, 1 );
                }
            }
        };
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
        if ( 'class' === attrName ) {
            value
                .split( ' ' )
                .filter( x => x.length > 0  )
                .forEach(
                    className => this.classList.add( className )
                );
        } else {
            this.attributes[ attrName ] = value;
        }
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
                if ( this.attributes[ attrName ] ) {
                    result += ` ${attrName}`;
                }
            } else {
                result += ` ${attrName}="${this.attributes[ attrName ]}"`;
            }
        }
        if ( this._classList.length > 0 ) {
            result += ` class="${this._classList.join( ' ' )}"`;
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
