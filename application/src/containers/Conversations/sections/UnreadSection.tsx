import React from 'react';
import {
  ConversationListSection,
  Icon,
} from 'ui-components';

const UnreadSection = () => (
  <ConversationListSection
    title="Unread"
    icon={<Icon>fiber_new</Icon>}
  />
);

export { UnreadSection };
export default UnreadSection;
