/*
 * @Author: Conner (conner.kang@ringcentral.com)
 * @Date: 2019-05-27 08:00:00
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import styled from '../../../foundation/styled-components';
import MuiTextField from '@material-ui/core/TextField';
import { FormHelperTextProps } from '@material-ui/core/FormHelperText';
import { InputLabelProps } from '@material-ui/core/InputLabel';
import { PropTypes } from '@material-ui/core';
import { InputProps } from '@material-ui/core/Input';
import RO from 'resize-observer-polyfill';

const SuffixFollowTextFieldWarp = styled('div')`
  && {
    position: relative;
  }
`;

const SuffixHolderWarpMarginBottom = '7px';
const SuffixHolderWarp = styled('pre')`
  && {
    position: absolute;
    bottom: 0;
    left: 0;
    margin-bottom: ${SuffixHolderWarpMarginBottom};
    word-wrap: break-word;
    white-space: pre-wrap;
  }
`;

const TextField = styled(MuiTextField)`` as typeof MuiTextField;

const SuffixHolderInputEl = styled('span')`
  && {
    color: transparent;
  }
`;

const SuffixHolderSuffixEl = styled('span')`
  && {
    color: ${({ theme }) => theme.palette.grey[700]};
  }
`;

type Props = {
  suffix?: string;
  defaultValue?: string | number;
  disabled?: boolean;
  error?: boolean;
  FormHelperTextProps?: Partial<FormHelperTextProps>;
  fullWidth?: boolean;
  helperText?: React.ReactNode;
  id?: string;
  InputLabelProps?: Partial<InputLabelProps>;
  label?: React.ReactNode;
  margin?: PropTypes.Margin;
  name?: string;
  onChange?: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  required?: boolean;
  type?: string;
  // tslint:disable-next-line: prefer-array-literal
  value?: Array<string | number | boolean> | string | number | boolean;
};

type TextFieldProps = Props & {
  variant?: 'standard';
  InputProps?: Partial<InputProps>;
  inputProps?: InputProps['inputProps'];
};

type States = {
  inputValue: string;
};

class RuiSuffixFollowTextField extends React.PureComponent<
  TextFieldProps,
  States
> {
  private _resizeObserver: RO;

  inputEl: HTMLInputElement;
  suffixHolder: React.RefObject<HTMLSpanElement> = React.createRef();
  suffixValue: React.RefObject<HTMLSpanElement> = React.createRef();
  inputWidth: number;

  state = {
    inputValue: '',
  };

  constructor(props: TextFieldProps) {
    super(props);
    this._resizeObserver = new RO(this.updateSize);
  }

  componentDidMount() {
    const inputEl = this.inputEl;
    const suffixEl = this.suffixHolder.current;
    if (inputEl && suffixEl) {
      const {
        fontFamily,
        fontSize,
        fontWeight,
        lineHeight,
        height,
      } = window.getComputedStyle(inputEl);
      suffixEl.style.maxHeight = height;
      suffixEl.style.fontFamily = fontFamily;
      suffixEl.style.fontSize = fontSize;
      suffixEl.style.fontWeight = fontWeight;
      suffixEl.style.lineHeight = lineHeight;

      this.inputWidth = Number(inputEl.style.width) || 0;
      this._resizeObserver.observe(inputEl);
    }

    const defaultValue = this.inputEl.value;
    this.setState({
      inputValue: defaultValue,
    });
  }

  componentWillUnmount() {
    this._resizeObserver.disconnect();
  }

  updateSize = (entries: ResizeObserverEntry[]) => {
    if (entries[0].target) {
      const { width } = entries[0].contentRect;
      const isAdded = this.inputWidth > width;
      this.syncHolderStyle(isAdded);
      this.inputWidth = width;
    }
  }

  handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    const originValue = this.state.inputValue;
    this.setState(
      {
        inputValue: value,
      },
      () => {
        const isAddAction = originValue.length < this.state.inputValue.length;
        this.syncHolderStyle(isAddAction);
      },
    );
    this.props.onChange && this.props.onChange(event);
  }

  transformPx2Num = (pxStr: string) => {
    return Number(pxStr.split('px')[0]);
  }

  syncHolderStyle(isAdd = true) {
    const inputEl = this.inputEl;
    const suffixEl = this.suffixHolder.current;
    if (inputEl && suffixEl) {
      if (!suffixEl.classList.value.includes(inputEl.className)) {
        suffixEl.className += ` ${inputEl.className}`;
      }

      const { height: inputElComputedHeight } = window.getComputedStyle(
        inputEl,
      );
      const inputElHeightValue = inputElComputedHeight
        ? this.transformPx2Num(inputElComputedHeight)
        : 0;

      const { height: suffixElComputedHeight } = window.getComputedStyle(
        suffixEl,
      );
      const suffixElHeightValue = suffixElComputedHeight
        ? suffixEl.scrollHeight
        : 0;

      if (isAdd) {
        const heightMaxValue = Math.max(
          inputElHeightValue,
          suffixElHeightValue,
        );
        suffixEl.style.minHeight = `${heightMaxValue}px`;
        inputEl.style.minHeight = `${heightMaxValue}px`;
      } else {
        const cacheSuffixElMinHeight = suffixEl.style.minHeight;
        suffixEl.style.minHeight = null;
        const inputElStyleHeight = inputEl.style.height;
        const inputElStyleHeightValue = inputElStyleHeight
          ? this.transformPx2Num(inputElStyleHeight)
          : 0;

        if (suffixEl.scrollHeight > inputElStyleHeightValue) {
          suffixEl.style.minHeight = cacheSuffixElMinHeight;
          return;
        }

        const heightMinValue = Math.min(
          suffixEl.scrollHeight,
          inputElStyleHeightValue,
        );
        suffixEl.style.minHeight = `${heightMinValue}px`;
        inputEl.style.minHeight = `${heightMinValue}px`;

        // 1px resize bug
        const inputElMinHeight = inputEl.style.minHeight;
        const inputElHeight = inputEl.style.height;
        if (inputElMinHeight && inputElHeight) {
          if (
            this.transformPx2Num(inputElMinHeight) + 1 ===
            this.transformPx2Num(inputElHeight)
          ) {
            inputEl.style.minHeight = inputElHeight;
            suffixEl.style.minHeight = inputElHeight;
          }
        }
      }
    }
  }

  render() {
    const { suffix, onChange, ...rest } = this.props;

    let suffixValue = null;

    if (typeof suffix === 'string') {
      suffixValue = ` ${suffix}`;
    }

    if (!this.inputEl || (this.inputEl && !this.inputEl.value)) {
      suffixValue = '';
    }

    const suffixHolder = (
      <SuffixHolderWarp ref={this.suffixHolder as any}>
        <SuffixHolderInputEl>{this.state.inputValue}</SuffixHolderInputEl>
        <SuffixHolderSuffixEl ref={this.suffixValue as any}>
          {suffixValue}
        </SuffixHolderSuffixEl>
      </SuffixHolderWarp>
    );

    return (
      <SuffixFollowTextFieldWarp>
        {suffixHolder}
        <TextField
          {...rest}
          onChange={this.handleInputChange}
          inputRef={(el: HTMLInputElement) => {
            this.inputEl = el;
          }}
          multiline={true}
        />
      </SuffixFollowTextFieldWarp>
    );
  }
}

export { RuiSuffixFollowTextField, TextFieldProps };
