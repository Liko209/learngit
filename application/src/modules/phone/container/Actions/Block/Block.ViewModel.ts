/*
 * @Author: joy.zhang (joy.zhang@ringcentral.com)
 * @Date: 2019-06-24 13:14:11
 * Copyright © RingCentral. All rights reserved.
 */

import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';
import { observable, action, computed } from 'mobx';
import { StoreViewModel } from '@/store/ViewModel';
import { RCInfoService } from 'sdk/module/rcInfo';
import { catchError } from '@/common/catchError';
import { BlockProps } from './types';

class BlockViewModel extends StoreViewModel<BlockProps> {
  @observable isBlocked?: boolean;

  private _rcInfoService = ServiceLoader.getInstance<RCInfoService>(
    ServiceConfig.RC_INFO_SERVICE,
  );

  constructor(props: BlockProps) {
    super(props);
    this.reaction(
      () => this.props.caller,
      async () => {
        await this.fetchNumberStatus();
      },
      {
        fireImmediately: true,
      },
    );
  }

  @action
  async fetchNumberStatus() {
    this.isBlocked = await this._rcInfoService.isNumberBlocked(this.number);
  }

  @computed
  get number() {
    return (this.props.caller.phoneNumber as string) || this.props.phoneNumber;
  }

  @catchError.flash({
    network: 'phone.prompt.notAbleToBlockForNetworkIssue',
    server: 'phone.prompt.notAbleToBlockForServerIssue',
  })
  @action
  block = async () => {
    await this._rcInfoService.addBlockedNumber(this.number);
    await this.fetchNumberStatus();
    return true;
  };

  @catchError.flash({
    network: 'phone.prompt.notAbleToUnblockForNetworkIssue',
    server: 'phone.prompt.notAbleToUnblockForServerIssue',
  })
  @action
  unblock = async () => {
    await this._rcInfoService.deleteBlockedNumbers([this.number]);
    await this.fetchNumberStatus();
    return true;
  };
}

export { BlockViewModel };
