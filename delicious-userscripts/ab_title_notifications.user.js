// ==UserScript==
// @name        AnimeBytes - Title Notifications
// @author      Megure
// @description Will prepend the number of notifications to the title
// @include     https://animebytes.tv/*
// @version     0.1
// @icon        http://animebytes.tv/favicon.ico
// @require     https://raw.githubusercontent.com/momentary0/AB-Userscripts/delicious-settings/delicious-library/src/ab_delicious_library.js
// ==/UserScript==

// Title Notifications by Megure
// Will prepend the number of notifications to the title
(function ABTitleNotifications() {
    var _enabled = delicious.settings.basicScriptCheckbox(
        'delicioustitlenotifications',
        'Delicious Title Notifications',
        'Display number of notifications in the tab title.'
    );
    if (!_enabled)
        return;

    var new_count = 0, _i, cnt, notifications = document.querySelectorAll('#alerts .new_count'), _len = notifications.length;
    for (_i = 0; _i < _len; _i++) {
        cnt = parseInt(notifications[_i].textContent, 10);
        if (!isNaN(cnt))
            new_count += cnt;
    }
    if (new_count > 0)
        document.title = '(' + new_count + ') ' + document.title;
})();