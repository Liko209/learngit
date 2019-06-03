/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2019-03-08 16:01:57
 * Copyright © RingCentral. All rights reserved.
 */
import 'emoji-mart/css/emoji-mart.css';
import { Picker, EmojiData } from 'emoji-mart';
import React, { MouseEvent } from 'react';
import { JuiIconButton, JuiToggleButton } from '../../components/Buttons';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import { ExcludeList } from './excludeList';
import { JuiPopperMenu, AnchorProps } from '../../pattern/PopperMenu';
import { HotKeys } from '../../hoc/HotKeys';
import styled from '../../foundation/styled-components';
import { grey, spacing, height } from '../../foundation/utils';
import { withTheme } from 'styled-components';
import { ThemeProps } from '../../foundation/theme/theme';

type Props = {
  handlerIcon: string;
  handleEmojiClick: (emoji: EmojiData, cb?: Function) => void;
  title?: string;
  sheetSize: 16 | 20 | 32 | 64 | undefined;
  set:
    | 'apple'
    | 'google'
    | 'twitter'
    | 'emojione'
    | 'messenger'
    | 'facebook'
    | undefined;
  defaultSelector?: string;
  toggleButtonLabel?: string;
  handleKeepOpenChange?: () => void;
  isKeepOpen?: boolean;
};

const StyledCutomizedComponentContainer = styled.span<{
  isToggleWrapShow?: boolean;
}>`
  display: ${({ isToggleWrapShow }) => {
    return isToggleWrapShow ? 'flex' : 'none';
  }};
  align-items: center;
  z-index: ${({ theme }) => theme.zIndex.default};
  position: absolute;
  width: 100%;
  height: ${height(17.5)};
  left: 0%;
  top: ${spacing(88.75)};
  color: ${grey('700')};
  && .leftContainer label {
    margin-left: ${spacing(5)};
  }
  && .custom-root {
    margin-right: ${spacing(2.5)};
  }
  && .rightContainer {
    margin-left: auto;
    margin-right: ${spacing(4)};
  }
`;

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
    .emoji-mart-preview-skins {
      z-index: ${({ theme }) => theme.zIndex.popup};
    }
  }
  && {
    z-index: ${({ theme }) => theme.zIndex.moreMenu};
  }
`;
let emojiMartContainer: HTMLCollectionOf<Element>;
type State = {
  open: boolean;
  anchorEl: EventTarget & Element | null;
  isToggleWrapShow: boolean;
};
type EmojiProps = Props & ThemeProps;
class JuiEmoji extends React.PureComponent<EmojiProps, State> {
  constructor(props: EmojiProps) {
    super(props);
    this.state = {
      anchorEl: null,
      open: false,
      isToggleWrapShow: true,
    };
  }

  componentDidMount() {
    emojiMartContainer =
      document.getElementsByClassName('emoji-mart-scroll') || [];
  }

  componentWillUnmount() {
    if (emojiMartContainer[0]) {
      emojiMartContainer[0].removeEventListener(
        'mouseenter',
        this._handleMouseEnter,
      );
      emojiMartContainer[0].removeEventListener(
        'mouseleave',
        this._handleMouseEnter,
      );
    }
  }

  private _handleMouseEnter = () => {
    this.setState({ isToggleWrapShow: false });
  }
  private _handleMouseLeave = () => {
    this.setState({ isToggleWrapShow: true });
  }

  handleClose = () => {
    this.setState({
      open: false,
    });
  }

  private _handleClickEvent = (evt: MouseEvent) => {
    const { currentTarget } = evt;
    this.setState(
      state => ({
        anchorEl: currentTarget,
        open: !state.open,
      }),
      () => {
        if (emojiMartContainer.length) {
          emojiMartContainer[0].addEventListener(
            'mouseenter',
            this._handleMouseEnter,
          );
          emojiMartContainer[0].addEventListener(
            'mouseleave',
            this._handleMouseLeave,
          );
        }
      },
    );
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
    const { handleEmojiClick, isKeepOpen } = this.props;
    handleEmojiClick(emoji, () => {
      if (!isKeepOpen) {
        this.handleClose();
      }
    });
  }

  render() {
    const { anchorEl, open } = this.state;
    const {
      sheetSize,
      set,
      title,
      defaultSelector,
      toggleButtonLabel,
      handleKeepOpenChange,
      isKeepOpen,
      theme,
    } = this.props;
    return (
      <HotKeys
        keyMap={{
          esc: this.handleClose,
        }}
      >
        <StyledEmojiWrapper>
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
            <Picker
              color={theme && theme.palette.primary.main}
              sheetSize={sheetSize}
              title={title || ''}
              emoji={defaultSelector || ''}
              set={set}
              onClick={this.handleClick}
              emojisToShowFilter={(emoji: any) => {
                return this.isIndexOf(ExcludeList, emoji.short_names);
              }}
            />
            <StyledCutomizedComponentContainer
              isToggleWrapShow={this.state.isToggleWrapShow}
            >
              <div className="leftContainer">
                <FormControlLabel
                  control={
                    <JuiToggleButton
                      checked={isKeepOpen}
                      onChange={handleKeepOpenChange}
                    />
                  }
                  label={toggleButtonLabel}
                />
              </div>
            </StyledCutomizedComponentContainer>
          </JuiPopperMenu>
        </StyledEmojiWrapper>
      </HotKeys>
    );
  }
}
const JuiEmojiWithTheme = withTheme(JuiEmoji);
export { JuiEmoji, JuiEmojiWithTheme };
