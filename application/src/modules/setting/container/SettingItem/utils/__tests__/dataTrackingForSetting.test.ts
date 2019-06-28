/*
 * @Author: looper Wang (looper.wang@ringcentral.com)
 * @Date: 2019-06-28 14:40:39
 * Copyright © RingCentral. All rights reserved.
 */
import { dataTrackingForSetting } from '../dataTrackingForSetting';
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
