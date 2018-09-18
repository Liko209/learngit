/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-09-18 10:08:57
 * Copyright © RingCentral. All rights reserved.
 */
import _ from 'lodash';
import { action, observable } from 'mobx';
import { AbstractViewModel } from '@/base';
import { onScrollToBottom, onScrollToTop } from '@/plugins/InfiniteListPlugin';
import {
  handleError,
  UIError,
  ERROR_HANDLER,
} from '@/plugins/ErrorHandlerPlugin';
import { InfiniteListDemoViewProps } from './types';

class InfiniteListDemoViewModel extends AbstractViewModel
  implements InfiniteListDemoViewProps {
  @observable
  items: number[] = _.range(0, 200);

  @action.bound
  @onScrollToTop
  async fetchPrev() {
    await this.wait(1000);
    const newItems = _.range(this.items.length, this.items.length + 100);
    this.items.unshift(...newItems);
  }

  @action.bound
  @onScrollToBottom
  @handleError
  async fetchNext() {
    await this.wait(500);

    // Produce random error
    const rand = _.random(2);
    switch (rand) {
      case 0:
        // This will not be catch.
        throw new Error('Failed to fetch next page');
      case 1:
        // This will be catch by `AlertErrorHandler` and show a alert.
        throw new UIError({
          message: 'Failed to fetch next page',
          handler: ERROR_HANDLER.ALERT,
        });
      case 2:
      default:
        // No error
        break;
    }

    await this.wait(500);
    const newItems = _.range(this.items.length, this.items.length + 100);
    this.items.push(...newItems);
  }

  async wait(time: number) {
    return new Promise((resolve: Function) => {
      setTimeout(resolve, time);
    });
  }
}

export { InfiniteListDemoViewModel };
