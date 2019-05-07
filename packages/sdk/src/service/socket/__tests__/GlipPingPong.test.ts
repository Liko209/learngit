/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2019-03-03 17:36:27
 * Copyright © RingCentral. All rights reserved.
 */

import { GlipPingPong } from '../GlipPingPong';

class MockSocket {
  emit() {}
  on() {}
}

describe('GlipPingPong', () => {
  describe('ping', () => {
    it('should callback with false when there is not socket client', () => {
      const glipPingPong = new GlipPingPong({});
      let isFlase = false;
      glipPingPong.ping((success: boolean) => {
        isFlase = !success;
      });
      expect(isFlase).toBeTruthy();
    });
    it('should call emit when there it is not pinging', () => {
      const mockSocket = new MockSocket() as SocketIOClient.Socket;
      jest.spyOn(mockSocket, 'emit').mockImplementationOnce(() => {});
      const glipPingPong = new GlipPingPong({
        socket: mockSocket,
        pingTimeOut: 0,
        callback: () => {},
      });

      glipPingPong.ping(() => {});
      expect(mockSocket.emit).toBeCalledTimes(1);
    });
  });
  describe('cleanup', () => {
    it('should clear all parameter ', () => {
      const glipPingPong = new GlipPingPong({});
      glipPingPong.cleanup();
      expect(glipPingPong._heartBeatCheck).toBeUndefined();
    });
  });
});
