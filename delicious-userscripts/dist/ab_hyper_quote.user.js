// ==UserScript==
// @name        AB - HYPER QUOTE!
// @author      Megure 
// @description Select text and press CTRL+V to quote
// @include     https://animebytes.tv/*
// @version     0.1
// @icon        http://animebytes.tv/favicon.ico
// ==/UserScript==

/* === Inserted from _delicious_common.js === */
// Common functions used by many scripts.
// Will be inserted once into the delicious bundle, 
// and prepended to each individual userscript.

// Debug flag. Used to enable/disable some verbose console logging.
var _debug = false;

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
if (!this.GM_getValue || (this.GM_getValue.toString && this.GM_getValue.toString().indexOf("not supported") > -1)) {
    this.GM_getValue = function (key, def) { return localStorage[key] || def; };
    this.GM_setValue = function (key, value) { return localStorage[key] = value; };
    this.GM_deleteValue = function (key) { return delete localStorage[key]; };
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

// HYPER QUOTE by Megure
// Select text and press CTRL+V to quote
(function ABHyperQuote() {
    if (document.getElementById('quickpost') === null)
    {
        return;
    }
    
    function formattedUTCString(date, timezone) {
        var creation = new Date(date);
        if (isNaN(creation.getTime()))
            return date;
        else {
            creation = creation.toUTCString().split(' ');
            return creation[1] + ' ' + creation[2] + ' ' + creation[3] + ', ' + creation[4].substring(0, 5) + (timezone !== false ? ' ' + creation[5] : '');
        }
    }

    function QUOTEALL() {
        var sel = window.getSelection();
        for (var i = 0; i < sel.rangeCount; i++)
            QUOTEMANY(sel.getRangeAt(i));
    }

    function QUOTEMANY(range) {
        function removeChildren(node, prev) {
            if (node === null || node.parentNode === null) return;
            if (prev === true)
                while (node.parentNode.firstChild !== node)
                    node.parentNode.removeChild(node.parentNode.firstChild);
            else
                while (node.parentNode.lastChild !== node)
                    node.parentNode.removeChild(node.parentNode.lastChild);
            removeChildren(node.parentNode, prev);
        }
        function inArray(arr, elem) {
            for (var i = 0; i < arr.length; i++) {
                if (arr[i] === elem)
                    return i;
            }
            return -1;
        }

        if (range.collapsed === true) return;

        var html1, html2, copy, res, start = [], end = [], startNode, endNode;
        html1 = range.startContainer;
        while (html1.parentNode !== null) {
            start.push(inArray(html1.parentNode.childNodes, html1));
            html1 = html1.parentNode;
        }
        html2 = range.endContainer;
        while (html2.parentNode !== null) {
            end.push(inArray(html2.parentNode.childNodes, html2));
            html2 = html2.parentNode;
        }
        if (html1 !== html2 || html1 === null) return;
        copy = html1.cloneNode(true);

        startNode = copy;
        for (var i = start.length - 1; i >= 0; i--) {
            if (start[i] === -1) return;
            startNode = startNode.childNodes[start[i]];
        }
        endNode = copy;
        for (var i = end.length - 1; i >= 0; i--) {
            if (end[i] === -1) return;
            endNode = endNode.childNodes[end[i]];
        }

        if (endNode.nodeType === 3)
            endNode.data = endNode.data.substr(0, range.endOffset);
        else if (endNode.nodeType === 1)
            for (var i = endNode.childNodes.length; i > range.endOffset; i--)
                endNode.removeChild(endNode.lastChild);
        if (range.startOffset > 0) {
            if (startNode.nodeType === 3)
                startNode.data = startNode.data.substr(range.startOffset);
            else if (startNode.nodeType === 1)
                for (var i = 0; i < range.startOffset; i++)
                    startNode.removeChild(startNode.firstChild);
        }

        removeChildren(startNode, true);
        removeChildren(endNode, false);

        var posts = copy.querySelectorAll('div[id^="post"],div[id^="msg"]');
        for (var i = 0; i < posts.length; i++)
            QUOTEONE(posts[i]);
    }


    function QUOTEONE(post) {
        function HTMLtoBB(str) {
            // Order is somewhat relevant
            var ret = str.replace(/<br.*?>/ig, '').
                replace(/<strong><a.*?>.*?<\/a><\/strong> <a.*?href="(.*?)#(?:msg|post)(.*?)".*?>wrote(?: on )?(.*?)<\/a>:?\s*<blockquote class="blockquote">([\s\S]*?)<\/blockquote>/ig, function (html, href, id, dateString, quote) {
                    var type = '';
                    if (/\/forums\.php/i.test(href)) type = '#';
                    if (/\/user\.php/i.test(href)) type = '*';
                    if (/\/torrents\.php/i.test(href)) type = '-1';
                    if (/\/torrents2\.php/i.test(href)) type = '-2';
                    if (type !== '')
                        return '[quote=' + type + id + ']' + quote + '[/quote]';
                    else
                        return html.replace(dateString, formattedUTCString(dateString));
                }).
                replace(/<strong>Added on (.*?):?<\/strong>/ig, function (html, dateString) {
                    return html.replace(dateString, formattedUTCString(dateString));
                }).
                replace(/<span class="smiley-.+?" title="(.+?)"><\/span>/ig, function (html, smiley) {
                    var smileyNode = document.querySelector('img[alt="' + smiley + '"]');
                    if (smileyNode === null)
                        smileyNode = document.querySelector('img[src$="' + smiley + '.png"]');
                    if (smileyNode === null)
                        smileyNode = document.querySelector('img[src$="' + smiley.replace(/-/g, '_') + '.png"]');
                    if (smileyNode === null)
                        smileyNode = document.querySelector('img[src$="' + smiley.replace(/-/g, '_').toLowerCase() + '.png"]');
                    if (smileyNode === null)
                        smileyNode = document.querySelector('img[src$="' + smiley.replace(/face/g, '~_~') + '.png"]');
                    if (smileyNode !== null && smileyNode.parentNode !== null) {
                        smileyNode = smileyNode.parentNode.getAttribute('onclick').match(/'(.+?)'/i);
                        if (smileyNode !== null)
                            return smileyNode[1];
                    }
                    return ':' + smiley + ':';
                }).
                replace(/<iframe.*?src="([^?"]*).*?".*?><\/iframe>/ig, '[youtube]$1[/youtube]').
                replace(/<([^\s>\/]+)[^>]*>\s*<\/([^>]+)>/ig, function (html, match1, match2) {
                    if (match1 === match2)
                        return '';
                    return html;
                }).
                replace(/<ul><li>(.+?)<\/li><\/ul>/ig, '[*]$1').
                replace(/<a.*?href="torrents\.php\?.*?torrentid=([0-9]*?)".*?>([\s\S]*?)<\/a>/ig, '[torrent=$1]$2[/torrent]').
                replace(/<a.*?href="(.*?)".*?>([\s\S]*?)<\/a>/ig, function (html, match1, match2) {
                    if (match1.indexOf('://') === -1 && match1.length > 0 && match1[0] !== '/')
                        return '[url=/' + match1 + ']' + match2 + '[/url]'
                    else
                        return '[url=' + match1 + ']' + match2 + '[/url]'
                }).
                replace(/<strong>([\s\S]*?)<\/strong>/ig, '[b]$1[/b]').
                replace(/<em>([\s\S]*?)<\/em>/ig, '[i]$1[/i]').
                replace(/<u>([\s\S]*?)<\/u>/ig, '[u]$1[/u]').
                replace(/<s>([\s\S]*?)<\/s>/ig, '[s]$1[/s]').
                replace(/<div style="text-align: center;">([\s\S]*?)<\/div>/ig, '[align=center]$1[/align]').
                replace(/<div style="text-align: left;">([\s\S]*?)<\/div>/ig, '[align=left]$1[/align]').
                replace(/<div style="text-align: right;">([\s\S]*?)<\/div>/ig, '[align=right]$1[/align]').
                replace(/<span style="color:\s*(.*?);?">([\s\S]*?)<\/span>/ig, '[color=$1]$2[/color]').
                replace(/<span class="size(.*?)">([\s\S]*?)<\/span>/ig, '[size=$1]$2[/size]').
                replace(/<blockquote class="blockquote">([\s\S]*?)<\/blockquote>/ig, '[quote]$1[/quote]').
                replace(/<div.*?class=".*?spoilerContainer.*?hideContainer.*?".*?><input.*?value="(?:Show\s*|Hide\s*)(.*?)".*?><div.*?class=".*?spoiler.*?".*?>([\s\S]*?)<\/div><\/div>/ig, function (html, button, content) {
                    if (button !== '')
                        return '[hide=' + button + ']' + content + '[/hide]';
                    else
                        return '[hide]' + content + '[/hide]';
                }).
                replace(/<div.*?class=".*?spoilerContainer.*?".*?><input.*?><div.*?class=".*?spoiler.*?".*?>([\s\S]*?)<\/div><\/div>/ig, '[spoiler]$1[/spoiler]').
                replace(/<img.*?src="(.*?)".*?>/ig, '[img]$1[/img]').
                replace(/<span class="last-edited">[\s\S]*$/ig, '');
            if (ret !== str) return HTMLtoBB(ret);
            else {
                // Decode HTML
                var tempDiv = document.createElement('div');
                tempDiv.innerHTML = ret;
                return tempDiv.textContent.trim();
            }
        }

        var res = HTMLtoBB(post.querySelector('div.post,div.body').innerHTML),
            author, creation, postid, type = '';
        if (res === '') return;

        postid = post.id.match(/(?:msg|post)(\d+)/i);
        if (postid === null)
            return;

        if (window.location.pathname === '/forums.php') type = '#';
        if (window.location.pathname === '/user.php') type = '*';
        if (window.location.pathname === '/torrents.php') type = '-1';
        if (window.location.pathname === '/torrents2.php') type = '-2';
        if (type !== '')
            res = '[quote=' + type + postid[1] + ']' + res + '[/quote]';
        else {
            author = post.className.match(/user_(\d+)/i);
            if (author !== null)
                author = '[b][user]' + author[1] + '[/user][/b] ';
            else {
                author = document.querySelector('#' + postid[0] + ' a[href^="/user.php?"]');
                if (author !== null) {
                    author = author.href.match(/id=(\d+)/i);
                    author = (author !== null ? '[b][user]' + author[1] + '[/user][/b] ' : '');
                }
                else
                    author = '';
            }

            creation = document.querySelector('div#' + postid[0] + ' > div > div > p.posted_info > span');
            if (creation === null)
                creation = document.querySelector('div#' + postid[0] + ' > div > span > span.usercomment_posttime');
            if (creation !== null)
                creation = ' on ' + formattedUTCString(creation.title.replace(/-/g, '/'));
            else
                creation = '';

            res = author + '[url=' + window.location.pathname + window.location.search + '#' + postid[0] + ']wrote' + creation + '[/url]:\n[quote]' + res + '[/quote]\n\n';
        }

        document.getElementById('quickpost').value += res;

        sel = document.getElementById('quickpost');
        if (sel !== null)
            sel.scrollIntoView();
    }

    document.addEventListener('keydown', function (e) {
        if ((e.ctrlKey || e.metaKey) && e.keyCode === 'V'.charCodeAt(0))
            QUOTEALL();
    });
})();