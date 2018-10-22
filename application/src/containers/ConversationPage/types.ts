import { TranslationFunction } from 'i18next';

type ConversationPageViewProps = {
  canPost: boolean;
  groupId: number;
  t: TranslationFunction;
};

type ConversationPageProps = {
  groupId: number;
};

export { ConversationPageProps, ConversationPageViewProps };
