/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-11-13 15:51:06
 * Copyright © RingCentral. All rights reserved.
 */

import { renderPerson } from '../../utils';

describe('render person utils', () => {
  it('renderPerson method', () => {
    const personId = 1;
    const personName = 'Name';
    const regExp = new RegExp(
      `.+?class="user".+?${personId}.+?${personName}`,
      'g',
    );
    expect(renderPerson(personId, personName)).toMatch(regExp);
  });
});
