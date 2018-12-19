/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-10-23 17:29:02
 * Copyright © RingCentral. All rights reserved.
 */
// dynamic change at mention name if username changed
import { glipdown2Html } from './glipdown2Html';
const UN_ESCAPE_HTML_AT_MENTION_REGEXP = /<a class=['"]at_mention_compose[\S\s.]*?rel=\D+(\d+)[^>]+>@([^<]+)<\/a>/g;

const handleAtMentionName = (str: string, kv = {}, currentUserId = 0) => {
  const ESCAPE_HTML_AT_MENTION_REGEXP = /&lt;a class=&#x27;at_mention_compose&#x27; rel=&#x27;{&quot;id&quot;:\d*?}&#x27;&gt;.*?&lt;\/a&gt;/g;
  if (ESCAPE_HTML_AT_MENTION_REGEXP.test(str)) {
    const converseHtml = glipdown2Html(str);
    return converseHtml.replace(
      UN_ESCAPE_HTML_AT_MENTION_REGEXP,
      (match, id, p2) => {
        const text = kv[id] || p2;
        return `<a class='at_mention_compose ${
          +id === currentUserId ? 'current' : ''
        }' href='javascript:void(0)' id=${id}>${text}</a>`;
      },
    );
  }
  return str;
};
export { handleAtMentionName };
