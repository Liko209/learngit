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
import GroupDao from '../../dao/group';
import { transform, baseHandleData as utilsBaseHandleData, isIEOrEdge } from '../utils';
import { Post, Group, Raw } from '../../models';
import PostService from '.';
import { mainLogger } from 'foundation';

let totalPostCount: number | null = null;
const handlePostsOverflow = async (newReceivedPosts: Post[]) => {
  const postDao = daoManager.getDao(PostDao);
  if (!postDao.isDexieDB()) return;

  if (typeof totalPostCount !== 'number') {
    totalPostCount = await postDao.createQuery().count();
  } else {
    totalPostCount += newReceivedPosts.length;
  }
  mainLogger.info(`Total post count in indexedDB ${totalPostCount}`);

  const occupation = await daoManager.getStorageQuotaOccupation();
  mainLogger.info(`Estimated storage quota occupation ${Number(occupation) * 100}%`);

  // When there are more than 300000 posts in indexedDB in total, or when more than 80% of
  // the local persist storage quota is used, the following code will remove posts
  // so that each group has no more than 20 latest posts saved in DB.
  if (totalPostCount > (isIEOrEdge ? 10000 : 100000) || occupation > 0.8) {
    const groupDao = daoManager.getDao(GroupDao);
    const allGroups: { id: number }[] = await groupDao.getAll();
    Promise.all(allGroups.map(({ id }) => postDao.purgePostsByGroupId(id, 20)));
  }
};

function transformData(data: Raw<Post>[] | Raw<Post>): Post[] {
  return ([] as Raw<Post>[]).concat(data).map((item: Raw<Post>) => transform<Post>(item));
}

export async function checkIncompletePostsOwnedGroups(posts: Post[]): Promise<Group[]> {
  if (posts.length) {
    const groupIds: number[] = [];
    posts.forEach(post => groupIds.push(post.group_id));
    const groupService: GroupService = GroupService.getInstance();
    const groups = await groupService.getGroupsByIds(groupIds);
    return groups;
  }
  return [];
}

export async function handleDeactivedAndNormalPosts(posts: Post[]): Promise<Post[]> {
  const postDao = daoManager.getDao(PostDao);
  // const postService = serviceManager.getInstance(PostService);
  // handle deactivated data and normal data
  const normalPosts = await utilsBaseHandleData({
    data: posts,
    dao: postDao,
    eventKey: ENTITY.POST,
  });

  // check if post's owner group exist in local or not
  // seems we only need check normal posts, don't need to check deactivated data
  await checkIncompletePostsOwnedGroups(normalPosts);
  handlePostsOverflow(normalPosts);
  return posts;
}

export async function handleDataFromSexio(data: Raw<Post>[]): Promise<void> {
  if (data.length === 0) {
    return;
  }
  const transformedData: Post[] = transformData(data);
  // handle edited posts not in local db
  const validPosts: Post[] = await IncomingPostHandler
    .handleGroupPostsDiscontinuousCausedByModificationTimeChange(transformedData);
  await handlePreInstedPosts(validPosts);
  if (validPosts.length) {
    handleDeactivedAndNormalPosts(validPosts);
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
  const exceedPostsHandled = await IncomingPostHandler
    .handelGroupPostsDiscontinuousCasuedByOverThreshold(
      transformedData,
      maxPostsExceed,
  );
  await handlePreInstedPosts(exceedPostsHandled);

  // handle discontinuous by modified
  const result = await IncomingPostHandler
    .handleGroupPostsDiscontinuousCausedByModificationTimeChange(exceedPostsHandled);
  handleDeactivedAndNormalPosts(result);
}

export default async function (data: Raw<Post>[], maxPostsExceed: boolean) {
  return handleDataFromIndex(data, maxPostsExceed);
}

export function baseHandleData(
  data: Raw<Post>[] | Raw<Post> | Post[] | Post,
  needTransformed = true,
): Promise<Post[]> {
  const transformedData: Post[] = needTransformed
    ? transformData(data as Raw<Post>[] | Raw<Post>)
    : Array.isArray(data)
      ? (data as Post[])
      : [data as Post];
  return handleDeactivedAndNormalPosts(transformedData);
}

export async function handlePreInstedPosts(posts: Post[] = []) {
  if (!posts || !posts.length) {
    return [];
  }
  const ids: number[] = [];
  const postService = PostService.getInstance<PostService>();
  await Promise.all(
    posts.map(async (element: Post) => {
      const obj = await postService.isVersionInPreInsert(element.version);
      if (obj && obj.existed) {
        ids.push(obj.id);
      }
    }),
  );

  if (ids.length) {
    const postDao = daoManager.getDao(PostDao);
    await postDao.bulkDelete(ids);
  }
  return ids;
}
