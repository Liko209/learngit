import { formalName } from '../../libs/filter';
import { setUp, tearDown } from '../../libs/helpers';
import { unifiedLogin } from '../../utils';
import { FavoriteSection } from '../../page-models/components';

declare var test: TestFn;
fixture('ConversationStream/ConversationStream')
  .beforeEach(setUp('rcBetaUserAccount'))
  .afterEach(tearDown());

// XIA-UP
const authInfo = {
  credential: 'system@tarcnonbetauser1487802163099530.com',
  password: 'Test!123',
};

test(
  formalName('The posts in the conversation should be displayed in the order of recency (date/time)', ['P1', 'ConversationStream']), async (t) => {
    await unifiedLogin(t, authInfo)
    .shouldNavigateTo(FavoriteSection)
    .expectExpanded()
    .clickHeader()
    .expectCollapsed()
    .clickHeader()
    .expectExpanded();
  });

test(
  formalName('No post in conversation when the conversation', ['P2', 'ConversationStream']), async (t) => {
    await unifiedLogin(t, authInfo)
    .shouldNavigateTo(FavoriteSection)
    .dragListItem(-1, 0);
  });

test(
  formalName('Show be able to read the newest posts once open a conversation', ['P0', 'ConversationStream']),
  async (t) => {
    await unifiedLogin(t, authInfo)
    .shouldNavigateTo(FavoriteSection)
    .dragListItem(-1, 0);
  },
);
