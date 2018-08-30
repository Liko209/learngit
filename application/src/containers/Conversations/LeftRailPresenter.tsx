import { observable, computed } from 'mobx';
import { service } from 'sdk';
import storeManager, { ENTITY_NAME } from '@/store';
import BasePresenter from '@/store/base/BasePresenter';
import MultiEntityMapStore from '@/store/base/MultiEntityMapStore';
import { AccountService as IAccountService } from 'sdk/service';
import { Company, Group, Person } from 'sdk/models';
import PersonModel from '../../store/models/Person';
import CompanyModel from '../../store/models/Company';
const { GROUP_QUERY_TYPE, ENTITY } = service;

const { AccountService } = service;

class LeftRailPresenter extends BasePresenter {
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
  @computed
  get sections() {
    return [
      {
        title: 'unread',
        iconName: 'fiber_new',
      },
      {
        title: 'mention_plural',
        iconName: 'alternate_email',
      },
      {
        title: 'bookmark_plural',
        iconName: 'bookmark',
      },
      {
        title: 'favorite_plural',
        iconName: 'start',
        queryType: GROUP_QUERY_TYPE.FAVORITE,
        entity: ENTITY.FAVORITE_GROUPS,
        sortable: true,
        expanded: true,
        transformFunc: (dataModel: Group, index: number) => ({
          id: dataModel.id,
          sortKey: index,
        }),
      },
      {
        title: 'directMessage_plural',
        iconName: 'people',
        queryType: GROUP_QUERY_TYPE.GROUP,
        entity: ENTITY.PEOPLE_GROUPS,
        sortable: false,
        expanded: true,
      },
      {
        title: 'team_plural',
        iconName: 'people',
        queryType: GROUP_QUERY_TYPE.TEAM,
        entity: ENTITY.TEAM_GROUPS,
        sortable: false,
        expanded: true,
      },
    ];
  }
}

export { LeftRailPresenter };
export default LeftRailPresenter;
