// ==UserScript==
// @name           AB Hoverin'
// @namespace      http://animebytes.tv
// @include        animebytes.tv*
// ==/UserScript==
function Hoverin(css) {
    var head, style;
    head = document.getElementsByTagName('head')[0];
    if (!head) {
        return;
    }
    style = document.createElement('style');
    style.type = 'text/css';
    style.innerHTML = css;
    head.appendChild(style);
}
Hoverin('.navmenu:hover .subnav {' + ' display: block !important;' + '}');