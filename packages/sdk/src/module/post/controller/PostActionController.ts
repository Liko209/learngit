/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2018-12-20 13:54:00
 * Copyright © RingCentral. All rights reserved.
 */
import { Post } from '../entity';
import { Raw } from '../../../framework/model';
import _ from 'lodash';
import { IPartialModifyController } from '../../../framework/controller/interface/IPartialModifyController';
import { IRequestController } from '../../../framework/controller/interface/IRequestController';
import { daoManager, PostDao, AccountDao } from '../../../dao';
import {
  ACCOUNT_USER_ID,
  ACCOUNT_COMPANY_ID,
} from '../../../dao/account/constants';
import PostActionControllerHelper from './PostActionControllerHelper';
import { EditPostType, SendPostType } from '../types';
import {
  transform,
  baseHandleData as utilsBaseHandleData,
} from '../../../service/utils';
import { ENTITY } from '../../../service/eventKey';
import { ProgressService, PROGRESS_STATUS } from '../../progress';
import { notificationCenter, GroupConfigService } from '../../../service';
import PostAPI from '../../../api/glip/post';
import { mainLogger } from 'foundation';
import { ErrorParserHolder } from '../../../error';

type HandlePostType = {
  data: Raw<Post> | Raw<Post>[] | Post | Post[];
  shouldCheckGroup: boolean;
  shouldCheckDisContinue: boolean;
  shouldSave: boolean;
};

type PostData = {
  id: number;
  data: Post;
};

class PostActionController {
  private _helper: PostActionControllerHelper;
  constructor(
    public partialModifyController: IPartialModifyController<Post>,
    public requestController: IRequestController<Post>,
  ) {
    this._helper = new PostActionControllerHelper();
  }

  async likePost(
    postId: number,
    personId: number,
    toLike: boolean,
  ): Promise<Post | null> {
    const preHandlePartial = (
      partialPost: Partial<Raw<Post>>,
      originalPost: Post,
    ): Partial<Raw<Post>> => {
      const likes = _.cloneDeep(originalPost.likes) || [];
      const index = likes.indexOf(personId);
      if (toLike) {
        if (index === -1) {
          likes.push(personId);
        }
      } else {
        if (index > -1) {
          likes.splice(index, 1);
        }
      }
      return {
        ...partialPost,
        likes,
      };
    };
    return this.partialModifyController.updatePartially(
      postId,
      preHandlePartial,
      async (newPost: Post) => {
        return this.requestController.put(newPost);
      },
    );
  }

  /**
   * edit post does not need to do pre-insert
   */
  async editPost(params: EditPostType) {
    const postDao = daoManager.getDao(PostDao);
    const oldPost = await postDao.get(params.postId);
    if (!oldPost) {
      throw new Error(`invalid post id: ${params.postId}`);
    }
    const newPostInfo = this._helper.buildModifiedPostInfo(params, oldPost);
    const serverTypeInfo = this._helper.transformLocalToServerType(newPostInfo);
    const result = await this.requestController.put(serverTypeInfo);
    this.handlePostResponseData(result);
  }

  async handlePostResponseData(data: Raw<Post> | Raw<Post>[] | Post | Post[]) {
    const paras: HandlePostType = {
      data,
      shouldCheckGroup: false,
      shouldCheckDisContinue: false,
      shouldSave: true,
    };
    return this.handlePost(paras);
  }

  async isContinuousWithLocalPost() {
    return true;
  }

  async handlePost(params: HandlePostType) {
    const transformedPost: Post[] = this._helper.transformData(params.data as
      | Raw<Post>[]
      | Raw<Post>);

    const groupedPosts = _.groupBy(transformedPost, 'group_id');
    const postDao = daoManager.getDao(PostDao);
    const normalPosts = _.flatten(
      await Promise.all(
        Object.values(groupedPosts).map(async (posts: Post[]) => {
          let shouldSave = params.shouldSave;
          if (params.shouldCheckDisContinue) {
            shouldSave = await this.isContinuousWithLocalPost();
            // shouldSave = !!(await isContinuousWithLocalData(posts));
          }
          const resultPosts = await utilsBaseHandleData({
            data: posts,
            dao: postDao,
            eventKey: ENTITY.POST,
            noSavingToDB: !shouldSave,
          });
          return resultPosts;
        }),
      ),
    );

    if (params.shouldCheckGroup) {
      const groupIds = Object.keys(groupedPosts).map(id => Number(id));
      await this.checkGroups(groupIds);
    }
    return normalPosts;
  }

