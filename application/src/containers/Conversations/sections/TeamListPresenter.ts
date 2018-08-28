import { service } from 'sdk';
import ConversationListPresenter from './ConversationListPresenter';
const { GROUP_QUERY_TYPE, ENTITY } = service;
export default class TeamListPresenter extends ConversationListPresenter {
  constructor() {
    super(
      'people',
      'team_plural',
      ENTITY.TEAM_GROUPS,
      GROUP_QUERY_TYPE.TEAM,
      'Teams',
    );
  }
}
