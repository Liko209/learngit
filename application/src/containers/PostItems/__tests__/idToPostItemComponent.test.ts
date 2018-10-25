import idToPostItemComponent from '../idToPostItemComponent';
import { Event } from '../event';

describe('idToPostItemComponent', () => {
  it('should return current post item component', () => {
    const Item = idToPostItemComponent(14);
    expect(Item).toBe(Event);
  });
});
