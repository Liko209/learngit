/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-04-19 13:53:49
 * Copyright © RingCentral. All rights reserved.
 */
import { daoManager } from '../../dao';
import ConfigDao from '../../dao/config';
import { LAST_INDEX_TIMESTAMP, SOCKET_SERVER_HOST } from '../../dao/config/constants';
import { ErrorParser } from '../../utils/error';
import accountHandleData from '../account/handleData';
import companyHandleData from '../company/handleData';
import { CONFIG, SERVICE } from '../eventKey';
import groupHandleData from '../group/handleData';
import itemHandleData from '../item/handleData';
import notificationCenter from '../notificationCenter';
import personHandleData from '../person/handleData';
import postHandleData from '../post/handleData';
import presenceHandleData from '../presence/handleData';
import profileHandleData from '../profile/handleData';
import stateHandleData from '../state/handleData';
import { IndexDataModel } from '../../api/glip/user';
import { IResponse } from '../../api/NetworkClient';
import { mainLogger } from 'foundation';

const dispatchIncomingData = (data: IndexDataModel) => {
  const {
    user_id: userId,
    company_id: companyId,
    profile,
    companies = [],
    items = [],
    presences = [],
    state,
    people = [],
    groups = [],
    teams = [],
    posts = [],
    max_posts_exceeded: maxPostsExceeded = false,
    client_config: clientConfig,
  } = data;

  const arrState: any[] = [];
  if (state && Object.keys(state).length > 0) {
    arrState.push(state);
  }

  const arrProfile: any[] = [];
  if (profile && Object.keys(profile).length > 0) {
    arrProfile.push(profile);
  }

  return Promise.all([
    accountHandleData({
      userId,
      companyId,
      clientConfig,
      profileId: profile ? profile._id : undefined,
    }),
    companyHandleData(companies),
    itemHandleData(items),
    presenceHandleData(presences),
    stateHandleData(arrState),
  ])
    .then(() => profileHandleData(arrProfile))
    .then(() => personHandleData(people))
    .then(() => groupHandleData(groups))
    .then(() => groupHandleData(teams))
    .then(() => postHandleData(posts, maxPostsExceeded));
};

const handleData = async (result: IResponse<IndexDataModel>) => {
  try {
    if (!(result instanceof Object) || !(result.data instanceof Object)) {
      return; // sometimes indexData return false
    }
    // logger.time('handle index data');
    await dispatchIncomingData(result.data);
    // logger.timeEnd('handle index data');

    const { timestamp = null, scoreboard = null } = result.data;
    const configDao = daoManager.getKVDao(ConfigDao);

    if (timestamp) {
      configDao.put(LAST_INDEX_TIMESTAMP, timestamp);
      notificationCenter.emitConfigPut(CONFIG.LAST_INDEX_TIMESTAMP, timestamp);
    }
    if (scoreboard) {
      configDao.put(SOCKET_SERVER_HOST, scoreboard);
      notificationCenter.emitConfigPut(CONFIG.SOCKET_SERVER_HOST, scoreboard);
    }

    notificationCenter.emitService(SERVICE.FETCH_INDEX_DATA_DONE);
  } catch (error) {
    mainLogger.error(error);
    notificationCenter
      .emitService(SERVICE.FETCH_INDEX_DATA_ERROR, { error: ErrorParser.parse(error) });
  }
};

export default handleData;
