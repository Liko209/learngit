import { daoManager } from '../../dao';
import ConfigDao from '../../dao/config';
import { LAST_INDEX_TIMESTAMP } from '../../dao/config/constants';
import { indexData } from '../../api';
import notificationCenter from '../../service/notificationCenter';
import { SERVICE } from '../../service/eventKey';
import { IndexDataModel } from '../../api/glip/user';
import { IResponse } from '../../api/NetworkClient';
import { mainLogger } from 'foundation';
import { progressBar } from '../../utils/progress';

interface Params {
  newer_than?: string;
}

const fetchIndexData = async (): Promise<IResponse<IndexDataModel>> => {
  progressBar.start();
  const params: Params = {};
  const configDao = daoManager.getKVDao(ConfigDao);
  const lastIndexTimestamp = configDao.get(LAST_INDEX_TIMESTAMP);

  if (lastIndexTimestamp) {
    notificationCenter.emitService(SERVICE.FETCH_INDEX_DATA_EXIST);
    // index newer than api need move back 5 mins
    params.newer_than = String(lastIndexTimestamp - 300000);
  }

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
  mainLogger.debug(`fetch index data: , ${result}`);
  return result;
};

export default fetchIndexData;
