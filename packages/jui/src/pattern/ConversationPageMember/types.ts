import React, { ReactElement } from 'react';
import { IconButtonSize } from '../../components/Buttons';

type JuiConversationPageMemberProps = {
  onClick(event: React.MouseEvent): void;
  ariaLabel: string;
  title: string;
  children: ReactElement;
  size?: IconButtonSize;
};

export { JuiConversationPageMemberProps };
