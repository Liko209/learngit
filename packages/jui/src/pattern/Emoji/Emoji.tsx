/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2019-03-08 16:01:57
 * Copyright © RingCentral. All rights reserved.
 */
import 'emoji-mart/css/emoji-mart.css';
import { Picker } from 'emoji-mart';
import React, { MouseEvent, Fragment } from 'react';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import { JuiIconButton } from '../../components/Buttons';
import styled from '../../foundation/styled-components';
import { JuiMenu, JuiMenuList } from '../../components';
import { ExcludeList } from './excludeList';

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

const Menu = styled(JuiMenu)`
  .menu-list-root {
    padding: 0;
  }
`;

class JuiEmoji extends React.PureComponent<Props> {
  state = {
    anchorEl: null,
  };

  private _handleClickEvent = (evt: MouseEvent) => {
    evt.stopPropagation();
    this.setState({ anchorEl: evt.currentTarget });
  }

  private _hideMenu = () => {
    this.setState({ anchorEl: null });
  }

  render() {
    const { anchorEl } = this.state;
    const {
      handleEmojiClick,
      handlerIcon,
      imgRootPath,
      sheetSize,
      set,
      title,
    } = this.props;
    const open = !!anchorEl;
    return (
      <Fragment>
        <JuiIconButton
          data-test-automation-id="conversation-chatbar-emoji-button"
          tooltipTitle="Emoji"
          onClick={this._handleClickEvent}
          size="medium"
        >
          {handlerIcon}
        </JuiIconButton>
        {open && (
          <Menu
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'center',
              horizontal: 'left',
            }}
            data-test-automation-id="conversation-chatbar-emoji-menu"
            anchorEl={anchorEl}
            MenuListProps={{
              classes: {
                root: 'menu-list-root',
              },
            }}
            open={open}
          >
            <JuiMenuList>
              <ClickAwayListener onClickAway={this._hideMenu}>
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
              </ClickAwayListener>
            </JuiMenuList>
          </Menu>
        )}
      </Fragment>
    );
  }
}

export { JuiEmoji };
