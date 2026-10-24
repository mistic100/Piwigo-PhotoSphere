class PhotoSphereMarkerElement extends HTMLElement {
    mode = 'arrow';
    image = null;
    
    /**
     * @param {Object} link
     * @param {Object} config
     */
    static build(link, config) {
        const element = document.createElement('photo-sphere-marker');
        element.mode = config.link_mode;
        element.image = link.square_url;

        return {
            id: link.dst_id,
            element: element,
            position: {
                yaw: link.yaw,
                pitch: link.pitch,
            },
            size: { 
                width: config.link_size, 
                height: config.link_size,
            },
            tooltip: link.name,
        };
    }

    connectedCallback() {
        this.classList.add('photo-sphere-marker');

        switch (this.mode) {
            case 'arrow':
                this.innerHTML = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <path fill-rule="even-odd" fill="currentColor" d="
        M50,50 m45,0
        a45,45 0 1,0 -90,0
        a45,45 0 1,0  90,0

        M50,50 m38,0
        a38,38 0 0,1 -76,0
        a38,38 0 0,1  76,0

        M50,50 m30,0
        a30,30 0 1,0 -60,0
        a30,30 0 1,0  60,0
        
        M50,40 m2.5,-2.5
        l17.5,17.5
        a 2.5,2.5 0 0 1 -5,5
        l-15,-15
        l-15,15
        a 2.5,2.5 0 0 1 -5,-5
        l17.5,-17.5
        a 3.5,3.5 0 0 1 5,0
    "/>
</svg>
`;
                break;

            case 'thumbnail':
                this.innerHTML = `<img src="${this.image}">`;
                break;
        }
    }
}

customElements.define('photo-sphere-marker', PhotoSphereMarkerElement);
