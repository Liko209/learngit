/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2019-07-31 10:14:47
 * Copyright © RingCentral. All rights reserved.
 */
import { getShortName } from '../helper';

describe('getShortName()', () => {
  it('when firstName and lastName exist', () => {
    const firstName = 'Shining';
    const lastName = 'Miao';
    const shortName = getShortName(firstName, lastName);
    expect(shortName).toBe('SM');
  });

  it('when only firstName exist', () => {
    const firstName = 'Shining';
    const lastName = '';
    const shortName = getShortName(firstName, lastName);
    expect(shortName).toBe('S');
  });

  it('when only lastName exist', () => {
    const firstName = '';
    const lastName = 'Miao';
    const shortName = getShortName(firstName, lastName);
    expect(shortName).toBe('M');
  });

  it('when only email exist', () => {
    const firstName = '';
    const lastName = '';
    const email = 'shining.miao@ringcentral.com';
    const shortName = getShortName(firstName, lastName, email);
    expect(shortName).toBe('S');
  });

  it('should return empty', () => {
    const firstName = '';
    const lastName = '';
    const email = '';
    const shortName = getShortName(firstName, lastName, email);
    expect(shortName).toBe('');
  });
});
