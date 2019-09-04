import { sortFunc } from '../hooks/useContactSearchDialog';

describe('sortFunc', () => {
  it('should sort by weight first, then most_recent_post_created_at, then name', () => {
    const datum = [
      {
        id: 0,
        sortWeights: [1],
        entity: { displayName: 'A', most_recent_post_created_at: 100 },
      },
      {
        id: 0,
        sortWeights: [1],
        entity: { displayName: 'D', most_recent_post_created_at: 100 },
      },
      {
        id: 1,
        sortWeights: [1],
        entity: { displayName: 'B', most_recent_post_created_at: 300 },
      },
      {
        id: 2,
        sortWeights: [2],
        entity: { displayName: 'A', most_recent_post_created_at: 400 },
      },
      {
        id: 3,
        sortWeights: [2],
        entity: { displayName: 'C', most_recent_post_created_at: 100 },
      },
      {
        id: 4,
        sortWeights: [2],
        entity: { displayName: 'A', most_recent_post_created_at: 200 },
      },
      {
        id: 5,
        sortWeights: [2],
        entity: { displayName: 'D', most_recent_post_created_at: 100 },
      },
    ];
    expect(datum.sort(sortFunc)).toEqual([
      {
        entity: { displayName: 'A', most_recent_post_created_at: 400 },
        id: 2,
        sortWeights: [2],
      },
      {
        entity: { displayName: 'A', most_recent_post_created_at: 200 },
        id: 4,
        sortWeights: [2],
      },
      {
        entity: { displayName: 'C', most_recent_post_created_at: 100 },
        id: 3,
        sortWeights: [2],
      },
      {
        entity: { displayName: 'D', most_recent_post_created_at: 100 },
        id: 5,
        sortWeights: [2],
      },
      {
        entity: { displayName: 'B', most_recent_post_created_at: 300 },
        id: 1,
        sortWeights: [1],
      },
      {
        entity: { displayName: 'A', most_recent_post_created_at: 100 },
        id: 0,
        sortWeights: [1],
      },
      {
        entity: { displayName: 'D', most_recent_post_created_at: 100 },
        id: 0,
        sortWeights: [1],
      },
    ]);
  });
});
