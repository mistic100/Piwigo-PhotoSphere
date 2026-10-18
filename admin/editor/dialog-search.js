import { rootUrl, translate } from './data.js';

export class PhotoSphereEditorDialogSearch extends HTMLDialogElement {
    /** @type {HTMLSelectElement} */
    #select = null;
    /** @type {HTMLElement} */
    #list = null;
    /** @type {HTMLElement} */
    #loader = null;

    /** @type {Array<number>} */
    #excludedImageIds = null;

    connectedCallback() {
        this.classList.add('photo-sphere-editor-dialog');
        
        this.#render();

        this.#select = this.querySelector('[name="dialog-search-album"]');
        this.#list = this.querySelector('#dialog-search-list');
        this.#loader = this.querySelector('.loader');

        this.querySelector('[data-close]').addEventListener('click', () => this.close());

        this.#select.addEventListener('change', () => {
            this.#loadImages(this.#select.value);
        });
    }

    #render() {
        this.innerHTML = `
        <header>
            <h3>${translate('Select a Photo Sphere')}</h3>

            <button class="buttonLike" title="${translate('Close')}" data-close>
                <i class="icon-cancel"></i>
            </button>
        </header>

        <label>
            <strong>${translate('Parent album')} :</strong>
            <select name="dialog-search-album"></select>
        </label>

        <div class="loader">
            <img src="${rootUrl()}themes/default/images/ajax_loader.gif">
        </div>

        <div id="dialog-search-list"></div>
        `;
    }

    /**
     * @param {Category[]} categories 
     * @param {number[]} excludeImageIds 
     */
    loadAndShow(categories, excludeImageIds = []) {
        this.#excludedImageIds = excludeImageIds;

        this.#select.replaceChildren(
            ...categories.map(({ id, name }) => {
                const opt = document.createElement('option');
                opt.value = id;
                opt.innerText = name;
                return opt;
            })
        );

        this.#loadImages(categories[0].id);
        this.showModal();
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
            btn.classList.add('dialog-search-list__item');
            btn.innerHTML = `
                <img src="${image.square_url}" alt="${image.name}">
                <span>${image.name}</span>
            `;

            btn.addEventListener('click', () => this.close(JSON.stringify(image)));

            this.#list.appendChild(btn);
        });

        if (filtered.length === 0) {
            this.#list.innerHTML = `<span>${translate('No Photo Sphere found')}</span>`;
        }

        this.#loader.style.display = 'none';
    }
}

customElements.define('photo-sphere-editor-dialog-search', PhotoSphereEditorDialogSearch, { extends: 'dialog' });
