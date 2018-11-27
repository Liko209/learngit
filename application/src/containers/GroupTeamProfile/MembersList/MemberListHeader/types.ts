import { WithNamespaces } from 'react-i18next';
import { ProfileType } from '../../types';

type MemberListHeaderViewProps = WithNamespaces & {
  counts: number;
  type: ProfileType;
};
type MemberListHeaderProps = {
  id: number;
  type: ProfileType;
};
export { MemberListHeaderViewProps, MemberListHeaderProps };
