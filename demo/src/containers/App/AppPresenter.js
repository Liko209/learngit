import BasePresenter from '#/store/base/BasePresenter';

// import { getAccountService } from 'sdk/service/account';

import { service } from 'sdk';

const { SERVICE, GroupService } = service;

export default class AppPresenter extends BasePresenter {
  constructor(history) {
    super();
    this.subscribeNotificationOnce(SERVICE.FETCH_INDEX_DATA_EXIST, () =>
      this.init()
    );
    this.subscribeNotificationOnce(SERVICE.FETCH_INDEX_DATA_DONE, () =>
      this.init()
    );
    this.history = history;
  }

  async init() {
    if (this.hasInit) {
      return;
    }
    this.hasInit = true;
    const { history } = this;
    const group = await GroupService.getInstance().getLatestGroup();
    if (group) {
      if (
        history &&
        history.location &&
        (history.location.pathname === '/' || history.location.pathname === '')
      ) {
        history.push(`/conversation/${group.id}`);
      }
    }
  }
}
