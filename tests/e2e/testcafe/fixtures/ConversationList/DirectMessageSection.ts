/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-09-12 09:43:58
 * Copyright © RingCentral. All rights reserved.
 */
import { formalName } from '../../libs/filter';
import { setUp, tearDown, TestHelper } from '../../libs/helpers';
import { directLogin } from '../../utils';
import { setupSDK } from '../../utils/setupSDK';
import { DirectMessageSection } from '../../page-models/components';

declare var test: TestFn;
fixture('DirectMessageSection')
  .beforeEach(setUp('GlipBetaUser(1210,4488)'))
  .afterEach(tearDown());

test(formalName('Show the 1:1 conversation and group conversation in the Direct Message section', ['JPT-5', 'P2', 'ConversationList']), async (t) => {
  await setupSDK(t);
  let id1: number;
  let id2: number;

  const page = directLogin(t);
  await page.chain(t => t.wait(10000))
    .log('1. should create conversations')
    .chain(async (t, h) => {
      await t.wait(4000);
      const client701 = await h.glipApiManager.getClient(h.users.user701, h.companyNumber);
      const privateChat = await client701.createGroup({
        type: 'PrivateChat',
        isPublic: true,
        description: 'test',
        members: [h.users.user701.rc_id, h.users.user702.rc_id],
      });
      h.log(`Private chat ${privateChat.data.id} is created.`);
      const group = await client701.createGroup({
        type: 'Group',
        isPublic: true,
        description: 'test',
        members: [h.users.user701.rc_id, h.users.user702.rc_id, h.users.user703.rc_id],
      });
      h.log(`Group chat ${group.data.id} is created.`);
      id1 = privateChat.data.id;
      id2 = group.data.id;
    });
  await page.log('2. should navigate to Direct Messages Section')
    .shouldNavigateTo(DirectMessageSection)
    .log('3. should expand the collapse')
    .shouldExpand()
    .log('4. should display 1:1 conversation')
    .shouldShowConversation(id1)
    .log('5. should display group conversation')
    .shouldShowConversation(id2);
});

// blocked. need new feature implemented to finish the test
// test.skip(formalName('New item should appear in the DM list if another user send a message to the current user for the first time', ['JPT-5', 'P2', 'ConversationList']), async (t) => {
// });
