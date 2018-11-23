/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-11-23 11:07:02
 * Copyright © RingCentral. All rights reserved.
 */
import { StoreViewModel } from '@/store/ViewModel';
// import { getEntity } from '@/store/utils';
import { computed } from 'mobx';
// import { ENTITY_NAME } from '@/store';
// import GroupModel from '@/store/models/Group';
import { ProfileBodyProps, ID_TYPE } from './types';
import { BaseProfileHandler } from '../TypeIdHandler';
import TypeDictionary from 'sdk/utils/glip-type-dictionary/types';
import { GlipTypeUtil } from 'sdk/utils';

class ProfileBodyViewModel extends StoreViewModel<ProfileBodyProps> {
  constructor() {
    super();
  }
  @computed
  get id() {
    return this.props.id;
  }
  @computed
  private get _group() {
    const baseProfileHandler = new BaseProfileHandler();
    return baseProfileHandler.handler(this.id);
  }
  @computed
  private get _person() {
    return new BaseProfileHandler().handler(this.id);
  }
  @computed
  private get _profileData() {
    return this._group || this._person;
  }
  @computed
  get displayName() {
    console.log('_group', this._group);
    console.log('_person', this._person);
    return this._profileData && this._profileData.displayName;
  }
  @computed
  get description() {
    return this._profileData && this._profileData.description;
  }
  @computed
  get idType() {
    const typeId = GlipTypeUtil.extractTypeId(this.id);
    const PROFILE_DATA_HANDLER_MAP = {
      [TypeDictionary.TYPE_ID_GROUP]: ID_TYPE.GROUP,
      [TypeDictionary.TYPE_ID_PERSON]: ID_TYPE.PERSON,
      [TypeDictionary.TYPE_ID_TEAM]: ID_TYPE.TEAM,
    };
    return PROFILE_DATA_HANDLER_MAP[typeId];
  }
}
export { ProfileBodyViewModel };
