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
  const helper = TestHelper.from(t);
  helper.setupGlipApiManager();
  const client701 = await helper.glipApiManager.getClient(helper.users.user701, helper.companyNumber);
  const privateChat = await client701.createGroup({
    type: 'PrivateChat',
    isPublic: true,
    description: 'test',
    members: [helper.users.user701.rc_id, helper.users.user702.rc_id],
  });
  const group = await client701.createGroup({
    type: 'Group',
    isPublic: true,
    description: 'test',
    members: [helper.users.user701.rc_id, helper.users.user702.rc_id, helper.users.user703.rc_id],
  });
  await directLogin(t)
    .chain(t => t.wait(10000))
    .log('1. should navigate to Direct Messages Section')
    .shouldNavigateTo(DirectMessageSection)
    .log('2. should expand the collapse')
    .shouldExpand()
    .log('3. should display 1:1 conversation')
    .shouldShowConversation(privateChat.data.id)
    .log('3. should display group conversation')
    .shouldShowConversation(group.data.id);
});

// blocked. need new feature implemented to finish the test
// test.skip(formalName('New item should appear in the DM list if another user send a message to the current user for the first time', ['JPT-5', 'P2', 'ConversationList']), async (t) => {
// });
