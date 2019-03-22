/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-03-08 10:28:46
 * Copyright © RingCentral. All rights reserved.
 */
import { getChildren } from '../getChildren';

describe('getChildren()', () => {
  it('should get convert children into array', () => {
    const div = document.createElement('ul');
    div.innerHTML = [0, 1, 2, 3, 4].reduce(
      (html, i) => `${html}<li>Item-${i}</li>`,
      '',
    );

    const children = getChildren(div);

    expect(children).toBeInstanceOf(Array);
    expect(children).toHaveLength(5);
  });
});
