import React from 'react';
import {
  ConversationListSection,
  Icon,
} from 'ui-components';

const BookmarkSection = () => (
  <ConversationListSection
    title="Bookmarks"
    icon={<Icon>bookmark</Icon>}
  />
);

export { BookmarkSection };
export default BookmarkSection;
