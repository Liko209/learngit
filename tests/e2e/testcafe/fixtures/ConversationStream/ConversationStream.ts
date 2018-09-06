import { formalName } from '../../libs/filter';
import { setUp, tearDown, TestHelper } from '../../libs/helpers';
import { unifiedLogin } from '../../utils';
import { FavoriteSection, TeamSection } from '../../page-models/components';
import { ConversationStream } from '../../page-models/components/ConversationStream/ConversationStream';
import { setupSDK } from '../../utils/setupSDK';

declare var test: TestFn;
fixture('ConversationStream/ConversationStream')
  .beforeEach(setUp('rcBetaUserAccount'))
  .afterEach(tearDown());

test(
  formalName('The posts in the conversation should be displayed in the order of recency (date/time)', ['P1', 'ConversationStream']), async (t) => {
    await setupSDK(t);
    await unifiedLogin(t)
    .log('1. Navigate to ConversationStream')
    .shouldNavigateTo(ConversationStream)
    .log('2. Click First Group')
    .clickFirstGroup()
    .log('3. Send post 1 to first group')
    .sendPost2FirstGroup(1)
    .log('4. Send post 1 to first group')
    .sendPost2FirstGroup(2)
    .log('5. Send post 2 to first group')
    .sendPost2FirstGroup(3)
    .log('6. Send post 3 to first group')
    .expectRightOrder(1, 2, 3);
  });

test(
  formalName('No post in conversation when the conversation', ['P2', 'ConversationStream']), async (t) => {
    await setupSDK(t);
    await unifiedLogin(t)
    .log('1. Navigate to team section')
    .shouldNavigateTo(TeamSection)
    .log('2. Create a new team')
    .createTeam()
    .log('3. Navigate to Conversation Stream')
    .shouldNavigateTo(ConversationStream)
    .log('Click first group')
    .clickFirstGroup()
    .expectNoPosts();
  });

test(
  formalName('Should be able to read the newest posts once open a conversation', ['P0', 'ConversationStream']),
  async (t) => {
    await setupSDK(t);
    await unifiedLogin(t)
    .shouldNavigateTo(ConversationStream)
    .log('1. Send post to first group lastPost')
    .sendPost2FirstGroup('lastPost')
    .log('2. Reload')
    .reload()
    .log('3. Navigate to Conversation Stream')
    .shouldNavigateTo(ConversationStream)
    .log('4. Click first group')
    .clickFirstGroup()
    .expectLastConversationToBe('lastPost')
    .log('5. Send post to first group newPost')
    .sendPost2FirstGroup('newPost')
    .expectLastConversationToBe('newPost');
  },
);
