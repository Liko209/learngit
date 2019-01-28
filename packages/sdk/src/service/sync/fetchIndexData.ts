/*
 * @Author: Lip Wang (lip.wangn@ringcentral.com)
 * @Date: 2018-08-09 09:44:56
 * Copyright © RingCentral. All rights reserved.
 */

import { indexData, initialData, remainingData } from '../../api';
import notificationCenter from '../../service/notificationCenter';
import { SERVICE } from '../../service/eventKey';
import { progressBar, IProgressEvent } from '../../utils/progress';
import { ApiResult, ApiResultErr } from '../../api/ApiResult';
import { IndexDataModel } from '../../api/glip/user';
import { JError } from '../../error';

interface IParams {
  newer_than?: string;
}

const requestConfig = {
  onDownloadProgress(e: IProgressEvent) {
    progressBar.update(e);
  },
};

const withProgress = (
  getDataFunction: (
    params: object,
    requestConfig?: object,
    headers?: object,
  ) => Promise<ApiResult<IndexDataModel, JError>>,
) => async (params: object) => {
  progressBar.start();
  let result: ApiResult<IndexDataModel, JError>;
  try {
    result = await getDataFunction(params, requestConfig);
  } catch (e) {
    if (e instanceof ApiResultErr) {
      result = e;
    }
    throw e;
  } finally {
    progressBar.stop();
  }
  return result;
};

const initialWithProgress = withProgress(initialData);
const indexWithProgress = withProgress(indexData);

const fetchInitialData = async (currentTime: number) => {
  return initialWithProgress({ _: currentTime });
};

const fetchRemainingData = async (currentTime: number) => {
  return remainingData({ _: currentTime });
};

// fetch plugins

const fetchIndexData = async (timeStamp: string) => {
  const params: IParams = { newer_than: timeStamp };

  notificationCenter.emitKVChange(SERVICE.FETCH_INDEX_DATA_EXIST);
  return indexWithProgress(params);
};

export { fetchIndexData, fetchInitialData, fetchRemainingData };
