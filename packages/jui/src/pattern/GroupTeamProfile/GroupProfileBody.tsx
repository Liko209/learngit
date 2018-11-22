/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-11-22 14:09:02
 * Copyright © RingCentral. All rights reserved.
 */
import React, { PureComponent } from 'react';
import { JuiIconography } from '../../foundation/Iconography';
import styled from '../../foundation/styled-components';
import defaultGroupAvatar from './static/Groups.png';
import defaultTeamAvatar from './static/Teams.png';
import { GROUP_BODY_TYPES, GroupBodyProps } from './types';

const StyledBodyWrapper = styled.div`
  border-bottom: 1px solid #e0e0e0;
`;
const StyledContent = styled.div`
  display: flex;
  margin: 24px;
`;
const StyledAvatar = styled.div`
  img {
    width: 80px;
    height: 80px;
  }
`;
const StyledRightColumn = styled.div`
  position: relative;
  width: 100%;
  margin-left: 18px;
  border: 1px solid black;
`;
const StyledName = styled.div`
  position: absolute;
  top: 0;
  left: 0;
`;
const StyledDescription = styled.div`
   margin-top: 16px;
   color: #9e9e9e;
   font-size: 12px;
`;
const StyledBottomButton = styled.div`
  display: flex;
`;
const StyledMessageBtn = styled.div`
  display: flex;
  margin-top: 12px;
  color: #0684bd;
  font-size: 14px;
  span {
    font-size: 20px;
    margin-right: 8px;
  }
`;
class JuiGroupProfileBody extends PureComponent<GroupBodyProps> {
  render() {
    const { type, displayName, description } = this.props;
    return (
      <StyledBodyWrapper>
        <StyledContent>
          <StyledAvatar>
            {type === GROUP_BODY_TYPES.GROUP ? (
              <img src={defaultGroupAvatar} alt="group avatar" />
            ) : (
              <img src={defaultTeamAvatar} alt="team avatar" />
            )}
          </StyledAvatar>
          <StyledRightColumn>
            <StyledName>{displayName}</StyledName>
            <StyledDescription>{description}</StyledDescription>
            <StyledBottomButton>
              <StyledMessageBtn>
                <JuiIconography>chat_bubble</JuiIconography>
                Message
              </StyledMessageBtn>
            </StyledBottomButton>
          </StyledRightColumn>
        </StyledContent>
      </StyledBodyWrapper>
    );
  }
}

export { JuiGroupProfileBody };
