import { WithNamespaces } from 'react-i18next';

type MemberListHeaderViewProps = WithNamespaces & {
  counts: number;
  idType: number;
};
enum GROUP_LIST_TITLE {
  TEAM_MEMBERS = 'TeamMembers',
  GROUP_MEMBERS = 'GroupMembers',
}
type MemberListHeaderProps = {
  id: number;
};
export { MemberListHeaderViewProps, GROUP_LIST_TITLE, MemberListHeaderProps };
