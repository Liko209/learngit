/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-11-23 15:29:02
 * Copyright © RingCentral. All rights reserved.
 */
import { GlipTypeUtil } from 'sdk/utils';
import TypeDictionary from 'sdk/utils/glip-type-dictionary/types';
import { getEntity } from '@/store/utils';
import { computed } from 'mobx';
import { ENTITY_NAME } from '@/store';

class BaseProfileHandler {
  public id: number;
  constructor() {}
  handler = (id: number) => {
    this.id = id;
    const typeId = GlipTypeUtil.extractTypeId(id);
    const PROFILE_DATA_HANDLER_MAP = {
      [TypeDictionary.TYPE_ID_GROUP]: this.group,
      [TypeDictionary.TYPE_ID_PERSON]: this.person,
      [TypeDictionary.TYPE_ID_TEAM]: this.group,
    };
    return PROFILE_DATA_HANDLER_MAP[typeId];
  }
  @computed
  get group() {
    return getEntity(ENTITY_NAME.GROUP, this.id);
  }
  @computed
  get person() {
    const id = this.id;
    return getEntity(ENTITY_NAME.PERSON, id);
  }
}
export { BaseProfileHandler };
