/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-11-07 17:59:17
 * Copyright © RingCentral. All rights reserved.
 */

import { computed, action } from 'mobx';
import { StoreViewModel } from '@/store/ViewModel';
import { BookmarkProps, BookmarkViewProps } from './types';
import { NewPostService } from 'sdk/module/post';
import { Profile } from 'sdk/module/profile/entity';
import { getSingleEntity } from '@/store/utils';
import { ENTITY_NAME } from '@/store';
import ProfileModel from '@/store/models/Profile';

class BookmarkViewModel extends StoreViewModel<BookmarkProps>
  implements BookmarkViewProps {
  @computed
  private get _id() {
    return this.props.id;
  }

  @computed
  private get _favoritePostIds() {
    return getSingleEntity<Profile, ProfileModel>(
      ENTITY_NAME.PROFILE,
      'favoritePostIds',
    );
  }

  @computed
  get isBookmark() {
    return this._favoritePostIds.includes(this._id);
  }

  @action
  bookmark = async (toBookmark: boolean): Promise<{ isFailed: boolean }> => {
    const postService: NewPostService = NewPostService.getInstance();
    const result = await postService.bookmarkPost(this._id, toBookmark);
    return {
      isFailed: result.isErr(),
    };
  }
}

export { BookmarkViewModel };
