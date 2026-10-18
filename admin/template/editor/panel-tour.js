import { categories, picture, pwgToken, rootUrl, translate } from './data.js';

class PhotoSphereEditorTourItem extends HTMLElement {
    /** @type {import('./data.js').Link} */
    data = null;

    connectedCallback() {
        this.#render();

        this.querySelector('[data-goto]').addEventListener('click', () => {
            this.dispatchEvent(new CustomEvent('goto-marker', { detail: this.data, bubbles: true }));
        });

        this.querySelector('[data-edit]').addEventListener('click', () => {
            this.dispatchEvent(new CustomEvent('edit-link', { detail: this.data }));
        });

        this.querySelector('[data-delete]').addEventListener('click', () => {
            this.dispatchEvent(new CustomEvent('delete-link', { detail: this.data }));
        });

        this.querySelector('[data-move]').addEventListener('click', () => {
            this.dispatchEvent(new CustomEvent('move-link', { detail: this.data }));
        });

        this.querySelector('[data-open]').addEventListener('click', () => {
            location.href = `${rootUrl()}admin.php?page=plugin-PhotoSphere-photo&image_id=${this.data.dst_id}`;
        });

        $(this.querySelectorAll('.tiptip')).tipTip({ delay: 100 });
    }

    #render() {
        this.innerHTML = `
            <img src="${this.data.square.url}" alt="${this.data.file}">

            <div class="photo-sphere-editor-tour-item__content">
                ${this.data.return_link ? `
                    <span class="photo-sphere-editor-tour-item__return tiptip icon-exchange"
                          title="${translate('Has return link')}"></span>
                ` : ''}

                <span>
                    <strong>${translate('Photo title')} :</strong>
                    <br>
                    <span>${this.data.name}</span>
                </span>

                <div class="photo-sphere-editor-tour-item__buttons">
                    <button type="button" class="tiptip icon-eye" title="${translate('Goto')}" data-goto></button>
                    <button type="button" class="tiptip icon-cog" title="${translate('Edit')}" data-edit></button>
                    <button type="button" class="tiptip icon-move" title="${translate('Change position')}" data-move></button>
                    <button type="button" class="tiptip icon-trash" title="${translate('Delete')}" data-delete></button>
                    <button type="button" class="tiptip icon-picture" title="${translate('Edit photo')}" data-open></button>
                </div>
            </div>
        `;
    }
}

customElements.define('photo-sphere-editor-tour-item', PhotoSphereEditorTourItem);

export class PhotoSphereEditorPanelTour extends HTMLElement {

    /** @type {import('./search-dialog.js').PhotoSphereEditorSearchDialog} */
    #searchDialog = null;
    /** @type {HTMLElement} */
    #editDialog = null;
    /** @type {HTMLElement} */
    #addPhotoBtn = null;
    /** @type {HTMLElement} */
    #list = null;

    /** @type {import('./data.js').Link} */
    #tempLink = null;

