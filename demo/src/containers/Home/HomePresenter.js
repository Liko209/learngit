import LogRocket from 'logrocket';
import { observable, action } from 'mobx';

import BasePresenter from '@/store/base/BasePresenter';

import { service } from 'sdk';
import notificationHandler from './notificationHandler';
import { env, betaUserIdList } from '@/globalConfig';

const { AccountService, AuthService, ConfigService, SERVICE, SOCKET } = service;

export default class HomePresenter extends BasePresenter {
  @observable loading = false;
  @observable error = {};
  constructor() {
    super();
    this.userId = null;

    this.subscribeNotificationOnce(SERVICE.FETCH_INDEX_DATA_DONE, () =>
      this.handleHasLogined()
    );
    this.subscribeNotification(SERVICE.FETCH_INDEX_DATA_ERROR, payload =>
      this.handleIndexError(payload)
    );
    this.subscribeNotification(SOCKET.POST, payload =>
      this.handleNotification(payload)
    );

    this.init();
  }

  @action
  init() {
    const configService = ConfigService.getInstance();
    const lastIndexTimestamp = configService.getLastIndexTimestamp();

    LogRocket.identify(this.userId, {
      console: {
        isEnabled: {
          log: false,
          warn: false,
          debug: false,
          info: false
        }
      }
    });

    this.loading = !lastIndexTimestamp || lastIndexTimestamp <= 0;
  }

  @action
  handleHasLogined() {
    const accountService = AccountService.getInstance();
    this.userId = accountService.getCurrentUserId();

    if (
      env === 'production' &&
      !betaUserIdList.some(uname => String(this.userId).indexOf(uname) > -1)
    ) {
      alert('Invalid account');
      this.signOutAction();
      return;
    }
    this.loading = false;
  }

  @action
  handleIndexError(payload) {
    const { error } = payload;
    this.error = { ...this.error, error };
  }

  @action
  handleNotification(payload) {
    if (payload.length === 0) {
      return;
    }

    payload.forEach(post => {
      if (
        post.at_mention_non_item_ids &&
        post.at_mention_non_item_ids.includes(this.userId)
      ) {
        notificationHandler(post, this.userId);
      }
    });
  }

  @action
  async signOutAction() {
    const authService = AuthService.getInstance();
    await authService.logout();
    window.location = '/';
  }
}
