/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-04-19 13:53:49
 * Copyright © RingCentral. All rights reserved.
 */
import { daoManager } from '../../dao';
import ConfigDao from '../../dao/config';
import {
  LAST_INDEX_TIMESTAMP,
  SOCKET_SERVER_HOST,
  STATIC_HTTP_SERVER,
} from '../../dao/config/constants';
import accountHandleData from '../account/handleData';
import companyHandleData from '../company/handleData';
import { CONFIG, SERVICE } from '../eventKey';
import notificationCenter from '../notificationCenter';
import { PresenceService } from '../../module/presence';
import { IndexDataModel } from '../../api/glip/user';
import { mainLogger } from 'foundation';
// import featureFlag from '../../component/featureFlag';
import { Raw } from '../../framework/model';
import { Profile } from '../../module/profile/entity';
import { ItemService } from '../../module/item';
import { StateService } from '../../module/state';
import { ErrorParserHolder } from '../../error';
import { PersonService } from '../../module/person';
import { ProfileService } from '../../module/profile';
import { PostService } from '../../module/post';
import { GroupService } from '../../module/group';

const dispatchIncomingData = async (data: IndexDataModel) => {
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
    public_teams = [],
    max_posts_exceeded: maxPostsExceeded = false,
    client_config: clientConfig = {},
  } = data;

  const arrState: any[] = [];
  if (state && Object.keys(state).length > 0) {
    arrState.push(state);
    arrState[0].__from_index = true;
  }

  let transProfile: Raw<Profile> | null = null;
  if (profile && Object.keys(profile).length > 0) {
    transProfile = profile;
  }
  return Promise.all([
    accountHandleData({
      userId,
      companyId,
      clientConfig,
      profileId: profile ? profile._id : undefined,
    }), // eslint-disable-line no-underscore-dangle, no-undefined
    companyHandleData(companies),
    (ItemService.getInstance() as ItemService).handleIncomingData(items),
    PresenceService.getInstance<PresenceService>().presenceHandleData(
      presences,
    ),
    (StateService.getInstance() as StateService).handleState(arrState),
    // featureFlag.handleData(clientConfig),
  ])
    .then(() =>
      ProfileService.getInstance<ProfileService>().handleIncomingData(
        transProfile,
      ),
    )
    .then(() =>
      PersonService.getInstance<PersonService>().handleIncomingData(people),
    )
    .then(() =>
      GroupService.getInstance<GroupService>().handleData(public_teams),
    )
    .then(() => GroupService.getInstance<GroupService>().handleData(groups))
    .then(() => GroupService.getInstance<GroupService>().handleData(teams))
    .then(() =>
      PostService.getInstance<PostService>().handleIndexData(
        posts,
        maxPostsExceeded,
      ),
    );
};

const handleData = async (
  result: IndexDataModel,
  shouldSaveScoreboard: boolean = true,
) => {
  try {
    const {
      timestamp = null,
      scoreboard = null,
      static_http_server: staticHttpServer = '',
    } = result;
    const configDao = daoManager.getKVDao(ConfigDao);

    if (scoreboard && shouldSaveScoreboard) {
      configDao.put(SOCKET_SERVER_HOST, scoreboard);
      notificationCenter.emitKVChange(CONFIG.SOCKET_SERVER_HOST, scoreboard);
    }

    if (staticHttpServer) {
      configDao.put(STATIC_HTTP_SERVER, staticHttpServer);
      notificationCenter.emitKVChange(
        CONFIG.STATIC_HTTP_SERVER,
        staticHttpServer,
      );
    }

    // logger.time('handle index data');
    await dispatchIncomingData(result);
    // logger.timeEnd('handle index data');
    if (timestamp) {
      configDao.put(LAST_INDEX_TIMESTAMP, timestamp);
      notificationCenter.emitKVChange(CONFIG.LAST_INDEX_TIMESTAMP, timestamp);
    }

    notificationCenter.emitKVChange(SERVICE.FETCH_INDEX_DATA_DONE);
  } catch (error) {
    mainLogger.error(`sync/handleData: ${JSON.stringify(error)}`);
    notificationCenter.emitKVChange(SERVICE.FETCH_INDEX_DATA_ERROR, {
      error: ErrorParserHolder.getErrorParser().parse(error),
    });
  }
};

export default handleData;
