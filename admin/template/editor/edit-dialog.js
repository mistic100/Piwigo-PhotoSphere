import { translate } from './data.js';

class PhotoSphereEditorEditDialog extends HTMLDialogElement {
    /** @type {import('./data.js').Link} */
    #link = null;
    /** @type {HTMLFormElement} */
    #form = null;

    connectedCallback() {
        this.#render();

        this.#form = this.querySelector('form');

        this.querySelector('[data-close]').addEventListener('click', () => this.close());

        this.#form.addEventListener('submit', (e) => {
            e.preventDefault();

            const data = new FormData(this.#form);

            this.close(JSON.stringify({
                ...this.#link,
                title: data.get('title')
            }));
        });
    }

    #render() {
        this.innerHTML = `
        <h3>Edit the link</h3>

        <form id="edit-link-form">
            <label>
                <strong>${translate('Override photo title')} :</strong>
                <input type="text" name="title">
            </label>
        </form>

        <button class="buttonLike" data-close>
            <i class="icon-cancel"></i>
            ${translate('Cancel')}
        </button>
        <button class="buttonLike" type="submit" form="edit-link-form">
            <i class="icon-floppy"></i>
            ${translate('Save')}
        </button>
        `;
    }
    
    /**
     * @param {import('./data.js').Link} link
     */
    showAndLoad(link) {
        this.#link = link;

        this.#form.elements['title'].value = link.title;

        this.showModal();
    }
}

customElements.define('photo-sphere-editor-edit-dialog', PhotoSphereEditorEditDialog, { extends: 'dialog' });
