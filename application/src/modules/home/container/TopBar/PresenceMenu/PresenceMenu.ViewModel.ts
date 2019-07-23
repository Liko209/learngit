/*
 * @Author: joy.zhang (joy.zhang@ringcentral.com)
 * @Date: 2019-07-15 06:29:46
 * Copyright © RingCentral. All rights reserved.
 */

import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';
import { StoreViewModel } from '@/store/ViewModel';
import { catchError } from '@/common/catchError';
import { action, observable } from 'mobx';
import { CompanyService } from 'sdk/module/company';
import { PresenceService } from 'sdk/module/presence';
import { PRESENCE } from 'sdk/module/presence/constant';
import { analyticsCollector } from '@/AnalyticsCollector';
import { PresenceMenuProps, PresenceMenuViewProps } from './types';

type Props = PresenceMenuProps & PresenceMenuViewProps;

class PresenceMenuViewModel extends StoreViewModel<Props> {
  @observable isFreyja?: boolean = false;

  private _presenceService = ServiceLoader.getInstance<PresenceService>(
    ServiceConfig.PRESENCE_SERVICE,
  );

  private _companyService = ServiceLoader.getInstance<CompanyService>(
    ServiceConfig.COMPANY_SERVICE,
  );

  constructor(props: Props) {
    super(props);
    this.reaction(
      () => this.props.presence,
      async () => {
        await this.getAccountType();
      },
      {
        fireImmediately: true,
      },
    );
  }

  @catchError.flash({
    network: 'presence.prompt.updatePresenceFailedForNetworkIssue',
    server: 'presence.prompt.updatePresenceFailedForServerIssue',
  })
  @action
  setPresence = async (toPresence: PRESENCE) => {
    const { presence } = this.props;
    analyticsCollector.setPresence(toPresence);

    if (presence === toPresence) {
      return;
    }

    await this._presenceService.setPresence(toPresence);
  };

  @action
  async getAccountType() {
    this.isFreyja = await this._companyService.isFreyjaAccount();
  }
}

export { PresenceMenuViewModel };
