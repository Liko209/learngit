import React from 'react';
import {
  ConversationListSection,
  Icon,
} from 'ui-components';

const MentionSection = () => (
  <ConversationListSection
    title="Mentions"
    icon={<Icon>alternate_email</Icon>}
  />
);

export { MentionSection };
export default MentionSection;
