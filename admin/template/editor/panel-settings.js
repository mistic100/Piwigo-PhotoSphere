import { picture, pwgToken, sphereCorrectionDegToRad, translate } from './data.js';

const DEFAULT_CONFIG = {
    fov: [30, 90],
    defaultZoomLvl: 50,
    fisheye: false,
    pan: 0,
    tilt: 0,
    roll: 0,
};

const SLIDERS = {
    fov: { range: true, min: 1, max: 180 },
    defaultZoomLvl: { min: 0, max: 100 },
    pan: { min: -180, max: 180 },
    tilt: { min: -90, max: 90 },
    roll: { min: -180, max: 180 },
};

function getSliderConfig(prop, initialConfig) {
    const config = { ...SLIDERS[prop] };

    switch (prop) {
        case 'fov':
            config.values = [...initialConfig[prop]];
            break;
        default:
            config.value = initialConfig[prop];
            break;
    }

    return config;
}

export class PhotoSphereEditorPanelSettings extends HTMLElement {
    #config = { ...DEFAULT_CONFIG };

    /** @type {HTMLInputElement} */
    #fisheye = null;

    connectedCallback() {
        const psvConfig = picture().photosphere_config;
        if (psvConfig) {
            this.#config.fov = [
                psvConfig.minFov ?? DEFAULT_CONFIG.minFov,
                psvConfig.maxFov ?? DEFAULT_CONFIG.maxFov,
            ];
            this.#config.defaultZoomLvl = psvConfig.defaultZoomLvl ?? DEFAULT_CONFIG.defaultZoomLvl;
            this.#config.fisheye = psvConfig.fisheye ?? DEFAULT_CONFIG.fisheye;
            this.#config.pan = psvConfig.sphereCorrection?.pan ?? DEFAULT_CONFIG.pan;
            this.#config.tilt = psvConfig.sphereCorrection?.tilt ?? DEFAULT_CONFIG.tilt;
            this.#config.roll = psvConfig.sphereCorrection?.roll ?? DEFAULT_CONFIG.roll;
        }

        this.#render();

        this.#fisheye = this.querySelector('[name=fisheye]');

