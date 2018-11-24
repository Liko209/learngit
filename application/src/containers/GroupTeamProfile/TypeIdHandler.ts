/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-11-23 15:29:02
 * Copyright © RingCentral. All rights reserved.
 */
import { GlipTypeUtil } from 'sdk/utils';
import TypeDictionary from 'sdk/utils/glip-type-dictionary/types';
import { getEntity } from '@/store/utils';
import { computed, observable } from 'mobx';
import { ENTITY_NAME } from '@/store';
import { ID_TYPE } from './types';

class BaseProfileHandler {
  @observable
  private _id: number;
  @observable
  private _typeId: number;
  constructor(id: number) {
    this._id = id;
    this._typeId = GlipTypeUtil.extractTypeId(id);
  }
  getGroupOrPersonData = () => {
    const PROFILE_DATA_HANDLER_MAP = {
      [TypeDictionary.TYPE_ID_GROUP]: this._group,
      [TypeDictionary.TYPE_ID_PERSON]: this._person,
      [TypeDictionary.TYPE_ID_TEAM]: this._group,
    };
    return PROFILE_DATA_HANDLER_MAP[this._typeId];
  }
  @computed
  private get _group() {
    return getEntity(ENTITY_NAME.GROUP, this._id);
  }
  @computed
  private get _person() {
    return getEntity(ENTITY_NAME.PERSON, this._id);
  }
  @computed
  get isTeamOrGroup() {
    return this._typeId === 2 || this._typeId === 6;
  }
  @computed
  get idType() {
    const typeId = this._typeId;
    const PROFILE_DATA_HANDLER_MAP = {
      [TypeDictionary.TYPE_ID_GROUP]: ID_TYPE.GROUP,
      [TypeDictionary.TYPE_ID_PERSON]: ID_TYPE.PERSON,
      [TypeDictionary.TYPE_ID_TEAM]: ID_TYPE.TEAM,
    };
    return PROFILE_DATA_HANDLER_MAP[typeId];
  }
}
export { BaseProfileHandler };
