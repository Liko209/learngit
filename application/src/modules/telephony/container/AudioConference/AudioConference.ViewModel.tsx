/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2019-08-21 14:17:17
 * Copyright © RingCentral. All rights reserved.
 */
import { container } from 'framework/ioc';
import { AbstractViewModel } from '@/base';
import { TelephonyService } from '@/modules/telephony/service';
import { AudioConferenceProps, AudioConferenceViewProps } from './types';
import { computed, action } from 'mobx';
import { promisedComputed } from 'computed-async-mobx';
import { getEntity } from '@/store/utils';
import GroupModel from '@/store/models/Group';
import { CONVERSATION_TYPES } from '@/constants';
import { Group } from 'sdk/module/group/entity';
import { ENTITY_NAME } from '@/store';
import { FeaturesFlagsService } from '@/modules/featuresFlags/service';
import { TELEPHONY_SERVICE } from '@/modules/telephony/interface/constant';
import { analyticsCollector } from '@/AnalyticsCollector';
import { mainLogger } from 'foundation/log';

class AudioConferenceViewModel extends AbstractViewModel<AudioConferenceProps>
  implements AudioConferenceViewProps {
  private _telephonyService: TelephonyService = container.get(
    TELEPHONY_SERVICE,
  );
  private _featuresFlagsService: FeaturesFlagsService = container.get(
    FeaturesFlagsService,
  );
  @computed
  private get _group() {
    const { groupId } = this.props;
    return groupId
      ? getEntity<Group, GroupModel>(ENTITY_NAME.GROUP, groupId)
      : null;
  }

  @action
  startAudioConference = async () => {
    const { analysisSource, groupId } = this.props;

    if (this._group && analysisSource) {
      analyticsCollector.startConferenceCall(
        this._group.analysisType,
        analysisSource,
      );
    }

    if (!groupId) {
      return false;
    }

    const isConferenceSuccess =
      await this._telephonyService.startAudioConference(groupId);

    return Boolean(isConferenceSuccess);
  };
  showIcon = promisedComputed(false, async () => {
    if (!this._group || !this._featuresFlagsService) return false;
    const canUseConference = await this._featuresFlagsService.canUseConference();
    mainLogger.info(`Conference permission: ${canUseConference}`);
    if (canUseConference) {
      const group = this._group;
      return (
        group.type === CONVERSATION_TYPES.NORMAL_GROUP ||
        group.type === CONVERSATION_TYPES.TEAM
      );
    }
    return false;
  });
}

export { AudioConferenceViewModel };
