/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-11-22 11:27:02
 * Copyright © RingCentral. All rights reserved.
 */
import { observer } from 'mobx-react';
import React from 'react';
import { translate } from 'react-i18next';
import { JuiGroupProfileList } from 'jui/pattern/GroupTeamProfile';
import { ID_TYPE } from '../types';
import { Avatar } from '@/containers/Avatar';
import { GROUP_LIST_TITLE } from 'jui/pattern/GroupTeamProfile/types';
import styled from 'jui/foundation/styled-components';
import { MemberListViewProps } from './types';

const StyledTitleBar = styled.div``;
const StyledTitle = styled.p`
  font-size: 16px;
  color: #212121;
  margin-left: 24px;
`;
const StyledBottomBar = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  border: 12px solid #fff;
  box-shadow: 0 -2px 4px -2px rgba(0, 0, 0, 0.14);
`;
const StyledListWrapper = styled.div`
  max-height: 100%;
`;
const StyledContent = styled.div``;

const StyledList = styled.ul`
  position: relative;
  max-height: 48vh;
  overflow: scroll;
  list-style: none;
  padding: 0;
  margin: 0;
`;
@observer
class MembersList extends React.Component<MemberListViewProps> {
  private _onScrollEvent(event: any) {
    const clientHeight = event.target.clientHeight;
    const isBottom = clientHeight + event.target.scrollTop === event.target.scrollHeight;
    console.log('isBottom', isBottom);
    console.log('scrollTop', event.target.scrollTop);
  }
  render() {
    const { membersList, idType, counts, t } = this.props;
    return (
      <StyledListWrapper>
        <StyledContent>
          <StyledTitleBar>
            <StyledTitle>
              {idType === ID_TYPE.TEAM
                ? `${t(GROUP_LIST_TITLE.TEAM_MEMBERS)} (${counts})`
                : `${t(GROUP_LIST_TITLE.GROUP_MEMBERS)} (${counts})`}
            </StyledTitle>
          </StyledTitleBar>
          <StyledList onScrollCapture={(event: any) => this._onScrollEvent(event)}>
            {membersList.map((item: any, idx: number) => {
              return (
                <JuiGroupProfileList key={idx}>
                  <Avatar uid={item.id} />
                  {item.displayName}
                </JuiGroupProfileList>
              );
            })}
          </StyledList>
        </StyledContent>
        <StyledBottomBar />
      </StyledListWrapper>
    );
  }
}
const MembersListView = translate('translations')(MembersList);

export { MembersListView };
