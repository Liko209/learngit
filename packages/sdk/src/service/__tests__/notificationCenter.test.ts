// import { EventEmitter2 } from 'eventemitter2';
import notificationCenter from '../notificationCenter';

// jest.mock('eventemitter2', () => ({
//   EventEmitter2: jest.fn(),
// }));

// const emitter = new EventEmitter2();

it('emitEntityUpdate()', () => {
  const result = notificationCenter.emitEntityUpdate('KEY', []);
  expect(result).toBeUndefined();
});

it('emitEntityDelete()', () => {
  const result = notificationCenter.emitEntityDelete('KEY', []);
  expect(result).toBeUndefined();
});

it('emitKVChange()', () => {
  const result = notificationCenter.emitKVChange('KEY', []);
  expect(result).toBeUndefined();
});
