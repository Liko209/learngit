/*
 * @Author: looper Wang (looper.wang@ringcentral.com)
 * @Date: 2019-06-28 14:40:39
 * Copyright © RingCentral. All rights reserved.
 */
import {
  dataTrackingForSetting,
  debounceTrackData,
  booleanTransform,
} from '../dataTrackingForSetting';
import { dataAnalysis } from 'foundation/analysis';

jest.mock('foundation/analysis');

describe('dataTrackingForSetting()', () => {
  it('should save setting ', async () => {
    dataTrackingForSetting({});
    expect(dataAnalysis.track).toHaveBeenCalledWith(
      'Jup_Web/DT_settings_updateSetting',
      {},
    );
  });
});

describe('debounceTrackData()', () => {
  it('should call 1 when call de debounceTrackData three time', async () => {
    debounceTrackData({});
    debounceTrackData({});
    debounceTrackData({});
    expect(dataAnalysis.track).toHaveBeenCalledTimes(1);
  });
});

describe('booleanTransform()', () => {
  it('should return on when call booleanTransform with true ', async () => {
    expect(booleanTransform(true)).toEqual('on');
  });
  it('should return off when call booleanTransform with false ', async () => {
    expect(booleanTransform(false)).toEqual('off');
  });
});
