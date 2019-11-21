/**
 * Insert CSS-file into document <head>
 *
 * @param {string} url - url to css file
 */
function injectCssFile(url) {
    // Get HTML head element
    let head = document.getElementsByTagName('head')[0];
    // Create new link Element
    let link = document.createElement('link');
    // Set the attributes for link element
    link.rel = 'stylesheet';
    link.type = 'text/css';
    link.href = url;
    // Append link element to HTML head
    head.appendChild(link);
}


/**
 * Insert JS-script into document head
 * 
 * Callback is called on script successful load
 *
 * @param {string} url - url to script
 * @callback `callback` is onload event callback
 */
function injectJsScript(url, callback = undefined) {
    var script = document.createElement("script")
    script.type = "text/javascript";

    if (script.readyState) {
        script.onreadystatechange = function () {
            if (script.readyState == "loaded" ||
                script.readyState == "complete") {
                script.onreadystatechange = null;
                if (callback) {
                    callback();
                }
            }
        };
    } else {
        script.onload = function () {
            if (callback) {
                callback();
            }
        };
    }

    script.src = url;
    document.getElementsByTagName("head")[0].appendChild(script);
}