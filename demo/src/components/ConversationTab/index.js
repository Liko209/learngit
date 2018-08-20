/*
 * @Author: Jeffrey Huang (jeffrey.huang@ringcentral.com)
 * @Date: 2018-03-09 17:29:02
 * Copyright © RingCentral. All rights reserved.
 */
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import Presence from '#/containers/Presence';
import Badge from '#/containers/Badge';
import { Wrapper, Text, Placeholder } from './style';
import { withRouter } from 'react-router-dom';

@withRouter
class ConversationTab extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      clickId: 0
    };
  }
  componentDidMount() {
    const { id, state, currentGroupId, markAsRead } = this.props;
    if (state.unread_count > 0 && currentGroupId && id === currentGroupId) {
      markAsRead();
    }
  }

  componentDidUpdate(prevProps) {
    const { id, state, currentGroupId, markAsRead } = this.props;
    if (
      prevProps.state.unread_count !== state.unread_count &&
      state.unread_count > 0 &&
      currentGroupId &&
      id === currentGroupId
    ) {
      markAsRead();
    }
  }
  handleDbClick = (id, title, groupIds) => {
    const userAgent = navigator.userAgent.toLowerCase();
    const { history } = this.props;
    this.setState({
      clickId: id
    });
    if (userAgent.indexOf('electron/') > -1) {
      window.fijiElectron.popupWindow(
        () => {
          this.setState({
            clickId: 0
          });
        },
        title,
        id
      );
    } else {
      let left = screen.width / 2 - 600 / 2;
      let top = screen.height / 2 - 500 / 2;
      let newWindow = window.open(
        window.location.origin + `/singleConversation/${id}`,
        title,
        'toolbar=no, location=no, directories=no, status=1, scrollbars=1,menubar=no, scrollbars=no, resizable=0, copyhistory=no, width=' +
          650 +
          ', height=' +
          550 +
          ', top=' +
          top +
          ', left=' +
          left
      );
      newWindow.onbeforeunload = () => {
        this.setState({
          clickId: 0
        });
      };
    }
    const current = groupIds && groupIds.indexOf(id);
    const nextId = groupIds && groupIds[current + 1];
    const prevId =
      groupIds && current > 0 ? groupIds[current - 1] : groupIds[current];
    const usedId = nextId ? nextId : prevId;
    history.push(`/conversation/${usedId}`);
  };
  render() {
    const {
      markAsRead,
      title,
      showPresence,
      presenceId,
      id,
      groupIds
    } = this.props;
    const { clickId } = this.state;
    return (
      <Wrapper
          to={`/conversation/${id}`}
          onClick={markAsRead}
          onDoubleClick={() => this.handleDbClick(id, title, groupIds)}
          id={id}
          clickid={clickId}
      >
      
        {showPresence ? (
          <Presence offlineHide id={presenceId} />
        ) : (
          <Placeholder />
        )}
        <Text>{title}</Text>
        <Badge id={id} />
      </Wrapper>
    );
  }
}

ConversationTab.propTypes = {
  id: PropTypes.number.isRequired,
  markAsRead: PropTypes.func.isRequired,
  currentGroupId: PropTypes.number.isRequired,
  state: PropTypes.object.isRequired,
  presenceId: PropTypes.number.isRequired,
  showPresence: PropTypes.bool.isRequired,
  title: PropTypes.string.isRequired
};

export default ConversationTab;
