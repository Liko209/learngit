/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2019-08-15 10:15:50
 * Copyright © RingCentral. All rights reserved.
 */
import React, { PureComponent } from 'react';
import { Emoji, getEmojiDataFromNative } from 'emoji-mart';
import TextField, { TextFieldProps } from '@material-ui/core/TextField';
import styled from '../../foundation/styled-components';
import { JuiMenuList, JuiMenuItem } from '../../components/Menus';
import { JuiCustomStatusProps } from './types';
import { backgroundImageFn } from '../Emoji';
import { JuiIconButton } from '../../components/Buttons';
import { spacing, grey, height } from '../../foundation/utils/styles';
import Collapse from '@material-ui/core/Collapse';
import data from 'emoji-mart/data/all.json';

const set = 'emojione';
const EMOJI_SIZE = 20;
const NAME_INPUT_PROPS = {
  'data-test-automation-id': 'ShareCustomStatusInputField',
  maxLength: 40,
};
const JuiCustomContainer = styled.div`
  position: relative;
`;

const JuiCustomInputContainer = styled.div`
  display: flex;
  flex-direction: row-reverse;
`;
const JuiCustomInput = styled<TextFieldProps>(TextField)`
  border: 1px solid ${grey('400')};
  margin-left: ${spacing(3)};
  && {
    input {
      padding: ${spacing(2.75, 3.5)};
      margin-left: ${spacing(9)};
      margin-right: ${spacing(4.5)};
    }
    fieldset {
      border-radius: ${spacing(1)};
    }
  }
` as typeof TextField;
const JuiEmojiContainer = styled.div`
  position: absolute;
  left: 0;
  top: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: ${spacing(10)};
  height: ${spacing(10)};
  border-right: 1px solid ${grey('400')};
  span {
    button {
      position: absolute;
      left: 0;
    }
  }
`;
const StyledMenuItem = styled(JuiMenuItem)`
  && {
    height: ${height(10)};
    color: ${grey('900')};
    padding: ${spacing(1, 4, 1, 2.5)};
    font-size: ${({ theme }) => theme.typography.body1.fontSize};
    .emoji-mart-emoji {
      padding-right: ${spacing(2.5)};
      display: flex;
      align-items: center;
    }
  }
`;
const ClearBtn = styled(JuiIconButton)`
  && {
    position: absolute;
    right: ${spacing(2.5)};
    top: ${spacing(2.5)};
    cursor: pointer;
  }
`;
const StyledMenuList = styled(JuiMenuList)`
  margin-bottom: ${spacing(-2)} !important;
`;

class JuiCustomStatus extends PureComponent<JuiCustomStatusProps> {
  render() {
    const {
      menuItems,
      emojiNode,
      showCloseBtn,
      value,
      colons,
      onClear,
      handleStatusChange,
      onStatusItemClick,
      isShowMenuList,
      handleInputFocus,
      placeHolder,
    } = this.props;

    const emojiData = getEmojiDataFromNative(colons, set, data);

    return (
      <JuiCustomContainer>
        <JuiCustomInputContainer>
          <JuiCustomInput
            value={value}
            autoFocus
            fullWidth
            onFocus={handleInputFocus}
            onChange={handleStatusChange}
            inputProps={NAME_INPUT_PROPS}
            variant="outlined"
            placeholder={placeHolder}
          />
          {showCloseBtn && (
            <ClearBtn
              disableToolTip
              variant="plain"
              data-test-automation-id="clearStatusBtn"
              onClick={onClear}
              color={'grey.500'}
            >
              remove
            </ClearBtn>
          )}
          <JuiEmojiContainer>
            {emojiNode}
            <Emoji
              emoji={(emojiData && emojiData.colons) || ''}
              set={set}
              size={18}
              backgroundImageFn={backgroundImageFn}
            />
          </JuiEmojiContainer>
        </JuiCustomInputContainer>
        <Collapse in={isShowMenuList}>
          <StyledMenuList
            style={isShowMenuList ? { display: 'block' } : { display: 'none' }}
          >
            {menuItems.map((item: { emoji: string; status: string }) => {
              const _emojiData = getEmojiDataFromNative(item.emoji, set, data);
              return (
                <StyledMenuItem
                  onClick={(evt: React.MouseEvent) =>
                    onStatusItemClick(evt, item)
                  }
                  data-text={item.status}
                  key={item.status}
                  data-test-automation-id="shareStatusMenuItem"
                >
                  <Emoji
                    emoji={(_emojiData && _emojiData.colons) || ''}
                    set={set}
                    size={EMOJI_SIZE}
                    backgroundImageFn={backgroundImageFn}
                  />
                  {item.status}
                </StyledMenuItem>
              );
            })}
          </StyledMenuList>
        </Collapse>
      </JuiCustomContainer>
    );
  }
}
export { JuiCustomStatus, JuiCustomInput };