  async checkGroups(groupIds: number[]) {
    // call group service to make sure all groups in local
    return true;
  }

  async sendPost(params: SendPostType) {
    const userId: number = daoManager.getKVDao(AccountDao).get(ACCOUNT_USER_ID);
    const companyId: number = daoManager
      .getKVDao(AccountDao)
      .get(ACCOUNT_COMPANY_ID);
    const paramsInfo = {
      userId,
      companyId,
      ...params,
    };
    const rawInfo = this._helper.buildRawPostInfo(paramsInfo);
    const needBuildItemVersionMap =
      params.groupId && params.itemIds && params.itemIds.length;
    if (needBuildItemVersionMap) {
      // TODO
    }
    this.innerSendPost(rawInfo, false);
  }

  async innerSendPost(post: Post, isResend: boolean) {
    const hasItems = post.item_ids.length > 0;
    if (!isResend && hasItems) {
      // clean uploading files
    }
    if (hasItems) {
      // send post with items
    } else {
      // send plain post
      this._sendPostToServer(post);
    }
  }

  private async _sendPostToServer(post: Post): Promise<PostData[]> {
    const preInsertId = post.id;
    delete post.id;
    try {
      const resp = await PostAPI.sendPost(post);
      const data = resp.expect('send post failed');
      return this.handleSendPostSuccess(data, preInsertId);
    } catch (e) {
      this.handleSendPostFail(preInsertId, post.group_id);
      throw ErrorParserHolder.getErrorParser().parse(e);
    }
  }

  async handleSendPostSuccess(
    data: Raw<Post>,
    preInsertId: number,
  ): Promise<PostData[]> {
    /**
     * 1. remove progress
     * 2. emit replace notification
     * 3. update failure Ids
     * 4. delete pre inserted post
     * 5. put in real post
     */
    const progressService: ProgressService = ProgressService.getInstance();
    progressService.deleteProgress(preInsertId);

    const post = transform<Post>(data);
    const obj: PostData = {
      id: preInsertId,
      data: post,
    };
    const result = [obj];
    const replacePosts = new Map<number, Post>();
    replacePosts.set(preInsertId, post);

    notificationCenter.emitEntityReplace(ENTITY.POST, replacePosts);
    const dao = daoManager.getDao(PostDao);

    const groupConfigService: GroupConfigService = GroupConfigService.getInstance();
    await groupConfigService.deletePostId(post.group_id, preInsertId);

    await dao.delete(preInsertId);
    await dao.put(post);
    return result;
  }

  async handleSendPostFail(preInsertId: number, groupId: number) {
    const progressService: ProgressService = ProgressService.getInstance();
    progressService.updateProgress(preInsertId, {
      id: preInsertId,
      status: PROGRESS_STATUS.FAIL,
    });

    const groupConfigService: GroupConfigService = GroupConfigService.getInstance();
    await groupConfigService.addPostId(groupId, preInsertId);
    return [];
  }

  /**
   * deletePost begin
   */

  private async _deletePreInsertedPost(post: Post): Promise<boolean> {
    /**
     * 1. delete from progress
     * 2. delete indexDB
     * 3. delete from pre inserted config
     * 4. delete from failure config
     */
    // 1
    const progressService: ProgressService = ProgressService.getInstance();
    progressService.deleteProgress(post.id);

    notificationCenter.emitEntityDelete(ENTITY.POST, [post.id]);
    // 2
    const postDao = daoManager.getDao(PostDao);
    postDao.delete(post.id);

    // 3 TODO

    // 4
    const groupConfigService: GroupConfigService = GroupConfigService.getInstance();
    groupConfigService.deletePostId(post.group_id, post.id); // does not need to wait
    return true;
  }

  private async _deletePostFromRemote(post: Post): Promise<boolean> {
    post.deactivated = true;
    const serverTypeInfo = this._helper.transformLocalToServerType(post);
    try {
      const result = await this.requestController.put(serverTypeInfo);
      this.handlePostResponseData(result);
      return true;
    } catch (e) {
      mainLogger.warn(`modify post error ${JSON.stringify(e)}`);
      return false;
    }
  }

  async deletePost(id: number): Promise<boolean> {
    const postDao = daoManager.getDao(PostDao);
    const post = (await postDao.get(id)) as Post;
    if (id < 0) {
      return this._deletePreInsertedPost(post);
    }
    return this._deletePostFromRemote(post);
  }

  /**
   * deletePost end
   */
}

export { PostActionController };
