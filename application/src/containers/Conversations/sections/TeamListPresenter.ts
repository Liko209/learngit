import { service } from 'sdk';
import ConversationListPresenter from './ConversationListPresenter';
const { GROUP_QUERY_TYPE, ENTITY } = service;
export default class TeamListPresenter extends ConversationListPresenter {
  constructor() {
    super(
      'people',
      'Team',
      ENTITY.TEAM_GROUPS,
      GROUP_QUERY_TYPE.TEAM,
      'Team',
    );
  }
}
