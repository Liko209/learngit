import { generateUUID, generateIncrementId } from '../util';
describe('generateUUID', () => {
  it('should be different UUID', () => {
    expect(generateUUID()).not.toEqual(generateUUID());
  });

  it('should self increment', () => {
    const id1 = generateIncrementId.get();
    const id2 = generateIncrementId.get();

    expect(id1).not.toEqual(id2);
    expect(parseInt(id2, 10) - parseInt(id1, 10)).toEqual(1);
  });
});
