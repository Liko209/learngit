import FeatureFlag from './FeatureFlag';
import ConfigChangeNotifier from './configChangeNotifier';
import featureConfig from './featureConfig';
import FlagCalculator from './FlagCalculator';

const notifier = new ConfigChangeNotifier();
const calculator = new FlagCalculator(featureConfig);
const featureFlag = new FeatureFlag(notifier, calculator);
export default featureFlag;
