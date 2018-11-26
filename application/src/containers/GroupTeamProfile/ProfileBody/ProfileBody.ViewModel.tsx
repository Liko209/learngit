/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-11-23 11:07:02
 * Copyright © RingCentral. All rights reserved.
 */
import { StoreViewModel } from '@/store/ViewModel';
import { computed } from 'mobx';
import { ProfileBodyProps } from './types';
import { BaseProfileTypeHandler } from '../TypeIdHandler';

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
    const baseProfileHandler = new BaseProfileTypeHandler(this.id);
    return baseProfileHandler.getGroupOrPersonData();
  }
  @computed
  private get _person() {
    return new BaseProfileTypeHandler(this.id).getGroupOrPersonData();
  }
  @computed
  private get _profileData() {
    return this._group || this._person;
  }
  @computed
  get displayName() {
    return this._profileData && this._profileData.displayName;
  }
  @computed
  get description() {
    return this._profileData && this._profileData.description;
  }
  @computed
  get idType() {
    return new BaseProfileTypeHandler(this.id).idType;
  }
}
export { ProfileBodyViewModel };
