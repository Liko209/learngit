import { service } from 'sdk';

import BasePresenter from '#/store/base/BasePresenter';

import ConversationListPresenter from './ConversationListPresenter';


const { AccountService, GROUP_QUERY_TYPE, SERVICE, ENTITY } = service;
export default class MainPresenter extends BasePresenter {
  computed;

  constructor() {
    super();
    const { TEAM, GROUP, FAVORITE } = GROUP_QUERY_TYPE;
    this.presenters = new Map();
    this.presenters.set(
      TEAM,
      new ConversationListPresenter(TEAM, ENTITY.TEAM_GROUPS)
    );
    this.presenters.set(
      GROUP,
      new ConversationListPresenter(GROUP, ENTITY.PEOPLE_GROUPS)
    );
    this.presenters.set(
      FAVORITE,
      new ConversationListPresenter(FAVORITE, ENTITY.FAVORITE_GROUPS)
    );

    this.subscribeNotificationOnce(SERVICE.FETCH_INDEX_DATA_DONE, () =>
      this.init()
    );
  }

  init() {
    if (this.hasInit) {
      return;
    }
    const accountService = AccountService.getInstance();
    const userId = accountService.getCurrentUserId();
    if (!userId) {
      return;
    }
    this.hasInit = true;
    this.fetchData();
  }

  fetchData() {
    this.presenters.forEach(presenter => {
      presenter.fetchData();
    });
  }

  getStore(groupType) {
    return this.presenters.get(groupType).getStore();
  }

  dispose(groupType) {
    super.dispose();
    if (groupType) {
      this.presenters[groupType].dispose();
    } else {
      this.presenters.forEach(presenter => {
        presenter.dispose();
      });
    }
  }
}
