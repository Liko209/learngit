import React from 'react';
import { observer } from 'mobx-react';
import {
  JuiConversationCard,
  JuiConversationCardHeader,
  JuiConversationCardBody,
} from 'jui/pattern/ConversationCard';
import { Avatar } from '@/containers/Avatar';
import { ConversationCardViewProps } from '@/containers/ConversationCard/types';
import { ProgressActions } from '@/containers/ConversationCard/ProgressActions';
import { Actions } from '@/containers/ConversationCard/Actions';
import { Footer } from '@/containers/ConversationCard/Footer';
import { IdsToConversationSheet } from '@/containers/ConversationSheet';
import { TextMessage } from '@/containers/ConversationSheet/TextMessage';
import { From } from './From';
import { MiniCard } from '@/containers/MiniCard';
import history from '@/history';
import storeManager from '@/store';
import { GLOBAL_KEYS } from '@/store/constants';
import { Activity } from './Activity';
import { EditMessageInput } from './EditMessageInput';
import { Profile, PROFILE_TYPE } from '@/containers/Profile';

@observer
export class ConversationCard extends React.Component<
  ConversationCardViewProps
> {
  state = {
    isHover: false,
    isFocusMoreAction: false,
  };

  handleMouseEnter = () => {
    this.setState({
      isHover: true,
    });
  }

  handleMouseLeave = () => {
    this.setState({
      isHover: false,
    });
  }

  onClickAvatar = (event: React.MouseEvent) => {
    const { creator } = this.props;
    event.stopPropagation();
    MiniCard.show(<Profile id={creator.id} type={PROFILE_TYPE.MINI_CARD} />, {
      anchor: event.target as HTMLElement,
    });
  }

  jumpToPost = () => {
    const globalStore = storeManager.getGlobalStore();
    globalStore.set(GLOBAL_KEYS.JUMP_TO_POST_ID, this.props.id);
    history.push(`/messages/${this.props.groupId}`);
  }

  render() {
    const {
      id,
      creator,
      name,
      createTime,
      customStatus,
      showProgressActions,
      itemTypeIds,
      mode,
      post,
      hideText,
      highlight,
      onAnimationStart,
      onHighlightAnimationStart,
      isEditMode,
      showActivityStatus,
      ...rest
    } = this.props;
    const { isHover } = this.state;
    if (!creator.id) {
      return null;
    }
    const avatar = (
      <Avatar
        uid={creator.id}
        size="medium"
        data-name="avatar"
        onClick={this.onClickAvatar}
      />
    );
    const activity = <Activity id={id} />;
    const from = mode === 'navigation' ? <From id={post.groupId} /> : undefined;
    const onClickHandler = mode ? this.jumpToPost : undefined;
    return (
      <JuiConversationCard
        data-name="conversation-card"
        data-id={id}
        Avatar={avatar}
        onMouseEnter={this.handleMouseEnter}
        onMouseLeave={this.handleMouseLeave}
        mode={mode}
        highlight={highlight}
        onClick={onClickHandler}
        onAnimationStart={onAnimationStart}
        {...rest}
      >
        <JuiConversationCardHeader
          data-name="header"
          name={name}
          time={showProgressActions ? '' : createTime}
          status={customStatus}
          from={from}
          notification={showActivityStatus && activity}
        >
          {showProgressActions && <ProgressActions id={id} />}
          {!showProgressActions && isHover && (
            <Actions postId={id} groupId={post.groupId} />
          )}
        </JuiConversationCardHeader>
        <JuiConversationCardBody data-name="body">
          {!hideText && !isEditMode && <TextMessage id={id} />}
          {isEditMode && <EditMessageInput id={id} />}
          {itemTypeIds && (
            <IdsToConversationSheet itemTypeIds={itemTypeIds} postId={id} />
          )}
        </JuiConversationCardBody>
        <Footer postId={id} />
      </JuiConversationCard>
    );
  }
}

const ConversationCardView = ConversationCard;

export { ConversationCardView };
