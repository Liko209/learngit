/*
 * @Author: Jeffrey Huang (jeffrey.huang@ringcentral.com)
 * @Date: 2018-03-12 15:25:22
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import { observer } from 'mobx-react';
import styled from 'styled-components';

import Button from '@/components/Button';
import Ellipsis from '@/components/Ellipsis';
import Box, { Container } from '@/components/Layout';
import Presence from '@/containers/Presence';

import HeaderPresenter from './HeaderPresenter';

const HeaderWrapper = styled.div`
  flex-basis: 75px;
  min-height: 73px;
  width: 100%;
  margin-bottom: 5px;
`;

const MinProfileWrapper = styled.div`
  overflow: hidden;
  white-space: nowrap;
`;

const TitleWrapper = styled.div`
  font-size: 24px;
  font-weight: 600;
  color: #eee;
  text-overflow: ellipsis;
  overflow: hidden;
`;

const UserInfoWrapper = styled.div`
  width: calc(100% - 23px);
  margin-left: 10px;
  font-size: 13px;
  font-weight: 600;
  color: #eee;
`;
@observer
class Header extends Component {
  constructor() {
    super();
    this.headerPresenter = new HeaderPresenter();
  }

  componentDidMount() {
    this.headerPresenter.init();
  }

  componentWillUnmount() {
    this.headerPresenter.dispose();
  }

  render() {
    const {
      user = {},
      company = {},
      signOutClickHandler,
      awayStatusHistory
    } = this.headerPresenter;
    const rcPhoneNumbers = user ? user.rcPhoneNumbers || [] : [];
    const directNumber = rcPhoneNumbers.filter(
      number => number.usageType === 'DirectNumber'
    );

    return (
      <HeaderWrapper>
        <Container justifyContent="space-between" width="100%" paddingTop="5px">
          <MinProfileWrapper>
            <TitleWrapper>{company ? company.name : ''}</TitleWrapper>
            {user && Object.keys(user).length ? (
              <Box style={{ padding: '5px 0 10px 0' }}>
                <Presence
                    id={user.id}
                    awayStatus={awayStatusHistory}
                    style={{ margin: '5px 0 0 5px' }}
                />
                <UserInfoWrapper>
                  <Ellipsis>{user.displayName}</Ellipsis>
                  <Ellipsis>
                    {directNumber.length ? directNumber[0].phoneNumber : null}
                  </Ellipsis>
                </UserInfoWrapper>
              </Box>
            ) : null}
          </MinProfileWrapper>
          <Button
              handleRoute={signOutClickHandler}
              padding="0.2rem 0.5rem"
              fontSize="1.2rem"
          >
            Exit
          </Button>
        </Container>
      </HeaderWrapper>
    );
  }
}

export default Header;
