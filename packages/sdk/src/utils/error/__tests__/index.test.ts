import { Throw, Aware } from '../index';
import notificationCenter from '../../../service/notificationCenter';
import { JSdkError } from '../../../error';
it('index Throw', () => {
  try {
    Throw('123', 'test');
  } catch (err) {
    expect(err).toBeInstanceOf(JSdkError);
    expect(err.code).toBe('123');
    expect(err.message).toBe('test');
  }
});

it('index Aware', () => {
  notificationCenter.on('Error', (info) => {
    expect(info.error).toBeInstanceOf(JSdkError);
    expect(info.error.code).toBe('123456');
    expect(info.error.message).not.toBeNull();
  });
  Aware('123456', 'test');
});
