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
import styled from '../../foundation/styled-components';

type Props = {
  handlerIcon: string;
  handleEmojiClick?: (emoji: any) => void;
  title: string;
  imgRootPath?: string;
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

  private _handleClickEvent = (evt: MouseEvent) => {
    this.setState({ anchorEl: evt.currentTarget });
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

  render() {
    const { anchorEl } = this.state;
    const { handleEmojiClick, imgRootPath, sheetSize, set, title } = this.props;
    const open = !!anchorEl;
    return (
      <>
        {
          <JuiPopperMenu
            open={open}
            placement="bottom-start"
            Anchor={this._IconButton}
            noTranslation={true}
          >
            <StyledEmojiWrapper>
              <Picker
                sheetSize={sheetSize}
                title={title}
                emoji="point_up"
                set={set}
                onClick={handleEmojiClick}
                emojisToShowFilter={emoji => {
                  return ExcludeList.indexOf(emoji.id as string) < 0;
                }}
                backgroundImageFn={(set, sheetSize) => {
                  return imgRootPath
                    ? `/${imgRootPath}/sheet_${set}_${sheetSize}.png`
                    : `https://unpkg.com/emoji-datasource-${set}@4.0.4/img/${set}/sheets-256/${sheetSize}.png`;
                }}
              />
            </StyledEmojiWrapper>
          </JuiPopperMenu>
        }
      </>
    );
  }
}

export { JuiEmoji };
