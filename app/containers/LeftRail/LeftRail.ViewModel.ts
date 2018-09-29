import { observable, computed } from 'mobx';
import { AccountService, GROUP_QUERY_TYPE, ENTITY } from 'sdk/service';
import { Company, Group, Person } from 'sdk/models';
import storeManager, { ENTITY_NAME } from '@/store';
import MultiEntityMapStore from '@/store/base/MultiEntityMapStore';
import PersonModel from '@/store/models/Person';
import CompanyModel from '@/store/models/Company';
import { ConversationListSectionModel } from './types';
import { ConversationSectionPresenter } from '../sections';
import { AbstractViewModel } from '@/base/AbstractViewModel';

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
  get sections(): ConversationListSectionModel[] {
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
        sortable: true,
        expanded: true,
        presenter: new ConversationSectionPresenter({
          entity: ENTITY.FAVORITE_GROUPS,
          queryType: GROUP_QUERY_TYPE.FAVORITE,
          transformFunc: (dataModel: Group, index: number) => ({
            id: dataModel.id,
            sortKey: index,
          }),
        }),
      },
      {
        title: 'directMessage_plural',
        iconName: 'people',
        expanded: true,
        presenter: new ConversationSectionPresenter({
          entity: ENTITY.PEOPLE_GROUPS,
          queryType: GROUP_QUERY_TYPE.GROUP,
          transformFunc: (dataModel: Group, index: number) => ({
            id: dataModel.id,
            sortKey: index,
          }),
        }),
      },
      {
        title: 'team_plural',
        iconName: 'people',
        expanded: true,
        presenter: new ConversationSectionPresenter({
          entity: ENTITY.TEAM_GROUPS,

          transformFunc: (dataModel: Group, index: number) => ({
            id: dataModel.id,
            sortKey: index,
          }),
        }),
      },
    ];
  }
}

export { LeftRailViewModel };
