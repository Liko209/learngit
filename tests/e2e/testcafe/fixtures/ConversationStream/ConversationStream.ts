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
    .log('1.Navigate to')
    .shouldNavigateTo(ConversationStream)
    .log('')
    .clickFirstGroup()
    .sendPost2FirstGroup(1)
    .sendPost2FirstGroup(2)
    .sendPost2FirstGroup(3)
    .expectRightOrder(1, 2, 3);
  });

test(
  formalName('No post in conversation when the conversation', ['P2', 'ConversationStream']), async (t) => {
    await setupSDK(t);
    await unifiedLogin(t)
    .shouldNavigateTo(TeamSection)
    .createTeam()
    .shouldNavigateTo(ConversationStream)
    .expectNoPosts();
  });

test(
  formalName('Show be able to read the newest posts once open a conversation', ['P0', 'ConversationStream']),
  async (t) => {
    await setupSDK(t);
    await unifiedLogin(t)
    .shouldNavigateTo(ConversationStream)
    .sendPost2FirstGroup('lastPost')
    .reload()
    .shouldNavigateTo(ConversationStream)
    .clickFirstGroup()
    .expectLastConversationToBe('lastPost')
    .sendPost2FirstGroup('newPost')
    .expectLastConversationToBe('newPost');
  },
);
