import { observable, computed } from 'mobx';
import { service } from 'sdk';
import storeManager, { ENTITY_NAME } from '@/store';
import BasePresenter from '@/store/base/BasePresenter';
import EntityMapStore from '@/store/base/MultiEntityMapStore';
import { AccountService as IAccountService } from 'sdk/service';

const { AccountService } = service;

class LeftRailPresenter extends BasePresenter {
  @observable
  userId: number|null;
  accountService: IAccountService;
  personStore: EntityMapStore;
  companyStore: EntityMapStore;

  constructor() {
    super();
    this.accountService = AccountService.getInstance();
    this.personStore = storeManager.getEntityMapStore(ENTITY_NAME.PERSON) as EntityMapStore;
    this.companyStore = storeManager.getEntityMapStore(ENTITY_NAME.COMPANY) as EntityMapStore;
    this.userId = this.accountService.getCurrentUserId();
  }
  @computed
  get user() {
    return this.userId && this.personStore.get(this.userId);
  }
  @computed
  get company() {
    return this.user && this.user.companyId && this.companyStore.get(this.user.companyId);
  }
}

export { LeftRailPresenter };
export default LeftRailPresenter;
