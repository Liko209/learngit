/*
 * @Author: Shining (shining.miao@ringcentral.com)
 * @Date: 2019-06-27 14:16:31
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { observer } from 'mobx-react';
import {
  JuiRecentCallItem,
  StyledContactWrapper,
  StyledCallLogStatusWrapper,
  StyledTime,
  StyledSelectedItemIcon,
} from 'jui/pattern/Dialer';
import { ContactInfo } from '@/modules/phone/container/ContactInfo';
import { ViewProps } from './types';
import { JuiIconography, IconColor } from 'jui/foundation/Iconography';

@observer
class RecentCallItemView extends React.Component<ViewProps> {
  render() {
    const {
      caller,
      icon,
      isMissedCall,
      startTime,
      direction,
      handleClick,
      selected,
      isTransferPage,
      itemIndex,
      selectedCallItemIndex,
    } = this.props;
    const color: IconColor = isMissedCall
      ? ['accent', 'tomato']
      : ['grey', '600'];
    return (
      <JuiRecentCallItem onClick={handleClick} tabIndex={0} selected={selected}>
        <StyledContactWrapper>
          <ContactInfo
            caller={caller}
            isMissedCall={isMissedCall}
            direction={direction}
            disableOpenMiniProfile
          />
        </StyledContactWrapper>
        {isTransferPage && selectedCallItemIndex === itemIndex ? (
          <StyledSelectedItemIcon>
            <JuiIconography iconSize="medium">
              item-list-selected
            </JuiIconography>
          </StyledSelectedItemIcon>
        ) : (
          <>
            <StyledCallLogStatusWrapper>
              <JuiIconography iconSize="medium" iconColor={color}>
                {icon}
              </JuiIconography>
            </StyledCallLogStatusWrapper>
            <StyledTime>{startTime}</StyledTime>
          </>
        )}
      </JuiRecentCallItem>
    );
  }
}

export { RecentCallItemView };
