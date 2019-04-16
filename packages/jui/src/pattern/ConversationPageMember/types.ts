<<<<<<< HEAD
import { ReactElement } from 'react';
import { IconButtonSize } from '../../components/Buttons';
=======
import React, { ReactElement } from 'react';
>>>>>>> hotfix/1.2.2

type JuiConversationPageMemberProps = {
  onClick(event: React.MouseEvent<HTMLAnchorElement, MouseEvent>): void;
  ariaLabel: string;
  title: string;
  children: ReactElement;
  size?: IconButtonSize;
};

export { JuiConversationPageMemberProps };
