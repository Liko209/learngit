import { observable, computed } from 'mobx';
import { AccountService, GROUP_QUERY_TYPE, ENTITY } from 'sdk/service';
import { Company, Group, Person } from 'sdk/models';
import storeManager, { ENTITY_NAME } from '@/store';
import MultiEntityMapStore from '@/store/base/MultiEntityMapStore';
import PersonModel from '@/store/models/Person';
import CompanyModel from '@/store/models/Company';
import { AbstractViewModel } from '@/base/AbstractViewModel';
import { SECTION_TYPE } from './Section/constants';

class LeftRailViewModel extends AbstractViewModel {
  @observable
  userId: number | null;
  accountService: AccountService;
  personStore: MultiEntityMapStore<Person, PersonModel>;
  companyStore: MultiEntityMapStore<Company, CompanyModel>;

  constructor() {
    super();
    this.accountService = AccountService.getInstance();
    this.personStore = storeManager.getEntityMapStore(
      ENTITY_NAME.PERSON,
    ) as MultiEntityMapStore<Person, PersonModel>;
    this.companyStore = storeManager.getEntityMapStore(
      ENTITY_NAME.COMPANY,
    ) as MultiEntityMapStore<Company, CompanyModel>;
    this.userId = this.accountService.getCurrentUserId();
  }

  @computed
  get user() {
    return this.userId && this.personStore.get(this.userId);
  }

  @computed
  get company() {
    return (
      this.user &&
      this.user.companyId &&
      this.companyStore.get(this.user.companyId)
    );
  }
  @computed
  get sections(): SECTION_TYPE[] {
    return [
      SECTION_TYPE.UNREAD,
      SECTION_TYPE.AT_MENTION,
      SECTION_TYPE.BOOKMARK,
      SECTION_TYPE.FAVORITE,
      SECTION_TYPE.DIRECT_MESSAGE,
      SECTION_TYPE.TEAM,
    ];
  }
}

export { LeftRailViewModel };
