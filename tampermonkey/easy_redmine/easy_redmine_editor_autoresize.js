// ==UserScript==
// @name         Easy Redmine - Article editor autoresize
// @namespace    http://dlisin.tk
// @version      0.3
// @description  Autoresize height of Easy Redmine article editor
// @author       Lisin D.A.
// @include      /http:\w*\/\/redmine(\.pin)?\w*\/{1}easy_knowledge_stories\/.+\/edit
// @include      /http:\w*\/\/redmine(\.pin)?\w*\/{1}easy_knowledge_stories\/new
// @grant        none
// ==/UserScript==


// TODO:
// - add more docs and explanations;
// - get rid of a mess;
// - add more functions.

(function () {
    'use strict';

    function addStyleToStyleSheet(cssStr) {
        var style = document.createElement('style');
        if (style.styleSheet) {
            style.styleSheet.cssText = cssStr;
        } else {
            style.appendChild(document.createTextNode(cssStr));
        }

        document.getElementsByTagName('head')[0].appendChild(style);
    }

    let EXTRA_SPACE_AFTER_TEXT = 50
    let descriptionLabelSelector = "label.wiki-edit"
    let textContainerId = "cke_1_contents"
    let fullTextFrameSelector = "iframe.cke_wysiwyg_frame"
    let toolbarId = "cke_1_top"
    let editorContainerSelector = "p.description"

    let css = `${descriptionLabelSelector}:hover {
                   text-decoration: underline;
               }
               ${descriptionLabelSelector} {
                   color: #009ee0;
                   cursor: pointer;
               }
               .sticky {
                    position: fixed !important;
                    top: 49px !important;
                    background-color: rgb(251, 250, 236) !important;
                    border: 1px solid #dfccaf !important;
                    padding: 10px 0px 0px !important;
               }`
    addStyleToStyleSheet(css)

    let button = document.querySelector(descriptionLabelSelector);
    button.onclick = resizeTextArea

    function resizeTextArea() {
        var textContainer = document.getElementById(textContainerId);
        var fullTextFrame = document.querySelector(fullTextFrameSelector);

        let resizeInterval = setInterval(function () {
            let actualHeight = fullTextFrame.contentWindow.document.body.offsetHeight;
            textContainer.style.cssText = 'height:auto; padding:0';
            textContainer.style.cssText = 'height:' + (actualHeight + EXTRA_SPACE_AFTER_TEXT) + 'px !important';
        }, 500);

        button.onclick = function () {
            clearInterval(resizeInterval);
            button.onclick = resizeTextArea;
            alert("Auto resize off")
        }
    }

    setTimeout(function () {
        var toolbar = document.getElementById(toolbarId);
        let toolbarHeight = toolbar.getBoundingClientRect().height;
        var stickyOffset = toolbar.getBoundingClientRect().top;
        var textContainer = document.getElementById(textContainerId);

        window.onscroll = function () {
            let stickyStopLone = stickyOffset + textContainer.offsetHeight - toolbarHeight
            if (window.pageYOffset >= stickyOffset && window.pageYOffset <= stickyStopLone) {
                if (!toolbar.classList.contains("sticky")) {
                    toolbar.classList.add("sticky")
                    toolbar.style.cssText = 'width:' + textContainer.clientWidth + 'px !important';
                }
            } else {
                toolbar.classList.remove("sticky");
                toolbar.style.cssText = 'width:""';
            }
        }

        window.addEventListener("resize", function () {
            if (toolbar.classList.contains("sticky")) {
                toolbar.style.cssText = 'width:' + textContainer.clientWidth + 'px !important';
            }
        });
    }, 500)
})();