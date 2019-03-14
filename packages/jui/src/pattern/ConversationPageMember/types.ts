import { ReactElement } from 'react';

type JuiConversationPageMemberProps = {
  onClick(): void;
  ariaLabel: string;
  title: string;
  children: ReactElement;
};

export { JuiConversationPageMemberProps };
