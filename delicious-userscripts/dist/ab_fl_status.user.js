// ==UserScript==
// @name        AB - Freeleech Pool Status
// @author      Megure (inspired by Lemma, Alpha, NSC)
// @description Shows current freeleech pool status in navbar with a pie-chart
// @include     https://animebytes.tv/*
// @version     0.1.1.1
// @icon        http://animebytes.tv/favicon.ico
// @grant       GM_getValue
// @grant       GM_setValue
// ==/UserScript==

// Freeleech Pool Status by Megure, inspired by Lemma, Alpha, NSC
// Shows current freeleech pool status in navbar with a pie-chart
// Updates only once every hour or when pool site is visited, showing a pie-chart on pool site
(function ABFLStatus() {
    /* === Inserted from _delicious_common.js === */
    // Common functions used by many scripts.
    // Will be inserted once into the delicious bundle,
    // and prepended to each individual userscript.
    
    // Debug flag. Used to enable/disable some verbose console logging.
    var _debug = false;
    
    // jQuery, just for Pale Moon.
    // Note: this doesn't actually import jQuery successfully,
    // but for whatever reason, it lets PM load the script.
    if ((typeof jQuery) === 'undefined') {
        _debug && console.log('setting window.jQuery');
        jQuery = window.jQuery;
        $ = window.$;
        $j = window.$j;
    }
    
    // Super duper important functions
    // Do not delete or something might break and stuff!! :(
    HTMLCollection.prototype.each = function (f) { for (var i = 0, e = null; e = this[i]; i++) f.call(e, e); return this; };
    HTMLElement.prototype.clone = function (o) { var n = this.cloneNode(); n.innerHTML = this.innerHTML; if (o !== undefined) for (var e in o) n[e] = o[e]; return n; };
    // Thank firefox for this ugly shit. Holy shit firefox get your fucking shit together >:(
    function forEach(arr, fun) { return HTMLCollection.prototype.each.call(arr, fun); }
    function clone(ele, obj) { return HTMLElement.prototype.clone.call(ele, obj); }
    
    function injectScript(content, id) {
        var script = document.createElement('script');
        if (id) script.setAttribute('id', id);
        script.textContent = content.toString();
        document.body.appendChild(script);
        return script;
    }
    if (typeof GM_getValue === 'undefined'  || (GM_getValue.toString && GM_getValue.toString().indexOf("not supported") > -1)) {
        _debug && console.log('Setting fallback localStorage GM_* functions');
        // There is some difference between this.GM_getValue and just GM_getValue.
        _debug && console.log(this.GM_getValue);
        _debug && typeof GM_getValue !== 'undefined' && console.log(GM_getValue.toString());
        // Previous versions lacked a @grant GM_getValue header, which resulted
        // in these being used when they shouldn't have been.
        this.GM_getValue = function (key, def) { return localStorage[key] || def; };
        this.GM_setValue = function (key, value) { return localStorage[key] = value; };
        this.GM_deleteValue = function (key) { return delete localStorage[key]; };
        // We set this when we have used localStorage so if in future we switch,
        // it will be imported.
        GM_setValue('deliciousSettingsImported', 'false');
        _debug && console.log(GM_getValue);
    } else {
        _debug&& console.log('Using default GM_* functions.');
        // For backwards compatibility,
        // we'll implement migrating localStorage to GM settings.
        // However, we can't implement the reverse because when localStorage is
        // used, GM_getValue isn't even defined so we obviously can't import.
        if (GM_getValue('deliciousSettingsImported', 'false') !== 'true') {
            _debug && console.log('Importing localStorage to GM settings');
            GM_setValue('deliciousSettingsImported', 'true');
            var keys = Object.keys(localStorage);
            keys.forEach(function(key){
                if (GM_getValue(key, 'undefined') === 'undefined') {
                    _debug && console.log('Imported ' + key);
                    GM_setValue(key, localStorage[key]);
                } else {
                    _debug && console.log('Key exists ' + key);
                }
            });
        }
    }
    
    function initGM(gm, def, json, overwrite) {
        if (typeof def === "undefined") throw "shit";
        if (typeof overwrite !== "boolean") overwrite = true;
        if (typeof json !== "boolean") json = true;
        var that = GM_getValue(gm);
        if (that != null) {
            var err = null;
            try { that = ((json) ? JSON.parse(that) : that); }
            catch (e) { if (e.message.match(/Unexpected token .*/)) err = e; }
            if (!err && Object.prototype.toString.call(that) === Object.prototype.toString.call(def)) { return that; }
            else if (overwrite) {
                GM_setValue(gm, ((json) ? JSON.stringify(def) : def));
                return def;
            } else { if (err) { throw err; } else { return that; } }
        } else {
            GM_setValue(gm, ((json) ? JSON.stringify(def) : def));
            return def;
        }
    }
    /* === End _delicious_common.js === */

    function niceNumber(num) {
        var res = '';
        while (num >= 1000) {
            res = ',' + ('00' + (num % 1000)).slice(-3) + res;
            num = Math.floor(num / 1000);
        }
        return num + res;
    }
    var locked = false;
    function getFLInfo() {
        function parseFLInfo(elem) {
            var boxes = elem.querySelectorAll('#content .box.pad');
            //console.log(boxes);
            if (boxes.length < 3) return;

            // The first box holds the current amount, the max amount and the user's individual all-time contribution
            var match = boxes[0].textContent.match(/have ¥([0-9,]+) \/ ¥([0-9,]+)/i),
                max = parseInt(GM_getValue('FLPoolMax', '50000000'), 10),
                current = parseInt(GM_getValue('FLPoolCurrent', '0'), 10);
            if (match == null) {
                // Updated 2018-02-23 according to oregano's suggestion
                match = boxes[0].textContent.match(/You must wait for freeleech to be over before donating/i);
                if (match != null) current = max;
            }
            else {
                current = parseInt(match[1].replace(/,/g, ''), 10);
                max = parseInt(match[2].replace(/,/g, ''), 10);
            }
            if (match != null) {
                GM_setValue('FLPoolCurrent', current);
                GM_setValue('FLPoolMax', max);
            }
            // Check first box for user's individual all-time contribution
            match = boxes[0].textContent.match(/you've donated ¥([0-9,]+)/i);
            if (match != null)
                GM_setValue('FLPoolContribution', parseInt(match[1].replace(/,/g, ''), 10));

            // The third box holds the top 10 donators for the current box
            var box = boxes[2],
                tr = box.querySelector('table').querySelectorAll('tbody > tr');

            var titles = [], hrefs = [], amounts = [], colors = [], sum = 0;
            for (var i = 0; i < tr.length; i++) {
                var el = tr[i],
                    td = el.querySelectorAll('td');

                titles[i] = td[0].textContent;
                hrefs[i] = td[0].querySelector('a').href;
                amounts[i] = parseInt(td[1].textContent.replace(/[,¥]/g, ''), 10);
                colors[i] = 'red';
                sum += amounts[i];
            }

            // Updated 2018-02-23. Properly draw full pie when FL active.
            if (current === max && sum === 0) {
                titles[0] = "Freeleech!";
                hrefs[0] = 'https://animebytes.tv/konbini/pool';
                amounts[0] = current;
                colors[0] = 'red';
                sum = current;
            }
            else {
                // Also add others and missing to the arrays
                // 2018-02-23 But only if FL isn't active.
                next_index = titles.length;
                titles[next_index] = 'Other';
                hrefs[next_index] = 'https://animebytes.tv/konbini/pool';
                amounts[next_index] = current - sum;
                colors[next_index] = 'lightgrey';

                titles[next_index + 1] = 'Missing';
                hrefs[next_index + 1] = 'https://animebytes.tv/konbini/pool';
                amounts[next_index + 1] = max - current;
                colors[next_index + 1] = 'black';
            }

            GM_setValue('FLPoolLastUpdate', Date.now());
            GM_setValue('FLPoolTitles', JSON.stringify(titles));
            GM_setValue('FLPoolHrefs', JSON.stringify(hrefs));
            GM_setValue('FLPoolAmounts', JSON.stringify(amounts));
            GM_setValue('FLPoolColors', JSON.stringify(colors));
        }

        // Either parse document or retrieve freeleech pool site 60*60*1000 ms after last retrieval
        if (/konbini\/pool$/i.test(document.URL))
            parseFLInfo(document);
        else if (Date.now() - parseInt(GM_getValue('FLPoolLastUpdate', '0'), 10) > 3600000 && locked === false) {
            locked = true;
            // Fix suggested by https://animebytes.tv/user/profile/oregano
            // https://discourse.mozilla.org/t/webextension-xmlhttprequest-issues-no-cookies-or-referrer-solved/11224/18
            try {
                var xhr = XPCNativeWrapper(new window.wrappedJSObject.XMLHttpRequest());
            } catch (exc) {
                var xhr = new XMLHttpRequest();
            }
            parser = new DOMParser();
            xhr.open('GET', "https://animebytes.tv/konbini/pool", true);
            xhr.send();
            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4) {
                    parseFLInfo(parser.parseFromString(xhr.responseText, 'text/html'));
                    updatePieChart();
                    locked = false;
                }
            };
        }
    }

    function getPieChart() {
        function circlePart(diff, title, href, color) {
            if (diff == 0) return '';
            var x = Math.sin(phi), y = Math.cos(phi);
            phi -= 2 * Math.PI * diff / max;
            var v = Math.sin(phi), w = Math.cos(phi);
            var z = 0;
            if (2 * diff > max)
                z = 1; // use long arc
            var perc = (100 * diff / max).toFixed(1) + '%\n' + niceNumber(diff) + ' ¥';

            // 2018-02-23 Hardcoded since rounding errors were making the pie a thin strip when it was a single
            // slice at 100%.
            if (diff === max) {
                /*v = -6.283185273215512e-8;
                w = -0.999999999999998;
                z = 1;
                x = 1.2246467991473532e-16;
                y = -1;*/
                v = -0.000001;
                w = -1;
                z = 1;
                x = 0;
                y = -1;

            }
            return '<a xlink:href="' + href + '" xlink:title="' + title + '\n' + perc + '"><path title="' + title + '\n' + perc +
                '" stroke-width="0.01" stroke="grey" fill="' + color + '" d="M0,0 L' + v + ',' + w + ' A1,1 0 ' + z + ',0 ' + x + ',' + y + 'z">\n' +

                '<animate begin="mouseover" attributeName="d" to="M0,0 L' + 1.1 * v + ',' + 1.1 * w + ' A1.1,1.1 0 ' + z + ',0 ' + 1.1 * x + ',' + 1.1 * y + 'z" dur="0.3s" fill="freeze" />\n' +
                '<animate begin="mouseout"  attributeName="d" to="M0,0 L' + v + ',' + w + ' A1,1 0 ' + z + ',0 ' + x + ',' + y + 'z" dur="0.3s" fill="freeze" />\n' +
                '</path></a>\n\n';
        }

        var str = '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="-1.11 -1.11 2.22 2.22" height="200px" width="100%">' +
            '<title>Most Donated To This Box Pie-Chart</title>';
        try {
            var phi = Math.PI, max = parseInt(GM_getValue('FLPoolMax', '50000000'), 10),
                titles = JSON.parse(GM_getValue('FLPoolTitles', '[]')),
                hrefs = JSON.parse(GM_getValue('FLPoolHrefs', '[]')),
                amounts = JSON.parse(GM_getValue('FLPoolAmounts', '[]')),
                colors = JSON.parse(GM_getValue('FLPoolColors', '[]'));
            for (var i = 0; i < titles.length; i++) {
                str += circlePart(amounts[i], titles[i], hrefs[i], colors[i]);
            }
        } catch (e) {console.error(e); }
        return str + '</svg>';
    }

    function updatePieChart() {
        var pieChart = getPieChart();
        p.innerHTML = pieChart;
        p3.innerHTML = pieChart;
        if (GM_getValue('delicousnavbarpiechart', 'false') === 'true') {
            li.innerHTML = pieChart;
        }
        p2.innerHTML = 'We currently have ¥' + niceNumber(parseInt(GM_getValue('FLPoolCurrent', '0'), 10)) + ' / ¥' + niceNumber(parseInt(GM_getValue('FLPoolMax', '50000000'), 10)) + ' in our donation box.<br/>';
        p2.innerHTML += '(That means we\'re ¥' + niceNumber(parseInt(GM_getValue('FLPoolMax', '50000000'), 10) - parseInt(GM_getValue('FLPoolCurrent', '0'), 10)) + ' away from getting sitewide freeleech!)<br/>';
        p2.innerHTML += '<br>In total, you\'ve donated ¥' + niceNumber(parseInt(GM_getValue('FLPoolContribution', '0'), 10)) + ' to the freeleech pool.<br/>';
        p2.innerHTML += 'Last Update: ' + Math.round((Date.now() - parseInt(GM_getValue('FLPoolLastUpdate', Date.now()), 10)) / 60000) + ' minutes ago.';
        a.textContent = 'FL: ' + (100 * parseInt(GM_getValue('FLPoolCurrent', '0'), 10) / parseInt(GM_getValue('FLPoolMax', '50000000'), 10)).toFixed(1) + '%';
        nav.replaceChild(a, nav.firstChild);
    }

    var pos = GM_getValue('deliciousflpoolposition', 'after #userinfo_minor');
    function dropPie2(event) {
        // because who doesn't love dropping their pies
        if ((typeof $j).toString() !== 'undefined') {
            // below copied from https://animebytes.tv/static/functions/global-2acd7ec19a.js
            $j(event.target).parent().find("ul.subnav").is(":hidden") ?
                ($j("ul.subnav").hide(),
                $j("li.navmenu").removeClass("selected"),
                $j(this).parent().addClass("selected").find("ul.subnav").show())
                : $j(event.target).parent().removeClass("selected").find("ul.subnav").hide();
        }

        // prevents global click handler from immediately closing the menu
        event.stopPropagation();
        return false;
    }
    if (pos !== 'none' || /user\.php\?id=/i.test(document.URL) || /konbini\/pool/i.test(document.URL)) {
        var p = document.createElement('p'),
            p2 = document.createElement('center'),
            p3 = document.createElement('p'),
            nav = document.createElement('li'),
            a = document.createElement('a'),
            ul = document.createElement('ul'),
            li = document.createElement('li');
        a.href = '/konbini/pool';
        nav.appendChild(a);
        if (GM_getValue('delicousnavbarpiechart', 'false') === 'true') {
            var outerSpan = document.createElement('span');
            outerSpan.className += "dropit hover clickmenu";
            outerSpan.onclick = (dropPie2);
            outerSpan.innerHTML += '<span class="stext">▼</span>';

            // nav is the li.navmenu
            nav.appendChild(outerSpan);

            // this ul contains the pie (somehow)
            ul.appendChild(li);
            ul.className = 'subnav nobullet';
            ul.style.display = 'none';
            nav.appendChild(ul);
            nav.className = 'navmenu';
            nav.id = "fl_menu";
        }
        if (pos !== 'none') {
            pos = pos.split(' ');
            var parent = document.querySelector(pos[1]);
            if (parent !== null) {
                getFLInfo();
                if (pos[0] === 'after')
                    parent.appendChild(nav);
                if (pos[0] === 'before')
                    parent.insertBefore(nav, parent.firstChild);
            }
        }

        updatePieChart();

        if (/user\.php\?id=/i.test(document.URL) && GM_getValue('deliciousyenperx', 'true') === 'true') {
            // Only do so on the users' profile pages if Yen per X is activated and Yen per day is present in userstats
            var userstats = document.querySelector('#user_rightcol > .box');
            if (userstats != null) {
                var tw = document.createTreeWalker(userstats, NodeFilter.SHOW_TEXT, { acceptNode: function (node) { return /Yen per day/i.test(node.data); } });
                if (tw.nextNode() != null) {
                    getFLInfo();
                    var cNode = document.querySelector('.userstatsleft');
                    var hr = document.createElement('hr');
                    hr.style.clear = 'both';
                    cNode.insertBefore(hr, cNode.lastElementChild);
                    cNode.insertBefore(p2, cNode.lastElementChild);
                    cNode.insertBefore(p3, cNode.lastElementChild);
                }
            }
        }

        if (/konbini\/pool/i.test(document.URL)) {
            let tw = document.createTreeWalker(document.getElementById('content'), NodeFilter.SHOW_TEXT, { acceptNode: function (node) { return /^\s*Most Donated to This Box\s*$/i.test(node.data); } });
            if (tw.nextNode() !== null) {
                tw.currentNode.parentNode.insertBefore(p, tw.currentNode.nextSibling);
            }
        }
    }
})();