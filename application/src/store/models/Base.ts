/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-09-04 12:00:41
 * Copyright © RingCentral. All rights reserved.
 */
import { Entity } from '../store';
import { IdModel } from 'sdk/framework/model';

export default class Base<T extends IdModel> implements Entity {
  id: number;
  data?: any;
  constructor(data: T) {
    const { id }: { id: number } = data;
    this.id = id;
  }

  toJS() {
    const descriptors = Object.getOwnPropertyDescriptors(this);
    const props: any = {};
    Object.keys(descriptors).forEach((key: string) => {
      props[key] = this[key];
    });
    return props;
  }
}

export interface IModelConstructor<T> {
  new (): T;
  fromJS: (data: any) => T;
}
