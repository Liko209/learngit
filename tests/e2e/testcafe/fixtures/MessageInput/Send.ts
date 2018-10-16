/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-10-12 13:23:57
 * Copyright © RingCentral. All rights reserved.
 */

import { formalName } from '../../libs/filter';
import { setUp, tearDown } from '../../libs/helpers';
import { directLogin, createPrivateChat } from '../../utils';
import { setupSDK } from '../../utils/setupSDK';
import { Send } from '../../page-models/components/MessageInput';

fixture('send messages')
  .beforeEach(setUp('GlipBetaUser(1210,4488)'))
  .afterEach(tearDown());

test(formalName('send', ['P0', 'JPT-77', 'Enter text in the conversation input box']), async (t) => {
  await setupSDK(t);
  let groupId: number;
  const msg = `${Date.now()}`; // Have a trap, no spaces
  const chain = directLogin(t).chain(async (t, h) => {
    groupId = await createPrivateChat(h, [h.users.user701.rc_id, h.users.user702.rc_id]);
    h.log(`1 create private chat id ${groupId}, and show in conversation list`);
  });
  await chain;
  await chain.shouldNavigateTo(Send)
    .log(`2. select this conversation id ${groupId}`)
    .selectConversation(groupId)
    .log('3. expect editor has existed')
    .expectEditorHasExisted()
    .log('4. typing message')
    .inputMessage(msg)
    .log('5. send message')
    .sendMessage()
    .log('6. expect show message')
    .expectShowMessageInConversationCard(msg);
});
