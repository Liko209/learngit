/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2018-12-28 09:16:00
 * Copyright © RingCentral. All rights reserved.
 */

export type IResponseError = {
  error: {
    code: string;
    message: string;
    validation: boolean;
  };
};

export type Raw<T> = Pick<T, Exclude<keyof T, 'id'>> & {
  _id: any;
  id?: any;
} & IResponseError;
