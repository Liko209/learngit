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
import { idsToConversationSheet } from '@/containers/ConversationSheet';
import { TextMessage } from '@/containers/ConversationSheet/TextMessage';
import { From } from './From';
import { MiniCard } from '@/containers/MiniCard';
import history from '@/history';
import storeManager from '@/store';
import { GLOBAL_KEYS } from '@/store/constants';
import { Activity } from './Activity';
import { EditMessageInput } from './EditMessageInput';

@observer
export class ConversationCard extends React.Component<
  ConversationCardViewProps
> {
  private timer: number;
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
    const { isFocusMoreAction } = this.state;
    if (!isFocusMoreAction) {
      this.setState({
        isHover: false,
      });
    }
  }

  handleMoreActionFocus = () => {
    this.setState({
      isFocusMoreAction: true,
    });
    clearTimeout(this.timer);
  }

  handleMoreActionBlur = () => {
    this.setState({
      isFocusMoreAction: false,
    });
    this.timer = setTimeout(() => {
      this.setState({
        isHover: false,
      });
    });
  }

  onClickAvatar = (event: React.MouseEvent) => {
    const { creator } = this.props;
    event.stopPropagation();
    MiniCard.showProfile({
      anchor: event.target as HTMLElement,
      id: creator.id,
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
      <React.Fragment>
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
            time={createTime}
            status={customStatus}
            from={from}
            notification={activity}
          >
            {showProgressActions ? <ProgressActions id={id} /> : null}
            {!showProgressActions && isHover ? (
              <Actions
                onMoreActionFocus={this.handleMoreActionFocus}
                onMoreActionBlur={this.handleMoreActionBlur}
                tabIndex={0}
                id={id}
              />
            ) : null}
          </JuiConversationCardHeader>
          <JuiConversationCardBody data-name="body">
            {hideText || isEditMode ? null : <TextMessage id={id} />}
            {isEditMode && <EditMessageInput id={id} />}
            {idsToConversationSheet(itemTypeIds, id)}
          </JuiConversationCardBody>
          <Footer id={id} />
        </JuiConversationCard>
      </React.Fragment>
    );
  }
}

const ConversationCardView = ConversationCard;

export { ConversationCardView };
