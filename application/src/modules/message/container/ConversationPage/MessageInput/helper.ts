/*
 * @Author: Alessia Li (alessia.li@ringcentral.com)
 * @Date: 2019-06-25 10:31:20
 * Copyright © RingCentral. All rights reserved.
 */

import { GlipTypeUtil, TypeDictionary } from 'sdk/utils';

export function isEmpty(content: string) {
  const trimmed = content.replace(/[(<br>)(<br/>)(<p>)(<p/>)\s]/g, '');
  return trimmed === '';
}

export function isMultipleLine(content: string) {
  const match = content.match(/<p>/gi);
  return !!match && match.length > 1;
}

export function isTeamId(id: number) {
  return GlipTypeUtil.extractTypeId(id) === TypeDictionary.TYPE_ID_TEAM;
}
