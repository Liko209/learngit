/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-11-23 11:07:02
 * Copyright © RingCentral. All rights reserved.
 */
import { StoreViewModel } from '@/store/ViewModel';
import { computed } from 'mobx';
import { ProfileBodyProps } from './types';
import GlipTypeUtil from 'sdk/utils/glip-type-dictionary/util';
import TypeDictionary from 'sdk/utils/glip-type-dictionary/types';
import { getEntity } from '@/store/utils';
import { ENTITY_NAME } from '@/store';

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
    return getEntity(ENTITY_NAME.GROUP, this.id);
  }
  @computed
  private get _person() {
    return getEntity(ENTITY_NAME.PERSON, this.id);
  }
  @computed
  private get _profileData() {
    switch (this.idType) {
      case TypeDictionary.TYPE_ID_GROUP:
      case TypeDictionary.TYPE_ID_TEAM:
        return this._group;
      case TypeDictionary.TYPE_ID_PERSON:
        return this._person;
      default:
        return this._group;
    }
  }
  @computed
  get idType() {
    return GlipTypeUtil.extractTypeId(this.id);
  }
  @computed
  get displayName() {
    return this._profileData && this._profileData.displayName;
  }
  @computed
  get description() {
    return this._profileData && this._profileData.description;
  }
}
export { ProfileBodyViewModel };
