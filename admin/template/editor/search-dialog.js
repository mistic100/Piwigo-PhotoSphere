import { rootUrl, translate } from './data.js';

export class PhotoSphereEditorSearchDialog extends HTMLDialogElement {
    /** @type {HTMLSelectElement} */
    #select = null;
    /** @type {HTMLElement} */
    #list = null;
    /** @type {HTMLElement} */
    #loader = null;

    /** @type {Array<number>} */
    #excludedImageIds = null;

    connectedCallback() {
        this.#render();

        this.#select = this.querySelector('[name="search-dialog-album"]');
        this.#list = this.querySelector('#search-dialog-list');
        this.#loader = this.querySelector('.loader');

        this.querySelector('[data-close]').addEventListener('click', () => this.close());

        this.#select.addEventListener('change', () => {
            this.#loadImages(this.#select.value);
        });
    }

    #render() {
        this.innerHTML = `
        <h3>${translate('Select a photo')}</h3>

        <label>
            <strong>${translate('Parent album')} :</strong>
            <select name="search-dialog-album"></select>
        </label>

        <div class="loader">
            <img src="${rootUrl()}themes/default/images/ajax_loader.gif">
        </div>

        <div id="search-dialog-list"></div>

        <button class="buttonLike" data-close>
            ${translate('Cancel')}
        </button>
        `;
    }

    /**
     * @param {Category[]} categories 
     * @param {number[]} excludeImageIds 
     */
    showAndLoad(categories, excludeImageIds = []) {
        this.#excludedImageIds = excludeImageIds;

        this.#select.replaceChildren(
            ...categories.map(({ id, name }) => {
                const opt = document.createElement('option');
                opt.value = id;
                opt.innerText = name;
                return opt;
            })
        );

        this.showModal();
        this.#loadImages(categories[0].id);
    }

    /**
     * @param {number} catId
     */
    async #loadImages(catId) {
        this.#list.replaceChildren();
        this.#loader.style.display = 'block';

        const { result } = await $.ajax({
            url: `/ws.php?format=json&method=psv.getImages`,
            dataType: 'json',
            data: {
                cat_id: catId,
            },
        });

        const filtered = result
            .filter(image => !this.#excludedImageIds.includes(image.id));

        filtered.forEach(image => {
            const btn = document.createElement('button');
            btn.classList.add('search-dialog-list__item');
            btn.innerHTML = `
                <img src="${image.derivatives.square.url}" alt="${image.file}">
                <span>${image.name}</span>
            `;

            btn.addEventListener('click', () => this.close(JSON.stringify(image)));

            this.#list.appendChild(btn);
        });

        if (filtered.length === 0) {
            this.#list.innerHTML = `<span>${translate('No photo available')}</span>`;
        }

        this.#loader.style.display = 'none';
    }
}

customElements.define('photo-sphere-editor-search-dialog', PhotoSphereEditorSearchDialog, { extends: 'dialog' });
