import { categories, gotoImage, picture, pwgToken, translate } from './data.js';

class PhotoSphereEditorTourItem extends HTMLElement {
    /** @type {import('./data.js').Linked} */
    data = null;

    connectedCallback() {
        this.#render();

        this.querySelector('[data-goto]').addEventListener('click', () => {
            this.dispatchEvent(new CustomEvent('goto-marker', { detail: this.data, bubbles: true }));
        });

        this.querySelector('[data-delete]').addEventListener('click', () => {
            this.dispatchEvent(new CustomEvent('delete-link', { detail: this.data }));
        });

        this.querySelector('[data-move]').addEventListener('click', () => {
            this.dispatchEvent(new CustomEvent('move-link', { detail: this.data }));
        });

        this.querySelector('[data-open]').addEventListener('click', () => {
            gotoImage(this.data.dst_id);
        });

        $(this.querySelectorAll('.tiptip')).tipTip({ delay: 100 });
    }

    #render() {
        this.innerHTML = `
            <img src="${this.data.square_url}" alt="${this.data.file}">

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
    /** @type {import('./network-dialog.js').PhotoSphereEditorNetworkDialog} */
    #networkDialog = null;
    /** @type {HTMLElement} */
    #list = null;

    /** @type {import('./data.js').Linked} */
    #tempLink = null;

    get #links() {
        return [...this.querySelectorAll('photo-sphere-editor-tour-item')].map(item => item.data);
    }

    connectedCallback() {
        this.#render();

        this.#searchDialog = this.querySelector('dialog[is=photo-sphere-editor-search-dialog]');
        this.#networkDialog = this.querySelector('dialog[is=photo-sphere-editor-network-dialog]');
        this.#list = this.querySelector('#links-list');

        this.querySelector('[data-add-photo]').addEventListener('click', () => {
            this.#searchDialog.loadAndShow(
                categories(),
                [
                    picture().id,
                    ...this.#links.map(l => l.dst_id)
                ]
            );
        });

        this.querySelector('[data-network]').addEventListener('click', () => {
            this.#networkDialog.loadAndShow();
        });

        this.#searchDialog.addEventListener('close', () => {
            if (this.#searchDialog.returnValue) {
                this.#prepareNewLink(JSON.parse(this.#searchDialog.returnValue));
            }
        });

        this.#list.addEventListener('goto-marker', () => {
            this.#cancelTempLink();
        });

        this.#list.addEventListener('move-link', (e) => {
            e.stopImmediatePropagation();
            if (this.#tempLink?.dst_id === e.detail.dst_id) {
                this.#cancelTempLink();
            } else {
                this.#prepareMoveLink(e.detail);
                this.dispatchEvent(new CustomEvent('goto-marker', { detail: e.detail, bubbles: true }));
            }
        }, { capture: true });

        this.#list.addEventListener('delete-link', (e) => {
            /** @type {import('./data.js').Linked} */
            const link = e.detail;

            e.stopImmediatePropagation();
            $.confirm({
                title: translate('Delete link to "{0}" ?', link.name),
                content: '',
                buttons: {
                    confirm: {
                        text: translate('Yes'),
                        btnClass: 'btn-red',
                        action: () => this.#deleteLink(link, false),
                    },
                    confirm2: link.return_link ? {
                        text: translate('Yes, and the return link'),
                        btnClass: 'btn-red',
                        action: () => this.#deleteLink(link, true),
                    } : undefined,
                    cancel: {
                        text: translate('No'),
                    },
                },
                ...jConfirm_confirm_options
            });
        }, { capture: true });

        this.#networkDialog.addEventListener('delete-link', (e) => {
            /** @type {import('./data.js').Link} */
            const link = e.detail;

            $.confirm({
                title: translate('Delete link to "{0}" ?', link.dst.name),
                content: '',
                buttons: {
                    confirm: {
                        text: translate('Yes'),
                        btnClass: 'btn-red',
                        action: async () => {
                            await this.#deleteLink(link, true);
                            this.#networkDialog.removeLink(link);
                        }
                    },
                    cancel: {
                        text: translate('No'),
                    },
                },
                container: this.#networkDialog,
                ...jConfirm_confirm_options
            });
        });
    }

    #render() {
        this.innerHTML = `
        <div>
            <button class="buttonLike" type="button" data-add-photo>
                <i class="icon-plus"></i>
                ${translate('Add a new link')}
            </button>
            <button class="buttonLike" type="button" data-network>
                <i class="icon-network"></i>
                ${translate('Network')}
            </button>
        </div>

        <div id="links-list"></div>

        <dialog is="photo-sphere-editor-search-dialog"></dialog>
        <dialog is="photo-sphere-editor-network-dialog"></dialog>
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
     * @param {import('./data.js').Linked[]} links
     */
    setLinks(links) {
        links.forEach(link => {
            this.#addLinkItem(link);
        });
    }

    /**
     * @param {import('./data.js').Linked} link
     */
    #addLinkItem(link) {
        const existingLink = this.#getLinkItem(link.dst_id);

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
     * @param {import('./data.js').Linked} link
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
     * @param {import('./data.js').Linked | import('./data.js').Link} link
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

        if (link.src_id === picture().id) {
            this.#getLinkItem(link.dst_id).remove();

            this.dispatchEvent(new CustomEvent('delete-marker', { detail: link, bubbles: true }));
        }
    }

    /**
     * @param {Object} image
     */
    #prepareNewLink(image) {
        /** @type {import('./data.js').Linked} */
        this.#tempLink = {
            src_id: picture().id,
            dst_id: image.id,
            width: image.width,
            height: image.height,
            yaw: null,
            pitch: null,
            file: image.file,
            name: image.name,
            square_url: image.square_url,
        };

        this.#showNotification(translate('place_link_hint'));
    }

    /**
     * @param {import('./data.js').Linked} link
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

    /**
     * @param {sstring} message 
     */
    #showNotification(message) {
        this.dispatchEvent(new CustomEvent('notification', { detail: message, bubbles: true }));
    }

    /**
     * @param {number} id 
     * @returns {PhotoSphereEditorTourItem}
     */
    #getLinkItem(id) {
        return this.#list.querySelector(`[data-dst-id="${id}"]`);
    }

}

customElements.define('photo-sphere-editor-panel-tour', PhotoSphereEditorPanelTour);
