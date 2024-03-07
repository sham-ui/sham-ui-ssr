import escapeHTML from 'escape-html';

export default class TextNode {
    constructor( component, textContent ) {
        this.component = component;
        this.textContent = textContent;
    }

    hydrate( storage, i, ignoreEscape = false ) {
        if ( 1 === i.length ) {
            i = i[ 0 ];
        }
        storage.addNode( this.component.ID, i );
        return ignoreEscape ?
            this.textContent :
            escapeHTML( this.textContent )
        ;
    }
}
