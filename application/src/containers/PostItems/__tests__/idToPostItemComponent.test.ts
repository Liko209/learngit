import idToPostItemComponent from '../idToPostItemComponent';

describe('idToPostItemComponent', () => {
  it('should return current post item component', () => {
    const Item = idToPostItemComponent(14);
    expect(Item).toEqual(expect.any(Function));
  });
});
