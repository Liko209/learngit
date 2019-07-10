/*
 * @Author: Paynter Chen
 * @Date: 2019-07-10 16:19:30
 * Copyright © RingCentral. All rights reserved.
 */
import assert from 'assert';
import { LokiDB } from 'foundation/db';
import _ from 'lodash';
import { createDebug } from 'sdk/__tests__/utils';
import { Post } from 'sdk/module/post/entity/Post';

import { META_ROUTE } from '../../../decorators/constants';
import { getMeta } from '../../../decorators/metaUtil';
import { Route } from '../../../decorators/Route.decorator';
import { IApiContract, IJRequest, IRoute } from '../../../types';
import { Router } from '../Router';
import { createResponse, String2Number } from '../utils';
import { STATE_KEYS } from './constants';
import { GlipClientConfigDao } from './dao/clientConfig';
import { GlipCompanyDao } from './dao/company';
import { GlipGroupDao } from './dao/group';
import { GlipGroupStateDao } from './dao/groupState';
import { GlipItemDao } from './dao/item';
import { GlipPersonDao } from './dao/person';
import { GlipPostDao } from './dao/post';
import { GlipProfileDao } from './dao/profile';
import { GlipStateDao } from './dao/state';
import { GlipDataHelper } from './data/data';
import { GlipBaseDao } from './GlipBaseDao';
import { schema } from './glipSchema';
import { MockSocketServer } from './MockSocketServer';
import {
    GlipData, GlipGroup, GlipModel, GlipPost, GlipProfile, GlipState, InitialData
} from './types';
import { genPostId, parseState, doPartialUpdate } from './utils';

const debug = createDebug('GlipController');

class GlipController {

  @Route({
    path: '/api/posts',
  })
  async getPosts(request: IJRequest) {
    const { limit = 20, direction = 'older', group_id } = request.params as any;
    return createResponse({
      request,
      data: {
        posts: await this.postDao.getPostsByGroupId(group_id),
        items: await this.itemDao.getItemsByGroupId(group_id),
      },
    });
  }

  @Route({
    path: '/api/posts_items_by_ids',
  })
  async getPostsItemsByIds(request: IJRequest) {
    const post_ids = request.params['post_ids']
      .split(',')
      .map((it: string) => Number(it));
    debug('getPostsItemsByIds %O', { post_ids });
    const { limit = 20, direction = 'older', group_id } = request.params as any;
    return createResponse({
      request,
      data: {
        posts: await this.postDao.getPostsByPostIds(post_ids),
        items: await this.itemDao.getItemsByGroupId(group_id),
      },
    });
  }

  @Route({
    path: '/api/post',
    method: 'post',
  })
  async createPost(request: IJRequest<Post>) {
    const serverPost: GlipPost = { _id: genPostId(), ...request.data };
    const groupId = serverPost.group_id;
    const updateResult = this.postDao.put(serverPost);
    const serverGroup = this.groupDao.getById(groupId)!;
    serverGroup.most_recent_post_id = serverPost._id;
    serverGroup.most_recent_post_created_at = serverPost.created_at;
    serverGroup.most_recent_content_modified_at = serverPost.modified_at;
    serverGroup.post_cursor += 1;
    serverGroup.last_author_id = serverPost.creator_id;
    this.groupDao.put(serverGroup);
    const groupState =
      this.groupStateDao.getById(groupId) ||
      this.dataHelper.groupState.createGroupState(groupId);
    groupState.post_cursor += 1;
    groupState.read_through = serverPost._id;
    this.groupStateDao.put(groupState);
    this.socketServer.emitEntityCreate(serverPost);
    this.socketServer.emitPartial(serverGroup, {
      hint: {
        post_creator_ids: {
          [String(serverGroup._id)]: serverPost.creator_id,
        },
      },
    });
    this.socketServer.emitPartial(groupState, {
      hint: {
        post_creator_ids: {
          [String(serverGroup._id)]: serverPost.creator_id,
        },
      },
    });

    return createResponse({
      request,
      data: updateResult,
    });
  }

  @Route({
    path: '/api/save_state_partial/:id?',
    method: 'put',
    query: {
      id: String2Number,
    },
  })
  saveStatePartial(request: IJRequest<GlipState>, query: { id: number }) {
    debug('handle saveStatePartial -> request', query);
    const groupStates = parseState(request.data);
    if (groupStates && groupStates[0]) {
      debug('saveStatePartial -> groupStates[0] %O', groupStates[0]);
      return createResponse({
        request,
        data: doPartialUpdate(
          this.groupStateDao,
          groupStates[0],
          result => this.socketServer.emitPartial(result),
        ),
      });
    }
    return createResponse({
      status: 500,
      statusText: 'saveStatePartial failed',
    });
  }

  @Route({
    path: '/api/group',
    method: 'post',
  })
  createGroup(request: IJRequest<GlipGroup>) {
    const serverGroup = this.dataHelper.group.factory.build(request.data);
    this.groupDao.put(serverGroup);
    this.socketServer.emitEntityCreate(serverGroup);
    return createResponse({
      request,
      data: serverGroup,
    });
  }

  @Route({
    path: '/api/group/:id',
    method: 'put',
    query: {
      id: String2Number,
    },
  })
  updateGroup(request: IJRequest<GlipGroup>, routeParams: object) {
    assert(routeParams['id'], 'update group lack ok id');
    return createResponse({
      request,
      data: doPartialUpdate(
        this.groupDao,
        { ...request.data, _id: routeParams['id'] },
        result => this.socketServer.emitPartial(result),
      ),
    });
  }

  @Route({
    path: '/api/team',
    method: 'post',
  })
  createTeam(request: IJRequest<GlipGroup>) {
    const serverTeam = this.dataHelper.team.factory.build(request.data);
    this.groupDao.put(serverTeam);
    this.socketServer.emitEntityCreate(serverTeam);
    return createResponse({
      request,
      data: serverTeam,
    });
  }

  @Route({
    path: '/api/team/:id',
    method: 'put',
    query: {
      id: String2Number,
    },
  })
  updateTeam(request: IJRequest<GlipGroup>, routeParams: object) {
    assert(routeParams['id'], 'update team lack ok id');
    return createResponse({
      request,
      data: doPartialUpdate(
        this.groupDao,
        { ...request.data, _id: routeParams['id'] },
        result => this.socketServer.emitPartial(result),
      ),
    });
  }

  @Route({
    path: '/api/profile/:id',
    method: 'get',
    query: {
      id: String2Number,
    },
  })
  getProfile(request: IJRequest<GlipProfile>, routeParams: object) {
    assert(routeParams['id'], 'get profile lack ok id');
    return createResponse({
      request,
      data: this.profileDao.getById(Number(routeParams['id'])),
    });
  }

  @Route({
    path: '/api/profile/:id',
    method: 'put',
    query: {
      id: String2Number,
    },
  })
  updateProfile(request: IJRequest<GlipProfile>, routeParams: object) {
    assert(routeParams['id'], 'update profile lack ok id');
    return createResponse({
      request,
      data: doPartialUpdate(
        this.profileDao,
        { ...request.data, _id: routeParams['id'] },
        result => this.socketServer.emitMessage(result),
      ),
    });
  }
}