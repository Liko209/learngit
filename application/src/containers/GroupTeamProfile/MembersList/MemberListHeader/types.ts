import { WithNamespaces } from 'react-i18next';
import { ID_TYPE } from '../../types';

type MemberListHeaderViewProps = WithNamespaces & {
  counts: number;
  idType: ID_TYPE;
};
enum GROUP_LIST_TITLE {
  TEAM_MEMBERS = 'Team members',
  GROUP_MEMBERS = 'Group members',
}
type MemberListHeaderProps = {
  id: number;
};
export { MemberListHeaderViewProps, GROUP_LIST_TITLE, MemberListHeaderProps };
