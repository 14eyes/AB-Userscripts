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
// @grant       GM_setValue
// @grant       GM_getValue
// @require https://github.com/momentary0/AB-Userscripts/raw/master/delicious-library/src/ab_delicious_library.js
// ==/UserScript==

delicious.settings.init('ABGamesForum', false);
delicious.settings.init('unreadindx', false);
delicious.settings.init('ABNoT', 5);
if (delicious.settings.ensureSettingsInserted()) {
    var section = delicious.settings.createCollapsibleSection('Unread Index');
    var s = section.querySelector('.settings_section_body');
    s.appendChild(delicious.settings.createCheckbox(
        'unreadindx',
        'Enable',
        'Enable/Disable Unread Index script.'
    ));
    s.appendChild(delicious.settings.createCheckbox(
        'ABGamesForum',
        'Unread forums in index(News Page)',
        'Hide those hideous "Forum Games" on your unread index page!'
    ));

    s.appendChild(delicious.settings.createNumberInput(
        'ABNoT',
        'Number of threads',
        'set the number of threads to show'
    ));
    delicious.settings.insertSection(section);
}
var _enabled = delicious.settings.get('unreadindx');
if (!_enabled)
    return;
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
            var row = unread_tablenode.rows[1];
            for (let i = 1; row; i++) {
                row = unread_tablenode.rows[i];
                if (row == null) break;
                if ((delicious.settings.get('ABGamesForum') === true && row.cells[0].getElementsByTagName('a')[0].textContent.trim() === "Forum Games") || (unread_posts === delicious.settings.get('ABNoT'))){
                    unread_tablenode.deleteRow(i);
                    i--;
                } else if (unread_posts < delicious.settings.get('ABNoT')) {
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