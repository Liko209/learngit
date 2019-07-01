/*
 * @Author: looper Wang (looper.wang@ringcentral.com)
 * @Date: 2019-06-28 14:40:39
 * Copyright © RingCentral. All rights reserved.
 */
import {
  dataTrackingForSetting,
  debounceTrackData,
} from '../dataTrackingForSetting';
import { dataAnalysis } from 'sdk';
jest.mock('sdk');

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
