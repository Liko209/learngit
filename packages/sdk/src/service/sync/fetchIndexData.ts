/*
 * @Author: Lip Wang (lip.wangn@ringcentral.com)
 * @Date: 2018-08-09 09:44:56
 * Copyright © RingCentral. All rights reserved.
 */

import { indexData, initialData, remainingData } from '../../api';
import notificationCenter from '../../service/notificationCenter';
import { SERVICE } from '../../service/eventKey';
import { IndexDataModel } from '../../api/glip/user';

interface IParams {
  newer_than?: string;
}

const fetchData = (
  getDataFunction: (
    params: object,
    requestConfig?: object,
    headers?: object,
  ) => Promise<IndexDataModel>,
) => async (params: object) => {
  return await getDataFunction(params);
};

const initialDataProcess = fetchData(initialData);
const indexDataProcess = fetchData(indexData);

const fetchInitialData = async (currentTime: number) => {
  return initialDataProcess({ _: currentTime });
};

const fetchRemainingData = async (currentTime: number) => {
  return remainingData({ _: currentTime });
};

const fetchIndexData = async (timeStamp: string) => {
  const params: IParams = { newer_than: timeStamp };
  notificationCenter.emitKVChange(SERVICE.FETCH_INDEX_DATA_EXIST);
  return indexDataProcess(params);
};

export { fetchIndexData, fetchInitialData, fetchRemainingData };
