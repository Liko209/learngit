/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2019-07-26 15:45:22
 * Copyright © RingCentral. All rights reserved.
 */

import { getCurrentTime } from 'sdk/utils/jsUtils';
import _ from 'lodash';
import { traceData } from 'sdk/api/glip/dataCollection';
import { TelephonyDataCollectionController } from '../TelephonyDataCollectionController';

jest.mock('sdk/api/glip/dataCollection');
jest.mock('sdk/utils/jsUtils');

describe('DataCollectionController', () => {
  function getController(
    config = {
      isProduction: false,
      userInfo: {
        userId: 1,
        companyId: 10,
      },
    },
  ) {
    const controller = new TelephonyDataCollectionController();
    controller.setDataCollectionInfoConfig(config);
    return controller;
  }

  beforeEach(() => {
    jest.resetAllMocks();
    jest.resetAllMocks();
    getCurrentTime.mockReturnValue(1564129259);
  });
  describe('traceNoAudioData', () => {
    it('should add more variables in', () => {
      const controller = getController();
      controller.traceNoAudioData({
        event: {
          type: 'no-rtp',
          details: {
            feature: 'no_audio_data',
          },
        },
      });
      expect(traceData).toHaveBeenCalledWith({
        event: {
          details: {
            build_type: 'non_prod',
            company_id: 10,
            feature: 'no_audio_data',
            user_id: 1,
          },
          timestamp: 1564129259,
          type: 'no-rtp',
        },
      });
    });
    it('should trace empty user info', () => {
      const controller = getController({ isProduction: true });
      controller.traceNoAudioData({
        event: {
          type: 'no-rtp',
          details: {
            feature: 'no_audio_data',
          },
        },
      });
      expect(traceData).toHaveBeenCalledWith({
        event: {
          details: {
            build_type: 'prod',
            company_id: '',
            feature: 'no_audio_data',
            user_id: '',
          },
          timestamp: 1564129259,
          type: 'no-rtp',
        },
      });
    });
  });
  describe('traceNoAudioStatus', () => {
    it('should trace data when is no audio call', () => {
      const controller = getController();
      controller.traceNoAudioStatus({
        event: {
          type: 'success',
          details: {
            feature: 'no_audio_data',
          },
        },
      });
      expect(traceData).toHaveBeenCalledWith({
        event: {
          details: {
            build_type: 'non_prod',
            company_id: 10,
            feature: 'no_audio_data',
            user_id: 1,
          },
          timestamp: 1564129259,
          type: 'success',
        },
      });
    });
    it('should trace user id and without company id', () => {
      const controller = getController({
        isProduction: true,
        userInfo: {
          userId: 1,
        },
      });
      controller.traceNoAudioStatus({
        event: {
          type: 'success',
          details: {
            feature: 'no_audio_data',
          },
        },
      });
      expect(traceData).toHaveBeenCalledWith({
        event: {
          details: {
            build_type: 'prod',
            company_id: '',
            feature: 'no_audio_data',
            user_id: 1,
          },
          timestamp: 1564129259,
          type: 'success',
        },
      });
    });
  });
});
