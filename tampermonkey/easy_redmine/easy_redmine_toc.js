// ==UserScript==
// @name         Easy Redmine - Table of content
// @namespace    http://dlisin.tk
// @version      0.4.1
// @description  Make a table of content from headers on `easy_knowledge_stories` pages
// @author       Lisin D.A.
// @include      /http(s)?:\/\/.*redmine.*\/{1}easy_knowledge_stories\/{1}\d+#?.*
// @grant        none
// ==/UserScript==

// How to:
// - install Tampermonkey in your browser (https://www.tampermonkey.net/faq.php?ext=dhdg#Q100);
// - add this script into extension ("Utilites > Install from URL > Paste this script URL (raw) > Install > Install");
// - enjoy!


//** Script constants */
const HEADERS_SELECTOR = "h1, h2, h3, h4, h5, h6";
const MIN_HEADERS_COUNT = 2;
const MAX_TREE_LEVEL = 2;
const HEADERS_CONTAINER_CLASS_NAME = "wiki";
const TABLE_OF_CONTENT_CLASS_NAME = "table-of-content";
const PAGE_ID_PREFIX = "article";

//** ToC styles */
const STYLE_SHEET = `
ul.table-of-content:before {
    content: "Оглавление";
    font-weight: bold;
}

ul.table-of-content {
    display: block;
    position: fixed;

    width:15%;
    height: 100%;

    margin-left: -1px;

    background-color: #f5efe6;

    left: 0;
    top: 87px;

    z-index: 1;

    overflow-y: auto;
}

ul.table-of-content > li {
    list-style: none;
}

div#content {
    margin-left: 15% !important;
}
`

/**
 * Add stylesheet to document
 *
 * @param {string} styles - valid CSS styles
 */
function addStylesheet(styles) {
    let style = document.createElement("style");
    style.innerHTML = styles;
    document.getElementsByTagName("body")[0].appendChild(style);
}

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
 * Node of a tree
 *
 * Header DOM element is only useful data
 * which this tree node stores.
 *
 * @class TreeNode
 */
class TreeNode {
    constructor() {

        /**
         * Level of tree
         *
         * @type {number}
         */
        this.level = 0;

        /**
         * Unique id of node
         *
         * @type {string}
         */
        this.id = "top";

        /**
         * Header element stored in node
         *
         * @type {HTMLHeadingElement}
         */
        this.header = undefined;

        /**
         * Subnodes list
         *
         * @type {Array<TreeNode>}
         */
        this.childNodes = [];

        /**
         * Parent node
         *
         * @type {TreeNode}
         */
        this.parentNode = undefined;
    }

    /**
     * Return last (most right) child of node
     *
     * @memberof TreeNode
     * @returns {TreeNode} last added subnode
     */
    lastChild() {
        return lastElem(this.childNodes);
    }

    /**
     * Add a sub node
     *
     * @param {TreeNode} child
     * @memberof TreeNode
     */
    addChild(child) {
        this.childNodes.push(child)
    }
}


/**
 * Generate id for current node
 *
 * @desc It concatenates `treeId` (probably same str for all nodes,
 *       but not necessary) and index of node in parent list (increased by one)
 *       all way down to root node. Id is unique only inside one tree.
 * @example
 * //               0              1                      2
 * //           node_node   other_node_node     other_other_node_node
 * //                |        |                  |
 * //   0       1    |        |                  |
 * // node  other_node--------+------------------+
 * //   |      |
 * // root-----+
 * //
 * // Id for `other_other_node_node` will be "treeId2.3"
 * // because index of `other_other_node_node` is 2(+1),
 * // index of other_node is 1(+1) and tree id is "treeId".
 *
 * @param {string} treeId
 * @param {TreeNode} node
 * @returns {string} id of tree node
 */
function generateId(treeId, node) {
    // Do nothing for root node
    if (node.parentNode == undefined) {
        return node.id
    }

    let levels = [];

    let currentNode = node;
    while (currentNode.parentNode != undefined) {
        levels.push(currentNode.parentNode.childNodes.indexOf(currentNode) + 1)
        currentNode = currentNode.parentNode;
    }

    return `${treeId}${levels.reverse().join('_')}`
}

/**
 * Create a node in tree
 *
 * For args types see TreeNode class fields.
 *
 * If `parentNode` exists when:
 *  - `level` will be auto initialized (parent level + 1);
 *  - `id` field will be auto initialized (see `generateId`);
 *  - node will be attached to tree - added to parent child list.
 *
 * @example
 * // Create a root node
 * let root_node = new TreeNode()
 * let h = document.querySelector('h1')
 *
 * // Returns node with
 * //  id="node1" (see generateId func)
 * //  level=1 (root node level is 0 => level of child is 1)
 * //  parentNode=root_node (root_node.childNodes += node)
 * //  childNodes=[]
 * //  header=h
 * let node = createNodeOnTree({
 *   treeId: "node",
 *   parentNode: root_node,
 *   header: h
 * });
 *
 * @returns {TreeNode} new node of tree
 * @see TreeNode, generateId
 */
function createNodeOnTree({
    treeId = "_",
    childNodes = [],
    parentNode = undefined,
    header = undefined,
    level = 0
} = {}) {
    let n = new TreeNode()

    n.level = level;
    n.header = header
    n.childNodes = childNodes;
    n.parentNode = parentNode;

    // If parent is undefined we can't
    // generate a node `id` because it based
    // on indexOf child in parent's childNodes
    // array.
    if (n.parentNode != undefined) {
        n.level = n.parentNode.level + 1;
        n.parentNode.addChild(n)
        n.id = generateId(treeId, n);
    }

    return n;
}

