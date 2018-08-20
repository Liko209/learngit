/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-02-28 13:38:31
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { observer } from 'mobx-react';
import styled from 'styled-components';

import incomingAudio from 'ringcentral-web-phone/audio/incoming.ogg';
import outgoingAudio from 'ringcentral-web-phone/audio/outgoing.ogg';
import RingCentralWebPhone from 'ringcentral-web-phone';

import { service } from 'sdk';

import { getGroupName } from '#/utils/groupName';
import storeManager, { ENTITY_NAME } from '#/store';

import { platform } from './platform';
import { appkey, appName } from './constant';

const { AccountService } = service;

const Wrapper = styled.header`
  font-family: proxima-nova0 !important;
  display: flex;
  margin: 0;
  padding: 16px 30px 16px 25px;
  border-bottom: 1px solid #e9e9e9;
  background-color: #fff;
  color: #333;
  font-size: 32px;
  font-weight: 100;
`;

const GroupName = styled.div`
  display: -webkit-box;
  -webkit-box-orient: vertical;
  text-overflow: ellipsis;
  font-size: 4vw;
  @media (min-width: 800px) {
    font-size: 32px;
  }
  @media (max-width: 930px) {
    overflow: hidden;
    -webkit-line-clamp: 1;
  }
`;
const PhoneCall = styled.button`
  position: absolute;
  right: 140px;
  width: 65px;
  height: 40px;
  border-radius: 8px;
  font-size: 14px;
  background: #008fc1;
  color: white;
`;
const HandUp = styled.button`
  position: absolute;
  right: 20px;
  width: 65px;
  height: 40px;
  border-radius: 8px;
  font-size: 14px;
  background: #e15352;
  color: white;
  outline: none;
`;
@withRouter
@observer
class Header extends Component {
  static propTypes = {
    match: PropTypes.object.isRequired
  };
  constructor(props) {
    super(props);
    this.handleMakeCall = this.handleMakeCall.bind(this);
    this.handleUp = this.handleUp.bind(this);
    this.state = {
      session: null
    };
  }
  componentDidMount() {
    const auth = JSON.parse(localStorage.getItem('AUTH/RC_TOKEN'));
    if (!platform.auth().accessTokenValid()) {
      platform.auth().setData(auth);
    }
  }
  handleMakeCall = phoneNumber => {
    const that = this;
    return platform
      .post('/client-info/sip-provision', {
        sipInfo: [{ transport: 'WSS' }]
      })
      .then(res => {
        const webPhone = new RingCentralWebPhone(res.json(), {
          appKey: appkey,
          appName,
          logLevel: 1, // error 0, warn 1, log: 2, debug: 3
          audioHelper: {
            enabled: true,
            incoming: incomingAudio,
            outgoing: outgoingAudio
          }
        });
        const session = webPhone.userAgent.invite(phoneNumber, {
          media: {
            render: {
              remote: document.getElementById('remoteVideo'),
              local: document.getElementById('localVideo')
            }
          },
          fromNumber: null,
          homeCountryId: '1'
        });
        that.setState({
          session
        });
      });
  };
  handleUp() {
    const { session } = this.state;
    if (session) {
      session.terminate();
    }
    // session && session.terminate();
  }

  render() {
    const userId = AccountService.getInstance().getCurrentUserId();

    const { match } = this.props;
    const {
      params: { id }
    } = match;
    const groupStore = storeManager.getEntityMapStore(ENTITY_NAME.GROUP);
    const group = groupStore.get(Number(id));
    const { isTeam } = group;
    const setAbbreviation = group.set_abbreviation
      ? group.set_abbreviation
      : group.setAbbreviation;
    if (isTeam) {
      return (
        <Wrapper>
          <GroupName>{setAbbreviation}</GroupName>
        </Wrapper>
      );
    }

    const { members = [] } = group;
    const showPhoneBtn = false;
    const personStore = storeManager.getEntityMapStore('person');
    /* eslint-disable */
    let otherId,
      person = null,
      rcPhoneNumbers = 0,
      phoneNumber = '';
    if (showPhoneBtn) {
      otherId = members[0] === userId ? members[1] : members[0];
      person = personStore.get(+otherId);
      rcPhoneNumbers = person && person.rcPhoneNumbers;
      if (rcPhoneNumbers) {
        phoneNumber = rcPhoneNumbers[0] && rcPhoneNumbers[0].phoneNumber;
      }
    }

    const memberIds = members.slice();
    const peopleName = getGroupName(memberIds, userId);
    const lastComma = peopleName.lastIndexOf(',');
    const lastUsername = peopleName.substring(lastComma);
    return (
      <Wrapper>
        <GroupName>
          {peopleName.replace(lastUsername, lastUsername.replace(',', ' and '))}
        </GroupName>
        {showPhoneBtn ? (
          <div>
            <PhoneCall onClick={() => this.handleMakeCall(phoneNumber)}>
              call
            </PhoneCall>
            <HandUp onClick={this.handleUp}>hangUp</HandUp>
          </div>
        ) : null}
      </Wrapper>
    );
  }
}

export default Header;
