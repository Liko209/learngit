/*
 * @Author: Alessia Li (alessia.li@ringcentral.com)
 * @Date: 2019-06-25 10:31:20
 * Copyright © RingCentral. All rights reserved.
 */

export function isEmpty(content: string) {
  const commentText = content.trim();
  const re = /^(<p>(<br>|<br\/>|<br\s\/>|\s+)*<\/p>)+$/gm;
  return commentText === '' || re.test(commentText);
}
