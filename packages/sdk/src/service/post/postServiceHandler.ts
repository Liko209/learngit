/*
 * @Author: Lip Wang (lip.wangn@ringcentral.com)
 * @Date: 2018-03-08 11:15:48
 */
import _ from 'lodash';
import { daoManager, AccountDao, PostDao } from '../../dao';
import {
  ACCOUNT_USER_ID,
  ACCOUNT_COMPANY_ID,
} from '../../dao/account/constants';
import { versionHash } from '../../utils/mathUtils';
import { Markdown } from 'glipdown';
import { Post, PostItemData } from '../../module/post/entity';
import { ItemFile } from '../../module/item/entity';
import { RawPostInfo } from './types';
import ItemService from '../item';
import { GlipTypeUtil, TypeDictionary } from '../../utils';

// global_url_regex
export type LinksArray = { url: string }[];
class PostServiceHandler {
  static buildLinksInfo(params: RawPostInfo): LinksArray {
    const { text } = params;
    let res: string[] = [];
    let matchedUrl: string[] = [];
    const urlArray: string[] = [];
    const links: LinksArray = [];
    res = res.concat(text);
    res && res.forEach((item: string, index: number) => {
      matchedUrl = res[index].match(/[^\(\)]+(?=\))/g) || [];
      if (!matchedUrl.length) {
        urlArray.push(item);
      }
    });
    if (matchedUrl.length) {
      for (const k of matchedUrl) {
        if (k) {
          urlArray.push(k);
        }
      }
    }
    const matchedNoneMdUrl = urlArray.toString().match(Markdown.global_url_regex);
    matchedNoneMdUrl && matchedNoneMdUrl.forEach((item: string) => {
      links.push({
        url: item,
      });
    });
    return links;
  }

  static async buildVersionMap(
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

  static async buildPostInfo(params: RawPostInfo): Promise<Post> {
    const userId: number = daoManager.getKVDao(AccountDao).get(ACCOUNT_USER_ID);
    const companyId: number = daoManager
      .getKVDao(AccountDao)
      .get(ACCOUNT_COMPANY_ID);
    const vers = versionHash();
    const links = PostServiceHandler.buildLinksInfo(params);
    const now = Date.now();
    const buildPost: Post = {
      links,
      id: GlipTypeUtil.generatePseudoIdByType(TypeDictionary.TYPE_ID_POST),
      created_at: now,
      modified_at: now,
      creator_id: userId,
      version: vers,
      new_version: vers,
      is_new: true,
      model_size: 0,
      text: params.text,
      group_id: Number(params.groupId),
      from_group_id: Number(params.groupId),
      item_id: params.itemId,
      item_ids: params.itemIds || [],
      post_ids: [],
      at_mention_item_ids: [],
      at_mention_non_item_ids: params.mentionsIds || [],
      company_id: companyId,
      deactivated: false,
    };

    if (params.groupId && params.itemIds && params.itemIds.length > 0) {
      const itemData = await PostServiceHandler.buildVersionMap(
        params.groupId,
        params.itemIds,
      );

      if (itemData) {
        buildPost.item_data = itemData;
      }
    }

    return buildPost;
  }

  static async buildModifiedPostInfo(
    params: RawPostInfo,
  ): Promise<object | null> {
    if (!params.postId) {
      // TODO use a new type that requires postId instead of RawPostInfo,
      // And don't throw this error.
      throw new Error(`invalid post id: ${params.postId}`);
    }
    const postDao = daoManager.getDao(PostDao);

    const oldPost = await postDao.get(params.postId);
    if (!oldPost) {
      console.error(`invalid post id: ${params.postId}`);
      return null;
    }
    oldPost.new_version = versionHash();
    oldPost.is_new = false;
    oldPost.text = params.text;
    if (params.mentionsIds !== undefined && params.mentionsIds.length) {
      oldPost.at_mention_non_item_ids = params.mentionsIds;
    }
    delete oldPost.likes; // do we need this ?
    oldPost._id = oldPost.id;
    delete oldPost.id;

    return oldPost;
  }
}

export default PostServiceHandler;
