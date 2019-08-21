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
import { ConversationPreferenceModel } from 'sdk/module/setting/entity';
import moize from 'moize';
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';
import GroupService from 'sdk/module/group';
import { SettingService } from 'sdk/module/setting';
import { eventsDict } from './dataTrackings';
import { ConversationType } from 'src/AnalyticsCollector/types';

class NotificationPreferencesViewModel extends StoreViewModel<Props> {
  private _groupService = ServiceLoader.getInstance<GroupService>(
    ServiceConfig.GROUP_SERVICE,
  );

  private _settingService = ServiceLoader.getInstance<SettingService>(
    ServiceConfig.SETTING_SERVICE,
  );

  @observable
  private _initialValue: ConversationPreferenceModel;
  @observable
  isTeam: boolean;
  private _groupType: ConversationType;

  constructor(props: Props) {
    super(props);
    this.init();
  }

  init = async () => {
    this._initialValue = await this._settingService.getByGroupId(
      this.props.groupId,
    );
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
  get currentValue() {
    return Object.assign({}, this._initialValue, this.value);
  }

  @computed
  get soundNotificationsDisabled() {
    const { muteAll, desktopNotification } = this.currentValue;
    return muteAll || !desktopNotification;
  }

  @action
  handleCheckboxChange = moize((item: string) => () => {
    this.value[item] =
      this.value[item] === undefined
        ? !this._initialValue[item]
        : !this.value[item];
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

  @catchError.flash({
    network: 'setting.errorText.network',
    server: 'setting.errorText.server',
  })
  handleSubmit = async () => {
    try {
      let hasUpdated = true;
      const updateValue: Partial<ConversationPreferenceModel> = {};
      for (const key in this.value) {
        if (this.value[key] !== this._initialValue[key]) {
          updateValue[key] = this.value[key];
          eventsDict[key](this.value[key], this._groupType);
          hasUpdated = true;
        }
      }
      if (hasUpdated) {
        this.loading = true;
        await this._settingService.updateConversationPreference(
          this.props.groupId,
          updateValue,
        );
        this.handleClose();
      }
    } catch (error) {
      throw error;
    } finally {
      this.loading = false;
    }
  };
}

export { NotificationPreferencesViewModel };
