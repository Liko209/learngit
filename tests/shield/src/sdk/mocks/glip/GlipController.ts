/*
 * @Author: Paynter Chen
 * @Date: 2019-07-10 16:19:30
 * Copyright © RingCentral. All rights reserved.
 */
import assert from 'assert';
import _ from 'lodash';
import { createDebug } from 'sdk/__tests__/utils';

import {
  PContext,
  PParam,
  PRequest,
} from 'shield/sdk/decorators/Parameter.decorator';
import { Route } from 'shield/sdk/decorators/Route.decorator';
import { IJRequest } from 'shield/sdk/types';
import { createResponse } from 'shield/sdk/utils';
import { String2Number } from 'shield/sdk/server/utils';
import { IGlipServerContext } from './IGlipServerContext';
import { GlipGroup, GlipPost, GlipProfile, GlipState } from './types';
import { doPartialUpdate, genPostId, parseState } from './utils';
import { delay } from 'shield/utils/asyncTest';

const debug = createDebug('GlipController');

export class GlipController {
  @Route({
    path: '/api/posts',
  })
  async getPosts(
    @PRequest request: IJRequest,
    @PContext context: IGlipServerContext,
  ) {
    const { limit = 20, direction = 'older', group_id } = request.params as any;
    return createResponse({
      request,
      data: {
        posts: await context.postDao.getPostsByGroupId(group_id),
        items: await context.itemDao.getItemsByGroupId(group_id),
      },
    });
  }

  @Route({
    path: '/api/posts_items_by_ids',
  })
  async getPostsItemsByIds(
    @PRequest request: IJRequest,
    @PContext context: IGlipServerContext,
  ) {
    const post_ids = request.params['post_ids']
      .split(',')
      .map((it: string) => Number(it));
    debug('getPostsItemsByIds %O', { post_ids });
    const { limit = 20, direction = 'older', group_id } = request.params as any;
    return createResponse({
      request,
      data: {
        posts: await context.postDao.getPostsByPostIds(post_ids),
        items: await context.itemDao.getItemsByGroupId(group_id),
      },
    });
  }

  @Route({
    path: '/api/post',
    method: 'post',
  })
  async createPost(
    @PRequest request: IJRequest<GlipPost>,
    @PContext context: IGlipServerContext,
  ) {
    const serverPost: GlipPost = { _id: genPostId(), ...request.data };
    const groupId = serverPost.group_id;
    const updateResult = context.postDao.put(serverPost);
    const serverGroup = context.groupDao.getById(groupId)!;
    serverGroup.most_recent_post_id = serverPost._id;
    serverGroup.most_recent_post_created_at = serverPost.created_at;
    serverGroup.most_recent_content_modified_at = serverPost.modified_at;
    serverGroup.post_cursor += 1;
    serverGroup.last_author_id = serverPost.creator_id;
    context.groupDao.put(serverGroup);
    const groupState =
      context.groupStateDao.getById(groupId) ||
      context.dataHelper.groupState.createGroupState(groupId);
    groupState.post_cursor += 1;
    groupState.read_through = serverPost._id;
    context.groupStateDao.put(groupState);
    delay(() => context.socketServer.emitEntityCreate(serverPost));
    delay(() => context.socketServer.emitMessage(serverGroup));
    delay(() =>
      context.socketServer.emitPartial(groupState, {
        hint: {
          post_creator_ids: {
            [String(serverGroup._id)]: serverPost.creator_id,
          },
        },
      }),
    );

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
  saveStatePartial(
    @PRequest request: IJRequest<GlipState>,
    @PContext context: IGlipServerContext,
    @PParam query: { id: number },
  ) {
    debug('handle saveStatePartial -> request', query);
    const groupStates = parseState(request.data);
    if (groupStates && groupStates[0]) {
      debug('saveStatePartial -> groupStates[0] %O', groupStates[0]);
      return createResponse({
        request,
        data: doPartialUpdate(context.groupStateDao, groupStates[0], result =>
          context.socketServer.emitPartial(result),
        ),
      });
    }
    return createResponse({
      status: 200,
      statusText: 'saveStatePartial failed',
    });
  }

  @Route({
    path: '/api/group',
    method: 'post',
  })
  createGroup(
    @PRequest request: IJRequest<GlipGroup>,
    @PContext context: IGlipServerContext,
  ) {
    const serverGroup = context.dataHelper.group.factory.build(request.data);
    context.groupDao.put(serverGroup);
    context.socketServer.emitEntityCreate(serverGroup);
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
  updateGroup(
    @PRequest request: IJRequest<GlipGroup>,
    @PParam routeParams: object,
    @PContext context: IGlipServerContext,
  ) {
    assert(routeParams['id'], 'update group lack ok id');
    return createResponse({
      request,
      data: doPartialUpdate(
        context.groupDao,
        { ...request.data, _id: routeParams['id'] },
        result => context.socketServer.emitPartial(result),
      ),
    });
  }

  @Route({
    path: '/api/team',
    method: 'post',
  })
  createTeam(
    @PRequest request: IJRequest<GlipGroup>,
    @PContext context: IGlipServerContext,
  ) {
    const serverTeam = context.dataHelper.team.factory.build(request.data);
    context.groupDao.put(serverTeam);
    context.socketServer.emitEntityCreate(serverTeam);
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
  updateTeam(
    @PRequest request: IJRequest<GlipGroup>,
    @PParam routeParams: object,
    @PContext context: IGlipServerContext,
  ) {
    assert(routeParams['id'], 'update team lack ok id');
    return createResponse({
      request,
      data: doPartialUpdate(
        context.groupDao,
        { ...request.data, _id: routeParams['id'] },
        result => context.socketServer.emitPartial(result),
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
  getProfile(
    @PRequest request: IJRequest<GlipProfile>,
    @PParam routeParams: object,
    @PContext context: IGlipServerContext,
  ) {
    assert(routeParams['id'], 'get profile lack ok id');
    return createResponse({
      request,
      data: context.profileDao.getById(Number(routeParams['id'])),
    });
  }

  @Route({
    path: '/api/profile/:id',
    method: 'put',
    query: {
      id: String2Number,
    },
  })
  updateProfile(
    @PRequest request: IJRequest<GlipProfile>,
    @PParam routeParams: object,
    @PContext context: IGlipServerContext,
  ) {
    assert(routeParams['id'], 'update profile lack ok id');
    return createResponse({
      request,
      data: doPartialUpdate(
        context.profileDao,
        { ...request.data, _id: routeParams['id'] },
        result => context.socketServer.emitMessage(result),
      ),
    });
  }

  @Route({
    path: '/api',
    method: 'get',
  })
  handleTyping(@PRequest request: IJRequest) {
    return createResponse({
      request,
      status: 200,
    });
  }

  @Route({
    path: '/glip-presence/v1/person/:ids/presence',
    method: 'get',
    query: {
      ids: (raw: string) => raw.split(','),
    },
  })
  presence(@PRequest request: IJRequest, @PParam query: { ids: number[] }) {
    return createResponse({
      request,
      data: query.ids.map(id => ({
        personId: id,
        calculatedStatus: 'Available',
      })),
    });
  }
}
