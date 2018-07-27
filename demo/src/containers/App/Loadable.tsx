/**
 *
 * Asynchronously loads the component for App
 *
 */

import * as Loadable from 'react-loadable';

export default Loadable({
  loader: () => import('./index'),
  loading: () => null,
});
