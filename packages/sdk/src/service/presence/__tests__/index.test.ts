import PresenceService from '../index';

const presenceService: PresenceService = new PresenceService();

describe('Presence service', () => {
  beforeEach(() => {
    presenceService.caches = {};
  });

  it('saveToMemory()', () => {
    presenceService.saveToMemory([
      {
        id: 1,
      },
      {
        id: 2,
      },
    ]);
    expect(presenceService.caches).toEqual({
      1: { id: 1 },
      2: { id: 2 },
    });
  });

  it('getById()', async () => {
    presenceService.saveToMemory([
      {
        id: 1,
      },
    ]);
    expect(await presenceService.getById(1)).toEqual({ id: 1 });
  });
});