        this.querySelectorAll('[data-slider]').forEach(element => {
            const prop = element.dataset.slider;
            const config = getSliderConfig(prop, this.#config);

            $(element).slider({
                ...config,
                step: 1,
                change: (_, ui) => this.#onSliderChange(prop, ui),
                slide: (_, ui) => this.#onSliderChange(prop, ui),
            });

            this.#updateSliderValue(prop, config);
        });

        this.#fisheye.addEventListener('change', (e) => {
            this.#config.fisheye = e.target.checked;
            this.#dispatchConfig({
                fisheye: this.#config.fisheye,
            });
        });

        this.querySelector('[data-reset]').addEventListener('click', () => {
            this.#reset();
        });

        this.querySelector('form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.#save();
        });

        $(this.querySelectorAll('.tiptip')).tipTip({ delay: 100 });

        $(this.querySelectorAll('.font-checkbox')).fontCheckbox();
    }

    #render() {
        this.innerHTML = `
            <form id="settings-form">
                <fieldset>
                    <h4>${translate('Display')}</h4>

                    <label>
                        <strong>${translate('Allowed field of view')} :</strong>
                        <span data-slider-value="fov">30° - 90°</span>
                    </label>
                    <div class="slider-bar-wrapper"><div class="slider-bar-container" data-slider="fov"></div></div>
                    
                    <label>
                        <strong>${translate('Defaut zoom level')} :</strong>
                        <span data-slider-value="defaultZoomLvl">50%</span>
                    </label>
                    <div class="slider-bar-wrapper"><div class="slider-bar-container" data-slider="defaultZoomLvl"></div></div>

                    <label class="font-checkbox">
                        <span class="icon-check"></span>
                        <input type="checkbox" name="fisheye" ${this.#config.fisheye ? 'checked' : ''}>
                        <strong>${translate('Fisheye')}</strong>
                    </label>
                </fieldset>


                <fieldset>
                    <h4>
                        ${translate('Orientation correction')}
                        <i class="tiptip icon-help-circled" title="${translate('orientation_help')}"></i>
                    </h4>

                    <label>
                        <strong>${translate('Pan')} :</strong>
                        <span data-slider-value="pan">0°</span>
                    </label>
                    <div class="slider-bar-wrapper"><div class="slider-bar-container" data-slider="pan"></div></div>

                    <label>
                        <strong>${translate('Tilt')} :</strong>
                        <span data-slider-value="tilt">0°</span>
                    </label>
                    <div class="slider-bar-wrapper"><div class="slider-bar-container" data-slider="tilt"></div></div>

                    <label>
                        <strong>${translate('Roll')} :</strong>
                        <span data-slider-value="roll">0°</span>
                    </label>
                    <div class="slider-bar-wrapper"><div class="slider-bar-container" data-slider="roll"></div></div>
                </fieldset>

                <button class="buttonLike" type="button" data-reset>
                    <i class="icon-cancel"></i>
                    ${translate('Reset')}
                </button>

                <button class="buttonLike" type="submit">
                    <i class="icon-floppy"></i>
                    ${translate('Save')}
                </button>
            </form>
        `;
    }

    async #reset() {
        this.#config = { ...DEFAULT_CONFIG };

        this.#fisheye.checked = this.#config.fisheye;
        this.#fisheye.dispatchEvent(new CustomEvent('change'));

        this.querySelectorAll('[data-slider]').forEach(element => {
            const prop = element.dataset.slider;

            switch (prop) {
                case 'fov':
                    $(element).slider('option', 'values', [...this.#config[prop]]);
                    break;
                default:
                    $(element).slider('option', 'value', this.#config[prop]);
                    break;
            }
        });

        await $.ajax({
            url: `/ws.php?format=json&method=psv.setConfig`,
            type: 'POST',
            dataType: 'json',
            data: {
                image_id: picture().id,
                reset: true,
                pwg_token: pwgToken(),
            },
        });
    }

    async #save() {
        await $.ajax({
            url: `/ws.php?format=json&method=psv.setConfig`,
            type: 'POST',
            dataType: 'json',
            data: {
                image_id: picture().id,
                minFov: this.#config.fov[0],
                maxFov: this.#config.fov[1],
                defaultZoomLvl: this.#config.defaultZoomLvl,
                fisheye: this.#config.fisheye,
                sphereCorrection_pan: this.#config.pan,
                sphereCorrection_tilt: this.#config.tilt,
                sphereCorrection_roll: this.#config.roll,
                pwg_token: pwgToken(),
            },
        });
    }

    #updateSliderValue(prop, slider) {
        const valueContainer = this.querySelector(`[data-slider-value="${prop}"]`);

        switch (prop) {
            case 'fov':
                valueContainer.innerText = `${slider.values[0]}° - ${slider.values[1]}°`;
                break;
            case 'defaultZoomLvl':
                valueContainer.innerText = slider.value + '%';
                break;
            case 'pan':
            case 'tilt':
            case 'roll':
                valueContainer.innerText = slider.value + '°';
                break;
        }
    }

    /**
     * @param {string} prop
     * @param {Object} slider
     */
    #onSliderChange(prop, slider) {
        this.#updateSliderValue(prop, slider);

        switch (prop) {
            case 'fov':
                this.#config.fov = [...slider.values];
                this.#dispatchConfig({
                    minFov: this.#config.fov[0],
                    maxFov: this.#config.fov[1],
                });
                break;
            case 'defaultZoomLvl':
                this.#config.defaultZoomLvl = slider.value;
                this.#dispatchConfig({
                    defaultZoomLvl: this.#config.defaultZoomLvl,
                });
                break;
            case 'pan':
            case 'tilt':
            case 'roll':
                this.#config.pan = $(this.querySelector('[data-slider="pan"]')).slider('option', 'value');
                this.#config.tilt = $(this.querySelector('[data-slider="tilt"]')).slider('option', 'value');
                this.#config.roll = $(this.querySelector('[data-slider="roll"]')).slider('option', 'value');
                this.#dispatchConfig({
                    sphereCorrection: sphereCorrectionDegToRad(this.#config),
                });
                break;
        }
    }

    /**
     * @param {Object} config
     */
    #dispatchConfig(config) {
        this.dispatchEvent(new CustomEvent('config-change', { detail: config, bubbles: true }));
    }

}

customElements.define('photo-sphere-editor-panel-settings', PhotoSphereEditorPanelSettings);
