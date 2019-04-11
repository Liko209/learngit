import React, { ReactElement } from 'react';

type JuiConversationPageMemberProps = {
  onClick(event: React.MouseEvent<HTMLAnchorElement, MouseEvent>): void;
  ariaLabel: string;
  title: string;
  children: ReactElement;
};

export { JuiConversationPageMemberProps };
