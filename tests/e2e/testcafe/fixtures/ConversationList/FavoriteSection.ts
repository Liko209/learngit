/*
 * FavoriteSection E2E
 * See: https://bit.ly/2wgXuLW
 *
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-08-21 16:30:30
 * Copyright © RingCentral. All rights reserved.
*/
import { formalName } from '../../libs/filter';
import { setUp, tearDown } from '../../libs/helpers';
import { directLogin } from '../../utils';
import { FavoriteSection } from '../../page-models/components';

declare var test: TestFn;
fixture('ConversationList/FavoriteSection')
  .beforeEach(setUp('GlipBetaUser(1210,4488)'))
  .afterEach(tearDown());

test(formalName('Expand & Collapse', ['JPT-6', 'P2', 'ConversationList']), async (t) => {
  await directLogin(t)
    .log('1. Navigate to Favorites section')
    .shouldNavigateTo(FavoriteSection)
    .log('2. Check the section is expended')
    .checkExpanded()
    .log('3. Click the favorite section name')
    .clickHeader()
    .log('4. Check the section is collapsed')
    .checkCollapsed()
    .log('5. Click the favorite section name')
    .clickHeader()
    .log('6. Check the section is expended')
    .checkExpanded();
});

test(formalName('Drag & Drop', ['JPT-10', 'P2', 'ConversationList']), async (t) => {
  // XIA-UP
  const authInfo = {
    credential: 'system@tarcnonbetauser1487802163099530.com',
    password: 'Test!123',
  };

  const LAST = -1;
  const FIRST = 0;

  await directLogin(t, authInfo)
    .log('1. Navigate to Favorites section')
    .shouldNavigateTo(FavoriteSection)
    .log('2. Drag & drop conversation')
    .dragListItem(LAST, FIRST);
});
