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
import { prepareConversations } from '../utils';

declare var test: TestFn;
fixture('DirectMessageSection')
  .beforeEach(setUp('GlipBetaUser(1210,4488)'))
  .afterEach(tearDown());

test(
  formalName(
    'Show the 1:1 conversation and group conversation in the Direct Message section',
    ['JPT-5', 'P2', 'ConversationList'],
  ),
  async (t: TestController) => {
    await setupSDK(t);
    const h = new TestHelper(t);
    const { privateChat, group } = await prepareConversations(t, [
      { type: 'privateChat', identifier: 'privateChat' },
      { type: 'group', identifier: 'group' },
    ]);
    const id1 = privateChat.id;
    const id2 = group.id;
    await directLogin(t)
      .log('2. should navigate to Direct Messages Section')
      .shouldNavigateTo(DirectMessageSection)
      .expectExist()
      .log('3. should expand the collapse')
      .shouldExpand()
      .log('4. should display 1:1 conversation')
      .shouldShowConversation(id1)
      .log('5. should display group conversation')
      .shouldShowConversation(id2);
  },
);

// skip temporarily due to bug
test(
  formalName(
    'New item should appear in the DM list if another user send a message to the current user for the first time',
    ['JPT-5', 'P2', 'ConversationList'],
  ),
  async (t: TestController) => {
    await setupSDK(t);
    const h = new TestHelper(t);
    const { privateChat, group } = await prepareConversations(t, [
      { type: 'privateChat', identifier: 'privateChat', isHidden: true },
      { type: 'group', identifier: 'group', isHidden: true },
    ]);
    const id1 = privateChat.id;
    const id2 = group.id;
    await directLogin(t)
      .log('2. should navigate to Direct Messages Section')
      .shouldNavigateTo(DirectMessageSection)
      .expectExist()
      .log('3. should not display 1:1 conversation')
      .shouldNotShowConversation(id1)
      .log('4. should not display group conversation')
      .shouldNotShowConversation(id2)
      .log('5. send a post to both conversations')
      .chain(async (t, h) => {
        const client701 = await h.glipApiManager.getClient(
          h.users.user701,
          h.companyNumber,
        );
        await client701.sendPost(id1, {
          text: 'test for direct messages section',
        });
        await client701.sendPost(id2, {
          text: 'test for direct messages section',
        });
      })
      .chain(t => t.wait(3000))
      .log('6. should expand the collapse')
      .shouldExpand()
      .log('7. should display 1:1 conversation')
      .shouldShowConversation(id1)
      .log('8. should display group conversation')
      .shouldShowConversation(id2);
  },
);
