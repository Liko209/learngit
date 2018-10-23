import { formalName } from '../../libs/filter';
import { setUp, tearDown, TestHelper } from '../../libs/helpers';
import { directLogin } from '../../utils';
import { HighlighConversation } from '../../page-models/components/ConversationList/Highligh conversation';
import { ProfileAPI, StateAPI, PersonAPI } from '../../libs/sdk';
import { setupSDK } from '../../utils/setupSDK';

declare var test: TestFn;
fixture('ConversationStream/ConversationStream')
  .beforeEach(setUp('GlipBetaUser(1210,4488)'))
  .afterEach(tearDown());

test(
  formalName('Open last conversation when login', [
    'JPT-144',
    'P2',
    'ConversationList',
  ]),
  async (t: TestController) => {
    await setupSDK(t);
    const h = new TestHelper(t);
    const client701 = await h.glipApiManager.getClient(
      h.users.user701,
      h.companyNumber,
    );
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
    const groupId = group.data.id;
    const person = (await PersonAPI.requestPersonById(h.users.user701.glip_id))
      .data;
    const profileId = person.profile_id;
    await (ProfileAPI as any).putDataById(profileId, {
      [`hide_group_${groupId}`]: false,
    });
    const stateId = person.state_id;
    await (StateAPI as any).putDataById(stateId, {
      last_group_id: group._id,
    });

    await directLogin(t)
      .log('1.Navigate to HighlighConversation')
      .shouldNavigateTo(HighlighConversation)
      .expectElementExists()
      .log('2.Get last conversation')
      .getLastConversation()
      .log('3.Send a new post to move the item to top')
      .sendPostToConversation('highlight this group')
      .log('4.Check the conversation was highlighted in list')
      .checkHighlighConversation()
      .log('5.Check the conversation was opened in content')
      .checkOpenedConversation();
  },
);
