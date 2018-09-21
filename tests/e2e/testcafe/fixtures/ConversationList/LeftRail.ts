// author = 'mia.cai@ringcentral.com'

import { formalName } from '../../libs/filter';
import { LeftRail } from '../../page-models/components/ConversationList/LeftRail';
// import { setUp, tearDown } from '../../libs/helpers';
// import { directLogin } from '../../utils';

import { setUp, tearDown } from '../../libs/mock/mockHelpers';
import { directLogin } from '../../libs/mock/mockLogin';

declare var test: TestFn;
fixture('ConversationList/LeftRail')
  .beforeEach(setUp('GlipBetaUser(1210,4488)'))
  .afterEach(tearDown());

test(formalName('Sections Order', ['P0', 'JPT2', 'LeftRail']), async t => {
  await directLogin(t)
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
