/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-10-23 17:29:02
 * Copyright © RingCentral. All rights reserved.
 */
const atMentionCompose = /<a class=['"]at_mention_compose[\S\s.]*?rel=\D+(\d+)[^>]+>([^<]+)<\/a>/g;

const html2React = (str: string, kv = {}) => {
  return str.replace(atMentionCompose, (match, id, p2) => {
    const text = kv[id] || p2;
    return `<a class='at_mention_compose-${id}' href='javascript:void(0)' id=${id}>${text}</a>`;
  });
};
export { html2React };
