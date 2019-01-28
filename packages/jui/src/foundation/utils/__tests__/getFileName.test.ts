/*
 * @Author: isaac.liu
 * @Date: 2019-01-28 18:39:15
 * Copyright © RingCentral. All rights reserved.
 */
import { getFileIcon } from '../getFileName';

jest.mock('i18next', () => ({
  t: (text: string) => text,
}));

const DAY = 24 * 3600 * 1000;
const DATE_2019_1_4 = 1546564919703;
const DATE_2019_1_3 = 1546564919703 - DAY;
const DATE_2019_1_5 = 1546564919703 + DAY;
const DATE_2019_1_5_12 = 1546617600000;

describe('Conversation sheet helpers', () => {
  it('getFileIcon()', () => {
    const type = getFileIcon('xlsx');
    expect(type).toBe('excel');
    const type1 = getFileIcon('xxx');
    expect(type1).toBe('default_file');
  });
});
