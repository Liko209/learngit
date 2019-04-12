import { createContext } from 'react';
import { WithTranslation } from 'react-i18next';
import { RouteComponentProps } from 'react-router';

type ConversationPageViewProps = WithTranslation & {
  canPost: boolean;
  groupId: number;
} & RouteComponentProps;

type ConversationPageProps = {
  groupId: number;
};

type ConversationPageContextInfo = {
  disableMoreAction: boolean;
};

const ConversationPageContext = createContext({
  disableMoreAction: false,
} as ConversationPageContextInfo);

export {
  ConversationPageProps,
  ConversationPageViewProps,
  ConversationPageContext,
};
