/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2019-03-08 16:01:57
 * Copyright © RingCentral. All rights reserved.
 */
import 'emoji-mart/css/emoji-mart.css';
import { Picker, EmojiData } from 'emoji-mart';
import React, { MouseEvent } from 'react';
import { JuiIconButton } from '../../components/Buttons';
import { ExcludeList } from './excludeList';
import { JuiPopperMenu, AnchorProps } from '../../pattern/PopperMenu';
import { HotKeys } from '../../hoc/HotKeys';
import styled from '../../foundation/styled-components';

type Props = {
  handlerIcon: string;
  handleEmojiClick: (emoji: EmojiData, cb?: Function) => void;
  title: string;
  sheetSize: 16 | 20 | 32 | 64 | undefined;
  set:
    | 'apple'
    | 'google'
    | 'twitter'
    | 'emojione'
    | 'messenger'
    | 'facebook'
    | undefined;
};

const StyledEmojiWrapper = styled.div`
  && {
    .emoji-mart-title-label {
      font-size: ${({ theme }) => theme.typography.title1.fontSize};
    }
    .emoji-mart-anchor:focus {
      outline: none;
    }
    .emoji-mart-emoji:focus {
      outline: none;
    }
    .emoji-mart {
      white-space: normal;
    }
  }
`;
type State = { open: boolean; anchorEl: EventTarget & Element | null };
class JuiEmoji extends React.PureComponent<Props, State> {
  state = {
    anchorEl: null,
    open: false,
  };

  handleClose = () => {
    this.setState({
      open: false,
    });
  }

  private _handleClickEvent = (evt: MouseEvent) => {
    const { currentTarget } = evt;
    this.setState(state => ({
      anchorEl: currentTarget,
      open: !state.open,
    }));
  }

  private _IconButton = ({ tooltipForceHide }: AnchorProps) => {
    return (
      <JuiIconButton
        data-test-automation-id="conversation-chatbar-emoji-button"
        tooltipTitle="Emoji"
        onClick={this._handleClickEvent}
        size="medium"
        tooltipForceHide={tooltipForceHide}
      >
        {this.props.handlerIcon}
      </JuiIconButton>
    );
  }

  private isIndexOf = (source: string[], target: string[]) => {
    let isIndex = true;
    target.forEach(name => {
      if (source.indexOf(name as string) > -1) {
        isIndex = false;
      }
    });
    return isIndex;
  }
  handleClick = (emoji: EmojiData) => {
    const { handleEmojiClick } = this.props;
    handleEmojiClick(emoji, () => {
      this.handleClose();
    });
  }
  render() {
    const { anchorEl, open } = this.state;
    const { sheetSize, set, title } = this.props;
    return (
      <HotKeys
        keyMap={{
          esc: this.handleClose,
        }}
      >
        <JuiPopperMenu
          automationId="conversation-chatbar-emoji-menu"
          open={open}
          anchorEl={anchorEl}
          onClose={this.handleClose}
          Anchor={this._IconButton}
          placement="bottom-start"
          noTransition={true}
          disablePortal={true}
        >
          <StyledEmojiWrapper>
            <Picker
              sheetSize={sheetSize}
              title={title}
              emoji="point_up"
              set={set}
              onClick={this.handleClick}
              emojisToShowFilter={(emoji: any) => {
                return this.isIndexOf(ExcludeList, emoji.short_names);
              }}
            />
          </StyledEmojiWrapper>
        </JuiPopperMenu>
      </HotKeys>
    );
  }
}

export { JuiEmoji };
