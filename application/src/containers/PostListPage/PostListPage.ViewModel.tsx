/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-11-08 13:42:41
 * Copyright © RingCentral. All rights reserved.
 */

import { AbstractViewModel } from '@/base';
import { POST_LIST_TYPE, PostListPageProps } from './types';
import { computed, observable } from 'mobx';
import { getSingleEntity } from '@/store/utils';
import { ENTITY_NAME } from '@/store/constants';
import { MyState } from 'sdk/src/models';
import MyStateModel from '../../store/models/MyState';

type DataMap = {
  [key: string]: {
    caption: string;
    idListProvider: () => number[];
  };
};

class PostListPageViewModel extends AbstractViewModel {
  private _dataMap: DataMap = {
    [POST_LIST_TYPE.mentions]: {
      caption: '@mentions',
      idListProvider: () => {
        return getSingleEntity<MyState, MyStateModel>(
          ENTITY_NAME.MY_STATE,
          'atMentionPostIds',
        );
      },
    },
  };

  @observable
  private _type: POST_LIST_TYPE;

  @computed
  get type(): POST_LIST_TYPE {
    return this._type;
  }

  @computed
  get caption(): string {
    if (this._type && this._dataMap[this._type]) {
      return this._dataMap[this._type].caption;
    }
    return '';
  }

  @computed
  get ids(): number[] {
    if (this._type && this._dataMap[this._type]) {
      return this._dataMap[this._type].idListProvider();
    }
    return [];
  }

  onReceiveProps(props: PostListPageProps) {
    if (
      Object.values(POST_LIST_TYPE).includes(props.type) &&
      this._type !== props.type
    ) {
      this._type = props.type as POST_LIST_TYPE;
    }
  }
}

export { PostListPageViewModel };
