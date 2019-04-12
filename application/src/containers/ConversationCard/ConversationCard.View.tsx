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
import { Activity } from './Activity';
import {
  EditMessageInput,
  EditMessageInputViewComponent,
} from './EditMessageInput';
import { Profile, PROFILE_TYPE } from '@/containers/Profile';
import { jumpToPost } from '@/common/jumpToPost';

@observer
export class ConversationCard extends React.Component<
  ConversationCardViewProps
> {
  private _editMessageInputRef: React.RefObject<
    EditMessageInputViewComponent
  > = React.createRef();
  state = {
    isHover: false,
    isFocusMoreAction: false,
  };

  componentDidUpdate(prevProps: ConversationCardViewProps) {
    if (this.props.isEditMode && !prevProps.isEditMode) {
      this._focusEditor();
    }
  }

  handleMouseOver = () => {
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
    const { id, groupId } = this.props;
    jumpToPost({ id, groupId });
  }

  private _focusEditor() {
    setTimeout(() => {
      if (this._editMessageInputRef.current) {
        this._editMessageInputRef.current.focusEditor();
      }
    },         100);
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
      cardRef,
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
    const jumpToPost = mode ? this.jumpToPost : undefined;
    return (
      <JuiConversationCard
        data-name="conversation-card"
        data-id={id}
        Avatar={avatar}
        onMouseOver={this.handleMouseOver}
        onMouseLeave={this.handleMouseLeave}
        mode={mode}
        jumpToPost={jumpToPost}
        onAnimationStart={onAnimationStart}
        ref={cardRef}
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
          {isEditMode && (
            <EditMessageInput viewRef={this._editMessageInputRef} id={id} />
          )}
          {itemTypeIds && (
            <IdsToConversationSheet
              itemTypeIds={itemTypeIds}
              postId={id}
              mode={mode}
            />
          )}
        </JuiConversationCardBody>
        <Footer postId={id} />
      </JuiConversationCard>
    );
  }
}

const ConversationCardView = ConversationCard;

export { ConversationCardView };
