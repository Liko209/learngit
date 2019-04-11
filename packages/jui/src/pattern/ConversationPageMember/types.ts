import { ReactElement } from 'react';
import { IconButtonSize } from '../../components/Buttons';

type JuiConversationPageMemberProps = {
  onClick(): void;
  ariaLabel: string;
  title: string;
  children: ReactElement;
  size?: IconButtonSize;
};

export { JuiConversationPageMemberProps };
