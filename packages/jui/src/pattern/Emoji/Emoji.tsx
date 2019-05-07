/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2019-03-08 16:01:57
 * Copyright © RingCentral. All rights reserved.
 */
import 'emoji-mart/css/emoji-mart.css';
import { Picker } from 'emoji-mart';
import React, { MouseEvent } from 'react';
import { JuiIconButton } from '../../components/Buttons';
import { ExcludeList } from './excludeList';
import { JuiPopperMenu, AnchorProps } from '../../pattern/PopperMenu';
import { HotKeys } from '../../hoc/HotKeys';
import styled from '../../foundation/styled-components';
import { ClickAwayListener } from '@material-ui/core';

type Props = {
  handlerIcon: string;
  handleEmojiClick?: (emoji: any) => void;
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
      font-size: 20px;
    }
    .emoji-mart-anchor:focus {
      outline: none;
    }
  }
`;

class JuiEmoji extends React.PureComponent<Props> {
  state = {
    anchorEl: null,
  };

  handleClose = () => {
    this.setState({
      anchorEl: null,
    });
  }

  private _handleClickEvent = (evt: MouseEvent) => {
    if (this.state.anchorEl) {
      this.handleClose();
    }
    this.setState({ anchorEl: this.state.anchorEl ? null : evt.currentTarget });
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

  render() {
    const { anchorEl } = this.state;
    const { handleEmojiClick, sheetSize, set, title } = this.props;
    const open = !!anchorEl;
    return (
      <>
        {
          <HotKeys
            keyMap={{
              esc: this.handleClose,
            }}
          >
            <ClickAwayListener onClickAway={this.handleClose}>
              <JuiPopperMenu
                open={open}
                placement="bottom-start"
                Anchor={this._IconButton}
                noTransition={true}
              >
                <StyledEmojiWrapper>
                  <Picker
                    sheetSize={sheetSize}
                    title={title}
                    emoji="point_up"
                    set={set}
                    onClick={handleEmojiClick}
                    emojisToShowFilter={(emoji: any) => {
                      return this.isIndexOf(ExcludeList, emoji.short_names);
                    }}
                  />
                </StyledEmojiWrapper>
              </JuiPopperMenu>
            </ClickAwayListener>
          </HotKeys>
        }
      </>
    );
  }
}

export { JuiEmoji };
