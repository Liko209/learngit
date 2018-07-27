import ConfigChangeNotifier from '../configChangeNotifier';
import { EventEmitter2 } from 'eventemitter2';
import { Flag } from '../utils';

describe('ConfigChangeNotifier', () => {
  let notifier: ConfigChangeNotifier;
  beforeAll(() => {
    jest.mock('eventemitter2');
    notifier = new ConfigChangeNotifier();
  });
  it('subscribe', () => {
    const noop = () => {};
    EventEmitter2.prototype.on = jest.fn();
    notifier.subscribe(noop);

    expect(EventEmitter2.prototype.on).toBeCalledWith('Flag.Change', noop);
    expect(EventEmitter2.prototype.on).toHaveBeenCalled();
  });
  it('unsubscribe', () => {
    const noop = () => {};
    EventEmitter2.prototype.off = jest.fn();
    notifier.unsubscribe(noop);

    expect(EventEmitter2.prototype.off).toBeCalledWith('Flag.Change', noop);
    expect(EventEmitter2.prototype.off).toHaveBeenCalled();
  });
  it('broadcast', () => {
    const flags: Flag = { SMS: 'false' };
    EventEmitter2.prototype.emit = jest.fn();
    notifier.broadcast(flags);

    expect(EventEmitter2.prototype.emit).toBeCalledWith('Flag.Change', flags);
    expect(EventEmitter2.prototype.emit).toHaveBeenCalled();
  });
});
