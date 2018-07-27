import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

import omit from '../utils/omit';
import Box from './Box';

const scrollViewProps = ['horizontal', 'initialScrollPos'];

/**
 * Scrollable Container
 */
class ScrollView extends PureComponent {
  constructor(props, context) {
    super(props, context);
    this.state = { scrollPos: props.initialScrollPos };
  }

  componentDidUpdate = () => {
    if (this.state.scrollPos === 'end') {
      if (this.props.horizontal) {
        this.DOMNode.scrollLeft =
          this.DOMNode.scrollWidth - this.DOMNode.offsetWidth;
        this.setState({ scrollPos: this.DOMNode.scrollLeft });
      } else {
        this.DOMNode.scrollTop =
          this.DOMNode.scrollHeight - this.DOMNode.offsetHeight;
        this.setState({ scrollPos: this.DOMNode.scrollTop });
      }
    } else if (this.state.scrollPos === 'start') {
      if (this.props.horizontal) {
        this.DOMNode.scrollLeft = 0;
      } else {
        this.DOMNode.scrollTop = 0;
      }

      this.setState({ scrollPos: 0 });
    }
  };

  onScroll = event => {
    const scrollPos = this.props.horizontal
      ? event.currentTarget.scrollLeft
      : event.currentTarget.scrollTop;

    // fire a custom onScroll if provided
    if (this.props.onScroll) {
      this.props.onScroll(scrollPos);
    }

    this.setState({ scrollPos });
  };

  getScrollPosition = () => this.state.scrollPos;

  scrollToStart = () => {
    this.setState({ scrollPos: 'start' });
  };

  scrollToEnd = () => {
    this.setState({ scrollPos: 'end' });
  };

  scrollTo = scrollPosition => {
    this.setState({ scrollPos: scrollPosition });
  };

  render() {
    const { props } = this;

    const styles = {
      overflowY: props.horizontal ? 'hidden' : 'auto',
      overflowX: props.horizontal ? 'auto' : 'hidden'
    };

    const childProps = omit(props, scrollViewProps);

    return (
      <Box
          {...childProps}
          ref={node => {
            this.DOMNode = node;
          }}
          column={!props.horizontal}
          style={{ ...styles, ...props.style }}
          onScroll={this.onScroll}
      />
    );
  }
}

ScrollView.propTypes = {
  width: PropTypes.any,
  height: PropTypes.any,
  horizontal: PropTypes.bool,
  initialScrollPos: PropTypes.number,
  onScroll: PropTypes.any
};

ScrollView.defaultProps = {
  horizontal: false,
  initialScrollPos: 0,
  width: 'auto',
  height: 'auto',
  onScroll: null
};

export default ScrollView;
