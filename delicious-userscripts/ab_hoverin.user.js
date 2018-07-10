// ==UserScript==
// @name           AB Hoverin'
// @namespace      http://animebytes.tv
// @include        animebytes.tv*
// @require https://raw.githubusercontent.com/momentary0/AB-Userscripts/delicious-settings/delicious-library/src/ab_delicious_library.js
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
var _enabled = delicious.settings.basicScriptCheckbox(
    'hoverdrop',
    'Hoverin',
    'Enable/Disable Auto dropdown menus when hovering.'
);
if (!_enabled)
    return;

Hoverin('.navmenu:hover .subnav {' + ' display: block !important;' + '}');