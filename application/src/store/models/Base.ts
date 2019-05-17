/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-09-04 12:00:41
 * Copyright © RingCentral. All rights reserved.
 */
import { Entity } from '../store';
import { IdModel, ModelIdType } from 'sdk/framework/model';

export default class Base<
  T extends IdModel<IdType>,
  IdType extends ModelIdType = number
> implements Entity<IdType> {
  id: IdType;
  data?: any;
  isMocked: boolean;
  constructor(data: T) {
    const { id, isMocked }: { id: IdType; isMocked?: boolean } = data;
    this.id = id;
    this.isMocked = isMocked || false;
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
