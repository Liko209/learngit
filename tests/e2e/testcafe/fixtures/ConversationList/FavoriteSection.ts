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

// XIA-UP
const authInfo = {
  credential: 'system@tarcnonbetauser1487802163099530.com',
  password: 'Test!123',
};

/**
 * AC 1
 *
 * Can expand/collapse the favorite section by clicking the section name.
 *
 * Given: At least one conversation in the favorite section.
 * When:  Clicking the section name.
 * Then:  The favorite section can be expanded or collapsed.
 */
test(formalName('Expand & Collapse', ['P2', 'ConversationList']), async (t) => {
  await unifiedLogin(t, authInfo)
    .shouldNavigateTo(FavoriteSection)
    .expectExpanded()
    .clickHeader()
    .expectCollapsed()
    .clickHeader()
    .expectExpanded();
});

/**
 * AC 3
 *
 * User can reorder the list in favorite section by drag and drop.
 *
 * Given: Have some conversations in favorite section.
 * When:  Drag and drop conversation.
 * Then:  The list of 'Favorite' section was reordered.
 */
test(formalName('Drag & Drop', ['P2', 'ConversationList']), async (t) => {
  await unifiedLogin(t, authInfo)
    .shouldNavigateTo(FavoriteSection)
    .dragListItem(-1, 0);
});
