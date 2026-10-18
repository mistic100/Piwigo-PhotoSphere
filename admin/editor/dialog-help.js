import { rootUrl, translate } from './data.js';

export class PhotoSphereEditorDialogHelp extends HTMLDialogElement {
    /** @type {HTMLElement} */
    #loader = null;
    /** @type {HTMLElement} */
    #content = null;
    /** @type {boolean} */
    #loaded = false;

    connectedCallback() {
        this.classList.add('photo-sphere-editor-dialog');
        
        this.#render();

        this.#loader = this.querySelector('.loader');
        this.#content = this.querySelector('#help-content');

        this.querySelector('[data-close]').addEventListener('click', () => this.close());
    }

    #render() {
        this.innerHTML = `
        <header>
            <h3>Photo Sphere help</h3>

            <button class="buttonLike" title="${translate('Close')}" data-close>
                <i class="icon-cancel"></i>
            </button>
        </header>

        <div class="loader">
            <img src="${rootUrl()}themes/default/images/ajax_loader.gif">
        </div>

        <div id="help-content"></div>
        `;
    }

    async loadAndShow() {
        this.showModal();

        if (!this.#loaded) {
            const baseUrl = rootUrl() + 'plugins/PhotoSphere/admin/editor/help/';
            const res = await fetch(baseUrl + 'index.html');
            const body = await res.text();

            this.#content.innerHTML = body.replace(/{ROOT_URL}/g, rootUrl()).replace(/{BASE_URL}/g, baseUrl);
            this.#loader.style.display= 'none';
            this.#loaded = true;
        }
    }
}

customElements.define('photo-sphere-editor-dialog-help', PhotoSphereEditorDialogHelp, { extends: 'dialog' });
