/*
 * @Author: Steve Chen (steve.chen@ringcentral.com)
 * @Date: 2018-10-05 23:07:55
 * Copyright © RingCentral. All rights reserved.
 */
import { ListStore } from '../index';

const checkListStore = <T>(listStore: ListStore<T>, expectData: T[]) => {
  expect(listStore.getItems()).toEqual(expectData);
};
export default checkListStore;
