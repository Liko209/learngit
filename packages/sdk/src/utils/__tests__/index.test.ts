import * as indexObj from '../index';

it('uniqueArray', () => {
  const res = !!indexObj.uniqueArray;
  expect(res).toBe(true);
});
