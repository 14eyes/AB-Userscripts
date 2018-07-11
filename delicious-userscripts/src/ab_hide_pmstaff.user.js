// ==UserScript==
// @name        AB - Hide PM staff
// @author      ShaverJ
// @description Hide PM staff on Main menu.
// @include     https://animebytes.tv/*
// @version     0.1
// @icon        http://animebytes.tv/favicon.ico
// ==/UserScript==

// Bassed on Hide treats by Alpha
(function ABHidePMstaff() {
    var _enabled = delicious.settings.basicScriptCheckbox(
        'hidepmstaff',
        'PM the staff',
        'Hide/Unhide PM the Staff link on the main menu'
    );
    if (!_enabled)
        return;

    var pmstaffnode = document.evaluate('//*[@id="nav_staffpm"]', document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
    if (pmstaffnode) pmstaffnode.style.display = "none";
})();