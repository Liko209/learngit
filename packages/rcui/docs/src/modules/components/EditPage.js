import React from "react";
import PropTypes from "prop-types";
import Button from "@material-ui/core/Button";
import { connect } from "react-redux";

function EditPage(props) {
  const { markdownLocation, sourceCodeRootUrl } = props;

  return (
    <Button component="a" href={`${sourceCodeRootUrl}${markdownLocation}`}>
      EDIT THIS PAGE
    </Button>
  );
}

EditPage.propTypes = {
  markdownLocation: PropTypes.string.isRequired,
  sourceCodeRootUrl: PropTypes.string.isRequired
};

export default connect(state => ({
  t: state.options.t
}))(EditPage);
