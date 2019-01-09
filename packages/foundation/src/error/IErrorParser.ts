/*
 * @Author: Paynter Chen
 * @Date: 2019-01-08 13:09:52
 * Copyright © RingCentral. All rights reserved.
 */
import { JError } from './JError';

export interface IErrorParser {
  getName(): string;

  parse(error: Error): JError | null;
}
