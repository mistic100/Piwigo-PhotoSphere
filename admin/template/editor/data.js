import { MathUtils } from 'three';

/**
 * @typedef {Object} Picture
 * @property {number} id
 * @property {string} name
 * @property {string} image_url
 * @property {string} square_url
 * @property {Object} photosphere_config
 * @property {number} photosphere_config.minFov
 * @property {number} photosphere_config.maxFov
 * @property {number} photosphere_config.defaultZoomLvl
 * @property {boolean} photosphere_config.fisheye
 * @property {Object} photosphere_config.sphereCorrection
 * @property {number} photosphere_config.sphereCorrection.pan
 * @property {number} photosphere_config.sphereCorrection.tilt
 * @property {number} photosphere_config.sphereCorrection.roll
 */

/**
 * @typedef {Object} Image
 * @property {number} id
 * @property {string} name
 * @property {string} file
 * @property {number} width
 * @property {number} height
 * @property {string} square_url
 */

/**
 * @typedef {Object} Linked
 * @property {number} src_id
 * @property {number} dst_id
 * @property {boolean} [return_link]
 * @property {number} width
 * @property {number} height
 * @property {number} yaw
 * @property {number} pitch
 * @property {string} title
 * @property {string} file
 * @property {string} name
 * @property {string} square_url
 */

/**
 * @typedef {Object} Link
 * @property {number} src_id
 * @property {number} dst_id
 * @property {Image} src
 * @property {Image} dst
 */

/**
 * @typedef {Object} Category
 * @property {number} id
 * @property {string} name
 */

const data = {
    rootUrl: null,
    pwgToken: null,
    config: null,
    lang: null,
    picture: null,
    categories: null,
};

export function init(params) {
    Object.assign(data, params);
}

/** @return {string} */
export function rootUrl() {
    return data.rootUrl;
}

/** @return {string} */
export function pwgToken() {
    return data.pwgToken;
}

/** @return {Picture} */
export function picture() {
    return data.picture;
}

/** @return {Category[]} */
export function categories() {
    return data.categories;
}

export function translate(k, ...args) {
    let message = data.lang[k] || k;
    for (let i = 0; i < args.length; i++) {
        const regexp = new RegExp(`\\{${i}\\}`, 'g');
        message = message.replace(regexp, args[i]);
    }
    return message;
}

export function sphereCorrectionDegToRad(sphereCorrection) {
    return {
        pan: MathUtils.degToRad(sphereCorrection?.pan ?? 0),
        tilt: MathUtils.degToRad(sphereCorrection?.tilt ?? 0),
        roll: MathUtils.degToRad(sphereCorrection?.roll ?? 0),
    };
}

/**
 * @param {number} id 
 */
export function gotoImage(id) {
    location.href = `${rootUrl()}admin.php?page=plugin-PhotoSphere-photo&image_id=${id}`;
}
