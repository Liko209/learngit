/*
 * @Author: Alessia Li (alessia.li@ringcentral.com)
 * @Date: 2019-08-14 17:54:54
 * Copyright © RingCentral. All rights reserved.
 */
import { computed, observable, action } from 'mobx';
import { StoreViewModel } from '@/store/ViewModel';
import { catchError } from '@/common/catchError';
import portalManager from '@/common/PortalManager';
import { Props } from './types';
import moize from 'moize';
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';
import GroupService from 'sdk/module/group';
import { ProfileService } from 'sdk/module/profile';
import { eventsDict } from './dataTrackings';
import { ConversationType } from 'src/AnalyticsCollector/types';
import ConversationPreferenceModel from '@/store/models/ConversationPreference';
import { TO_CAMEL_DICT } from './constant';
import _ from 'lodash';

class NotificationPreferencesViewModel extends StoreViewModel<Props> {
  private _groupService = ServiceLoader.getInstance<GroupService>(
    ServiceConfig.GROUP_SERVICE,
  );

  private _profileService = ServiceLoader.getInstance<ProfileService>(
    ServiceConfig.PROFILE_SERVICE,
  );

  @observable
  private _initialValue: ConversationPreferenceModel = {} as ConversationPreferenceModel;
  @observable
  isTeam: boolean;
  private _groupType: ConversationType;
  @observable
  currentValue: ConversationPreferenceModel = {} as ConversationPreferenceModel;

  constructor(props: Props) {
    super(props);
    this.init();
    this.autorun(() => {
      Object.assign(this.currentValue, this._initialValue, this.value);
    });
  }

  init = async () => {
    const initialValue = await this._profileService.getConversationPreference(
      this.props.groupId,
    );
    for (const key in initialValue) {
      if (Object.prototype.hasOwnProperty.call(initialValue, key)) {
        this._initialValue[TO_CAMEL_DICT[key]] = initialValue[key];
      }
    }
    const group = await this._groupService.getById(this.props.groupId);
    if (group) {
      const isOne2One = await this._groupService.isIndividualGroup(group);
      this.isTeam = !!group.is_team;
      this._groupType = this.isTeam ? 'team' : isOne2One ? '1:1' : 'group';
    }
  };

  @observable
  value: Partial<ConversationPreferenceModel> = {};

  @observable
  loading: boolean = false;

  @computed
  get soundNotificationsDisabled() {
    const { muted, desktopNotifications } = this.currentValue;
    return muted || !desktopNotifications;
  }

  @action
  handleCheckboxChange = moize((item: string) => () => {
    const hasSetValue = this.value[item] !== undefined;
    this.value[item] = hasSetValue
      ? !this.value[item]
      : !this._initialValue[item];
  });

  @action
  handleSelectChange = moize(
    <T>(item: string) => (newValue: string, rawValue: T) => {
      this.value[item] = rawValue;
    },
  );

  handleClose = () => {
    portalManager.dismissLast();
  };

  private _diffObject = (
    currObj: Partial<ConversationPreferenceModel>,
    prevObj: ConversationPreferenceModel,
  ) => _.omitBy(currObj, (value, key) => prevObj[key] === value);

  private get _changedValue() {
    return this._diffObject(this.value, this._initialValue);
  }

  private get _hasChanged() {
    return !_.isEmpty(this._changedValue);
  }

  private _trackEvent = () => {
    Object.keys(this._changedValue).forEach(key => {
      eventsDict[key](this._changedValue[key], this._groupType);
    });
  };

  @catchError.flash({
    network: 'setting.errorText.network',
    server: 'setting.errorText.server',
  })
  handleSubmit = async () => {
    try {
      if (this._hasChanged) {
        this.loading = true;
        this._trackEvent();
        await this._profileService.updateConversationPreference(
          this.props.groupId,
          this._changedValue,
        );
      }
      this.handleClose();
    } finally {
      this.loading = false;
    }
  };
}

export { NotificationPreferencesViewModel };
