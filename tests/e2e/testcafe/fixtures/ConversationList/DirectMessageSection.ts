/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-09-12 09:43:58
 * Copyright © RingCentral. All rights reserved.
 */
import { formalName } from '../../libs/filter';
import { setUp, tearDown, TestHelper } from '../../libs/helpers';
import { directLogin } from '../../utils';
import { setupSDK } from '../../utils/setupSDK';
import { ProfileAPI, PersonAPI } from '../../libs/sdk';
import { DirectMessageSection } from '../../page-models/components';

declare var test: TestFn;
fixture('DirectMessageSection')
  .beforeEach(setUp('GlipBetaUser(1210,4488)'))
  .afterEach(tearDown());

async function prepareConversations(t, h) {
  await h.log('1. should create conversations');
  const client701 = await h.glipApiManager.getClient(
    h.users.user701,
    h.companyNumber,
  );
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
    members: [
      h.users.user701.rc_id,
      h.users.user702.rc_id,
      h.users.user703.rc_id,
    ],
  });
  h.log(`Group chat ${group.data.id} is created.`);
  return {
    privateChat,
    group,
  };
}
test.skip(
  formalName(
    'Show the 1:1 conversation and group conversation in the Direct Message section',
    ['JPT-5', 'P2', 'ConversationList'],
  ),
  async (t: TestController) => {
    await setupSDK(t);
    const h = new TestHelper(t);
    const { privateChat, group } = await prepareConversations(t, h);
    const id1 = privateChat.data.id;
    const id2 = group.data.id;
    const profileId = (await PersonAPI.requestPersonById(
      h.users.user701.glip_id,
    )).data.profile_id;
    await (ProfileAPI as any).putDataById(profileId, {
      [`hide_group_${id1}`]: false,
      [`hide_group_${id2}`]: false,
    });
    h.log('Show the groups again in case it was set hidden before');
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
test.skip(
  formalName(
    'New item should appear in the DM list if another user send a message to the current user for the first time',
    ['JPT-5', 'P2', 'ConversationList'],
  ),
  async (t: TestController) => {
    await setupSDK(t);
    const h = new TestHelper(t);
    const { privateChat, group } = await prepareConversations(t, h);
    const id1 = privateChat.data.id;
    const id2 = group.data.id;
    const profileId = (await PersonAPI.requestPersonById(
      h.users.user701.glip_id,
    )).data.profile_id;
    await (ProfileAPI as any).putDataById(profileId, {
      [`hide_group_${id1}`]: true,
      [`hide_group_${id2}`]: true,
    });
    h.log('Hide the groups');
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
      .log('6. should expand the collapse')
      .shouldExpand()
      .log('7. should display 1:1 conversation')
      .shouldShowConversation(id1)
      .log('8. should display group conversation')
      .shouldShowConversation(id2);
  },
);
