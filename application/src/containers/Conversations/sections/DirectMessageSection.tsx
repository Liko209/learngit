import React from 'react';
import {
  ConversationListSection,
  Icon,
} from 'ui-components';

const DirectMessageSection = () => (
  <ConversationListSection
    title="Direct Messages"
    icon={<Icon>textsms</Icon>}
  />
);

export { DirectMessageSection };
export default DirectMessageSection;
