import featureFlag from '../index';
import FeatureFlag from '../FeatureFlag';
describe('FeatureFlag', () => {
  it('should be instance of FeatureFlag', () => {
    expect(featureFlag).toBeInstanceOf(FeatureFlag);
  });
});
