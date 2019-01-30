import { StreamController } from '../StreamController';
import { HistoryHandler } from '../HistoryHandler';
import { StreamItemType } from '../types';
describe('StreamController', () => {
  function setUp() {
    return new StreamController(
      1,
      new HistoryHandler(),
      { fetchData: async () => ({ data: [], hasMore: true }) },
      {
        isMatchFunc: () => true,
        transformFunc: i => ({
          id: i.id,
          sortValue: i.id,
          data: i,
        }),
      },
    );
  }
  beforeEach(() => {});
  afterEach(() => {});
  it('should filter out the first non-post when provided with date separator and post', () => {
    const controller = setUp();
    const items = [
      { id: 1, type: StreamItemType.POST },
      { id: 2, type: StreamItemType.POST },
      { id: 0, type: StreamItemType.DATE_SEPARATOR },
    ];
    controller._streamListHandler.replaceAll(items);
    expect(controller.items.map(i => i.type)).toEqual(
      Array(2).fill(StreamItemType.POST),
    );
  });
  it('should not filter out the first post when provided with post only', () => {
    const controller = setUp();
    const items = [
      { id: 1, type: StreamItemType.POST },
      { id: 2, type: StreamItemType.POST },
      { id: 0, type: StreamItemType.POST },
    ];
    controller._streamListHandler.replaceAll(items);
    console.log('andy hu', controller.items);
    expect(controller.items.map(i => i.type)).toEqual(
      Array(3).fill(StreamItemType.POST),
    );
  });
});
