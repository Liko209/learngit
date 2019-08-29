import React from 'react';
import { observer } from 'mobx-react';
import {
  JuiConversationCard,
  JuiConversationCardHeader,
  JuiConversationCardHeaderAction,
  JuiConversationCardBody,
} from 'jui/pattern/ConversationCard';
import { Avatar } from '@/containers/Avatar';
import { jumpToPost } from '@/common/jumpToPost';
import { noop } from 'jui/foundation/utils';
import { JuiIconLink } from 'jui/pattern/IconLink';
import { Notification } from '@/containers/Notification';
import {
  ToastType,
  ToastMessageAlign,
} from '@/containers/ToastWrapper/Toast/types';
import { ConversationCardViewProps } from './types';
import { ProgressActions } from './ProgressActions';
import { Actions } from './Actions';
import { Footer } from './Footer';
import { IdsToConversationSheet } from '../ConversationSheet';
import { TextMessage } from '../ConversationSheet/TextMessage';
import { From } from './From';
import { MiniCard } from '../MiniCard';
import { Activity } from './Activity';
import {
  EditMessageInput,
  EditMessageInputViewComponent,
} from './EditMessageInput';
import { Profile, PROFILE_TYPE } from '../Profile';
import { i18nP } from '@/utils/i18nT';
import { Translation } from 'react-i18next';
import {
  SearchHighlightContext,
  HighlightContextInfo,
} from '@/common/postParser';
@observer
export class ConversationCard extends React.Component<
  ConversationCardViewProps
> {
  static contextType = SearchHighlightContext;
  context: HighlightContextInfo;

  private _editMessageInputRef: React.RefObject<
    EditMessageInputViewComponent
  > = React.createRef();
  state = {
    isHover: false,
  };

  handleMouseOver = () => {
    this.setState({
      isHover: true,
    });
  };

  handleMouseLeave = () => {
    this.setState({
      isHover: false,
    });
  };

  onClickAvatar = (event: React.MouseEvent) => {
    const { creator } = this.props;
    event.stopPropagation();
    MiniCard.show(<Profile id={creator.id} type={PROFILE_TYPE.MINI_CARD} />, {
      anchor: event.target as HTMLElement,
    });
  };

  getToastMessage = () => {
    const message = this.props.isArchivedGroup
      ? 'people.prompt.conversationArchived'
      : '';
    return i18nP(message);
  };
  get _navigationProps(): {
    mode?: string;
    navigate?: () => void;
    navigationTip?: JSX.Element;
    from?: JSX.Element;
  } {
    let navigationProps = {};
    const { mode, post } = this.props;
    if (mode === 'navigation') {
      navigationProps = {
        mode: 'navigation',
        navigate: this.handleJumpToPost,
        navigationTip: (
          <Translation>{t => t('message.jumpToConversation')}</Translation>
        ),
        from: <From id={post.groupId} />,
      };
    }
    return navigationProps;
  }
  handleJumpToPost = async () => {
    if (this.props.showToast) {
      this.flashToast(this.getToastMessage());
    } else {
      const { dataTrackingJumpToConversation } = this.context;
      dataTrackingJumpToConversation && dataTrackingJumpToConversation();
      const { id, groupId } = this.props;
      jumpToPost({ id, groupId });
    }
  };

  flashToast(message: string) {
    Notification.flashToast({
      message,
      type: ToastType.ERROR,
      messageAlign: ToastMessageAlign.LEFT,
      fullWidth: false,
      dismissible: false,
    });
  }

  private get _renderRepliedEntity() {
    const { repliedEntity } = this.props;

    if (!repliedEntity) {
      return null;
    }

    const { title = '', iconName } = repliedEntity;

    return (
      <>
        <JuiConversationCardHeaderAction>
          {i18nP('item.activity.reply')}
        </JuiConversationCardHeaderAction>
        <JuiIconLink iconName={iconName}>{title}</JuiIconLink>
      </>
    );
  }

  render() {
    const {
      id,
      creator,
      name,
      createTime,
      showProgressActions,
      itemTypeIds,
      mode,
      post,
      hideText,
      cardRef,
      onAnimationStart,
      onHighlightAnimationStart,
      colonsEmoji,
      statusPlainText,
      isEditMode,
      showActivityStatus,
      ...rest
    } = this.props;
    const { from, ...restNavigationProps } = this._navigationProps;
    const { isHover } = this.state;
    if (!creator.id) {
      return null;
    }
    const avatar = (
      <Avatar
        icon={post.icon}
        uid={creator.id}
        size="medium"
        data-name="avatar"
        onClick={post.icon ? noop : this.onClickAvatar}
      />
    );
    const activity = <Activity id={id} />;
    return (
      <JuiConversationCard
        data-name="conversation-card"
        data-id={id}
        Avatar={avatar}
        onMouseOver={this.handleMouseOver}
        onMouseLeave={this.handleMouseLeave}
        onAnimationStart={onAnimationStart}
        ref={cardRef}
        {...rest}
        {...restNavigationProps}
      >
        <JuiConversationCardHeader
          data-name="header"
          name={name}
          time={showProgressActions ? '' : createTime}
          statusPlainText={statusPlainText}
          colonsEmoji={colonsEmoji}
          notification={showActivityStatus && activity}
          repliedEntity={this._renderRepliedEntity}
          from={from}
        >
          {showProgressActions && (
            <ProgressActions id={id} isEditMode={isEditMode} />
          )}
          {!showProgressActions && isHover && (
            <Actions postId={id} groupId={post.groupId} />
          )}
        </JuiConversationCardHeader>
        <JuiConversationCardBody data-name="body">
          {!hideText && !isEditMode && (
            <TextMessage id={id} keyword={this.context.keyword} />
          )}
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
