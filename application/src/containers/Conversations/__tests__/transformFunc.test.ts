import { transformGroupSortKey } from '../transformFunc';

describe('transformFunc', () => {

  describe('transformGroupSortKey()', () => {

    it('should use most recent post create time as sortKey', () => {
      const result = transformGroupSortKey({
        id: 1,
        create_at: 1400000000000,
        most_recent_post_created_at: 1500000000000,
      });

      expect(result).toEqual({
        id: 1,
        sortKey: -1500000000000,
      });
    });

    it('should use group create time as sortKey if the group had no most recent post and was new', () => {
      const result = transformGroupSortKey({
        id: 1,
        is_new: true,
        created_at: 1400000000000,
      });

      expect(result).toEqual({
        id: 1,
        sortKey: -1400000000000,
      });
    });
  });

});
