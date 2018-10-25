/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-10-23 17:29:02
 * Copyright © RingCentral. All rights reserved.
 */
// dynamic change at mention name if username changed
const atMentionCompose = /<a class=['"]at_mention_compose[\S\s.]*?rel=\D+(\d+)[^>]+>([^<]+)<\/a>/g;

const handleAtMentionName = (str: string, kv = {}, currentUserId = 0) => {
  return str.replace(atMentionCompose, (match, id, p2) => {
    const text = kv[id] || p2;
    return `<a class='at_mention_compose ${+id === currentUserId ? 'current' : ''}' href='javascript:void(0)' id=${id}>${text}</a>`;
  });
};
export { handleAtMentionName };
