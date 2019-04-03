import _ from 'lodash';
import {
  LocationDescriptorObject,
  Path,
  LocationState,
  createBrowserHistory,
} from 'history';

const history = createBrowserHistory();
const historyPush = history.push;
const historyReplace = history.replace;

const isSameLocation = (
  options: LocationDescriptorObject | Path,
  newState?: LocationState,
) => {
  const { pathname, search, hash, state } = history.location;
  if (
    typeof options === 'string' &&
    (`${pathname}${search}${hash}` !== options || !_.isEqual(newState, state))
  ) {
    return false;
  }
  if (
    typeof options === 'object' &&
    (pathname !== options.pathname ||
      search !== options.search ||
      hash !== options.hash ||
      !_.isEqual(state, options.state))
  ) {
    return false;
  }
  return true;
};

const pushOrReplace = (action: Function) => {
  return (options: LocationDescriptorObject | Path, state?: LocationState) => {
    if (!isSameLocation(options, state)) {
      action(options, state);
    }
  };
};

history.push = pushOrReplace(historyPush);
history.replace = pushOrReplace(historyReplace);

export { isSameLocation, pushOrReplace };

export default history;
