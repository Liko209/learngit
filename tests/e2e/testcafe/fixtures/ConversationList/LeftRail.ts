// author = 'mia.cai@ringcentral.com'

import { formalName } from '../../libs/filter';
import { LeftRail } from '../../page-models/components/ConversationList/LeftRail';
import { go2Home, mockRequest } from '../../utils';

declare var test: TestFn;
fixture('ConversationList/LeftRail');
// .beforeEach(setUp('GlipBetaUser(1210,4488)'))
// .afterEach(tearDown());

test(formalName('Sections Order', ['P0', 'JPT2', 'LeftRail']), async t => {
  await mockRequest(t);
  await go2Home(t)
    .shouldNavigateTo(LeftRail)
    .checkSectionsOrder(
      'Unread',
      'Mentions',
      'Bookmarks',
      'Favorites',
      'Direct Messages',
      'Teams',
    );
});
