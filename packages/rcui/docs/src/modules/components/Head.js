import React from "react";
import NextHead from "next/head";
import PropTypes from "prop-types";

function Head(props) {
  const { title, description } = props;

  return (
    <NextHead>
      <title>{title}</title>
      <meta name="description" content={description} />
    </NextHead>
  );
}

Head.propTypes = {
  description: PropTypes.string,
  title: PropTypes.string
};

Head.defaultProps = {
  description: "React Components that Implement Google's Material Design.",
  title: "RingCentral-UI"
};

export default Head;
