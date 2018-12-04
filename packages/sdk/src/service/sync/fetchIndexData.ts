/*
 * @Author: Lip Wang (lip.wangn@ringcentral.com)
 * @Date: 2018-08-09 09:44:56
 * Copyright © RingCentral. All rights reserved.
 */

import { BaseError } from 'foundation';
import { indexData, initialData, remainingData } from '../../api';
import notificationCenter from '../../service/notificationCenter';
import { SERVICE } from '../../service/eventKey';
import { progressBar } from '../../utils/progress';
import { NetworkResult } from '../../api/NetworkResult';
import { IndexDataModel } from '../../api/glip/user';

interface IParams {
  newer_than?: string;
}

const fetchInitialData = async (currentTime: number) => {
  progressBar.start();
  let promise: Promise<NetworkResult<IndexDataModel, BaseError>>;
  try {
    promise = initialData({ _: currentTime });
  } finally {
    progressBar.stop();
  }
  return promise;
};

const fetchRemainingData = async (currentTime: number) => {
  return remainingData({ _: currentTime });
};

// fetch plugins

const fetchIndexData = async (timeStamp: string) => {
  progressBar.start();
  const params: IParams = { newer_than: timeStamp };

  notificationCenter.emitKVChange(SERVICE.FETCH_INDEX_DATA_EXIST);

  const requestConfig = {
    onDownloadProgress(e: any) {
      progressBar.update(e);
    },
  };
  let result: NetworkResult<IndexDataModel, BaseError>;

  try {
    result = await indexData(params, requestConfig);
  } catch (e) {
    result = e;
  } finally {
    progressBar.stop();
  }

  return result;
};

export { fetchIndexData, fetchInitialData, fetchRemainingData };
