/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-04-16 09:35:30
 * Copyright © RingCentral. All rights reserved.
 */
import { daoManager } from '../../dao';
import PostDao from '../../dao/post';
import { ENTITY } from '../../service/eventKey';
import GroupService from '../../service/group';
import IncomingPostHandler from '../../service/post/incomingPostHandler';
import { transform, baseHandleData as utilsBaseHandleData } from '../utils';
import { Post, Group, Raw } from '../../models';
import PostService from '.';
import _ from 'lodash';

function transformData(data: Raw<Post>[] | Raw<Post>): Post[] {
  return ([] as Raw<Post>[])
    .concat(data)
    .map((item: Raw<Post>) => transform<Post>(item));
}

export async function isContinuousWithLocalData(posts: Post[]) {
  if (!posts.length) {
    return [];
  }
  if (!posts.every(({ group_id }) => group_id === posts[0].group_id)) {
    throw new Error('Posts should belong to same group');
  }

  const postDao = daoManager.getDao(PostDao);
  const groupId = posts[0].group_id;
  const localOldest = await postDao.queryOldestPostByGroupId(groupId);
  const localLatest = await postDao.queryLastPostByGroupId(groupId);
  const sortedPosts = _.sortBy(posts, ['created_at']);
  const incomingOldest = sortedPosts[0];
  const incomingLatest = sortedPosts[posts.length - 1];
  const notContinuous =
    localOldest &&
    localLatest &&
    (incomingLatest.created_at < localOldest.created_at ||
      localLatest.created_at < incomingOldest.created_at);

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

export async function handleDeactivedAndNormalPosts(
  posts: Post[],
  isContinuous: boolean = false,
): Promise<Post[]> {
  const groups = _.groupBy(posts, 'group_id');
  const postDao = daoManager.getDao(PostDao);
  // const postService = serviceManager.getInstance(PostService);
  // handle deactivated data and normal data
  const normalPosts = _.flatten(
    await Promise.all(
      Object.values(groups).map(async (posts: Post[]) => {
        const _isContinuous =
          isContinuous || (await isContinuousWithLocalData(posts));
        const normalPosts = await utilsBaseHandleData({
          data: posts,
          dao: postDao,
          eventKey: ENTITY.POST,
          noSavingToDB: !_isContinuous,
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
    await handleDeactivedAndNormalPosts(validPosts);
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
  handleDeactivedAndNormalPosts(result);
}

export default async function (data: Raw<Post>[], maxPostsExceed: boolean) {
  return handleDataFromIndex(data, maxPostsExceed);
}

export function baseHandleData(
  data: Raw<Post>[] | Raw<Post> | Post[] | Post,
  needTransformed = true,
  isContinuous: boolean = false,
): Promise<Post[]> {
  const transformedData: Post[] = needTransformed
    ? transformData(data as Raw<Post>[] | Raw<Post>)
    : Array.isArray(data)
    ? (data as Post[])
    : [data as Post];
  return handleDeactivedAndNormalPosts(transformedData, isContinuous);
}

export async function handlePreInsertPosts(posts: Post[] = []) {
  if (!posts || !posts.length) {
    return [];
  }
  const ids: number[] = [];
  const postService = PostService.getInstance<PostService>();
  posts.map(async (post: Post) => {
    const isInPreInsert = postService.isInPreInsert(post.version);
    if (isInPreInsert) {
      ids.push(post.version);
    }
  });

  if (ids.length) {
    const postDao = daoManager.getDao(PostDao);
    await postDao.bulkDelete(ids);
  }
  return ids;
}
