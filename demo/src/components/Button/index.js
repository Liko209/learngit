/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-03-03 13:24:26
 * @Last Modified by: Shining Miao (shining.miao@ringcentral.com)
 * @Last Modified time: 2018-04-10 17:55:35
 */

import React, { Children } from 'react';
import PropTypes from 'prop-types';

import A from './A';
import StyledButton from './StyledButton';
import Wrapper from './Wrapper';

const Button = (props) => {
  // Render an anchor tag
  let button = (
    <A {...props} href={props.href} onClick={props.onClick}>
      {Children.toArray(props.children)}
    </A>
  );

  // If the Button has a handleRoute prop, we want to render a button
  if (props.handleRoute) {
    button = (
      <StyledButton {...props} onClick={props.handleRoute}>
        {Children.toArray(props.children)}
      </StyledButton>
    );
  }

  return <Wrapper {...props}>{button}</Wrapper>;
};

Button.propTypes = {
  handleRoute: PropTypes.func,
  href: PropTypes.string,
  onClick: PropTypes.func,
  children: PropTypes.node.isRequired,
};

Button.defaultProps = {
  handleRoute: null,
  href: '',
  onClick: null,
};

export default Button;
