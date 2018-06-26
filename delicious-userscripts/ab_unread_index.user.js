// ==UserScript==
// @name AnimeBytes Unread Index
// @author potatoe
// @version 1.12.1
// @description Adds the top new unread forum posts to AnimeBytes index page.
// @icon https://animebytes.tv/favicon.ico
// @include https://animebytes.tv/
// @include https://animebytes.tv/index.php
// @include https://animebytes.tv/user.php?action=edit
// @match https://animebytes.tv/
// @match https://animebytes.tv/index.php
// @match https://animebytes.tv/user.php?action=edit
// @downloadURL https://ab.nope.bz/userscripts/unread_index/ab_unread_index.user.js
// @updateURL https://ab.nope.bz/userscripts/unread_index/ab_unread_index.user.js
// @grant GM_getValue
// @grant GM_setValue
// @grant GM_deleteValue
// ==/UserScript==



var ABGamesForum = GM_getValue('ABGamesForum');
if (ABGamesForum == null) {
    GM_setValue('ABGamesForum', 'true');
    ABGamesForum = 'true';
}
var unread_tablenode;
var dividernode = document.createElement('div');
dividernode.className = 'divider';
var newsnode = document.getElementById('news');
function ABUnreadIndex () {
    var unread_doc = document.implementation.createHTMLDocument('');
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            unread_doc.documentElement.innerHTML = xmlhttp.responseText;
            unread_tablenode = unread_doc.evaluate("//div[@id='content']/div[@class='thin']/table[@width='100%']", unread_doc, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
            var unread_posts = 0;
            for (let j = 0; j < 2; j++) unread_tablenode.rows[0].cells[j].style.padding = '8px';
            unread_tablenode.rows[0].cells[0].style.width = '30%';

            unread_tablenode.rows[0].cells[1].style.width = '70%';
            unread_tablenode.rows[0].deleteCell(2);
            var row;
            for (let i = 1; row = unread_tablenode.rows[i]; i++) {
                if (row == null) break;
                if ((ABGamesForum === 'false' && row.cells[0].getElementsByTagName('a')[0].textContent.trim() === "Forum Games") || (unread_posts === 5)) {
                    unread_tablenode.deleteRow(i);
                    i--;
                } else if (unread_posts < 5) {
                    for (let j = 0; j < 2; j++) row.cells[j].style.padding = '0px';
                    //row.cells[0].getElementsByTagName('p')[0].innerHTML += "<div style='font-size: 8px;'>&nbsp;</div>";
                    row.cells[1].getElementsByTagName('p')[0].innerHTML += "<div style='font-size: 8px;'>" + row.cells[2].getElementsByTagName('p')[0].innerHTML + '</div>';
                    row.deleteCell(2);
                    unread_posts++;
                }
            }
            unread_tablenode.style.marginBottom = '20px';
            newsnode.parentNode.insertBefore(unread_tablenode, newsnode);
            newsnode.parentNode.insertBefore(dividernode, newsnode);
        }
    };
    xmlhttp.open('GET', '/forums.php?action=viewunread', true);
    xmlhttp.send();

}
if (newsnode !== null) {
    ABUnreadIndex();
}