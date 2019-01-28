/*
 * @Author: Lip Wang (lip.wangn@ringcentral.com)
 * @Date: 2018-08-09 09:44:56
 * Copyright © RingCentral. All rights reserved.
 */

import { indexData, initialData, remainingData } from '../../api';
import notificationCenter from '../../service/notificationCenter';
import { SERVICE } from '../../service/eventKey';
import { progressBar } from '../../utils/progress';
import { ApiResult, ApiResultErr } from '../../api/ApiResult';
import { IndexDataModel } from '../../api/glip/user';
import { JError } from '../../error';

interface IParams {
  newer_than?: string;
}

const requestConfig = {
  onDownloadProgress(e: any) {
    progressBar.update(e);
  },
};

const handerGetData = async (
  getDataFunction: () => Promise<ApiResult<IndexDataModel, JError>>,
) => {
  let result: ApiResult<IndexDataModel, JError>;
  try {
    result = await getDataFunction();
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

const fetchInitialData = async (currentTime: number) => {
  progressBar.start();
  return handerGetData(() => initialData({ _: currentTime }, requestConfig));
};

const fetchRemainingData = async (currentTime: number) => {
  return remainingData({ _: currentTime });
};

// fetch plugins

const fetchIndexData = async (timeStamp: string) => {
  progressBar.start();
  const params: IParams = { newer_than: timeStamp };

  notificationCenter.emitKVChange(SERVICE.FETCH_INDEX_DATA_EXIST);
  return handerGetData(() => indexData(params, requestConfig));
};

export { fetchIndexData, fetchInitialData, fetchRemainingData };
