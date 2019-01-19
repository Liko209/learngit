/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-01-16 18:32:46
 * Copyright © RingCentral. All rights reserved.
 */

import React, { lazy, Suspense, ComponentType } from 'react';

function lazyComponent({
  loader,
  Loading = () => <div />,
}: {
  loader: () => Promise<{ default: ComponentType<any> }>;
  Loading?: ComponentType<any>;
}) {
  //
  // React.lazy currently only supports default exports. If
  // the module you want to import uses named exports, you
  // can create an intermediate module that reexports it as
  // the default. This ensures that treeshaking keeps working
  // and that you don’t pull in unused components.
  // See:
  // https://reactjs.org/docs/code-splitting.html#named-exports
  //
  const Component = lazy(loader);

  return (props: any) => (
    <Suspense fallback={<Loading />}>
      <Component {...props} />
    </Suspense>
  );
}

export { lazyComponent };
