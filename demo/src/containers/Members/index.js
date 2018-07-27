/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-03-05 15:59:37
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { observer } from 'mobx-react';
import { withRouter } from 'react-router-dom';
import throttle from 'lodash/throttle';

import storeManager, { ENTITY_NAME } from '@/store';

import RightPanelTitle from '@/components/Conversation/RightTitle';
import More from '@/components/Conversation/MembersMore';
import AvatarPresence from '@/components/AvatarWithPresence/index';
import AddMember from '@/components/AddMember';
import AddMemberModal from '@/containers/Members/AddMemberModal';

import MembersPresenter from './MembersPresenter';

const MembersList = styled.div`
  margin: 10px 0;
`;

const NEED_RESPONSITIVE = 1100; // window's width(default 1100px)

const NORMAL_MEMBERS = 14; // window size greater then NEED_RESPONSITIVE
const MORE_MEMBERS = 16;

const NORMAL_AVATAR = '36px'; // window size greater then NEED_RESPONSITIVE
const SMALL_AVATAR = '30px';

@withRouter
@observer
class Members extends Component {
  static propTypes = {
    match: PropTypes.object.isRequired
  };
  constructor(props) {
    super(props);
    this.membersPresenter = new MembersPresenter();
    this.state = {
      maxLength: NORMAL_MEMBERS,
      avatarStyle: {
        width: '36px',
        height: '36px'
      },
      showModal: false
    };
    this.handleOpenModal = this.handleOpenModal.bind(this);
    this.handleCloseModal = this.handleCloseModal.bind(this);
  }
  componentDidMount() {
    window.addEventListener('resize', this.handleResize);
  }
  componentWillUnmount() {
    window.removeEventListener('resize', this.handleResize);
    this.membersPresenter.dispose();
  }

  // eslint-disable-next-line
  handleResize = throttle(e => {
    const { innerWidth } = e.target;
    // TODO Need extract global constant
    // And wherever used in project
    const avatarSize =
      innerWidth < NEED_RESPONSITIVE ? SMALL_AVATAR : NORMAL_AVATAR;
    const maxLength =
      innerWidth < NEED_RESPONSITIVE ? MORE_MEMBERS : NORMAL_MEMBERS;
    this.setState({
      maxLength,
      avatarStyle: {
        width: avatarSize,
        height: avatarSize
      }
    });
  }, 450);

  handleOpenModal() {
    this.setState({ showModal: true });
  }

  handleCloseModal() {
    this.setState({ showModal: false });
  }

  render() {
    const groupStore = storeManager.getEntityMapStore(ENTITY_NAME.GROUP);
    const { match } = this.props;
    const {
      params: { id }
    } = match;
    const group = groupStore.get(Number(id));
    const { members = [], isTeam } = group;
    const { showAddMember } = this.membersPresenter;
    const showAddMemberBtn = showAddMember && isTeam;
    const {
      avatarStyle: { width, height },
      maxLength,
      showModal
    } = this.state;

    this.membersPresenter.hasAddMemberPermissionByGroupId(Number(id));

    return (
      <section>
        <RightPanelTitle title="MEMBERS" />
        <MembersList className="memberList">
          {members
            .slice(0, maxLength - 1)
            .map(uid => (
              <AvatarPresence
                  width={width}
                  height={height}
                  key={uid}
                  id={uid}
              />
            ))}
          {showAddMemberBtn && (
            <AddMember
                handleOpenModal={this.handleOpenModal}
                width={width}
                height={height}
            />
          )}
          {members.length > maxLength &&
            !showAddMemberBtn && <More width={width} height={height} />}
        </MembersList>
        {showModal && (
          <AddMemberModal
              showModal={showModal}
              handleCloseModal={this.handleCloseModal}
              groupId={id}
              members={members}
          />
        )}
      </section>
    );
  }
}

export default Members;
