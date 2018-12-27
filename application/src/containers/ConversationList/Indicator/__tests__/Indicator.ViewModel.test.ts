/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-10-11 10:28:56
 * Copyright © RingCentral. All rights reserved.
 */

import { IndicatorViewModel } from '../Indicator.ViewModel';

const mockGroupEntityData = {
  draft: 'draft',
  sendFailurePostIds: [1, 2],
};
// @ts-ignore
const getEntity = jest.fn().mockReturnValue(mockGroupEntityData);
const indicatorViewModel = new IndicatorViewModel();

describe('IndicatorViewModel', () => {
  it('lifecycle onReceiveProps method', () => {
    let id = 123;
    indicatorViewModel.onReceiveProps({ id });
    expect(indicatorViewModel.id).toBe(id);
    id = 123;
    indicatorViewModel.onReceiveProps({ id });
    expect(indicatorViewModel.id).toBe(id);
  });

  it.skip('get computed _group', () => {
    expect(indicatorViewModel._groupConfig).toBe(mockGroupEntityData);
  });

  it.skip('get computed draft', () => {
    expect(indicatorViewModel.hasDraft).toBe(true);
  });

  it.skip('get computed sendFailurePostIds', () => {
    expect(indicatorViewModel.sendFailurePostIds).toBe(
      mockGroupEntityData.sendFailurePostIds,
    );

    mockGroupEntityData.sendFailurePostIds = [];
    expect(indicatorViewModel.sendFailurePostIds).toEqual([]);
  });
});
