import { EquirectangularAdapter, Viewer } from '@photo-sphere-viewer/core';
import { MarkersPlugin } from '@photo-sphere-viewer/markers-plugin';
import { init, picture, sphereCorrectionDegToRad } from './data.js';
import './edit-dialog.js';
import './network-dialog.js';
import './panel-settings.js';
import './panel-tour.js';
import './panel.js';
import './search-dialog.js';

class PhotoSphereEditor extends HTMLElement {

    /** @type {string} */
    get rootUrl() {
        return this.getAttribute('root-url');
    }

    /** @type {string} */
    get pwgToken() {
        return this.getAttribute('pwg-token');
    }

    /** @type {Object} */
    get config() {
        return JSON.parse(this.getAttribute('config'));
    }

    /** @type {Object} */
    get lang() {
        return JSON.parse(this.getAttribute('lang'));
    }

    /** @type {import('./data.js').Picture} */
    get picture() {
        return JSON.parse(this.getAttribute('picture'));
    }

    /** @type {import('./data.js').Category[]} */
    get categories() {
        return JSON.parse(this.getAttribute('categories'));
    }

    /** @type {Viewer} */
    #viewer = null;
    /** @type {MarkersPlugin} */
    #markersPlugin = null;
    /** @type {import('./panel.js').PhotoSphereEditorPanel} */
    #panel = null;

    connectedCallback() {
        init({
            rootUrl: this.rootUrl,
            pwgToken: this.pwgToken,
            config: this.config,
            lang: this.lang,
            picture: this.picture,
            categories: this.categories,
        });

        this.style.height = `calc(100vh - ${this.offsetTop}px)`;

        this.#render();

        this.#panel = this.querySelector('photo-sphere-editor-panel');

        this.#viewer = new Viewer({
            container: this.querySelector('#photo-sphere-editor-viewer'),
            adapter: [EquirectangularAdapter, { shader: true }],
            panorama: picture().image_url,
            minFov: picture().photosphere_config?.minFov ?? 30,
            maxFov: picture().photosphere_config?.maxFov ?? 90,
            defaultZoomLvl: picture().photosphere_config?.defaultZoomLvl ?? 50,
            fisheye: picture().photosphere_config?.fisheye ?? false,
            sphereCorrection: sphereCorrectionDegToRad(picture().photosphere_config?.sphereCorrection),
            navbar: false,
            plugins: [MarkersPlugin],
        });
        this.#markersPlugin = this.#viewer.getPlugin(MarkersPlugin);

        this.#panel.addEventListener('notification', (e) => {
            if (e.detail) {
                this.#viewer.notification.show(e.detail);
            } else {
                this.#viewer.notification.hide();
            }
        });

        this.#panel.addEventListener('add-edit-marker', (e) => {
            this.#addEditMarker(e.detail);
        });

        this.#panel.addEventListener('delete-marker', (e) => {
            this.#deleteMarker(e.detail);
        });

        this.#panel.addEventListener('goto-marker', (e) => {
            this.#gotoMarker(e.detail);
        });

        this.#panel.addEventListener('config-change', (e) => {
            this.#setConfig(e.detail);
        });

        this.#viewer.addEventListener('click', (e) => {
            this.#panel.onViewerClick(e.data);
        });

        this.#loadLinks();
    }

    #render() {
        this.innerHTML = `
        <div id="photo-sphere-editor-viewer"></div>
        <photo-sphere-editor-panel></photo-sphere-editor-panel>
        `;
    }

    async #loadLinks() {
        const { result } = await $.ajax({
            url: `/ws.php?format=json&method=psv.getLinks`,
            dataType: 'json',
            data: {
                image_id: picture().id,
            },
        });

        this.#panel.setLinks(result);

        result.forEach(link => this.#addEditMarker(link));
    }

    /**
     * @param {import('./data.js').Link} link 
     */
    #addEditMarker(link) {
        try {
            this.#markersPlugin.getMarker(link.dst_id);
            this.#markersPlugin.updateMarker({
                id: link.dst_id,
                position: { yaw: link.yaw, pitch: link.pitch },
                tooltip: link.title || link.name,
            });
        } catch {
            this.#markersPlugin.addMarker({
                id: link.dst_id,
                image: link.square.url,
                position: { yaw: link.yaw, pitch: link.pitch },
                size: { width: 120, height: 120 },
                tooltip: link.title || link.name,
                className: 'photosphere-marker',
                hoverScale: { amount: 1.1, easing: 'ease-in-out', duration: 200 },
            });
        }
    }

    /**
     * @param {import('./data.js').Link} link 
     */
    #deleteMarker(link) {
        this.#markersPlugin.removeMarker(link.dst_id);
    }

    /**
     * @param {import('./data.js').Link} link 
     */
    #gotoMarker(link) {
        this.#markersPlugin.gotoMarker(link.dst_id, 1000);
    }

    /**
     * @param {Object} values
     */
    #setConfig(values) {
        this.#viewer.setOptions(values);
        this.#viewer.rotate({ yaw: 0, pitch: 0 });
        if ('defaultZoomLvl' in values) {
            this.#viewer.zoom(values.defaultZoomLvl);
        }
    }
}

customElements.define('photo-sphere-editor', PhotoSphereEditor);
