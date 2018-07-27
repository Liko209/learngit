import React from 'react';
import PropTypes from 'prop-types';

const styles = {
  width: '100%',
  height: '100%',
  top: 0,
  left: 0,
  bottom: 0,
  right: 0,
  position: 'fixed'
};

const Page = ({ style, children }) => (
  <div style={{ ...styles, ...style }}>{children}</div>
);

Page.propTypes = {
  style: PropTypes.object,
  children: PropTypes.element.isRequired
};

Page.defaultProps = {
  style: {}
};

export default Page;
