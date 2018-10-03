import { observable, computed } from 'mobx';
import storeManager, { ENTITY_NAME } from '@/store';
import MultiEntityMapStore from '@/store/base/MultiEntityMapStore';
import { AccountService, GROUP_QUERY_TYPE, ENTITY } from 'sdk/service';
import { Company, Group, Person } from 'sdk/models';
import PersonModel from '../../store/models/Person';
import CompanyModel from '../../store/models/Company';

interface IConversationListSectionModel {
  title: string;
  iconName: string;
  queryType?: GROUP_QUERY_TYPE;
  entity: string;
  sortable?: boolean;
  expanded?: boolean;
  transformFunc?: Function;
  isMatchFun: Function;
}

class LeftRailPresenter {
  @observable
  userId: number | null;
  accountService: AccountService;
  personStore: MultiEntityMapStore<Person, PersonModel>;
  companyStore: MultiEntityMapStore<Company, CompanyModel>;

  constructor() {
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
  get sections(): IConversationListSectionModel[] {
    return [
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
        isMatchFun: () => {
          return false;
        },
      },
      {
        title: 'directMessage_plural',
        iconName: 'people',
        queryType: GROUP_QUERY_TYPE.GROUP,
        entity: ENTITY.PEOPLE_GROUPS,
        expanded: true,
        transformFunc: (dataModel: Group, index: number) => ({
          id: dataModel.id,
          sortKey: -(
            dataModel.most_recent_post_created_at || dataModel.created_at
          ),
        }),

        isMatchFun: (model: Group) => {
          return !model.is_team;
        },
      },
      {
        title: 'team_plural',
        iconName: 'people',
        queryType: GROUP_QUERY_TYPE.TEAM,
        entity: ENTITY.TEAM_GROUPS,
        expanded: true,
        transformFunc: (dataModel: Group, index: number) => ({
          id: dataModel.id,
          sortKey: -(
            dataModel.most_recent_post_created_at || dataModel.created_at
          ),
        }),
        isMatchFun: (model: Group) => {
          return model.is_team;
        },
      },
    ];
  }
}

export { LeftRailPresenter };
export default LeftRailPresenter;
