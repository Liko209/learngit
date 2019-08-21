/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2019-08-21 14:17:17
 * Copyright © RingCentral. All rights reserved.
 */
import { container } from 'framework/ioc';
import { AbstractViewModel } from '@/base';
// import { TelephonyService } from '../../service';
import { AudioConferenceProps, AudioConferenceViewProps } from './types';
import { computed } from 'mobx';
import { promisedComputed } from 'computed-async-mobx';
import { getEntity } from '@/store/utils';
import GroupModel from '@/store/models/Group';
import { CONVERSATION_TYPES } from '@/constants';
import { Group } from 'sdk/module/group/entity';
import { ENTITY_NAME } from '@/store';
import { FeaturesFlagsService } from '@/modules/featuresFlags/service';
// import { analyticsCollector } from '@/AnalyticsCollector';
// import { TELEPHONY_SERVICE } from '../../interface/constant';

class AudioConferenceViewModel extends AbstractViewModel<AudioConferenceProps>
  implements AudioConferenceViewProps {
  // private _telephonyService: TelephonyService = container.get(
  //   TELEPHONY_SERVICE,
  // );
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
  // @action
  // call = async () => {
  //   if (!this.phoneNumber) return;
  //   const isCallSuccess = await this._telephonyService.directCall(
  //     this.phoneNumber,
  //   );
  //   if (!isCallSuccess) {
  //     this._telephonyService.hangUp();
  //   }
  // };
  // @action
  // trackCall = (analysisSource?: string) => {
  //   if (analysisSource) {
  //     analyticsCollector.makeOutboundCall(analysisSource);
  //   }
  // };
  showIcon = promisedComputed(false, async () => {
    if (!this._group) return false;
    const canUseTelephony = await this._featuresFlagsService.canUseTelephony();
    if (canUseTelephony) {
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
