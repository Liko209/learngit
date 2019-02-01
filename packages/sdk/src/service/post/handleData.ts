/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-04-16 09:35:30
 * Copyright © RingCentral. All rights reserved.
 */
import { daoManager } from '../../dao';
import PostDao from '../../dao/post';
import { ENTITY } from '../../service/eventKey';
import GroupService from '../../module/group';
import IncomingPostHandler from '../../service/post/incomingPostHandler';
import { transform, baseHandleData as utilsBaseHandleData } from '../utils';
import { Raw } from '../../framework/model';
import { Group } from '../../module/group/entity';
import { Post } from '../../module/post/entity';
import _ from 'lodash';

function transformData(data: Raw<Post>[] | Raw<Post>): Post[] {
  return ([] as Raw<Post>[])
    .concat(data)
    .map((item: Raw<Post>) => transform<Post>(item));
}

export async function isContinuousWithLocalData(posts: Post[]) {
  if (!posts.length) {
    return true;
  }
  if (!posts.every(({ group_id }) => group_id === posts[0].group_id)) {
    throw new Error('Posts should belong to same group');
  }

  const postDao = daoManager.getDao(PostDao);
  const groupId = posts[0].group_id;
  const localOldest = await postDao.queryOldestPostByGroupId(groupId);
  const sortedPosts = _.sortBy(posts, ['created_at']);
  const incomingLatest = sortedPosts[posts.length - 1];
  if (!localOldest) {
    return false;
  }
  const notContinuous = incomingLatest.created_at < localOldest.created_at;
  return !notContinuous;
}

export async function checkIncompletePostsOwnedGroups(
  posts: Post[],
): Promise<Group[]> {
  if (posts.length) {
    const groupIds: number[] = [];
    posts.forEach(post => groupIds.push(post.group_id));
    const groupService: GroupService = GroupService.getInstance();
    const groups = await groupService.getGroupsByIds(groupIds);
    return groups;
  }
  return [];
}

/**
 * @param posts
 * @param save：Explicitly specify whether should save to DB, if not specified, depends on the result of continuity check.
 */
export async function handleDeactivatedAndNormalPosts(
  posts: Post[],
  save?: boolean,
): Promise<Post[]> {
  const groups = _.groupBy(posts, 'group_id');
  const postDao = daoManager.getDao(PostDao);
  // const postService = serviceManager.getInstance(PostService);
  // handle deactivated data and normal data
  const normalPosts = _.flatten(
    await Promise.all(
      Object.values(groups).map(async (posts: Post[]) => {
        let shouldSave;
        if (typeof save === 'boolean') {
          shouldSave = save;
        } else {
          shouldSave = !!(await isContinuousWithLocalData(posts));
        }
        const normalPosts = await utilsBaseHandleData({
          data: posts,
          dao: postDao,
          eventKey: ENTITY.POST,
          noSavingToDB: !shouldSave,
        });
        return normalPosts;
      }),
    ),
  );

  // check if post's owner group exist in local or not
  // seems we only need check normal posts, don't need to check deactivated data
  await checkIncompletePostsOwnedGroups(normalPosts);
  return posts;
}

export async function handleDataFromSexio(data: Raw<Post>[]): Promise<void> {
  if (data.length === 0) {
    return;
  }
  const transformedData: Post[] = transformData(data);
  // handle edited posts not in local db
  const validPosts: Post[] = await IncomingPostHandler.handleGroupPostsDiscontinuousCausedByModificationTimeChange(
    transformedData,
  );
  await handlePreInsertPosts(validPosts);
  if (validPosts.length) {
    await handleDeactivatedAndNormalPosts(validPosts, true);
  }
}

export async function handleDataFromIndex(
  data: Raw<Post>[],
  maxPostsExceed: boolean,
): Promise<void> {
  if (data.length === 0) {
    return;
  }
  const transformedData = transformData(data);

  // handle max exceeded
  const exceedPostsHandled = await IncomingPostHandler.handelGroupPostsDiscontinuousCasuedByOverThreshold(
    transformedData,
    maxPostsExceed,
  );
  await handlePreInsertPosts(exceedPostsHandled);

  // handle discontinuous by modified
  const result = await IncomingPostHandler.handleGroupPostsDiscontinuousCausedByModificationTimeChange(
    exceedPostsHandled,
  );
  handleDeactivatedAndNormalPosts(result, true);
}

export default async function (data: Raw<Post>[], maxPostsExceed: boolean) {
  return handleDataFromIndex(data, maxPostsExceed);
}

/**
 * @param data
 * @param needTransformed
 * @param save：Explicitly specify whether should save to DB, if not specified, depends on the result of continuity check.
 */
export function baseHandleData(
  data: Raw<Post>[] | Raw<Post> | Post[] | Post,
  save?: boolean,
): Promise<Post[]> {
  const transformedData: Post[] = transformData(data as
    | Raw<Post>[]
    | Raw<Post>);
  return handleDeactivatedAndNormalPosts(transformedData, save);
}

export async function handlePreInsertPosts(posts: Post[] = []) {
  if (!posts || !posts.length) {
    return [];
  }
  const ids: number[] = [];
  posts.map(async (post: Post) => {
    if (post.id < 0) {
      ids.push(post.version);
    }
  });

  if (ids.length) {
    const postDao = daoManager.getDao(PostDao);
    await postDao.bulkDelete(ids);
  }
  return ids;
}
