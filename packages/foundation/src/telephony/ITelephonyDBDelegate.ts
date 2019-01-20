/*
 * @Author: Lewi Li (lewi.li@ringcentral.com)
 * @Date: 2019-01-18 14:24:22
 * Copyright © RingCentral. All rights reserved.
 */
interface ITelephonyDBDelegate {
  put(key: string, value: any): void;
  get(key: string): any;
}

export { ITelephonyDBDelegate };
