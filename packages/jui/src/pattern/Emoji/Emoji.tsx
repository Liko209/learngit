/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2019-03-08 16:01:57
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import 'emoji-mart/css/emoji-mart.css';
import { Picker, EmojiData, EmojiSet, EmojiSheetSize } from 'emoji-mart';
import { JuiIconButton, JuiToggleButton } from '../../components/Buttons';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import { ExcludeList } from './excludeList';
import { JuiPopperMenu, AnchorProps } from '../PopperMenu';
import { HotKeys, HotKeysProps } from '../../hoc/HotKeys';
import styled from '../../foundation/styled-components';
import { grey, spacing, height } from '../../foundation/utils';
import { withTheme } from 'styled-components';
import { ThemeProps } from '../../foundation/theme/theme';

type Props = {
  handlerIcon: string;
  handleEmojiClick: (emoji: EmojiData, cb?: Function) => void;
  title?: string;
  sheetSize?: EmojiSheetSize;
  set?: EmojiSet;
  defaultSelector?: string;
  toggleButtonLabel?: string;
  handleKeepOpenChange?: () => void;
  isKeepOpen?: boolean;
  i18nObj?: object;
  tooltip?: string;
};
type ComponentProps = {
  isToggleWrapShow?: boolean;
};
const StyledCutomizedComponentContainer = styled.span<ComponentProps>`
  display: ${({ isToggleWrapShow }) => (isToggleWrapShow ? 'flex' : 'none')};
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
  isToggleWrapShow: boolean;
};

type EmojiProps = Props & ThemeProps;

const EMOJI_DASE_PATH = '/emoji';

function backgroundImageFn(set: EmojiSet, sheetSize: EmojiSheetSize) {
  return `${EMOJI_DASE_PATH}/${set}/${sheetSize}.png`;
}

class JuiEmoji extends React.PureComponent<EmojiProps, State> {
  private _buttonRef = React.createRef<HTMLButtonElement>();
  private _keyMap: HotKeysProps['keyMap'];

  constructor(props: EmojiProps) {
    super(props);
    this.state = {
      open: false,
      isToggleWrapShow: true,
    };
    this._keyMap = {
      esc: this._handleClose,
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
  };
  private _handleMouseLeave = () => {
    this.setState({ isToggleWrapShow: true });
  };

  private _handleClose = () => {
    this.setState({
      open: false,
      isToggleWrapShow: true,
    });
  };

  private _handleClickEvent = () => {
    this.setState(
      state => ({
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
  };

  private _IconButton = ({ tooltipForceHide }: AnchorProps) => (
    <JuiIconButton
      buttonRef={this._buttonRef}
      data-test-automation-id="conversation-chatbar-emoji-button"
      tooltipTitle={this.props.tooltip}
      onClick={this._handleClickEvent}
      size="medium"
      tooltipForceHide={tooltipForceHide}
    >
      {this.props.handlerIcon}
    </JuiIconButton>
  );

  private _isIndexOf = (source: string[], target: string[]) => {
    let isIndex = true;
    target.forEach(name => {
      if (source.indexOf(name as string) > -1) {
        isIndex = false;
      }
    });
    return isIndex;
  };

  private _handleClick = (emoji: EmojiData) => {
    const { handleEmojiClick, isKeepOpen } = this.props;
    handleEmojiClick(emoji, () => {
      if (!isKeepOpen) {
        this._handleClose();
      }
    });
  };

  private _filterEmoji = (emoji: any) =>
    this._isIndexOf(ExcludeList, emoji.short_names);

  render() {
    const { open } = this.state;
    const {
      sheetSize,
      set,
      title,
      defaultSelector,
      toggleButtonLabel,
      handleKeepOpenChange,
      isKeepOpen,
      theme,
      i18nObj,
    } = this.props;
    return (
      <HotKeys keyMap={this._keyMap}>
        <StyledEmojiWrapper>
          <JuiPopperMenu
            automationId="conversation-chatbar-emoji-menu"
            open={open}
            anchorEl={this._buttonRef.current}
            onClose={this._handleClose}
            Anchor={this._IconButton}
            placement="bottom-start"
            noTransition
            disablePortal
          >
            <Picker
              i18n={i18nObj}
              color={theme && theme.palette.primary.main}
              sheetSize={sheetSize}
              title={title || ''}
              emoji={defaultSelector || ''}
              set={set}
              onClick={this._handleClick}
              emojisToShowFilter={this._filterEmoji}
              backgroundImageFn={backgroundImageFn}
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
export { JuiEmoji, backgroundImageFn, JuiEmojiWithTheme };
