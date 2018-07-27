import React, { PureComponent } from 'react';

import omit from '../utils/omit';
import { containerProps, borderShortcutProps } from '../utils/props';

import Box from './Box';

const containerLayoutProps = [...containerProps, ...borderShortcutProps];

/**
 * Container Component
 */
class Container extends PureComponent {
  render() {
    const { props } = this;
    const styles = {};

    if (props.fixed) {
      styles.position = 'fixed';
    }
    if (props.absolute) {
      styles.position = 'absolute';
    }

    // resolving all container properties
    containerProps.forEach(prop => {
      if (Object.prototype.hasOwnProperty.call(props, prop)) {
        styles[prop] = props[prop];
      }
    });

    // resolving the border shortcuts
    borderShortcutProps.forEach(prop => {
      if (props[prop] === true) {
        styles[`${prop}Width`] = props.borderWidth || 1;
      }
    });

    const childProps = omit(props, containerLayoutProps);
    return <Box {...childProps} style={{ ...styles, ...props.style }} />;
  }
}

export default Container;
