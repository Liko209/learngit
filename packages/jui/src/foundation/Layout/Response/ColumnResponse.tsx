/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-11-14 14:00:12
 * Copyright © RingCentral. All rights reserved.
 */

import React, { PureComponent } from 'react';
import styled from '../../styled-components';

const MAIN_MIN_WIDTH = 400;
const SIDEBAR_DEFAULT_WIDTH = 268;
const SIDEBAR_MIN_WIDTH = 180;
const SIDEBAR_MAX_WIDTH = 360;

type Props = {
  children: JSX.Element[];
  mainPanelIndex: number;
};

type Panels = {
  width?: number;
  minWidth: number;
  maxWidth?: number;
};

type States = {
  panels: Panels[];
};

const StyledWrapper = styled('div')`
  display: flex;
  height: 100%;
  width: 100%;
`;

type PropsSidebarPanel = {
  width: number;
};

const StyledSidebarPanel = styled('div').attrs({ className: 'panel-sidebar' })`
  height: 100%;
  flex-basis: ${(props: PropsSidebarPanel) => `${props.width}px`};
`;

const StyledMainPanel = styled('div').attrs({ className: 'panel-main' })`
  height: 100%;
  flex: 1;
  min-width: ${MAIN_MIN_WIDTH}px;
  border: 1px solid red;
`;

class JuiColumnResponse extends PureComponent<Props, States> {
  constructor(props: Props) {
    super(props);
    this.state = { panels: this.getPanelsData() };
  }

  getPanelsData() {
    const { children, mainPanelIndex } = this.props;
    return React.Children.map(children, (child: JSX.Element, index: number) => {
      if (index === mainPanelIndex) {
        return { minWidth: MAIN_MIN_WIDTH };
      }
      return {
        width: SIDEBAR_DEFAULT_WIDTH,
        minWidth: SIDEBAR_MIN_WIDTH,
        maxWidth: SIDEBAR_MAX_WIDTH,
      };
    });
  }

  render() {
    const { children, mainPanelIndex } = this.props;
    const { panels } = this.state;
    return (
      <StyledWrapper>
        {React.Children.map(children, (child: JSX.Element, index: number) => {
          if (index === mainPanelIndex) {
            return <StyledMainPanel>{child}</StyledMainPanel>;
          }
          return (
            <StyledSidebarPanel width={panels[index].width!}>
              {child}
            </StyledSidebarPanel>
          );
        })}
      </StyledWrapper>
    );
  }
}

export { JuiColumnResponse };

// import { JuiColumnResponse } from 'jui/foundation/Layout/Response/ColumnResponse';

/* <JuiColumnResponse mainPanelIndex={1}>
  <div>1</div>
  <div>2</div>
  <div>3</div>
</JuiColumnResponse>; */
