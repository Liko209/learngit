import { WithNamespaces } from 'react-i18next';
import { RouteComponentProps } from 'react-router';

type ConversationPageViewProps = WithNamespaces & {
  canPost: boolean;
  groupId: number;
} & RouteComponentProps;

type ConversationPageProps = {
  groupId: number;
};

export { ConversationPageProps, ConversationPageViewProps };
