/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-11-13 15:51:06
 * Copyright © RingCentral. All rights reserved.
 */

import { renderPerson } from '../renderPerson';

describe('render person utils', () => {
  it('renderPerson method', () => {
    const personId = 1;
    const personName = 'Name';
    const regExp = new RegExp(
      `.+?class="at_mention_compose".+?id="${personId}".+?${personName}`,
      'g',
    );
    expect(renderPerson(personId, personName)).toMatch(regExp);
  });
});
