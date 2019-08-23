/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2019-01-08 14:16:22
 * Copyright © RingCentral. All rights reserved.
 */

/**
 * this helper is only used for some simple operations
 * Do not do any DB, Network operations in this file
 */

import { GlipTypeUtil, TypeDictionary } from '../../../../utils';
import { versionHash } from '../../../../utils/mathUtils';
import { Markdown } from 'glipdown';
// global_url_regex
import { Post } from '../../entity';
import { RawPostInfo } from '../../types';
import { Raw } from '../../../../framework/model';
import { transform } from '../../../../service/utils';
import _ from 'lodash';
import { Item } from 'sdk/module/item/entity';
import { JSdkError, ERROR_CODES_SDK } from 'sdk/error';
import { Nullable } from 'sdk/types';

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

  buildRawPostInfo(
    params: RawPostInfo,
    preInsertIds: { uniqueIds: string[]; ids: number[] },
  ): Post {
    let vers = versionHash();
    while (preInsertIds.uniqueIds.includes(vers.toString())) {
      vers = versionHash();
    }
    let preId = GlipTypeUtil.generatePseudoIdByType(
      TypeDictionary.TYPE_ID_POST,
    );

    while (preInsertIds.ids.includes(preId)) {
      preId = GlipTypeUtil.generatePseudoIdByType(TypeDictionary.TYPE_ID_POST);
    }

    const links = this.buildLinksInfo(params.text);
    const now = Date.now();
    const buildPost: Post = {
      links,
      id: preId,
      created_at: now,
      modified_at: now,
      creator_id: params.userId,
      version: vers,
      new_version: vers,
      unique_id: vers.toString(),
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
      is_team_mention: params.isTeamMention,
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

  async buildShareItemPost(
    options: {
      fromPost: Post;
      itemIds: number[];
      targetGroupId: number;
    },
    getItemById: (id: number) => Promise<Nullable<Item>>,
  ) {
    const { fromPost, itemIds, targetGroupId } = options;
    const now = Date.now();
    const vers = versionHash();
    const linkIds = itemIds.filter(id =>
      GlipTypeUtil.isExpectedType(id, TypeDictionary.TYPE_ID_LINK),
    );
    const noLinkIds = _.difference(itemIds, linkIds);
    const mapToLinks = async (id: number) => {
      const item = await getItemById(id);
      if (!item || item.deactivated) {
        throw new JSdkError(ERROR_CODES_SDK.ITEM_DEACTIVATED, 'item deactivated.');
      }
      return {
        url: item.url,
        source: 'streamPostLink',
        history: [{ url: item.url }],
        do_not_render: false,
      };
    };
    const links = await Promise.all(
      linkIds.map(mapToLinks).filter(item => !!item),
    );
    return {
      links,
      is_new: true,
      source: 'Jupiter',
      version: vers,
      new_version: vers,
      created_at: now,
      modified_at: now,
      group_id: targetGroupId,
      item_ids: noLinkIds,
      from_company_id: fromPost.company_id,
      from_group_id: fromPost.group_id,
      item_data: fromPost.item_data || {
        version_map: {},
      },
    } as Post;
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
