/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-10-11 10:28:56
 * Copyright © RingCentral. All rights reserved.
 */

import { getEntity } from '../../../../store/utils';
import { IndicatorViewModel } from '../Indicator.ViewModel';

const mockGroupEntityData = {
  draft: 'draft',
  sendFailurePostIds: [1, 2],
};
// @ts-ignore
getEntity = jest.fn().mockReturnValue(mockGroupEntityData);
const indicatorViewModel = new IndicatorViewModel();

describe('IndicatorViewModel', () => {
  it('lifecycle onReceiveProps method', () => {
    const id = 123;
    indicatorViewModel.onReceiveProps({ id });
    expect(indicatorViewModel.id).toBe(id);
  });

  it('get computed _group', () => {
    expect(indicatorViewModel._group).toBe(mockGroupEntityData);
  });

  it('get computed draft', () => {
    expect(indicatorViewModel.draft).toBe(mockGroupEntityData.draft);
  });

  it('get computed sendFailurePostIds', () => {
    expect(indicatorViewModel.sendFailurePostIds).toBe(mockGroupEntityData.sendFailurePostIds);
  });
});
