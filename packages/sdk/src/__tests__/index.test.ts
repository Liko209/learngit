import Sdk from '../Sdk';
import { sdk } from '../index';

it('should export instance of sdk', () => {
  expect(sdk).toBeInstanceOf(Sdk);
});
