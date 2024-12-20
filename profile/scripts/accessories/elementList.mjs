import accessoriesList from '../../../accessory/list.json' with {type: 'json'};
import * as domainManager from "../../../scripts/domainManager.mjs";
import * as accessoriesApi from "./accessoriesApi.mjs";

/**
 * @type {Set<string>}
 * */
export const selectedAccessoryKeys = new Set();

/**
 * @param {string} key
 * @returns void
 * */
export function downloadAccessory(key) {
    const accessory = accessoriesList[key];
    if (accessory === undefined || accessory === null) return;

    let configFile = accessory.modelConfig;
    let textureFile = accessory.modelTexture;

    download_files([configFile, textureFile]
        .filter(value => value !== undefined && value !== null)
        .map(value => {
            const slashIndex = value.lastIndexOf('/');
            const fileName = value.substring(slashIndex + 1);

            return {download: replaceDomain(value), filename: fileName}
        })
    );
}

/**
 * @param {HTMLElement} component
 * @param {string} searchText
 * @param {boolean} hasPermission
 * @returns void
 * */
export function drawAvailableAccessories(component, searchText, hasPermission) {
    let domHtml = "";

    const seasonalAccessories = accessoriesApi.getAllSeasonalAccessories();

    const searchedWords = searchText.trim().toLowerCase().split(" ");
    for (const [key, accessory] of Object.entries(accessoriesList)) {
        if (key === undefined || key === null) continue;

        if (selectedAccessoryKeys.has(key) || !isSearchedElement(key, accessory.name, searchedWords)) {
            continue;
        }

        const name = accessory.name || key;
        const previewAspectRatio = accessory.preview.aspectRatio || 0.86468646864686468646864686468647;
        const previewUrl = replaceDomain(accessory.preview.url || "{tntweb}images/accessories/missing.png");

        const buttonClick = (hasPermission || seasonalAccessories.includes(key)) ?
            `class="btn btn-success d-block w-100" onclick="window.addAccessory('${key}')"` :
            'class="btn btn-secondary d-block w-100" data-bs-toggle="tooltip" data-bs-placement="bottom" ' +
            'data-bs-title="You haven\'t bought accessories." style="pointer-events: auto;" disabled';

        domHtml +=
            `<div class="col">
                <div class="card h-100 shadow-lg">
                    <img class="card-img-top" src="${previewUrl}" alt="Image: ${name}" loading="lazy" style="aspect-ratio: ${previewAspectRatio}">
                    <div class="card-body">
                        <h5 class="card-title text-center">${name}</h5>
                    </div>
                    <div class="card-footer">
                        <button class="btn btn-link my-auto p-0 mb-2 d-block w-100" data-bs-toggle="tooltip" data-bs-placement="top"
                           data-bs-title="Download the model for BlockBench if you want to modify it." 
                           onclick="window.downloadAccessory('${key}')">Download model</button>
                        <button ${buttonClick}>Enable</button>
                    </div>
                </div>
            </div>`;
    }

    component.innerHTML = domHtml;
}

/**
 * @param {HTMLElement} component
 * @returns void
 * */
export function drawSelectedAccessories(component) {
    let domHtml = "";

    for (const accessoryKey of selectedAccessoryKeys) {
        if (accessoryKey === undefined || accessoryKey === null) continue;

        const accessory = accessoriesList[accessoryKey];
        if (accessory === undefined || accessory === null) continue;

        const name = accessory.name || accessoryKey;
        const previewAspectRatio = accessory.preview.aspectRatio || 0.86468646864686468646864686468647;
        const previewUrl = replaceDomain(accessory.preview.url || "{tntweb}images/accessories/missing.png");

        domHtml +=
            `<div class="col">
                <div class="card h-100 shadow-lg">
                    <img class="card-img-top" src="${previewUrl}" alt="Image: ${name}" loading="lazy" style="aspect-ratio: ${previewAspectRatio}">
                    <div class="card-body">
                        <h5 class="card-title text-center">${name}</h5>
                    </div>
                    <div class="card-footer">
                        <button class="btn btn-link my-auto p-0 mb-2 d-block w-100" data-bs-toggle="tooltip" data-bs-placement="top"
                           data-bs-title="Download the model for BlockBench if you want to modify it." 
                           onclick="window.downloadAccessory('${accessoryKey}')">Download model</button>
                        <button class="btn btn-danger d-block w-100" onclick="window.removeAccessory('${accessoryKey}')">Disable</button>
                    </div>
                </div>
            </div>`;
    }

    component.innerHTML = domHtml;
}

/**
 * @param {string} key
 * @param {string|undefined} name
 * @param {string[]} searchedWords
 * @returns {boolean}
 * @private
 * */
function isSearchedElement(key, name, searchedWords) {
    if (key === undefined && name === undefined) return false;

    const lowerKey = key.toLowerCase();
    const nameLower = name?.toLowerCase();

    for (const word of searchedWords) {
        if (!(lowerKey.includes(word) || (nameLower !== undefined && nameLower.includes(word)))) return false;
    }

    return true;
}

/**
 * Download a list of files.
 * @author speedplane
 */
function download_files(files) {
    function download_next(i) {
        if (i >= files.length) {
            return;
        }
        const a = document.createElement('a');
        a.href = files[i].download;
        a.target = '_parent';
        // Use a.download if available, it prevents plugins from opening.
        if ('download' in a) {
            a.download = files[i].filename;
        }
        // Add to the doc for click to work.
        (document.body || document.documentElement).appendChild(a);
        a.click(); // The click method is supported by most browsers.
        // Delete the temporary link.
        a.parentNode.removeChild(a);
        // Download the next file with a small timeout. The timeout is necessary
        // for IE, which will otherwise only download the first file.
        setTimeout(function () {
            download_next(i + 1);
        }, 500);
    }

    // Initiate the first download.
    download_next(0);
}

/**
 * @param {string} url
 * @returns {string}
 * */
function replaceDomain(url) {
    return url.replaceAll("{tntweb}", domainManager.getCurrentOrigin())
}