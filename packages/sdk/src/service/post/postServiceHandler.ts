/*
 * @Author: Lip Wang (lip.wangn@ringcentral.com)
 * @Date: 2018-03-08 11:15:48
 */
import { daoManager, AccountDao, PostDao } from '../../dao';
import {
  ACCOUNT_USER_ID,
  ACCOUNT_COMPANY_ID,
} from '../../dao/account/constants';
import { versionHash } from '../../utils/mathUtils';
import { Markdown } from 'glipdown';
import { Post } from '../../models';
import { RawPostInfo } from './types';
import { POST_STATUS } from '../constants';

// global_url_regex
export type LinksArray = { url: string }[];
class PostServiceHandler {
  // <a class='at_mention_compose' rel='{"id":21952077827}'>@Jeffrey Huang</a>
  static buildAtMentionsPeopleInfo(params: RawPostInfo): {
    text: string;
    at_mention_non_item_ids: number[];
  } {
    const { atMentions, users = [], text } = params;

    if (atMentions) {
      let renderedText = text;
      const ids = [];

      for (let i = 0; i < users.length; i += 1) {
        const userDisplay: string = users[i].display.replace(
          /([.?*+^$[\]\\(){}|-])/g,
          '\\$1',
        );
        const key = new RegExp(`@\\[${userDisplay}\\]:${users[i].id}:`, 'g');

        // tslint:disable-next-line:max-line-length
        const replacedText = `<a class='at_mention_compose' rel='{"id":${
          users[i].id
          }}'>@${users[i].display}</a>`;
        renderedText = renderedText.replace(key, replacedText);
        ids.push(users[i].id);
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

  static buildLinksInfo(params: RawPostInfo): LinksArray {
    const { text } = params;
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

  static buildPostInfo(params: RawPostInfo): Post {
    const userId: number = daoManager.getKVDao(AccountDao).get(ACCOUNT_USER_ID);
    const companyId: number = daoManager
      .getKVDao(AccountDao)
      .get(ACCOUNT_COMPANY_ID);
    const vers = versionHash();
    const atMentionsPeopleInfo = PostServiceHandler.buildAtMentionsPeopleInfo(
      params,
    );
    const links = PostServiceHandler.buildLinksInfo(params);
    const now = Date.now();
    return {
      links,
      id: vers,
      created_at: now,
      modified_at: now,
      creator_id: userId,
      version: vers,
      new_version: vers,
      is_new: true,
      model_size: 0,
      text: atMentionsPeopleInfo.text,
      group_id: Number(params.groupId),
      from_group_id: Number(params.groupId),
      item_id: params.itemId,
      item_ids: params.itemIds || [],
      post_ids: [],
      at_mention_item_ids: [],
      at_mention_non_item_ids: atMentionsPeopleInfo.at_mention_non_item_ids,
      company_id: companyId,
      deactivated: false,
      status: POST_STATUS.INPROGRESS,
    };
  }

  static buildResendPostInfo(post: Post) {
    post.status = POST_STATUS.INPROGRESS;
    return post;
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
    const atMentionsInfo: any = PostServiceHandler.buildAtMentionsPeopleInfo(
      params,
    );
    oldPost.text = atMentionsInfo.text;
    if (atMentionsInfo.at_mention_non_item_ids.length) {
      oldPost.at_mention_non_item_ids = atMentionsInfo.at_mention_non_item_ids;
    }
    delete oldPost.likes; // do we need this ?
    oldPost._id = oldPost.id;
    delete oldPost.id;

    return oldPost;
  }
}

export default PostServiceHandler;
