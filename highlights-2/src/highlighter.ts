import { parse, SEP_SYMBOL } from "./parser";
import { tokenise } from "./lexer";

export function highlight(links: NodeListOf<HTMLAnchorElement>, className: string): number {
  let success = 0;
  console.log("Highlighting " + links.length + " link elements...");
  for (const el of links) {
    let tokens = null;
    let output = null;
    let fields = null;

    try {
      const delim = el.href.indexOf('torrents.php') !== -1 ? ' | ' : ' / ';

      tokens = tokenise(el.childNodes, delim);
      [output, fields] = parse(tokens, delim);

      el.classList.add('userscript-highlight', className);

      while (el.hasChildNodes()) {
        el.removeChild(el.lastChild!);
      }
      const df = document.createDocumentFragment();
      df.append(...output);
      el.append(df);

      for (const [k, v] of Object.entries(fields)) {
        el.dataset[k] = v;
      }
      success++;
    } catch (e) {
      console.error("Error while highlighting torrent: ", e);
      console.log("Element: ", el);
      console.log("Child nodes: ", Array.from(el.childNodes));
      console.log("Tokenised: ", tokens);
      console.log("Converted: ", output);
      console.log("Fields: ", fields);
      console.log("------------------------------------");
    }
  }
  console.log("Done highlighting, successful: " + success);
  return success;
}

export function main() {
  const TORRENT_PAGE_QUERY = '.group_torrent > td > a[href*="&torrentid="], .torrent_properties > a[href*="&torrentid="]'

  const links = document.querySelectorAll(TORRENT_PAGE_QUERY) as NodeListOf<HTMLAnchorElement>;
  highlight(links, 'torrent-page');
}

export function test() {
  console.log("Testing...");
}
