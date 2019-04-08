/*
 * @Author: Paynter Chen
 * @Date: 2019-04-04 08:54:53
 * Copyright © RingCentral. All rights reserved.
 */
export interface IErrorReporter {
  report: (error: Error) => void;
}
