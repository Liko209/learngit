/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-09-04 12:00:41
 * Copyright © RingCentral. All rights reserved.
 */
import { IEntity } from '../store';
import { BaseModel } from 'sdk/models';

export default class Base<T extends BaseModel> implements IEntity {
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
