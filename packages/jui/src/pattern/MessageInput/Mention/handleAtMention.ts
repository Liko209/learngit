/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-10-23 17:29:02
 * Copyright © RingCentral. All rights reserved.
 */
// dynamic change at mention name if username changed
const UN_ESCAPE_HTML_AT_MENTION_REGEXP = /<a class=['"]at_mention_compose[\S\s.]*?rel=\D+(\d+)[^>]+>@([^<]+)<\/a>/g;

const handleAtMention = (str: string) => {
  let text = str;
  if (/\n/g.test(text)) {
    text = text.replace(/\n/g, () => {
      return '<br />';
    });
  }
  if (UN_ESCAPE_HTML_AT_MENTION_REGEXP.test(str)) {
    text = `<p>${text.replace(
      UN_ESCAPE_HTML_AT_MENTION_REGEXP,
      (match, id, name) => {
        // tslint:disable-next-line
        return `<span class='mention' data-id='${id}' data-name='${name}' data-denotation-char='@'><span contenteditable='false'><span class='ql-mention-denotation-char'>@</span>${name}</span></span>`;
      },
    )}</p>`;
  }
  return text;
};
export { handleAtMention };
