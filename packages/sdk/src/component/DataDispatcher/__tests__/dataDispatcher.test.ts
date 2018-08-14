import { rawPostFactory } from '../../../__tests__/factories';
import dataDispatcher from '../index';
import { EventEmitter2 } from 'eventemitter2';
import { SOCKET } from '../../../service';

describe('dataDispatcher', () => {
  let companyHandlers;
  let postHandlers;
  beforeAll(() => {
    companyHandlers = [jest.fn(), jest.fn()];
    postHandlers = [jest.fn(), jest.fn()];
    jest.spyOn(EventEmitter2.prototype, 'emit');
    jest.spyOn(EventEmitter2.prototype, 'on');
    jest.spyOn(EventEmitter2.prototype, 'off');
  });
  it('register', () => {
    dataDispatcher.register(SOCKET.COMPANY, companyHandlers[0]);
    expect(EventEmitter2.prototype.on).toBeCalledWith(SOCKET.COMPANY, companyHandlers[0]);
  });
  it('unregister', () => {
    dataDispatcher.unregister(SOCKET.COMPANY, companyHandlers[1]);
    expect(EventEmitter2.prototype.off).toBeCalledWith(SOCKET.COMPANY, companyHandlers[1]);
  });
  it('onDataArrived', async () => {
    jest.restoreAllMocks();
    const post = rawPostFactory.build({ _id: 4879476924420 });
    const PUSHED_DATA = JSON.stringify({ body: { objects: [[post]] } });
    dataDispatcher.register(SOCKET.POST, postHandlers[0]);
    await dataDispatcher.onDataArrived(PUSHED_DATA);
    expect(postHandlers[0]).toBeCalledWith([post]);
  });
});
