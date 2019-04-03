import { WithTranslation } from 'react-i18next';
import { RouteComponentProps } from 'react-router';

type ConversationPageViewProps = WithTranslation & {
  canPost: boolean;
  groupId: number;
} & RouteComponentProps;

type ConversationPageProps = {
  groupId: number;
};

export { ConversationPageProps, ConversationPageViewProps };
