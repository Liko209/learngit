import { formalName } from '../../libs/filter';
import { setUp, tearDown, TestHelper } from '../../libs/helpers';
import { directLogin } from '../../utils';
import { TeamSection } from '../../page-models/components';
import { ConversationStream } from '../../page-models/components/ConversationStream/ConversationStream';
import { setupSDK } from '../../utils/setupSDK';
import { prepareConversations } from '../utils';

declare var test: TestFn;
fixture('ConversationStream/ConversationStream')
  .beforeEach(setUp('GlipBetaUser(1210,4488)'))
  .afterEach(tearDown());

test(
  formalName(
    'The posts in the conversation should be displayed in the order of recency (date/time)',
    ['P1', 'JPT-52', 'ConversationStream'],
  ),
  async (t: TestController) => {
    await setupSDK(t);
    const { team } = await prepareConversations(t, [
      { type: 'team', identifier: 'team' },
    ]);
    await directLogin(t)
      .chain(t => t.wait(10000))
      .log('1. Navigate to ConversationStream')
      .shouldNavigateTo(ConversationStream)
      .expectExist()
      .log('2. Send post 1 to first group')
      .sendPost2Group(+team.id, '1')
      .log('3. Send post 2 to first group')
      .sendPost2Group(+team.id, '2')
      .log('4. Send post 3 to first group')
      .sendPost2Group(+team.id, '3')
      .log('5. Click First Group')
      .chain(t => t.wait(4000))
      .clickFirstGroup()
      .log('6. Expect the right order')
      .expectRightOrder(1, 2, 3);
  },
);

test(
  formalName('No post in conversation when the conversation', [
    'P2',
    'JPT-53',
    'ConversationStream',
  ]),
  async (t: TestController) => {
    await directLogin(t)
      .chain(t => t.wait(10000))
      .log('1. Navigate to team section')
      .shouldNavigateTo(TeamSection)
      .expectExist()
      .log('2. Create team')
      .createTeam()
      .log('3. Navigate to Conversation Stream')
      .shouldNavigateTo(ConversationStream)
      .log('4. Click first group')
      .chain(t => t.wait(3000))
      .clickFirstGroup()
      .chain(t => t.wait(3000))
      .expectNoPosts();
  },
);

test(
  formalName(
    'Should be able to read the newest posts once open a conversation',
    ['P0', 'JPT-65', 'ConversationStream'],
  ),
  async (t: TestController) => {
    await setupSDK(t);
    const { team } = await prepareConversations(t, [
      { type: 'team', identifier: 'team' },
    ]);
    await directLogin(t)
      .shouldNavigateTo(ConversationStream)
      .expectExist()
      .log('1. Send post to first group lastPost')
      .sendPost2Group(+team.id, 'lastPost')
      .chain(t => t.wait(3000))
      .log('2. Reload')
      .reload()
      .log('3. Navigate to Conversation Stream')
      .shouldNavigateTo(ConversationStream)
      .expectExist()
      .log('4. Click first group')
      .chain(t => t.wait(3000))
      .clickFirstGroup()
      .chain(t => t.wait(3000))
      .expectLastConversationToBe('lastPost')
      .log('5. Send post to first group newPost')
      .sendPost2Group(+team.id, 'newPost')
      .chain(t => t.wait(3000))
      .expectLastConversationToBe('newPost');
  },
);
