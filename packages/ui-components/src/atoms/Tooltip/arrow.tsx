/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-8-39 17:29:02
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { createStyles, withStyles, WithStyles } from '@material-ui/core/styles';
import Tooltip, { TooltipProps } from '@material-ui/core/Tooltip';

const styles = createStyles({
  arrowPopper: {
    '&[x-placement*="bottom"] $arrowArrow': {
      top: 0,
      left: 0,
      marginTop: '-0.9em',
      width: '3em',
      height: '1em',
      '&::before': {
        borderWidth: '0 1em 1em 1em',
        borderColor: 'transparent transparent #616161 transparent',
      },
    },
    '&[x-placement*="top"] $arrowArrow': {
      bottom: '-1em',
      left: 0,
      marginTop: '-0.9em',
      width: '3em',
      height: '1em',
      '&::before': {
        borderWidth: '1em 1em 1em',
        borderColor: '#616161 transparent transparent',
      },
    },
    '&[x-placement*="right"] $arrowArrow': {
      left: 0,
      marginLeft: '-0.9em',
      height: '3em',
      width: '1em',
      '&::before': {
        borderWidth: '1em 1em 1em 0',
        borderColor: 'transparent #616161 transparent transparent',
      },
    },
  },
  arrowArrow: {
    position: 'absolute',
    fontSize: 7,
    width: '3em',
    height: '3em',
    '&::before': {
      content: '""',
      margin: 'auto',
      display: 'block',
      width: 0,
      height: 0,
      borderStyle: 'solid',
    },
  },
  tooltipPlacementBottom: {
    margin: '12px 0',
  },
  tooltipPlacementTop: {
    margin: '16px 0',
  },
  tooltipPlacementRight: {
    margin: '2px 0',
  },
});

class CustomizedTooltips extends React.Component<TooltipProps & WithStyles> {
  state = {
    arrowRef: null,
  };
  handleArrowRef = (ele: HTMLSpanElement) => {
    this.setState({
      arrowRef: ele,
    });
  }
  render() {
    const { title, classes, children, ...rest } = this.props;
    return (
      <Tooltip
        {...rest}
        title={
          <React.Fragment>
            {title}
            <span className={classes.arrowArrow} ref={this.handleArrowRef} />
          </React.Fragment>
        }
        classes={{
          popper: classes.arrowPopper,
          tooltipPlacementBottom: classes.tooltipPlacementBottom,
          tooltipPlacementTop: classes.tooltipPlacementTop,
          tooltipPlacementRight: classes.tooltipPlacementRight,
        }}
        PopperProps={{
          popperOptions: {
            modifiers: {
              arrow: {
                enabled: Boolean(this.state.arrowRef),
                element: this.state.arrowRef,
              },
            },
          },
        }}
      >
        {children}
      </Tooltip>
    );
  }
}
const ArrowTip = withStyles(styles)(CustomizedTooltips);
export { ArrowTip };
