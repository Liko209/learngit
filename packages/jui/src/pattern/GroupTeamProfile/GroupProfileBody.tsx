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
import { GROUP_TYPES, GroupBodyProps } from './types';

const StyledBodyWrapper = styled.div`
  border-bottom: 1px solid #e0e0e0;
`;
const StyledContent = styled.div`
  display: flex;
  margin: 20px 24px 21px 24px;
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
`;
const StyledName = styled.div`
  position: relative;
  top: 0;
  left: 0;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
`;
const StyledDescription = styled.div`
  margin-top: 24px;
  color: #9e9e9e;
  font-size: 12px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
`;
const StyledBottomButton = styled.div`
  margin-top: 12px;
  display: flex;
`;
const StyledMessageBtn = styled.div`
  display: flex;
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
            {type === GROUP_TYPES.GROUP ? (
              <img src={defaultGroupAvatar} alt="group avatar" />
            ) : (
              <img src={defaultTeamAvatar} alt="team avatar" />
            )}
          </StyledAvatar>
          <StyledRightColumn>
            <StyledName>{displayName}</StyledName>
            {description ? (
              <StyledDescription>{description}</StyledDescription>
            ) : null}
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
