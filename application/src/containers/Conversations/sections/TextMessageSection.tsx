import React from 'react';
import {
  ConversationListSection,
  Icon,
} from 'ui-components';

const TextMessageSection = () => (
  <ConversationListSection
    title="Mentions"
    icon={<Icon>alternate_email</Icon>}
  />
);

export { TextMessageSection };
export default TextMessageSection;
