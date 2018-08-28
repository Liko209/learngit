import { observable, computed } from 'mobx';
import { service } from 'sdk';
import storeManager, { ENTITY_NAME } from '@/store';
import BasePresenter from '@/store/base/BasePresenter';
import MultiEntityMapStore from '@/store/base/MultiEntityMapStore';
import { AccountService as IAccountService } from 'sdk/service';
import { Company, Group, Person } from 'sdk/models';
import PersonModel from '../../store/models/Person';
import CompanyModel from '../../store/models/Company';

const { AccountService } = service;

class LeftRailPresenter extends BasePresenter<Group> {
  @observable
  userId: number | null;
  accountService: IAccountService;
  personStore: MultiEntityMapStore<Person, PersonModel>;
  companyStore: MultiEntityMapStore<Company, CompanyModel>;

  constructor() {
    super();
    this.accountService = AccountService.getInstance();
    this.personStore = storeManager.getEntityMapStore(ENTITY_NAME.PERSON) as MultiEntityMapStore<Person, PersonModel>;
    this.companyStore = storeManager.getEntityMapStore(ENTITY_NAME.COMPANY) as MultiEntityMapStore<Company, CompanyModel>;
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
