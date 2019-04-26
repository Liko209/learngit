/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-10-29 10:29:02
 * Copyright © RingCentral. All rights reserved.
 */
import { glipdown2Html } from '../utils/glipdown2Html';

describe('glipdown2Html', () => {
  it('should encode tags', () => {
    expect(glipdown2Html('&lt; href=&#x27;javascript:void(0)&#x27;&gt;')).toBe("< href='javascript:void(0)'>");
  });
  it('should encode &nbsp;', () => {
    expect(glipdown2Html('&nbsp;&nbsp;')).toBe('  ');
  });
  it('should encode &amp;', () => {
    expect(glipdown2Html('&amp;&amp;')).toBe('&&');
  });
});
