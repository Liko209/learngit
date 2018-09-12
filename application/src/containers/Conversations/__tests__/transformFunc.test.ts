import { Group } from 'sdk/models';
import { transformGroupSortKey } from '../transformFunc';

describe('transformFunc', () => {
  describe('transformGroupSortKey()', () => {
    it('should use most recent post create time as sortKey', () => {
      const result = transformGroupSortKey({
        id: 1,
        created_at: 1400000000000,
        most_recent_post_created_at: 1500000000000,
      } as Group);

      expect(result).toEqual({
        id: 1,
        sortKey: -1500000000000,
      });
    });

    it('should use group create time as sortKey if the group had no most recent post', () => {
      const result = transformGroupSortKey({
        id: 1,
        created_at: 1400000000000,
      } as Group);

      expect(result).toEqual({
        id: 1,
        sortKey: -1400000000000,
      });
    });
  });
});
