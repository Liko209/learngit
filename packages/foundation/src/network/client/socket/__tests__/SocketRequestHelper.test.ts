/*
 * @Author: dennis.jiang (dennis.jiang@ringcentral.com)
 * @Date: 2018-07-27 11:13:43
 * Copyright © RingCentral. All rights reserved.
 */
import SocketRequestHelper from '../SocketRequestHelper';
import NetworkRequestBuilder from '../../NetworkRequestBuilder';
import { NETWORK_VIA } from '../../../network';
import SocketRequest from '../SocketRequest';
import { SocketResponseBuilder } from '../SocketResponseBuilder';
import { SocketResponse } from '../SocketResponse';

const getFakeRequest = () => {
  const request = new NetworkRequestBuilder()
    .setVia(NETWORK_VIA.SOCKET)
    .build() as SocketRequest;
  return request;
};
const getFakeResponse = () => {
  const response = new SocketResponseBuilder()
    .options({ request: { parameters: { request_id: '1' }}})
    .build() as SocketResponse;
  return response;
};
const manager = new SocketRequestHelper();
describe('SocketManager', () => {
  describe('newRequest', () => {
    it('should call registerRequestListener and setRequestTimer', () => {
      const spy = jest.spyOn(manager, 'setRequestTimer');
      const spy1 = jest.spyOn(manager, 'setRequestTimer');
      manager.newRequest(getFakeRequest());
      expect(spy).toBeCalled();
      expect(spy1).toBeCalled();
    });
  });

  describe('newResponse', () => {
    it('should call removeRequestTimer and handleRegisteredRequest', () => {
      const spy1 = jest.spyOn(manager, 'removeRequestTimer');
      const spy2 = jest.spyOn(manager, 'handleRegisteredRequest');
      manager.newResponse(getFakeResponse());
      expect(spy2).toBeCalled();
      expect(spy1).toBeCalled();
    });
  });
});
