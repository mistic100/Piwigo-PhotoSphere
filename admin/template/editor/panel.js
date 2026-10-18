import { translate } from './data.js';

export class PhotoSphereEditorPanel extends HTMLElement {
    /** @type {import('./panel-settings.js').PhotoSphereEditorPanelSettings} */
    #panelSettings = null;
    /** @type {import('./panel-tour.js').PhotoSphereEditorPanelTour} */
    #panelTour = null;

    connectedCallback() {
        this.#render();

        this.#panelSettings = this.querySelector('photo-sphere-editor-panel-settings');
        this.#panelTour = this.querySelector('photo-sphere-editor-panel-tour');

        this.querySelector('.photo-sphere-editor-tabs').addEventListener('click', (e) => {
            if (e.target.dataset.tab) {
                this.#setTab(e.target.dataset.tab);
            }
        });

        this.#setTab('tour');
    }

    #render() {
        this.innerHTML = `
        <ul class="photo-sphere-editor-tabs">
            <li data-tab="tour">${translate('Linked photos')}</li>
            <li data-tab="settings">${translate('Settings')}</li>
        </ul>

        <photo-sphere-editor-panel-settings data-tab-content="settings"></photo-sphere-editor-panel-settings>
        <photo-sphere-editor-panel-tour data-tab-content="tour"></photo-sphere-editor-panel-tour>
        `;
    }

    /**
     * @param {Object} data 
     */
    onViewerClick(data) {
        this.#panelTour.onClick(data);
    }

    /**
     * @param {import('./data.js').Link[]} links
     */
    setLinks(links) {
        this.#panelTour.setLinks(links);
    }

    /**
     * @param {string} tab 
     */
    #setTab(tab) {
        this.querySelectorAll('[data-tab]').forEach(element => {
            element[element.dataset.tab === tab ? 'setAttribute' : 'removeAttribute']('selected', '');
        });
        this.querySelectorAll('[data-tab-content]').forEach(element => {
            element.style.display = element.dataset.tabContent === tab ? '' : 'none';
        });
    }

}

customElements.define('photo-sphere-editor-panel', PhotoSphereEditorPanel);
