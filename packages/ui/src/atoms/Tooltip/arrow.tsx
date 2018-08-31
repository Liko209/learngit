import React from 'react';
import { createStyles, withStyles, WithStyles } from '@material-ui/core/styles';
import Tooltip from '@material-ui/core/Tooltip';

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
});
export interface IProps {
  title?: string;
  node: any;
  enterDelay?: number;
  leaveDelay?: number;
  classes?: any;
  placement?: string;
}

class CustomizedTooltips extends React.Component<IProps & WithStyles> {
  // constructor(props: IProps & WithStyles<'arrowPopper', 'arrowArrow'>) {
  //   super(props);
  // }
  state = {
    arrowRef: null,
  };
  handleArrowRef = (node: any) => {
    this.setState({
      arrowRef: node,
    });
  }
  render() {
    const { classes, title, node, enterDelay, leaveDelay } = this.props;
    return (
      <Tooltip
        enterDelay={enterDelay}
        leaveDelay={leaveDelay}
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
        {node}
      </Tooltip>
    );
  }
}
const ArrowTip = withStyles(styles)(CustomizedTooltips);
export { ArrowTip };
