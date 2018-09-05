// author = 'mia.cai@ringcentral.com'

import { formalName } from '../../libs/filter';
import { setUp, tearDown } from '../../libs/helpers';
import { unifiedLogin } from '../../utils';
import { MaxConversation } from '../../page-models/components/ConversationList/MaxConversation';

fixture('ConversationList/maxConversation')
  .beforeEach(setUp('rcBetaUserAccount'))
  .afterEach(tearDown());

test(formalName('maxConversation', ['JPT-57', 'P2', 'ConversationList']), async (t) => {

  await unifiedLogin(t)
    .log('1. Navigate to Messages')
    .shouldNavigateTo(MaxConversation)
    .log('2. Check Teams section displays 20 recent conversations')
    .checkMaxConversation('Teams', 'Team', 20);
});
