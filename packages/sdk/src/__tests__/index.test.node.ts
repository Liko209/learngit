import { sdk } from '../index';
import Sdk from '../Sdk';

it('should export instance of sdk', () => {
  expect(sdk).toBeInstanceOf(Sdk);
});
