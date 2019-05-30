import notificationCenter from '../notificationCenter';
import { EVENT_TYPES } from '../constants';

it('emitEntityUpdate()', () => {
  const result = notificationCenter.emitEntityUpdate('KEY', []);
  expect(result).toBeUndefined();
});

it('emitEntityDelete()', () => {
  const result = notificationCenter.emitEntityDelete('KEY', []);
  expect(result).toBeUndefined();
});

it('emitEntityReset()', () => {
  const result = notificationCenter.emitEntityReset('KEY');
  expect(result).toBeUndefined();
});

it('emitEntityReload()', () => {
  const result = notificationCenter.emitEntityReload('KEY');
  expect(result).toBeUndefined();
});

it('emitEntityReplace()', () => {
  const entitiesMap = new Map<number, any>();
  const result = notificationCenter.emitEntityReplace('KEY', entitiesMap);
  expect(result).toBeUndefined();
});

it('emitKVChange()', () => {
  const result = notificationCenter.emitKVChange('KEY', []);
  expect(result).toBeUndefined();
});

describe('notificationCenter', () => {
  function setUp() {}

  function cleanUp() {
    jest.clearAllMocks();
    jest.resetAllMocks();
    jest.restoreAllMocks();
    notificationCenter.removeAllListeners();
  }

  describe('on', () => {
    describe('onEntityUpdate()', () => {
      beforeEach(() => {
        setUp();
      });
      afterEach(() => {
        cleanUp();
      });
      it('should not callback when payload.type !== EVENT_TYPES.UPDATE', (done: jest.DoneCallback) => {
        notificationCenter.onEntityUpdate('test', async () => {
          expect(1).toEqual(2);
          done();
        });

        setTimeout(() => {
          expect(1).toEqual(1);
          done();
        });
        notificationCenter.emit('test', []);
      });
      it('should callback when payload.type === EVENT_TYPES.UPDATE', (done: jest.DoneCallback) => {
        notificationCenter.onEntityUpdate('test', async payload => {
          expect(payload.type).toEqual(EVENT_TYPES.UPDATE);
          done();
        });

        notificationCenter.emitEntityUpdate('test', []);
      });
    });

    describe('onEntityReplace()', () => {
      beforeEach(() => {
        setUp();
      });
      afterEach(() => {
        cleanUp();
      });
      it('should not callback when payload.type !== EVENT_TYPES.REPLACE', (done: jest.DoneCallback) => {
        notificationCenter.onEntityUpdate('test', async () => {
          expect(1).toEqual(2);
          done();
        });

        setTimeout(() => {
          expect(1).toEqual(1);
          done();
        });
        notificationCenter.emit('test', []);
      });
      it('should callback when payload.type === EVENT_TYPES.REPLACE', (done: jest.DoneCallback) => {
        notificationCenter.onEntityReplace('test', async payload => {
          expect(payload.type).toEqual(EVENT_TYPES.REPLACE);
          done();
        });
        notificationCenter.emitEntityReplace('test', new Map() as any);
      });
    });
    describe('onEntityReload()', () => {
      beforeEach(() => {
        setUp();
      });
      afterEach(() => {
        cleanUp();
      });
      it('should not callback when payload.type !== EVENT_TYPES.RELOAD', (done: jest.DoneCallback) => {
        notificationCenter.onEntityReload('test', async () => {
          expect(1).toEqual(2);
          done();
        });

        setTimeout(() => {
          expect(1).toEqual(1);
          done();
        });
        notificationCenter.emit('test', []);
      });
      it('should callback when payload.type === EVENT_TYPES.RELOAD', (done: jest.DoneCallback) => {
        notificationCenter.onEntityReload('test', async payload => {
          expect(payload.type).toEqual(EVENT_TYPES.RELOAD);
          done();
        });

        notificationCenter.emitEntityReload('test');
      });
    });
    describe('onEntityReset()', () => {
      beforeEach(() => {
        setUp();
      });
      afterEach(() => {
        cleanUp();
      });
      it('should not callback when payload.type !== EVENT_TYPES.RESET', (done: jest.DoneCallback) => {
        notificationCenter.onEntityReset('test', async () => {
          expect(1).toEqual(2);
          done();
        });

        setTimeout(() => {
          expect(1).toEqual(1);
          done();
        });
        notificationCenter.emit('test', []);
      });
      it('should callback when payload.type === EVENT_TYPES.RESET', (done: jest.DoneCallback) => {
        notificationCenter.onEntityReset('test', async payload => {
          expect(payload.type).toEqual(EVENT_TYPES.RESET);
          done();
        });

        notificationCenter.emitEntityReset('test');
      });
    });
    describe('onEntityDelete()', () => {
      beforeEach(() => {
        setUp();
      });
      afterEach(() => {
        cleanUp();
      });
      it('should not callback when payload.type !== EVENT_TYPES.DELETE', (done: jest.DoneCallback) => {
        notificationCenter.onEntityDelete('test', async () => {
          expect(1).toEqual(2);
          done();
        });

        setTimeout(() => {
          expect(1).toEqual(1);
          done();
        });
        notificationCenter.emit('test', []);
      });
      it('should callback when payload.type === EVENT_TYPES.DELETE', (done: jest.DoneCallback) => {
        notificationCenter.onEntityDelete('test', async payload => {
          expect(payload.type).toEqual(EVENT_TYPES.DELETE);
          done();
        });

        notificationCenter.emitEntityDelete('test', [{ id: 1 }] as any);
      });
    });
  });
});
