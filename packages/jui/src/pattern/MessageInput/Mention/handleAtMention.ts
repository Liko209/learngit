/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-10-23 17:29:02
 * Copyright © RingCentral. All rights reserved.
 */
// dynamic change at mention name if username changed
const UN_ESCAPE_HTML_AT_MENTION_REGEXP = /&lt;a class=['"]at_mention_compose[\S\s.]*?rel='{"id":(-?\d+)((?!&gt;).)+&gt;@((((?!&lt;).))+)&lt;&sol;a&gt;/g;
const TEAM_MENTION_ID = 1;

function decode(text: string) {
  const DECODE = {
    '&': '&amp;',
    '\\': '&bsol;',
    '/': '&sol;',
    ' ': '&nbsp;',
    '<': '&lt;',
    '>': '&gt;',
  };
  const REGEXP_DECODE = /[&\\/'"<>]/g;
  return text.replace(REGEXP_DECODE, $0 => {
    let handleText = $0;
    if (DECODE[$0]) {
      handleText = DECODE[$0];
    }
    return handleText;
  });
}

function atMentionTemplate(id: string, name: string) {
  return `<span class='mention' data-id='${id}' data-name='${name}' data-denotation-char='@' data-is-team='${Math.abs(
    Number(id),
  ) ===
    TEAM_MENTION_ID}'><span contenteditable='false'><span class='ql-mention-denotation-char'>@</span>${name}</span></span>`;
}

const handleAtMention = (str: string) => {
  let text = decode(str);

  if (/\n/g.test(text)) {
    text = text.replace(/\n/g, () => '<br />');
  }
  if (UN_ESCAPE_HTML_AT_MENTION_REGEXP.test(text)) {
    text = `<p>${text.replace(
      UN_ESCAPE_HTML_AT_MENTION_REGEXP,
      (match, id, $1, name) => atMentionTemplate(id, name),
    )}</p>`;
  }
  return text;
};
export {
  handleAtMention,
  UN_ESCAPE_HTML_AT_MENTION_REGEXP,
  decode,
  atMentionTemplate,
};
