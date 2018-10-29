import { WithNamespaces } from 'react-i18next';

type ConversationPageViewProps = WithNamespaces & {
  canPost: boolean;
  groupId: number;
};

type ConversationPageProps = {
  groupId: number;
};

export { ConversationPageProps, ConversationPageViewProps };
