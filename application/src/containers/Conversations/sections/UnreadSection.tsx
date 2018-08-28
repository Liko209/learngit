import React from 'react';
import { translate } from 'react-i18next';
import { TranslationFunction } from 'i18next';
import {
  ConversationListSection,
  Icon,
} from 'ui-components';
import { toTitleCase } from '@/utils';

const UnreadSection = translate('Conversations')(
  ({ t }: { t: TranslationFunction }) => (
    <ConversationListSection
      title={toTitleCase(t('unread'))}
      icon={<Icon>fiber_new</Icon>}
    />
  ),
);

export { UnreadSection };
export default UnreadSection;
