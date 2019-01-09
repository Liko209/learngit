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
  /**
   * return text simple:
   * <a class='at_mention_compose' rel='{"id":xxxx}'>@Lip Wang</a>
   */
  buildAtMentionsPeopleInfo(
    params: RawPostInfo,
  ): {
    text: string;
    at_mention_non_item_ids: number[];
  } {
    const { atMentions, users = [], text } = params;

    if (atMentions) {
      let renderedText = text;
      const ids = [];

      // this implementation has efficiency issue
      // should refactor at_mention with UI
      for (let i = 0; i < users.length; i += 1) {
        const userDisplay: string = users[i].display
          ? users[i].display.replace(/([.?*+^$[\]\\(){}|-])/g, '\\$1')
          : '';
        const key = new RegExp(`@\\[${userDisplay}\\]:${users[i].id}:`, 'g');

        // tslint:disable-next-line:max-line-length
        const replacedText = `<a class='at_mention_compose' rel='{"id":${
          users[i].id
        }}'>@${users[i].display}</a>`;
        const text = renderedText.replace(key, replacedText);
        if (text !== renderedText) {
          renderedText = text;
          ids.push(users[i].id);
        }
      }
      return {
        text: renderedText,
        at_mention_non_item_ids: ids,
      };
    }

    return {
      at_mention_non_item_ids: [],
      text: params.text,
    };
  }

  buildLinksInfo(text: string): LinksArray {
    let res: any;
    const links: LinksArray = [];

    res = text.match(Markdown.global_url_regex);
    res &&
      res.forEach((item: string) => {
        links.push({
          url: item,
        });
      });
    return links;
  }

  buildRawPostInfo(params: RawPostInfo): Post {
    const vers = versionHash();
    const atMentionsPeopleInfo = this.buildAtMentionsPeopleInfo(params);
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
      text: atMentionsPeopleInfo.text,
      group_id: params.groupId,
      from_group_id: params.groupId,
      item_id: params.itemId,
      item_ids: params.itemIds || [],
      post_ids: [],
      at_mention_item_ids: [],
      at_mention_non_item_ids: atMentionsPeopleInfo.at_mention_non_item_ids,
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
    const atMentionsInfo: any = this.buildAtMentionsPeopleInfo(
      params as RawPostInfo,
    );
    oldPost.text = atMentionsInfo.text;
    if (atMentionsInfo.at_mention_non_item_ids.length) {
      oldPost.at_mention_non_item_ids = atMentionsInfo.at_mention_non_item_ids;
    }
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
