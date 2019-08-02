/*
 * @Author: isaac.liu
 * @Date: 2019-07-15 08:45:37
 * Copyright © RingCentral. All rights reserved.
 */
import { EnzymeWrapper } from '../wrapper/EnzymeWrapper';
import { TextMessage } from '@/modules/message/container/ConversationSheet/TextMessage';

class ConversationPage extends EnzymeWrapper {
  textMessageView(): EnzymeWrapper {
    return this.find(TextMessage)[0];
  }
}

export { ConversationPage };
