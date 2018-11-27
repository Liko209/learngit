import { WithNamespaces } from 'react-i18next';
import { ProfileType } from '../../types';

type MemberListHeaderViewProps = WithNamespaces & {
  counts: number;
  type: ProfileType;
};
enum GROUP_LIST_TITLE {
  TEAM_MEMBERS = 'TeamMembers',
  GROUP_MEMBERS = 'GroupMembers',
}
type MemberListHeaderProps = {
  id: number;
  type: ProfileType;
};
export { MemberListHeaderViewProps, GROUP_LIST_TITLE, MemberListHeaderProps };
