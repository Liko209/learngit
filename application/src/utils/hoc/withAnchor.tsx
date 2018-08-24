import { withAttributes } from './withAttributes';

function withAnchor(WrappedComponent: any, anchor: string) {
  return withAttributes(WrappedComponent, {
    'data-anchor': anchor,
  });
}

export { withAnchor };
