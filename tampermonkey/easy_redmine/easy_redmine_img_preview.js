// ==UserScript==
// @name         Easy Redmine - Image preview
// @namespace    http://dlisin.tk
// @version      0.2.2
// @description  Show full image preview by clicking on img inside a knowledge base article
// @author       Lisin D.A.
// @include      /http(s)?:\/\/.*redmine.*\/easy_knowledge_stories\/\d+#?.*
// @require      https://gitcdn.xyz/repo/mrdimfox/sites_improvers_collection/master/tampermonkey/helpers/tm_injections.js
// @grant        GM_addStyle
// ==/UserScript==

// How to:
// - install Tampermonkey in your browser (https://www.tampermonkey.net/faq.php?ext=dhdg#Q100);
// - add this script into extension ("Utilities > Install from URL > Paste this script URL (raw) > Install > Install");
// - enjoy!


//** Script constants */
const IMGS_CONTAINER_CLASS_NAME = "wiki";
const THUMBNAILS_ELEM_CLASS_NAME = "thumbnail";
const IMAGE_FULLSCR_ATTR = "data-fullsrc";
const JS_ONLY_LIGHTBOX_CSS = 'https://cdn.jsdelivr.net/npm/jsonlylightbox@0.5.5/css/lightbox.min.css';
const JS_ONLY_LIGHTBOX_JS = 'https://cdn.jsdelivr.net/npm/jsonlylightbox@0.5.5/js/lightbox.min.js';

//** Extra styles for lightbox library */
const STYLE_SHEET = `
#jslghtbx {
    z-index: 9999;
}
`

/**
 * Returns last array element
 *
 * or undefined if there is no elements in array
 *
 * @param {Array<T>} array
 * @returns {T} array element | undefined
 */
function lastElem(array) {
    return array[array.length - 1];
}


/**
 * Generate an downloadable link form attachment link
 * 
 * @param {string} attachment_link - a link to attachment like `http://redmine.pin/attachments/3480`
 * @returns {string} - downloadable link to attachment
 */
function generateDownloadAttachmentLink(attachment_link) {
    // Extract parts "http://redmine.pin/" and "/3480"
    let [page_url, attachment_id] = attachment_link.split("attachments");
    // Make downloadable image link
    let download_url = `${page_url}attachments/download${attachment_id}`;

    return download_url;
}


/**
 * Adds a lightbox attrib to <img> element to make it "previewable"
 * 
 * @param {HTMLImageElement} img - <img> DOM-element to setup library attrs
 * @param {string} full_img_url - link to full size image
 */
function make_img_previewable(img, full_img_url) {
    img.setAttribute('data-jslghtbx', full_img_url);
}


(function () {
    'use strict';

    let imgsContainers = document.querySelectorAll(`.${IMGS_CONTAINER_CLASS_NAME}`);
    if (imgsContainers.length > 1) { // there should be only one images container
        console.log(`To many image containers (.${IMGS_CONTAINER_CLASS_NAME}) is found!`);
        return;
    }
    if (imgsContainers.length == 0) { // there should be at least one images container
        console.log(`Image containers (.${IMGS_CONTAINER_CLASS_NAME}) is not found!`);
        return;
    }
    console.log(`.${IMGS_CONTAINER_CLASS_NAME} element found!`);

    let imgsContainer = imgsContainers[0];

    console.log("Creating a cool previews for images...");

    // Extract all images and add lightbox attrs to them
    let images =
        Array.from(imgsContainer.querySelectorAll('a'))
            .filter(function (a) { // filter our imgs in article
                // Img in article is usually a image inside <a> tag
                let img = a.querySelector('img');
                // If there is no image it is not our client
                if (!img) { return false; }

                // All embedded imgs inside article have fullscreen attr
                // All thumbnails have specific class
                return (
                    img.hasAttribute(IMAGE_FULLSCR_ATTR) ||
                    a.classList.contains(THUMBNAILS_ELEM_CLASS_NAME)
                );
            }).map(function (a) { // transform array of <a> to array imgs
                let img = a.querySelector('img');
                make_img_previewable(img, generateDownloadAttachmentLink(a.href));
                return img;
            });

    if (images.length == 0) {
        console.log(`Images was not found!`);
        return;
    }

    console.log(`Previews was created!`);

    // Add and init lightbox library
    injectCssFile(JS_ONLY_LIGHTBOX_CSS);
    injectJsScript(JS_ONLY_LIGHTBOX_JS, function () {
        let lightbox = new Lightbox();
        let lightBoxOptions = {
            captions: false,
            hideCloseBtn: true,
            closeOnClick: true,
            responsive: true,
            maxImgSize: 1,
        }
        lightbox.load(lightBoxOptions);
    });

    GM_addStyle(STYLE_SHEET);
})();