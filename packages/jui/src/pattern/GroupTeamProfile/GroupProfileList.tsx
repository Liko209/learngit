/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-11-22 14:09:02
 * Copyright © RingCentral. All rights reserved.
 */
import React, { PureComponent } from 'react';
import { GroupListProps, GROUP_TYPES, GROUP_LIST_TITLE } from './types';
import styled from '../../foundation/styled-components';

const StyledListWrapper = styled.div`
  height: 320px;
`;
const StyledContent = styled.div`
  margin: 16px 16px 24px 24px;
`;
const StyledTitleBar = styled.div``;
const StyledTitle = styled.p`
  font-size: 16px;
  color: #212121;
`;
const StyledList = styled.ul`
  height: 294px;
  overflow: scroll;
  list-style: none;
  padding:0;
  margin:0;
`;
const StyledItem = styled.li`
  padding:0; margin:0;
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
