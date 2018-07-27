/*
 * @Author: Lily.li (lily.li@ringcentral.com)
 * @Date: 2018-06-15 12:59:36
 * Copyright © RingCentral. All rights reserved.
 */

import {
  PREFIX_START_ENUM,
  ALPHABET,
  LIMIT,
  IPageParams,
  IPage
} from './constants';
import { PersonService } from 'sdk/service';

export default class Page {
  prefix: string;
  offset: number;
  limit: number;
  total: number;
  exist: number;
  prefixDirectionMap: Map<string, PREFIX_START_ENUM> = new Map();
  totalMap: Map<string, number> = new Map();
  service: PersonService;

  constructor(service: PersonService) {
    this.service = service;
  }

  get params(): IPageParams {
    return {
      prefix: this.prefix,
      offset: this.offset,
      limit: this.limit
    };
  }

  get nextPrefix(): string {
    const i = ALPHABET.indexOf(this.prefix);
    return ALPHABET[Math.min(i + 1, ALPHABET.length - 1)];
  }

  get prevPrefix(): string {
    if (this.prefix === 'A') return '#';
    const i = ALPHABET.indexOf(this.prefix);
    return ALPHABET[Math.max(i - 1, 0)];
  }

  setParams(params: IPage) {
    const { prefix, exist, limit, offset, direction } = params;
    this.prefix = prefix;
    this.exist = exist;
    this.limit = limit || LIMIT;
    this.offset = offset || 0;
    if (direction) {
      this.prefixDirectionMap.set(this.prefix, direction);
    }
  }

  async getNextParams(params?: IPage): Promise<IPageParams | void> {
    params && this.setParams(params);
    const remain = (await this.getTotalByPrefix(this.prefix)) - this.exist;
    // Z is complete
    if (remain <= 0 && this.prefix === this.nextPrefix) return;
    const direction =
      this.prefixDirectionMap.get(this.prefix) || PREFIX_START_ENUM.TOP;
    if (remain > 0 && direction === PREFIX_START_ENUM.TOP) {
      this.offset = this.exist;
    } else {
      this.prefix = this.nextPrefix;
      this.offset = 0;
      this.prefixDirectionMap.set(this.prefix, PREFIX_START_ENUM.TOP);
    }
    this.limit = LIMIT;
    return this.params;
  }

  async getPrevParams(params?: IPage): Promise<IPageParams | void> {
    params && this.setParams(params);
    let remain = (await this.getTotalByPrefix(this.prefix)) - this.exist;
    const direction = this.prefixDirectionMap.get(this.prefix);
    if (remain > 0 && direction === PREFIX_START_ENUM.BOTTOM) {
      this.limit = remain >= this.limit ? this.limit : remain;
    } else {
      this.prefix = this.prevPrefix;
      if (this.prefix === '#') return;
      remain = await this.getTotalByPrefix(this.prefix);
      this.limit = Math.min(LIMIT, remain);
      this.prefixDirectionMap.set(this.prefix, PREFIX_START_ENUM.BOTTOM);
    }
    this.offset = remain - this.limit > 0 ? remain - this.limit : 0;
    return this.params;
  }

  async getTotalByPrefix(prefix: string) {
    let count = this.totalMap.get(prefix);
    !count && (count = await this.service.getPersonsCountByPrefix(prefix));
    this.totalMap.set(prefix, count);
    return count;
  }
}
