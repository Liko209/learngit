import { randomInt, versionHash, generateUUID } from '../mathUtils';

describe('mathUtils', () => {
  it('randomInt()', () => {
    expect(randomInt()).not.toBe(-1);
  });

  it('versionHash()', () => {
    let res = !/(^[1-9]\d*$)/.test(versionHash().toString());
    expect(res).toBe(false);
  });

  it('generateUUID()', () => {
    const resp = generateUUID();
    for (let i = 0; i < 100; i++) {
      expect(resp !== generateUUID()).toBe(true);
    }
  });
});