/**
 * Generates a tree from the list of DOM headers
 *
 * h1 headers are lowest nodes of tree (roots). h2 is
 * higher h1. h2 is higher h3. Etc.
 *
 * Lowest node of tree contains ony a list of roots.
 *
 * @param {Array<HTMLHeadingElement>} headers - array of headers
 * @param {string} treeId - is unique tree id, is used for id
 *                          generation of tree nodes
 * @param {number} maxTreeLevel - highest level of tree
 * @returns {TreeNode} lowest node of tree
 */
function generateTreeFromHeaders(headers, treeId, maxTreeLevel) {
    let lastHeader = 0;
    let currentHeader = 0;

    let rootNode = new TreeNode();
    let currentNode = rootNode;

    headers.forEach(
        function (header, _) {
            // Extract a header level from a header tag
            // 1 for `h1`, 2 for `h2`, etc.
            currentHeader = parseInt(header.tagName.slice(-1));

            if (currentHeader > lastHeader) { // if we go higher in tree
                if (currentNode.level > maxTreeLevel) {
                    return;
                }

                let _ = createNodeOnTree({
                    treeId: treeId,
                    header: header,
                    parentNode: currentNode
                });

                currentNode = currentNode.lastChild()
            }
            else if (currentHeader == lastHeader) { // if we stay on same level
                let _ = createNodeOnTree({
                    treeId: treeId,
                    header: header,
                    parentNode: currentNode.parentNode
                });

                currentNode = currentNode.parentNode.lastChild();
            }
            else if (currentHeader < lastHeader) { // if we go back to root
                let parentNode = currentNode.parentNode;

                let _ = createNodeOnTree({
                    treeId: treeId,
                    header: header,
                    parentNode: parentNode.parentNode
                });

                currentNode = parentNode.parentNode.lastChild();
            }

            lastHeader = currentHeader;
        },
    );

    return rootNode;
}

(function () {
    'use strict';

    console.log("Creating a table of content...");

    let headersContainers = document.querySelectorAll(`.${HEADERS_CONTAINER_CLASS_NAME}`);
    if (headersContainers.length > 1) { // there should be only one headers container
        console.log(`To many headers containers (.${HEADERS_CONTAINER_CLASS_NAME}) found!`);
        return;
    }
    if (headersContainers.length == 0) { // there should be at least one header container
        console.log(`Headers containers (.${HEADERS_CONTAINER_CLASS_NAME}) not found!`);
        return;
    }

    console.log(`.${HEADERS_CONTAINER_CLASS_NAME} element found!`);
    let headersContainer = headersContainers[0];

    let headers = headersContainer.querySelectorAll(HEADERS_SELECTOR);

    if (headers.length < MIN_HEADERS_COUNT) {
        console.log(`Too small count (${headers.length}) of headers to make a ToC!`);
        return;
    }

    console.log("Headers found:", headers);

    let lastPartOfHref = location.href.match(/([^\/]*)\/*$/)[1];
    // Remove anchors
    lastPartOfHref = lastPartOfHref.split("#")[0]
    // Remove all non digits or characters
    lastPartOfHref = lastPartOfHref.replace(/[\W_]+/g, "");
    let thisPageId = `${PAGE_ID_PREFIX}_${lastPartOfHref}_`;

    console.log("This page id:", thisPageId);

    let tree = generateTreeFromHeaders(headers, thisPageId, MAX_TREE_LEVEL);

    /**
     * Create a ToC from TreeNode tree
     *
     * @param {HTMLUListElement} topUl - `ul` DOM-element to start from
     * @param {Array<TreeNode>} nodes - array of TreeNode objects
     * @returns {HTMLUListElement} topUl filled with content from nodes
     */
    function createATableOfContent(topUl, nodes) {
        nodes.forEach(function (node) {
            // Create a line of ToC
            let li = document.createElement('li');

            // Create a link to page anchor
            let linkToAnchor = document.createElement('a');
            linkToAnchor.innerHTML = node.header.innerText;
            linkToAnchor.href = `#${node.id}`;
            // Set `onlick` event handler for ToC link
            linkToAnchor.onclick = function () {
                // Add hash to page url
                window.history.pushState(null, null, '#' + node.id);

                // Scroll to element
                let scrollTop = document.getElementById(node.id).offsetTop;
                window.scrollTo(0, scrollTop)

                return false; // prevent all default browser actions
            };
            li.appendChild(linkToAnchor);

            // Set a header id and name to link it with table of content link
            node.header.setAttribute("name", node.id)
            node.header.setAttribute("id", node.id)

            // Process higher tree nodes
            if (node.childNodes.length > 0) {
                let ul = document.createElement('ul');
                ul = createATableOfContent(ul, node.childNodes);
                li.appendChild(ul);
            }

            // Add line to ToC
            topUl.appendChild(li)
        });

        return topUl;
    }

    // Create a table of content
    let tableOfContentList = document.createElement('ul');
    tableOfContentList = createATableOfContent(tableOfContentList, tree.childNodes);
    tableOfContentList.className = TABLE_OF_CONTENT_CLASS_NAME;

    // Add styles
    addStylesheet(STYLE_SHEET)

    // Add table as a first element of headers container
    headersContainer.insertAdjacentElement('afterbegin', tableOfContentList)

    console.log("Table of content is successfully created!");
})();