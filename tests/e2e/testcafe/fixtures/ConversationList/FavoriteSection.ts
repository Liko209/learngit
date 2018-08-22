/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-08-21 16:30:30
 * Copyright © RingCentral. All rights reserved.
 */
import { formalName } from '../../libs/filter';
import { setUp, tearDown } from '../../libs/helpers';
import { login } from '../../utils';

fixture('ConversationList/FavoriteSection')
  .beforeEach(setUp('rcBetaUserAccount'))
  .afterEach(tearDown());

/**
 * Can expand/collapse the favorite section by clicking the section name.
 */
test(formalName('Expand/Collapse', ['P2', 'ConversationList']), async (t: TestController) => {
  const mainPage = login(t);
  const {
    favoriteSectionCollapse: collapse,
    favoriteSectionHeader: sectionHeader,
  } = mainPage;

  await mainPage.clickElement(sectionHeader);
  await t.expect(collapse.clientHeight).gt(0);

  await mainPage.clickElement(sectionHeader);
  await t.expect(collapse.clientHeight).eql(0);
});
