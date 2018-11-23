/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-11-22 14:09:02
 * Copyright © RingCentral. All rights reserved.
 */
import React, { PureComponent } from 'react';
import { GroupListProps, GROUP_TYPES, GROUP_LIST_TITLE } from './types';
import styled from '../../foundation/styled-components';

const StyledListWrapper = styled.div`
  max-height: 100%;
`;
const StyledContent = styled.div`
  margin-left: 24px;
`;
const StyledTitleBar = styled.div``;
const StyledTitle = styled.p`
  font-size: 16px;
  color: #212121;
`;
const StyledList = styled.ul`
  max-height: 48vh;
  overflow: scroll;
  list-style: none;
  padding:0;
  margin:0;
`;
const StyledItem = styled.li`
  display: flex;
  height: 48px;
  background-color: #fff;
  align-items: center;
  &:hover{
    background-color: #f5f5f5;
  }
  &:nth-last-child(1) {
    margin-bottom: 24px;
  }
`;
const StyledBottomBar = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  border: 12px solid #fff;
  box-shadow: 0 -2px 4px -2px rgba(0, 0, 0, 0.14);
`;
class JuiGroupProfileList extends PureComponent<GroupListProps> {
  render() {
    const { counts, type, membersList = [] } = this.props;
    return (
      <StyledListWrapper>
        <StyledContent>
          <StyledTitleBar>
            <StyledTitle>
              {type === GROUP_TYPES.TEAM
                ? `${GROUP_LIST_TITLE.TEAM_MEMBERS} (${counts})`
                : `${GROUP_LIST_TITLE.GROUP_MEMBERS} (${counts})`}
            </StyledTitle>
          </StyledTitleBar>
          <StyledList>
            {
              membersList.map((item, idx) => {
                return (<StyledItem key={idx}>{item.name}</StyledItem>);
              })
            }
          </StyledList>
        </StyledContent>
        <StyledBottomBar />
      </StyledListWrapper>
    );
  }
}

export { JuiGroupProfileList };
