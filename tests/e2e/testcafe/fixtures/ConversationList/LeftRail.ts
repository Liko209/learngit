// author = 'mia.cai@ringcentral.com'

import { formalName } from '../../libs/filter';
import { setUp, tearDown } from '../../libs/helpers';
import { unifiedLogin } from '../../utils';
import { LeftRail } from '../../page-models/components/ConversationList/LeftRail';

declare var test: TestFn;
fixture('ConversationList/DefaultView')
  .beforeEach(setUp('rcBetaUserAccount'))
  .afterEach(tearDown());

test(formalName('Sections Order', ['P0', 'JPT2', 'Default view']), async (t) => {
  await unifiedLogin(t)
    .shouldNavigateTo(LeftRail)
    .checkSectionsOrder('Unread', 'Mentions', 'Bookmarks', 'Favorites', 'Direct Messages', 'Teams');
});
