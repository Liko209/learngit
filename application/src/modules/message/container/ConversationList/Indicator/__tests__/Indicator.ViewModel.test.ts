/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-10-11 10:28:56
 * Copyright © RingCentral. All rights reserved.
 */

import { getEntity } from '../../../../../../store/utils';
import { IndicatorViewModel } from '../Indicator.ViewModel';

jest.mock('../../../../store/utils');

function clearMocks() {
  jest.clearAllMocks();
  jest.resetModules();
  jest.restoreAllMocks();
}

describe('IndicatorViewModel', () => {
  let indicatorViewModel: IndicatorViewModel = undefined;
  beforeEach(() => {
    clearMocks();
    indicatorViewModel = new IndicatorViewModel();
  });

  it('lifecycle onReceiveProps method', () => {
    let id = 123;
    indicatorViewModel.onReceiveProps({ id });
    expect(indicatorViewModel.id).toBe(id);
    id = 123;
    indicatorViewModel.onReceiveProps({ id });
    expect(indicatorViewModel.id).toBe(id);
  });

  describe('hasDraft', () => {
    beforeEach(() => {
      clearMocks();
    });

    function setUpData(draft: any) {
      const mockGroupEntityData = {
        ...draft,
        sendFailurePostIds: [1, 2],
      };

      // @ts-ignore
      getEntity = jest.fn().mockReturnValue(mockGroupEntityData);
    }

    it('should return true when has draft text', () => {
      setUpData({ draft: 'draft' });
      expect(indicatorViewModel.hasDraft).toBeTruthy();
    });

    it('should return true when has draft items', () => {
      setUpData({ attachmentItemIds: [1] });
      expect(indicatorViewModel.hasDraft).toBeTruthy();
    });

    it('should return false when has no draft items and text', () => {
      setUpData({});
      expect(indicatorViewModel.hasDraft).toBeFalsy();
    });
  });
});
