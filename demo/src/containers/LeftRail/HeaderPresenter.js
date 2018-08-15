import { observable, computed, action } from 'mobx';

import { service } from 'sdk';

import storeManager, { ENTITY_NAME } from '@/store';
import BasePresenter from '@/store/base/BasePresenter';

const { AuthService, AccountService, SERVICE } = service;
export default class HeaderPresenter extends BasePresenter {
  @observable userId;

  @computed
  get user() {
    return this.userId && this.personStore.get(this.userId);
  }

  @computed
  get company() {
    return this.user && this.user.companyId && this.companyStore.get(this.user.companyId);
  }

  @computed
  get awayStatusHistory() {
    return this.myStateStore.get('awayStatusHistory');
  }

  constructor() {
    super();

    this.companyStore = storeManager.getEntityMapStore(ENTITY_NAME.COMPANY);
    this.personStore = storeManager.getEntityMapStore(ENTITY_NAME.PERSON);
    this.myStateStore = storeManager.getEntityMapStore(ENTITY_NAME.MY_STATE);

    this.subscribeNotificationOnce(SERVICE.FETCH_INDEX_DATA_DONE, () =>
      this.init()
    );
    this.subscribeNotification(SERVICE.DO_SIGN_OUT, () => {
      this.signOutClickHandler();
    });
  }

  @action
  init() {
    const accountService = AccountService.getInstance();
    this.userId = accountService.getCurrentUserId();
  }

  async signOutClickHandler() {
    const authService = AuthService.getInstance();
    await authService.logout();
    window.location = '/';
  }

  dispose() {
    super.dispose();
  }
}
