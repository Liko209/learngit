/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-06-26 13:18:18
 * Copyright © RingCentral. All rights reserved.
 */
import { BUTTON_TYPE } from 'jui/pattern/Phone/VoicemailItem';
import { NavType, ContactType } from '../types';

type MessageProps = {
  id: number;
  entity: NavType;
  contactType: ContactType;
};

type MessageViewProps = MessageProps & {
  type: BUTTON_TYPE;
  goToConversation: () => void;
};

export { MessageProps, MessageViewProps };
