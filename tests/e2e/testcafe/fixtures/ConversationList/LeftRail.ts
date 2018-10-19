// author = 'mia.cai@ringcentral.com'

import { formalName } from '../../libs/filter';
import { setUp, tearDown } from '../../libs/helpers';
import { directLogin } from '../../utils';
import { LeftRail } from '../../page-models/components/ConversationList/LeftRail';

declare var test: TestFn;
fixture('ConversationList/LeftRail')
  .beforeEach(setUp('GlipBetaUser(1210,4488)'))
  .afterEach(tearDown());

test(
  formalName('Sections Order', ['P0', 'JPT-2', 'LeftRail']),
  async (t: TestController) => {
    await directLogin(t)
      .shouldNavigateTo(LeftRail)
      .log('check leftRail section order')
      .checkSectionsOrder('Favorites', 'Direct Messages', 'Teams'); // 'Unread', 'Mentions', 'Bookmarks',
  },
);
