// author = 'mia.cai@ringcentral.com'

import { formalName } from '../../libs/filter';
import { setUp, tearDown } from '../../libs/helpers';
import { directLogin } from '../../utils';
import { MaxConversation } from '../../page-models/components/ConversationList/MaxConversation';

fixture('ConversationList/maxConversation')
  .beforeEach(setUp('GlipBetaUser(1210,4488)'))
  .afterEach(tearDown());

test(formalName('maxConversation', ['JPT-57', 'P2', 'ConversationList']), async (t) => {
  const MAX_NUMBER = 20;
  const SECTION = 'Teams';
  const TYPE = 'Team';
  const teamNames = [];
  let page;

  const cc = await (page = directLogin(t)
    .log('1. Navigate to Messages')
    .shouldNavigateTo(MaxConversation)
    .waitForSections()
    .getConversationCount(SECTION));
  console.log("init conversation teams count:",cc)
  await page
    .log(`2.1 Create ${MAX_NUMBER} conversations`)
    .chain(async (t, h) => {
      await t.wait(2000);
      const client701 = await h.glipApiManager.getClient(h.users.user701, h.companyNumber);
      for (let i = 0; i < MAX_NUMBER; i += 1) {
        const resp = await client701.createGroup({
          name: `${i}_${Date.now()}_JPT57teams`,
          description: `test${i}`,
          type: TYPE,
          members: [h.users.user701.rc_id],
        });
        teamNames.unshift(resp.data.name);
      }
      await h.log(JSON.stringify(teamNames));
    })
    .log('2.2 Display recent conversations')
    .checkConversationListItems(SECTION, teamNames)
    .log(`2.3 Conversation max count is ${MAX_NUMBER}`)
    .checkConversationCount(SECTION, MAX_NUMBER+(+cc));
});
