/*
 * @Author: Lily.li (lily.li@ringcentral.com)
 * @Date: 2018-06-12 14:34:57
 * Copyright © RingCentral. All rights reserved.
 */

const ALPHABET = '#ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

const LIMIT = 200;
const DIVIDING_DATA = 13700;

enum PREFIX_START_ENUM {
  TOP = 'top',
  BOTTOM = 'bottom',
}

interface IPage {
  prefix: string;
  exist: number;
  offset?: number;
  limit?: number;
  direction?: PREFIX_START_ENUM;
  total?: number;
}
interface IPageParams {
  prefix: string;
  offset: number;
  limit: number;
}

export {
  LIMIT,
  ALPHABET,
  IPage,
  IPageParams,
  PREFIX_START_ENUM,
  DIVIDING_DATA,
};
