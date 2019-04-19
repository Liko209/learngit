import { createContext } from 'react';
import { WithTranslation } from 'react-i18next';
import { RouteComponentProps } from 'react-router';

enum STATUS {
  PENDING,
  SUCCESS,
  FAILED,
}

type ConversationPageViewProps = WithTranslation & {
  loadingStatus: STATUS,
  updateStatus: () => void,
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

export { STATUS, ConversationPageProps, ConversationPageViewProps, ConversationPageContext };
