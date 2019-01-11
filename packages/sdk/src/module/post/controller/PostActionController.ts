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
import { ENTITY, SERVICE } from '../../../service/eventKey';
import { ProgressService, PROGRESS_STATUS } from '../../progress';
import { notificationCenter, GroupConfigService } from '../../../service';
import PostAPI from '../../../api/glip/post';
import { mainLogger } from 'foundation';
import { ErrorParserHolder } from '../../../error';
import { ItemService } from '../../item/service';
import { PostItemData } from '../entity/PostItemData';
import { ItemFile } from '../../../module/item/entity';
import { uniqueArray } from '../../../utils';

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
    let rawInfo = this._helper.buildRawPostInfo(paramsInfo);
    rawInfo = await this._buildItemVersionMap4Post(rawInfo);
    this.innerSendPost(rawInfo, false);
  }

  /**
   * 1. clean uploading files
   * 2. pre insert post
   */
  async innerSendPost(post: Post, isResend: boolean) {
    const hasItems = post.item_ids.length > 0;
    if (!isResend && hasItems) {
      // clean uploading files
      this._cleanUploadingFiles(post.group_id, post.item_ids);
    }

    await this._handlePreInsertProcess(post);

    if (hasItems) {
      // send post with items
      this._sendPostWithItems(post, isResend);
    } else {
      // send plain post
      this._sendPostToServer(post);
    }
  }

  private async _sendPostWithItems(post: Post, isResend: boolean) {
    const pseudoItems = this._getPseudoItemIdsFromPost(post);
    if (pseudoItems.length > 0) {
      if (isResend) {
        this._resendFailedItems(pseudoItems);
      } else {
        if (
          !this._hasItemInTargetStatus(post, PROGRESS_STATUS.INPROGRESS) // no item in progress
        ) {
          return await this.handleSendPostFail(post.id, post.group_id);
        }
      }
      return await this._sendPostWithPreInsertItems(post);
    }
    return this._sendPostToServer(post);
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

  async reSendPost(id: number) {
    if (id < 0) {
      const dao = daoManager.getDao(PostDao);
      const post = await dao.get(id);
      if (post) {
        return this.innerSendPost(post, true);
      }
    }
    mainLogger.warn(
      `PostActionController: invalid, should not resend, id ${id}`,
    );
    return null;
  }

  /**
   * private
   */

  private async _cleanUploadingFiles(groupId: number, itemIds: number[]) {
    const itemService: ItemService = ItemService.getInstance();
    itemService.cleanUploadingFiles(groupId, itemIds);
  }

  private async _handlePreInsertProcess(buildPost: Post): Promise<void> {
    const progressService: ProgressService = ProgressService.getInstance();
    progressService.addProgress(buildPost.id, {
      id: buildPost.id,
      status: PROGRESS_STATUS.INPROGRESS,
    });
    const dao = daoManager.getDao(PostDao);
    await dao.put(buildPost);
    notificationCenter.emitEntityUpdate(ENTITY.POST, [buildPost]);
  }

  private async _buildItemVersionMap4Post(rawInfo: Post) {
    const needBuildItemVersionMap = rawInfo.item_ids && rawInfo.item_ids.length;
    if (needBuildItemVersionMap) {
      const result = await this._buildItemVersionMap(
        rawInfo.group_id,
        rawInfo.item_ids,
      );
      if (result) {
        rawInfo.item_data = result;
      }
    }
    return rawInfo;
  }

  private async _buildItemVersionMap(
    groupId: number,
    itemIds: number[],
  ): Promise<PostItemData | undefined> {
    if (itemIds && itemIds.length > 0) {
      const itemService: ItemService = ItemService.getInstance();
      const uploadFiles = itemService.getUploadItems(groupId);
      const needCheckItemFiles = _.intersectionWith(
        uploadFiles,
        itemIds,
        (itemFile: ItemFile, id: number) => {
          return id === itemFile.id && !itemFile.is_new;
        },
      );
      if (needCheckItemFiles.length > 0) {
        const itemData: PostItemData = { version_map: {} };
        const promises = needCheckItemFiles.map(itemFile =>
          itemService.getItemVersion(itemFile),
        );
        const versions = await Promise.all(promises);
        for (let i = 0; i < needCheckItemFiles.length; i++) {
          if (versions[i]) {
            itemData.version_map[needCheckItemFiles[i].id] = versions[i];
          }
        }
        return itemData;
      }
    }
    return undefined;
  }

  private _getPseudoItemIdsFromPost(post: Post) {
    return post.item_ids.filter(x => x < 0);
  }

  private async _resendFailedItems(pseudoItemIds: number[]) {
    const itemService: ItemService = ItemService.getInstance();
    await itemService.resendFailedItems(pseudoItemIds);
  }

  private _hasItemInTargetStatus(post: Post, status: PROGRESS_STATUS) {
    return this._getPseudoItemStatusInPost(post).indexOf(status) > -1;
  }

  private _getPseudoItemStatusInPost(post: Post) {
    const itemService: ItemService = ItemService.getInstance();
    return uniqueArray(itemService.getItemsSendingStatus(post.item_ids));
  }

  /**
   * _sendPostWithPreInsertItems begin
   */

  // private _updatePreInsertItem(
  //   post: Post,
  //   params: {
  //     status: PROGRESS_STATUS;
  //     preInsertId: number;
  //     updatedId: number;
  //   },
  // ) {
  //   let shouldUpdatePost: boolean = true;
  //   const { status, preInsertId, updatedId } = params;
  //   if (status === PROGRESS_STATUS.CANCELED) {
  //     _.remove(post.item_ids, (id: number) => {
  //       return id === preInsertId;
  //     });
  //   } else if (status === PROGRESS_STATUS.SUCCESS) {
  //     // update post to db
  //     if (updatedId !== preInsertId) {
  //       post.item_ids = post.item_ids.map((id: number) => {
  //         return id === preInsertId ? updatedId : id;
  //       });

  //       if (post.item_data && post.item_data.version_map) {
  //         const versionMap = post.item_data.version_map;
  //         Object.keys(versionMap).forEach((strKey: string) => {
  //           if (strKey === preInsertId.toString()) {
  //             versionMap[updatedId] = versionMap[preInsertId];
  //             delete versionMap[preInsertId];
  //           }
  //         });
  //       }
  //     }
  //   } else {
  //     shouldUpdatePost = false;
  //   }
  //   return {
  //     post,
  //     shouldUpdatePost,
  //   };
  // }

  // private async _updatePreInsertedItemStatusInPost(clonePost: Post) {
  //   const preHandle = (
  //     partialPost: Partial<Raw<Post>>,
  //     originalPost: Post,
  //   ): Partial<Raw<Post>> => {
  //     const item_ids = clonePost.item_ids || [];
  //     return {
  //       ...partialPost,
  //       item_ids,
  //     };
  //   };
  //   await this.partialModifyController.updatePartially(
  //     clonePost.id,
  //     preHandle,
  //     async (updatedPost: Post) => {
  //       return updatedPost;
  //     },
  //   );
  // }

  private async _sendPostWithPreInsertItems(post: Post): Promise<PostData[]> {
    // let isPostSent: boolean = false;
    // const listener = async (params: {
    //   status: PROGRESS_STATUS;
    //   preInsertId: number;
    //   updatedId: number;
    // }) => {
    //   const { preInsertId } = params;
    //   if (!post.item_ids.includes(preInsertId)) {
    //     return;
    //   }
    //   const result = this._updatePreInsertItem.bind(this)(post, params);
    //   const clonePost = _.cloneDeep(result.post);
    //   const itemStatuses = this._getPseudoItemStatusInPost.bind(this)(
    //     clonePost,
    //   );
    //   console.log(
    //     '-----itemStatuses--------',
    //     _.cloneDeep(result),
    //     '================',
    //     _.cloneDeep(clonePost),
    //     '====invalid===',
    //     itemStatuses,
    //   );
    //   if (result.post) {
    //     await this._updatePreInsertedItemStatusInPost.bind(this)(clonePost);
    //     const itemService: ItemService = ItemService.getInstance();
    //     itemService.deleteFileItemCache(preInsertId);
    //   }
    //   if (this._isValidPost(clonePost)) {
    //     if (
    //       !isPostSent &&
    //       this._getPseudoItemIdsFromPost(clonePost).length === 0
    //     ) {
    //       isPostSent = true;
    //       console.log('--------clonePost------------>>>>', clonePost);
    //       await this._sendPostToServer.bind(this)(clonePost);
    //     }
    //   } else {
    //     await this.deletePost(clonePost.id);
    //   }
    //   // remove listener if item files are not in progress
    //   if (!itemStatuses.includes(PROGRESS_STATUS.INPROGRESS)) {
    //     // has failed
    //     if (itemStatuses.includes(PROGRESS_STATUS.FAIL)) {
    //       debugger;
    //       this.handleSendPostFail.bind(this)(clonePost.id, post.group_id);
    //     }
    //     notificationCenter.removeListener(
    //       SERVICE.ITEM_SERVICE.PSEUDO_ITEM_STATUS,
    //       listener,
    //     );
    //   }
    // };
    // notificationCenter.on(SERVICE.ITEM_SERVICE.PSEUDO_ITEM_STATUS, listener);
    // const itemService: ItemService = ItemService.getInstance();
    // itemService.sendItemData(post.group_id, post.item_ids);
    // return [];
    let isPostSent: boolean = false;
    const listener = async (params: {
      status: PROGRESS_STATUS;
      preInsertId: number;
      updatedId: number;
    }) => {
      const { status, preInsertId, updatedId } = params;
      if (!post.item_ids.includes(preInsertId)) {
        return;
      }

      let shouldUpdatePost: boolean = true;
      if (status === PROGRESS_STATUS.CANCELED) {
        _.remove(post.item_ids, (id: number) => {
          return id === preInsertId;
        });
      } else if (status === PROGRESS_STATUS.SUCCESS) {
        // update post to db
        if (updatedId !== preInsertId) {
          post.item_ids = post.item_ids.map((id: number) => {
            return id === preInsertId ? updatedId : id;
          });

          if (post.item_data && post.item_data.version_map) {
            const versionMap = post.item_data.version_map;
            Object.keys(versionMap).forEach((strKey: string) => {
              if (strKey === preInsertId.toString()) {
                versionMap[updatedId] = versionMap[preInsertId];
                delete versionMap[preInsertId];
              }
            });
          }
        }
      } else {
        shouldUpdatePost = false;
      }

      const clonePost = _.cloneDeep(post);
      if (shouldUpdatePost) {
        const preHandle = (
          partialPost: Partial<Raw<Post>>,
          originalPost: Post,
        ): Partial<Raw<Post>> => {
          const item_ids = clonePost.item_ids || [];
          return {
            ...partialPost,
            item_ids,
          };
        };
        await this.partialModifyController.updatePartially(
          clonePost.id,
          preHandle,
          async (updatedPost: Post) => {
            return updatedPost;
          },
        );

        const itemService: ItemService = ItemService.getInstance();
        itemService.deleteFileItemCache(preInsertId);
      }

      if (this._isValidPost(clonePost)) {
        if (
          !isPostSent &&
          this._getPseudoItemIdsFromPost(clonePost).length === 0
        ) {
          isPostSent = true;
          await this._sendPostToServer.bind(this)(clonePost);
        }
      } else {
        await this.deletePost(clonePost.id);
      }

      const itemStatuses = this._getPseudoItemStatusInPost(clonePost);
      // remove listener if item files are not in progress
      if (!itemStatuses.includes(PROGRESS_STATUS.INPROGRESS)) {
        // has failed
        if (itemStatuses.includes(PROGRESS_STATUS.FAIL)) {
          this.handleSendPostFail(clonePost.id, post.group_id);
        }

        notificationCenter.removeListener(
          SERVICE.ITEM_SERVICE.PSEUDO_ITEM_STATUS,
          listener,
        );
      }
    };

    notificationCenter.on(SERVICE.ITEM_SERVICE.PSEUDO_ITEM_STATUS, listener);

    const itemService: ItemService = ItemService.getInstance();
    itemService.sendItemData(post.group_id, post.item_ids);

    return [];
  }

  /**
   * _sendPostWithPreInsertItems end
   */

  private _isValidPost(post: Post) {
    return post && (post.text.length > 0 || post.item_ids.length > 0);
  }
}

export { PostActionController };
