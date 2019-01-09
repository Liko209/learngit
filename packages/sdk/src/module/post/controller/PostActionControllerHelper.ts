/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2019-01-08 14:16:22
 * Copyright © RingCentral. All rights reserved.
 */

/**
 * this helper is only used for some simple operations
 * Do not do any DB, Network operations in this file
 */

import _ from 'lodash';
import { GlipTypeUtil, TypeDictionary } from '../../../utils';
import { versionHash } from '../../../utils/mathUtils';
import { Markdown } from 'glipdown';
// global_url_regex
import { Post } from '../entity';
import { RawPostInfo, SendPostType } from '../types';
import { Raw } from 'src/framework/model';
import { transform } from '../../../service/utils';

export type LinksArray = { url: string }[];

class PostActionControllerHelper {
  constructor() {}

  buildLinksInfo(text: string): LinksArray {
    let res: string[] = [];
    let matchedUrl: string[] = [];
    const urlArray: string[] = [];
    const links: LinksArray = [];
    res = res.concat(text);
    res &&
      res.forEach((item: string, index: number) => {
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
    const matchedNoneMdUrl = urlArray
      .toString()
      .match(Markdown.global_url_regex);
    matchedNoneMdUrl &&
      matchedNoneMdUrl.forEach((item: string) => {
        links.push({
          url: item,
        });
      });
    return links;
  }

  buildRawPostInfo(params: RawPostInfo): Post {
    const vers = versionHash();
    const links = this.buildLinksInfo(params.text);
    const now = Date.now();
    const buildPost: Post = {
      links,
      id: GlipTypeUtil.generatePseudoIdByType(TypeDictionary.TYPE_ID_POST),
      created_at: now,
      modified_at: now,
      creator_id: params.userId,
      version: vers,
      new_version: vers,
      is_new: true,
      model_size: 0,
      text: params.text,
      group_id: params.groupId,
      from_group_id: params.groupId,
      item_id: params.itemId,
      item_ids: params.itemIds || [],
      post_ids: [],
      at_mention_item_ids: [],
      at_mention_non_item_ids: params.mentionIds || [],
      company_id: params.companyId,
      deactivated: false,
    };

    // if (params.groupId && params.itemIds && params.itemIds.length > 0) {
    //   const itemData = await PostServiceHandler.buildVersionMap(
    //     params.groupId,
    //     params.itemIds,
    //   );

    //   if (itemData) {
    //     buildPost.item_data = itemData;
    //   }
    // }

    return buildPost;
  }

  buildModifiedPostInfo(info: SendPostType, oldPost: Post): Post {
    oldPost.new_version = versionHash();
    oldPost.is_new = false;
    const params = _.cloneDeep(info);
    params['companyId'] = oldPost.company_id;
    params['userId'] = oldPost.creator_id;
    oldPost.text = info.text;
    oldPost.at_mention_non_item_ids = info.mentionIds || [];
    delete oldPost.likes;
    return oldPost;
  }

  transformData(data: Raw<Post>[] | Raw<Post>): Post[] {
    return ([] as Raw<Post>[])
      .concat(data)
      .map((item: Raw<Post>) => transform<Post>(item));
  }

  transformLocalToServerType(data: Post): Raw<Post> {
    data._id = data.id;
    delete data.id;
    return data as Raw<Post>;
  }
}

export default PostActionControllerHelper;
