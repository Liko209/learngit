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
    .options({ request: { parameters: { request_id: '1' } } })
    .build() as SocketResponse;
  return response;
};
let manager: SocketRequestHelper;
describe('SocketManager', () => {
  function setUp() {
    jest.useFakeTimers();
    manager = new SocketRequestHelper();
  }

  function clearMocks() {
    jest.clearAllTimers();
    jest.resetAllMocks();
    jest.restoreAllMocks();
    jest.clearAllMocks();
  }

  describe('newRequest', () => {
    beforeEach(() => {
      clearMocks();
      setUp();
    });
    it('should call registerRequestListener and setRequestTimer', () => {
      const spy = jest.spyOn(manager, '_setRequestTimer');
      const spy1 = jest.spyOn(manager, '_setRequestTimer');
      manager.newRequest(getFakeRequest());
      expect(spy).toHaveBeenCalled();
      expect(spy1).toHaveBeenCalled();
    });
  });

  describe('newResponse', () => {
    beforeEach(() => {
      clearMocks();
      setUp();
    });
    it('should call removeRequestTimer and handleRegisteredRequest', () => {
      const spy1 = jest.spyOn(manager, '_removeRequestTimer');
      const spy2 = jest.spyOn(manager, '_handleRegisteredRequest');
      manager.newResponse(getFakeResponse());
      expect(spy2).toHaveBeenCalled();
      expect(spy1).toHaveBeenCalled();
    });
  });

  describe('onSocketDisconnect', () => {
    beforeEach(() => {
      clearMocks();
      setUp();
    });
    it('should call removeRequestTimer when socket disconnect and requestTimerMap is not empty', done => {
      const spy1 = jest.spyOn(manager, '_setRequestTimer');
      const spy2 = jest.spyOn(manager, '_setRequestTimer');
      const spy3 = jest.spyOn(manager, '_removeRequestTimer');
      manager.newRequest(getFakeRequest()).catch(() => {});
      manager.newRequest(getFakeRequest()).catch(() => {});
      manager.newRequest(getFakeRequest()).catch(() => {});
      manager.onSocketDisconnect();
      setTimeout(() => {
        expect(spy1).toHaveBeenCalledTimes(3);
        expect(spy2).toHaveBeenCalledTimes(3);
        expect(spy3).toHaveBeenCalledTimes(3);
        done();
      });
      jest.runAllTimers();
    });

    it('should not call removeRequestTimer when socket disconnect but requestTimerMap is empty', done => {
      const spy1 = jest.spyOn(manager, '_setRequestTimer');
      const spy2 = jest.spyOn(manager, '_setRequestTimer');
      const spy3 = jest.spyOn(manager, '_removeRequestTimer');
      manager.newRequest(getFakeRequest()).catch(() => {});
      manager.newRequest(getFakeRequest()).catch(() => {});
      manager.newRequest(getFakeRequest()).catch(() => {});
      manager['requestTimerMap'].clear();
      manager.onSocketDisconnect();
      setTimeout(() => {
        expect(spy1).toHaveBeenCalledTimes(3);
        expect(spy2).toHaveBeenCalledTimes(3);
        expect(spy3).toHaveBeenCalledTimes(0);
        done();
      });
      jest.runAllTimers();
    });
  });
});
