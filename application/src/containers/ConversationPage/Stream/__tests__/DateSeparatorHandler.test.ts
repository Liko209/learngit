import _ from 'lodash';
import moment from 'moment';
import { DateSeparatorHandler } from '../DateSeparatorHandler';
import { ISortableModel } from '../../../../store/base';
import { SeparatorType } from '../types';
import { QUERY_DIRECTION } from 'sdk/dao';

type OnAddedCaseConfig = {
  setup?: (handler: DateSeparatorHandler) => void;
  addedPosts: ISortableModel[];
};

function runOnAdded({ addedPosts, setup }: OnAddedCaseConfig) {
  const handler = new DateSeparatorHandler();
  setup && setup(handler);
  handler.onAdded(
    QUERY_DIRECTION.OLDER,
    _(addedPosts)
      .clone()
      .reverse(),
    _.clone(addedPosts),
  );
  return handler;
}

const DATE_2018_10_31 = moment(1540957577000).valueOf();
const START_OF_2018_10_31 = moment(DATE_2018_10_31)
  .startOf('day')
  .valueOf();
const DATE_2018_10_30 = moment(1540957577000)
  .subtract(1, 'day')
  .valueOf();
const START_OF_2018_10_30 = moment(DATE_2018_10_30)
  .startOf('day')
  .valueOf();
const DATE_2018_10_29 = moment(1540957577000)
  .subtract(2, 'day')
  .valueOf();
const START_OF_2018_10_29 = moment(DATE_2018_10_29)
  .startOf('day')
  .valueOf();

describe('DateSeparatorHandler', () => {
  describe('onAdded()', () => {
    it('should have separator for each day except 2018-10-31', () => {
      const handler = runOnAdded({
        addedPosts: [
          {
            id: 1000,
            sortValue: DATE_2018_10_31,
            data: { created_at: DATE_2018_10_31 },
          },
          {
            id: 1001,
            sortValue: DATE_2018_10_30,
            data: { created_at: DATE_2018_10_30 },
          },
          {
            id: 1002,
            sortValue: DATE_2018_10_29,
            data: { created_at: DATE_2018_10_29 },
          },
        ],
      });

      expect(Array.from(handler.separatorMap)).toEqual([
        [1001, { timestamp: START_OF_2018_10_30, type: SeparatorType.DATE }],
        [1002, { timestamp: START_OF_2018_10_29, type: SeparatorType.DATE }],
      ]);
    });

    it('should have separator when many posts at same day', () => {
      const handler = runOnAdded({
        addedPosts: [
          {
            id: 999,
            sortValue: DATE_2018_10_30,
            data: { created_at: DATE_2018_10_30 },
          },
          {
            id: 1000,
            sortValue: DATE_2018_10_31,
            data: { created_at: DATE_2018_10_31 },
          },
          {
            id: 1001,
            sortValue: DATE_2018_10_31 + 1000,
            data: { created_at: DATE_2018_10_31 + 1000 },
          },
          {
            id: 1002,
            sortValue: DATE_2018_10_31 + 2000,
            data: { created_at: DATE_2018_10_31 + 2000 },
          },
        ],
      });

      expect(handler.separatorMap.size).toBe(1);
      expect(handler.separatorMap.get(1000)).toEqual({
        timestamp: START_OF_2018_10_31,
        type: SeparatorType.DATE,
      });
    });
  });

  describe('onDeleted()', () => {
    it('should delete separator', () => {
      const handler = runOnAdded({
        addedPosts: [
          {
            id: 1000,
            sortValue: DATE_2018_10_31,
            data: { created_at: DATE_2018_10_31 },
          },
        ],
      });
      handler.onDeleted([1000], []);
      expect(handler.separatorMap.size).toBe(0);
    });

    it('should move separator to next post when have many posts same day', () => {
      const handler = runOnAdded({
        addedPosts: [
          {
            id: 1000,
            sortValue: DATE_2018_10_31,
            data: { created_at: DATE_2018_10_31 },
          },
          {
            id: 1001,
            sortValue: DATE_2018_10_31 + 1000,
            data: { created_at: DATE_2018_10_31 + 1000 },
          },
        ],
      });
      handler.onDeleted([1000], []);
      expect(handler.separatorMap.get(1001)).toEqual({
        timestamp: START_OF_2018_10_31,
        type: SeparatorType.DATE,
      });
    });

    it('should not modify separator when deleted post has no separator', () => {
      const handler = runOnAdded({
        addedPosts: [
          {
            id: 999,
            sortValue: DATE_2018_10_30,
            data: { created_at: DATE_2018_10_30 },
          },
          {
            id: 1000,
            sortValue: DATE_2018_10_31,
            data: { created_at: DATE_2018_10_31 },
          },
          {
            id: 1001,
            sortValue: DATE_2018_10_31 + 1000,
            data: { created_at: DATE_2018_10_31 + 1000 },
          },
        ],
      });

      handler.onDeleted([1001], []);
      expect(handler.separatorMap.get(1000)).toEqual({
        timestamp: START_OF_2018_10_31,
        type: SeparatorType.DATE,
      });
    });
  });
});