    get #links() {
        return [...this.querySelectorAll('photo-sphere-editor-tour-item')].map(item => item.data);
    }

    connectedCallback() {
        this.#render();

        this.#searchDialog = this.querySelector('dialog[is=photo-sphere-editor-search-dialog]');
        this.#editDialog = this.querySelector('dialog[is=photo-sphere-editor-edit-dialog]');
        this.#addPhotoBtn = this.querySelector('#add-photo-btn');
        this.#list = this.querySelector('#links-list');

        this.#addPhotoBtn.addEventListener('click', () => {
            this.#searchDialog.showAndLoad(
                categories(),
                [
                    parseInt(picture().id),
                    ...this.#links.map(l => l.dst_id)
                ]
            );
        });

        this.#searchDialog.addEventListener('close', () => {
            if (this.#searchDialog.returnValue) {
                this.#prepareNewLink(JSON.parse(this.#searchDialog.returnValue));
            }
        });

        this.#editDialog.addEventListener('close', () => {
            if (this.#editDialog.returnValue) {
                this.#addEditLink(JSON.parse(this.#editDialog.returnValue));
            }
        });

        this.#list.addEventListener('move-link', (e) => {
            e.stopImmediatePropagation();
            if (this.#tempLink?.dst_id === e.detail.dst_id) {
                this.#cancelTempLink();
            } else {
                this.#prepareMoveLink(e.detail);
            }
        }, { capture: true });

        this.#list.addEventListener('edit-link', (e) => {
            e.stopImmediatePropagation();
            this.#cancelTempLink();
            this.#editDialog.showAndLoad(e.detail);
        }, { capture: true });

        this.#list.addEventListener('delete-link', (e) => {
            e.stopImmediatePropagation();
            $.confirm({
                title: translate('Delete link to "{0}" ?', e.detail.name),
                content: '',
                buttons: {
                    confirm: {
                        text: translate('Yes'),
                        btnClass: 'btn-red',
                        action: () => this.#deleteLink(e.detail, false),
                    },
                    confirm2: e.detail.return_link ? {
                        text: translate('Yes, and the return link'),
                        btnClass: 'btn-red',
                        action: () => this.#deleteLink(e.detail, true),
                    } : undefined,
                    cancel: {
                        text: translate('No'),
                    },
                },
                ...jConfirm_confirm_options
            });
        }, { capture: true });
    }

    #render() {
        this.innerHTML = `
        <button class="buttonLike" type="button" id="add-photo-btn">
            <i class="icon-plus"></i>
            ${translate('Add a new link')}
        </button>

        <div id="links-list"></div>

        <dialog is="photo-sphere-editor-search-dialog"></dialog>
        <dialog is="photo-sphere-editor-edit-dialog"></dialog>
        `;
    }

    /**
     * @param {Object} data 
     */
    onClick(data) {
        if (this.#tempLink) {
            const isNew = this.#tempLink.yaw === null;

            const link = {
                ...this.#tempLink,
                yaw: data.yaw,
                pitch: data.pitch,
            };

            if (isNew) {
                $.confirm({
                    title: translate('Create return link from "{0}" ?', link.name),
                    content: '',
                    buttons: {
                        confirm: {
                            text: translate('Yes'),
                            btnClass: 'btn-green',
                            action: () => this.#addEditLink(link, true),
                        },
                        cancel: {
                            text: translate('No'),
                            action: () => this.#addEditLink(link, false),
                        },
                    },
                    ...jConfirm_confirm_options
                });
            } else {
                this.#addEditLink(link, false);
            }
        }
    }

    /**
     * @param {import('./data.js').Link[]} links
     */
    setLinks(links) {
        links.forEach(link => {
            this.#addLinkItem(link);
        });
    }

    /**
     * @param {import('./data.js').Link} link
     */
    #addLinkItem(link) {
        const existingLink = this.#list.querySelector(`[data-dst-id="${link.dst_id}"]`);

        const item = document.createElement('photo-sphere-editor-tour-item');
        item.setAttribute('data-dst-id', link.dst_id);
        item.data = link;

        if (existingLink) {
            this.#list.replaceChild(item, existingLink);
        } else {
            this.#list.appendChild(item);
        }
    }

    /**
     * @param {import('./data.js').Link} link
     * @param {boolean} createReturn 
     */
    async #addEditLink(link, createReturn) {
        await $.ajax({
            url: `/ws.php?format=json&method=psv.addLink`,
            type: 'POST',
            dataType: 'json',
            data: {
                ...link,
                pwg_token: pwgToken(),
            },
        });

        if (createReturn) {
            const returnLink = {
                src_id: link.dst_id,
                dst_id: link.src_id,
                yaw: link.yaw + Math.PI,
                pitch: link.pitch,
            };
            if (returnLink.yaw > Math.PI * 2) {
                returnLink.yaw -= Math.PI * 2;
            }

            await $.ajax({
                url: `/ws.php?format=json&method=psv.addLink`,
                type: 'POST',
                dataType: 'json',
                data: {
                    ...returnLink,
                    pwg_token: pwgToken(),
                },
            });
        }

        this.#addLinkItem(link);
        this.#cancelTempLink();

        this.dispatchEvent(new CustomEvent('add-edit-marker', { detail: link, bubbles: true }));
    }

    /**
     * @param {import('./data.js').Link} link
     * @param {boolean} deleteReturn
     */
    async #deleteLink(link, deleteReturn) {
        this.#cancelTempLink();

        await $.ajax({
            url: `/ws.php?format=json&method=psv.deleteLink`,
            type: 'POST',
            dataType: 'json',
            data: {
                src_id: link.src_id,
                dst_id: link.dst_id,
                pwg_token: pwgToken(),
            },
        });

        if (deleteReturn) {
            await $.ajax({
                url: `/ws.php?format=json&method=psv.deleteLink`,
                type: 'POST',
                dataType: 'json',
                data: {
                    src_id: link.dst_id,
                    dst_id: link.src_id,
                    pwg_token: pwgToken(),
                },
            });
        }

        this.#list.querySelector(`[data-dst-id="${link.dst_id}"]`).remove();

        this.dispatchEvent(new CustomEvent('delete-marker', { detail: link, bubbles: true }));
    }

    /**
     * @param {Object} image
     */
    #prepareNewLink(image) {
        this.#tempLink = {
            src_id: picture().id,
            dst_id: image.id,
            width: image.width,
            height: image.height,
            yaw: null,
            pitch: null,
            title: null,
            file: image.file,
            name: image.name,
            square: image.derivatives.square,
        };

        this.#showNotification(translate('place_link_hint'));
    }

    /**
     * @param {import('./data.js').Link} link
     */
    #prepareMoveLink(link) {
        this.#tempLink = link;
        this.#showNotification(translate('place_link_hint'));
    }

    #cancelTempLink() {
        if (this.#tempLink) {
            this.#tempLink = null;
            this.#showNotification(null);
        }
    }

    #showNotification(message) {
        this.dispatchEvent(new CustomEvent('notification', { detail: message, bubbles: true }));
    }

}

customElements.define('photo-sphere-editor-panel-tour', PhotoSphereEditorPanelTour);
