/*
 * @Author: Lip Wang (lip.wangn@ringcentral.com)
 * @Date: 2018-03-22 10:53:42
 * Copyright © RingCentral. All rights reserved.
 */

import { daoManager } from '../../dao';
import PostDao from '../../dao/post';
import { Post } from '../../models';
import { mainLogger } from 'foundation';

// greater than or equal to this indicate the local post should be dirty since they can not use anymore becasue
// they are not continues with server pushed data;
const ServerIndexPostMaxSize = 50;

export type GroupPosts = {
  [groupId: number]: Post[];
};

class IncomingPostHandler {
  // categorize the posts based on group, if one group has greater than or equal 50 posts, mark the posts of this group
  static async handelGroupPostsDiscontinuousCasuedByOverThreshold(transformedData: Post[], maxPostsExceed: boolean) {
    mainLogger.info(`maxPostsExceed: ${maxPostsExceed} transformedData.length: ${transformedData.length}`);
    if (!(maxPostsExceed && transformedData.length >= ServerIndexPostMaxSize)) {
      return transformedData;
    }
    const groupPostsNumber = {};
    for (let i = 0; i < transformedData.length; i += 1) {
      if (groupPostsNumber[transformedData[i].group_id]) {
        groupPostsNumber[transformedData[i].group_id].push(transformedData[i].id);
      } else {
        groupPostsNumber[transformedData[i].group_id] = [transformedData[i].id];
      }
    }
    const keys = Object.keys(groupPostsNumber);
    const postsShouldBeRemovedGroupIds = [];
    for (let i = 0; i < keys.length; i += 1) {
      if (groupPostsNumber[keys[i]].length >= ServerIndexPostMaxSize) {
        postsShouldBeRemovedGroupIds.push(Number(keys[i]));
      }
    }
    try {
      if (postsShouldBeRemovedGroupIds.length) {
        const dao = daoManager.getDao(PostDao);
        let postsInDB: Post[] = [];
        await Promise.all(
          postsShouldBeRemovedGroupIds.map(async id => {
            const posts = await dao.queryPostsByGroupId(id, 0, 9999);
            postsInDB = postsInDB.concat(posts);
          })
        );
        if (postsInDB.length) {
          const ids = postsInDB.map(item => item.id);
          dao.bulkDelete(ids);
          // should notifiy ???
          return transformedData.filter(item => ids.indexOf(item.id) === -1);
        }
      }
      return transformedData;
    } catch (e) {
      mainLogger.warn(`handelGroupPostsDiscontinuousCasuedByOverThreshold, ${e}`);
      return [];
    }
  }

  static isGroupPostsDiscontinuous(posts: Post[]) {
    for (let i = 0; i < posts.length; i += 1) {
      if (posts[i].modified_at && posts[i].created_at !== posts[i].modified_at) {
        return true;
      }
    }
    return false;
  }

  static async removeDiscontinuousPosts(groupPosts: GroupPosts): Promise<number[]> {
    const keys = Object.keys(groupPosts);
    const groupIds = [];
    const postQuerys = [];
    const dao = daoManager.getDao(PostDao);

    for (let i = 0; i < keys.length; i += 1) {
      if (IncomingPostHandler.isGroupPostsDiscontinuous(groupPosts[keys[i]])) {
        const key = Number(keys[i]);
        groupIds.push(key);
        postQuerys.push(dao.queryOldestPostByGroupId(key));
      }
    }
    try {
      const result = await Promise.all(postQuerys);

      // 1 filter out the post which could cause discontinous
      let shouldBeMovedPosts: Post[] = [];
      for (let i = 0; i < groupIds.length; i += 1) {
        // if (result[i] === undefined) {
        if (!result || !result[i]) {
          shouldBeMovedPosts = shouldBeMovedPosts.concat(groupPosts[groupIds[i]]);
        } else {
          let tmpPosts = groupPosts[groupIds[i]];
          tmpPosts = tmpPosts.sort((post1: Post, post2: Post) => post1.created_at - post2.created_at);
          // case b, post 6 in local db
          // incoming posts: 1,2,3,4,5,6; 5 is modified, should discard 1,2,3,4,5
          // that's why we need order
          let lastModifiedIndex = -1;
          for (let j = 0; j < tmpPosts.length; j += 1) {
            if (
              tmpPosts[j].created_at !== tmpPosts[j].modified_at &&
              tmpPosts[j].created_at < (result[i] as NonNullable<Post>).created_at
            ) {
              lastModifiedIndex = j;
            }
          }
          if (lastModifiedIndex >= 0) {
            shouldBeMovedPosts = shouldBeMovedPosts.concat(tmpPosts.slice(0, lastModifiedIndex + 1));
          }
        }
      }

      // 2 remove posts
      if (shouldBeMovedPosts.length > 0) {
        const ids = [];
        for (let i = 0; i < shouldBeMovedPosts.length; i += 1) {
          ids.push(shouldBeMovedPosts[i].id);
        }
        await dao.bulkDelete(ids);
        return ids;
      }
      return [];
    } catch (e) {
      return [];
    }
  }

  static async handleGroupPostsDiscontinuousCausedByModificationTimeChange(posts: Post[]) {
    const groupPosts: GroupPosts = {};
    for (let i = 0; i < posts.length; i += 1) {
      if (groupPosts[posts[i].group_id]) {
        groupPosts[posts[i].group_id].push(posts[i]);
      } else {
        groupPosts[posts[i].group_id] = [posts[i]];
      }
    }
    const removedIds = await IncomingPostHandler.removeDiscontinuousPosts(groupPosts);
    const resultPosts = posts.filter((item: Post) => removedIds.indexOf(item.id) === -1);
    return resultPosts;
  }

  static async handleEditedPostNoInDB(transformedData: Post[]) {
    const editedPostIds = [];
    for (let i = 0; i < transformedData.length; i += 1) {
      if (transformedData[i].modified_at && transformedData[i].created_at !== transformedData[i].modified_at) {
        editedPostIds.push(transformedData[i].id);
      }
    }

    try {
      if (editedPostIds.length !== 0) {
        const dao = daoManager.getDao(PostDao);
        const postsInDB: Post[] = await dao.queryManyPostsByIds(editedPostIds);
        const editedPostsNotInDBIds = editedPostIds.filter(
          id => postsInDB.filter((item: Post) => item.id === id).length === 0
        );
        if (editedPostsNotInDBIds.length !== 0) {
          return transformedData.filter(item => editedPostsNotInDBIds.indexOf(item.id) === -1);
        }
      }
      return transformedData;
    } catch (e) {
      return [];
    }
  }

  static getDeactivatedPosts(validPosts: Post[]) {
    const deactivedPosts = [];
    for (let i = 0; i < validPosts.length; i += 1) {
      if (validPosts[i].deactivated) {
        deactivedPosts.push(validPosts[i]);
      }
    }
    return deactivedPosts;
  }

  static removeDeactivedPostFromValidPost(validPost: Post[], deactivedPosts: Post[]) {
    return validPost.filter(item => {
      for (let i = 0; i < deactivedPosts.length; i += 1) {
        if (item.id === deactivedPosts[i].id) {
          return false;
        }
      }
      return true;
    });
  }
}

export default IncomingPostHandler;
