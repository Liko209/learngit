/*
 * @Author: Lip Wang (lip.wangn@ringcentral.com)
 * @Date: 2018-08-09 09:44:56
 * Copyright © RingCentral. All rights reserved.
 */

import { indexData, initialData, remainingData } from '../../api';
import notificationCenter from '../../service/notificationCenter';
import { SERVICE } from '../../service/eventKey';
import { IndexDataModel } from '../../api/glip/user';
import { IResponse, IResponseError } from '../../api/NetworkClient';
import { progressBar } from '../../utils/progress';

interface IParams {
  newer_than?: string;
}

const fetchInitialData = async (
  currentTime: number,
): Promise<IResponse<IndexDataModel & IResponseError>> => {
  progressBar.start();
  let result;
  try {
    result = initialData({ _: currentTime });
  } finally {
    progressBar.stop();
  }
  return result;
};

const fetchRemainingData = async (
  currentTime: number,
): Promise<IResponse<IndexDataModel & IResponseError>> => {
  const result = remainingData({ _: currentTime });
  return result;
};

// fetch plugins

const fetchIndexData = async (
  timeStamp: string,
): Promise<IResponse<IndexDataModel & IResponseError>> => {
  progressBar.start();
  const params: IParams = { newer_than: timeStamp };

  notificationCenter.emitService(SERVICE.FETCH_INDEX_DATA_EXIST);

  const requestConfig = {
    onDownloadProgress(e: any) {
      progressBar.update(e);
    },
  };
  let result;

  // logger.time('fetch index data');
  try {
    result = await indexData(params, requestConfig);
  } finally {
    progressBar.stop();
  }

  // logger.timeEnd('fetch index data');
  return result;
};

export { fetchIndexData, fetchInitialData, fetchRemainingData };
