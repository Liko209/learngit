/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-10-30 18:39:43
 * Copyright © RingCentral. All rights reserved.
 */

import { TimeNodeDividerViewModel } from '../TimeNodeDivider.ViewModel';

jest.mock('i18next', () => ({
  t: (text: string) => text,
}));

const timeNodeDividerViewModel = new TimeNodeDividerViewModel();

describe('TimeNodeDividerViewModel', () => {
  it('get computed text for timestamp', () => {
    const FORMAT = 'today';
    timeNodeDividerViewModel.props.value = Date.now();
    expect(timeNodeDividerViewModel.text).toBe(FORMAT);
  });

  it('get computed text for new messages', () => {
    const FORMAT = 'new messages';
    timeNodeDividerViewModel.props.value = FORMAT;
    expect(timeNodeDividerViewModel.text).toBe(FORMAT);
  });
});
