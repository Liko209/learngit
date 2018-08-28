import React from 'react';
import { translate } from 'react-i18next';
import { TranslationFunction } from 'i18next';
import {
  ConversationListSection,
  Icon,
} from 'ui-components';
import { toTitleCase } from '@/utils';

const BookmarkSection = translate('Conversations')(
  ({ t }: { t: TranslationFunction }) => (
    <ConversationListSection
      title={toTitleCase(t('bookmark_plural'))}
      icon={<Icon>bookmark</Icon>}
    />
  ),
);

export { BookmarkSection };
export default BookmarkSection;
