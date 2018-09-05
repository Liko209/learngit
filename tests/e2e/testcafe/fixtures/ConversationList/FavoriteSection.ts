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
import { unifiedLogin } from '../../utils';
import { FavoriteSection } from '../../page-models/components';

declare var test: TestFn;
fixture('ConversationList/FavoriteSection')
  .beforeEach(setUp('rcBetaUserAccount'))
  .afterEach(tearDown());

test(formalName('Expand & Collapse', ['P2', 'ConversationList']), async (t) => {
  await unifiedLogin(t)
    .shouldNavigateTo(FavoriteSection)
    .checkExpanded()
    .clickHeader()
    .checkCollapsed()
    .clickHeader()
    .checkExpanded();
});

test(formalName('Drag & Drop', ['P2', 'ConversationList']), async (t) => {
  // XIA-UP
  const authInfo = {
    credential: 'system@tarcnonbetauser1487802163099530.com',
    password: 'Test!123',
  };

  const LAST = -1;
  const FIRST = 0;

  await unifiedLogin(t, authInfo)
    .shouldNavigateTo(FavoriteSection)
    .dragListItem(LAST, FIRST);
});
