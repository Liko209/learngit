import { WithNamespaces } from 'react-i18next';
import { ProfileType } from '../../types';

type MemberListHeaderViewProps = WithNamespaces & {
  counts: number;
  type: ProfileType;
  isShowHeaderShadow: boolean;
};
type MemberListHeaderProps = {
  id: number;
  type: ProfileType;
};
export { MemberListHeaderViewProps, MemberListHeaderProps };
