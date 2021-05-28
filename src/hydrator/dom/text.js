export default class TextNode {
    constructor( component, textContent ) {
        this.component = component;
        this.textContent = textContent;
    }

    hydrate( storage, i ) {
        if ( 1 === i.length ) {
            i = i[ 0 ];
        }
        storage.addNode( this.component.ID, i );
        return this.textContent;
    }
}
