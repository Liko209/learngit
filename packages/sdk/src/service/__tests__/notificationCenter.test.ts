// import { EventEmitter2 } from 'eventemitter2';
import notificationCenter from '../notificationCenter';

// jest.mock('eventemitter2', () => ({
//   EventEmitter2: jest.fn(),
// }));

// const emitter = new EventEmitter2();

it('emitEntityPut()', () => {
  const result = notificationCenter.emitEntityPut('KEY', [{ id: 1 }]);
  expect(result).toBeUndefined();
});

it('emitEntityUpdate()', () => {
  const result = notificationCenter.emitEntityUpdate('KEY', []);
  expect(result).toBeUndefined();
});

it('emitEntityDelete()', () => {
  const result = notificationCenter.emitEntityDelete('KEY', []);
  expect(result).toBeUndefined();
});

it('emitConfigPut()', () => {
  const result = notificationCenter.emitConfigPut('KEY', []);
  expect(result).toBeUndefined();
});

it('emitConfigDelete()', () => {
  const result = notificationCenter.emitConfigDelete('KEY');
  expect(result).toBeUndefined();
});

it('emitService()', () => {
  const result = notificationCenter.emitService('KEY', []);
  expect(result).toBeUndefined();
});
