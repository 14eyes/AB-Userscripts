// ==UserScript==
// @name        AB - Hide treats
// @author      Alpha
// @description Hide treats on profile.
// @include     https://animebytes.tv/*
// @version     0.1
// @icon        http://animebytes.tv/favicon.ico
// ==/UserScript==

/* === Script generated at 2018-04-21T16:36:42.420640 === */


// Hide treats by Alpha
// Hide treats on profile.
(function ABHideTreats(){
var treatsnode = document.evaluate('//*[@id="user_leftcol"]/div[@class="box" and div[@class="head" and .="Treats"]]', document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
if (treatsnode) treatsnode.style.display = "none";
})();