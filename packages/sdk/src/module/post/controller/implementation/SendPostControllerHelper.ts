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
import { GlipTypeUtil, TypeDictionary } from '../../../../utils';
import { versionHash } from '../../../../utils/mathUtils';
import { Markdown } from 'glipdown';
// global_url_regex
import { Post } from '../../entity';
import { RawPostInfo } from '../../types';
import { Raw } from '../../../../framework/model';
import { transform } from '../../../../service/utils';

export type LinksArray = { url: string }[];

class SendPostControllerHelper {
  constructor() {}

  buildLinksInfo(text: string): LinksArray {
    const links: LinksArray = [];
    const matchedNoneMdUrl = text.match(Markdown.global_url_regex);
    matchedNoneMdUrl &&
      matchedNoneMdUrl.forEach((item: string) => {
        !item.includes('@') &&
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
      unique_id: String(vers),
      is_new: true,
      model_size: 0,
      text: params.text,
      group_id: params.groupId,
      from_group_id: params.groupId,
      item_id: params.itemId,
      item_ids: params.itemIds || [],
      post_ids: [],
      at_mention_item_ids: params.mentionItemIds || [],
      at_mention_non_item_ids: params.mentionNonItemIds || [],
      company_id: params.companyId,
      deactivated: false,
      parent_id: params.parentId,
      source: 'Jupiter',
    };

    if (params.annotation) {
      buildPost.annotation = {
        x_percent: params.annotation.xPercent,
        y_percent: params.annotation.yPercent,
        stored_file_version: params.annotation.storedFileVersion,
        page: params.annotation.page,
        anno_id: params.annotation.annoId,
      };
    }

    return buildPost;
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

export default SendPostControllerHelper;
