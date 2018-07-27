/**
 *
 * Asynchronously loads the component for UnifiedLogin
 *
 */

import Loadable from 'react-loadable';

export default Loadable({
  loader: () => import('./index'),
  loading: () => null,
});
