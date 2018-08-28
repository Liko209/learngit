import React from 'react';
import { translate } from 'react-i18next';
import { TranslationFunction } from 'i18next';
import {
  ConversationListSection,
  Icon,
} from 'ui-components';
import { toTitleCase } from '@/utils';

const MentionSection = translate('Conversations')(
  ({ t }: { t: TranslationFunction }) => (
    <ConversationListSection
      title={toTitleCase(t('mention_plural'))}
      icon={<Icon>alternate_email</Icon>}
    />
  ),
);

export { MentionSection };
export default MentionSection;
