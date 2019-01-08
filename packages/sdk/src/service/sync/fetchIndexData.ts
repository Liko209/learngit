/*
 * @Author: Lip Wang (lip.wangn@ringcentral.com)
 * @Date: 2018-08-09 09:44:56
 * Copyright © RingCentral. All rights reserved.
 */

import { indexData, initialData, remainingData } from '../../api';
import notificationCenter from '../../service/notificationCenter';
import { SERVICE } from '../../service/eventKey';
import { progressBar } from '../../utils/progress';
import { ApiResult } from '../../api/ApiResult';
import { IndexDataModel } from '../../api/glip/user';
import { JError } from '../../error';

interface IParams {
  newer_than?: string;
}

const fetchInitialData = async (currentTime: number) => {
  progressBar.start();
  let promise: Promise<ApiResult<IndexDataModel, JError>>;
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
  let result: ApiResult<IndexDataModel, JError>;

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
