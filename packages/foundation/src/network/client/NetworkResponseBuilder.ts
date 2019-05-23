/*
 * @Author: dennis.jiang (dennis.jiang@ringcentral.com)
 * @Date: 2018-06-04 15:44:05
 * Copyright © RingCentral. All rights reserved.
 */
import { IRequest, IResponse, RESPONSE_STATUS_CODE } from '../../network';

abstract class NetworkResponseBuilder<R extends IRequest> {
  data: any = {};
  statusText: string = '';
  headers: object = {};
  request: R;
  status: RESPONSE_STATUS_CODE;
  retryAfter: number = 6000;

  /**
   * Setter retryAfter
   * @param {number} value
   */
  public setRetryAfter(value: number) {
    this.retryAfter = value;
    return this;
  }

  /**
   * Setter data
   * @param {object } value
   */
  public setData(value: object) {
    this.data = value;
    return this;
  }

  /**
   * Setter status
   * @param {RESPONSE_STATUS_CODE} value
   */
  public setStatus(value: RESPONSE_STATUS_CODE) {
    this.status = value;
    return this;
  }

  /**
   * Setter statusText
   * @param {string} value
   */
  public setStatusText(value: string) {
    this.statusText = value;
    return this;
  }

  /**
   * Setter headers
   * @param {object } value
   */
  public setHeaders(value: object) {
    this.headers = value;
    return this;
  }

  /**
   * Setter request
   * @param {Request} value
   */
  public setRequest(value: R) {
    this.request = value;
    return this;
  }

  abstract build(): IResponse;
}
export default NetworkResponseBuilder;
