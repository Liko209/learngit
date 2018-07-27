/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-03-01 10:06:54
 * @Last Modified by: mikey.zhaopeng
 * @Last Modified time: 2018-07-26 16:01:43
 */
import React, { Component } from 'react';
import { service } from 'sdk';
import storeManager, { ENTITY_NAME } from '@/store';
import MultiEntityMapStore from '@/store/base/MultiEntityMapStore';
import Edit from './Edit';
import Like from './Like';
import Delete from './Delete';
import Pin from './Pin';
import Bookmark from './Bookmark';
import Quote from './Quote';
import Wrapper from './Wrapper';

const { AccountService, GroupService, PERMISSION_ENUM } = service;

interface Props {
  postId: number;
}

interface States {
  showPin: boolean;
  isMounted: boolean;
}

export default class Actions extends Component<Props, States> {
  constructor(props: Props) {
    super(props);
    this.state = {
      showPin: false,
      isMounted: false,
    };
  }

  componentDidMount() {
    const { postId } = this.props;
    const postStore: MultiEntityMapStore = storeManager.getEntityMapStore(
      ENTITY_NAME.POST,
    ) as MultiEntityMapStore;
    const { group_id } = postStore.get(postId);
    // Warning: Can't call setState (or forceUpdate) on an unmounted component.
    // This is a no-op, but it indicates a memory leak in your application.
    // To fix, cancel all subscriptions and asynchronous tasks in the componentWillUnmount method.
    this.setState({ isMounted: true }, () => {
      const service: GroupService = GroupService.getInstance();
      service
        .hasPermissionWithGroupId(group_id, PERMISSION_ENUM.TEAM_PIN_POST)
        .then((res: boolean) => {
          if (this.state.isMounted) {
            this.setState({
              showPin: res,
            });
          }
        });
    });
  }

  componentWillUnmount() {
    this.setState({ isMounted: false });
  }

  render() {
    const { postId } = this.props;
    const { showPin } = this.state;
    const postStore: MultiEntityMapStore = storeManager.getEntityMapStore(
      ENTITY_NAME.POST,
    ) as MultiEntityMapStore;
    const { text, creator_id } = postStore.get(postId);
    const service: AccountService = AccountService.getInstance();
    const userId = service.getCurrentUserId();
    const canEdit = userId === creator_id && text;
    const canQuote = text;
    const canDelete = userId === creator_id;

    return (
      <Wrapper>
        <Like postId={this.props.postId} />
        {showPin ? <Pin postId={this.props.postId} /> : null}
        <Bookmark postId={this.props.postId} />
        {canQuote && <Quote name="Quote" postId={this.props.postId} />}
        {canDelete && <Delete name="Delete" postId={this.props.postId} />}
        {canEdit && <Edit name="Edit" postId={this.props.postId} />}
      </Wrapper>
    );
  }
}
