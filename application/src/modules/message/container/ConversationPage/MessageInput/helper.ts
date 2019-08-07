/*
 * @Author: Alessia Li (alessia.li@ringcentral.com)
 * @Date: 2019-06-25 10:31:20
 * Copyright © RingCentral. All rights reserved.
 */

import { GlipTypeUtil, TypeDictionary } from 'sdk/utils';

export function isEmpty(content: string) {
  const commentText = content.trim();
  const re = /^(<p>(<br>|<br\/>|<br\s\/>|\s+)*<\/p>)+$/gm;
  return commentText === '' || re.test(commentText);
}

export function isMultipleLine(content: string) {
  const match = content.match(/<p>/gi);
  return !!match && match.length > 1;
}

export function isTeamId(id: number) {
  return GlipTypeUtil.extractTypeId(id) === TypeDictionary.TYPE_ID_TEAM;
}
