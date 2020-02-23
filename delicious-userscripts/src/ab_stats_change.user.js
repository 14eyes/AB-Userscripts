    // ==UserScript==
    // @name         AB stats change
    // @namespace    https://github.com/ewasion
    // @version      0.1.4
    // @description  Displays the changes in stats on AB
    // @author       NullPhantom, Eva, Shaver
    // @homepage     https://gist.github.com/ewasion/8f3875baee474607bda6566126c45c92
    // @icon         https://animebytes.tv/favicon.ico
    // @grant   GM_setValue
    // @grant   GM_getValue
    // @require https://github.com/momentary0/AB-Userscripts/raw/master/delicious-library/src/ab_delicious_library.js
    // @match        https://animebytes.tv/user.php*
    // @license      GPL-3.0
    // @run-at       document-end
    // ==/UserScript==

    (function ABStatsChange() {
        delicious.settings.init('ABStatsChange', true);
        delicious.settings.init('unreadindx', true);
        delicious.settings.init('uid', null);
        delicious.settings.init('psc', true);
        delicious.settings.init('st', 5);
        if (delicious.settings.ensureSettingsInserted()) {
            var section = delicious.settings.createCollapsibleSection('Stats Change');
            var s = section.querySelector('.settings_section_body');
            s.appendChild(delicious.settings.createCheckbox(
                'ABStatsChange',
                'Enable',
                'Enable/Disable Stats Change script.'
            ));
            s.appendChild(delicious.settings.createTextSetting(
                'uid',
                'User id',
                ''
            ));
            s.appendChild(delicious.settings.createCheckbox(
                'psc',
                'Persistant stat Changes',
                'Keep showing last stat changes(Unless other changes occur)'
            ));
            s.appendChild(delicious.settings.createNumberInput(
                'st',
                'Time to keep last changes',
                'Minutes'
            ));
            delicious.settings.insertSection(section);
        }
        var _enabled = delicious.settings.get('ABStatsChange');
        if (!_enabled)
            return;
        if (parseInt(window.location.search.match(/\d+/)) != delicious.settings.get('uid'))
            return;
        'use strict';
        var currentStats = {};
        var statspans = document.getElementsByClassName("userstatsright")[0].childNodes[3];
        currentStats.up = parseFloat(statspans.childNodes[3].childNodes[0].title);
        currentStats.down = parseFloat(statspans.childNodes[7].childNodes[0].title);
        currentStats.ratio = parseFloat(statspans.childNodes[11].textContent);
        currentStats.rup = parseStats(document.getElementsByClassName("stats nobullet")[1].children[0].textContent.replace(/ *\([^)]*\) */g, "").replace('Raw Uploaded: ', ''));
        currentStats.rdown = parseStats(document.getElementsByClassName("stats nobullet")[1].children[1].textContent.replace(/ *\([^)]*\) */g, "").replace('Raw Downloaded: ', ''));
        currentStats.rratio = parseFloat(document.getElementsByClassName("stats nobullet")[1].children[2].textContent.replace(/[^0-9]/g, '').replace('Raw Ratio: ', '') / 100);

        if (isNaN(currentStats.ratio))
            currentStats.ratio = 0;
        currentStats.time = (new Date()) * 1;
        var oldStats = window.localStorage.lastStats;
        var oldchange = window.localStorage.lastChange;
        if (!oldStats)
            oldStats = {
                up: currentStats.up,
                down: currentStats.down,
                ratio: currentStats.ratio,
                rup: currentStats.rup,
                rdown: currentStats.rdown,
                rratio: currentStats.rratio
            };
        else
            oldStats = JSON.parse(oldStats);
        if (!oldchange)
            oldchange = {
                up: currentStats.up,
                down: currentStats.down,
                ratio: currentStats.ratio,
                rup: currentStats.rup,
                rdown: currentStats.rdown,
                rratio: currentStats.rratio
            };
        else
            oldchange = JSON.parse(oldchange);

        var change = {
            up: currentStats.up - oldStats.up,
            down: currentStats.down - oldStats.down,
            ratio: Math.round((currentStats.ratio - oldStats.ratio) * 100) / 100,
            rup: currentStats.rup - oldStats.rup,
            rdown: currentStats.rdown - oldStats.rdown,
            rratio: Math.round((currentStats.rratio - oldStats.rratio) * 100) / 100,
        };

        if (change.up != 0 || change.down != 0 || change.ratio != 0 || change.rup != 0 || change.rdown != 0 || change.rratio != 0) {
            displayStats(change);
            change.time = (new Date()) * 1;
            window.localStorage.lastChange = JSON.stringify(change);
        } else if (currentStats.time - JSON.parse(window.localStorage.lastChange).time < delicious.settings.get('st') * 60000 && oldchange.up != 0 || oldchange.down != 0 || oldchange.ratio != 0 || oldchange.rup != 0 || oldchange.rdown != 0 || oldchange.rratio != 0) {
            displayStats(oldchange);
        }
        window.localStorage.lastStats = JSON.stringify(currentStats);
    })();

    function displayStats(change) {
        userscriptInfo = document.createElement("div");
        userscriptInfo.id = "userscript-statchange";
        userscriptInfo.innerHTML = `<h3>Stat Changes</h3>` + 'Up: ' + renderStats(change.up) + ', Down: ' + renderStats(change.down) + ', Buffer: ' + renderStats(change.up - change.down) + ', Ratio: ' + change.ratio + `<br>` + 'rUp: ' + renderStats(change.rup) + ', rDown: ' + renderStats(change.rdown) + ', rBuffer: ' + renderStats(change.rup - change.rdown) + ', rRatio: ' + change.rratio;
        userscriptInfo.style.setProperty("border", "1px solid black", "important");
        userscriptInfo.style.setProperty("padding", "10px", "important");
        userscriptInfo.style.setProperty("background", "#1A1A1A", "important");
        userscriptInfo.style.setProperty("margin-bottom", "5px", "important");
        userscriptInfo.style.setProperty("text-align", "center", "important");
        const content = document.getElementById("user_rightcol");
        content.insertBefore(userscriptInfo, content.childNodes[1]);
    }

    function renderStats(number) {
        var amount = number;
        var pow = 0;
        for (var i = 10; i <= 50; i = i + 10) {
            if (Math.abs(amount) / Math.pow(2, i) > 1)
                pow = i / 10;
        }
        var suffixes = ['B', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB'];
        return (Math.round(amount / Math.pow(2, pow * 10) * 100)) / 100 + ' ' + suffixes[pow];
    }

    function parseStats(string) {
        string = string.replace(/,/g, '');
        var suffixes = ['B', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB'];
        var amount = parseFloat(string);
        if (string.indexOf(suffixes[1]) != -1)
            amount = amount * Math.pow(2, 10);
        else if (string.indexOf(suffixes[2]) != -1)
            amount = amount * Math.pow(2, 20);
        else if (string.indexOf(suffixes[3]) != -1)
            amount = amount * Math.pow(2, 30);
        else if (string.indexOf(suffixes[4]) != -1)
            amount = amount * Math.pow(2, 40);
        else if (string.indexOf(suffixes[5]) != -1)
            amount = amount * Math.pow(2, 50);
        return Math.round(amount);
    }