/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2019-04-02 14:26:39
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import keycode from 'keycode';
import MuiTextField, { TextFieldProps } from '@material-ui/core/TextField';
import styled from '../../foundation/styled-components';
import { JuiTextField } from '../../components/Forms/TextField';
import { GetInputPropsOptions } from 'downshift';

type SelectedItem = {
  label: string;
  id?: number;
  email?: string;
};

type JuiDownshiftTextFieldStates = {
  showPlaceholder: boolean;
  shrink: boolean;
};

type JuiDownshiftTextFieldProps = {
  inputValue: string;
  selectedItems: SelectedItem[];
  label: string;
  helperText?: string;
  placeholder: string;
  getInputProps: (options?: GetInputPropsOptions | undefined) => any;
  InputItem?: React.ComponentType<any>;
  nameError?: boolean;
  emailError?: string;
  ref?: React.RefObject<HTMLInputElement>;
  autoSwitchEmail?: boolean;
  onSelectChange: (selectedItems: SelectedItem[]) => void;
  onInputChange: (value: string) => void;
};

const StyledTextField = styled<TextFieldProps>(JuiTextField)`
  && {
    .inputRoot {
      flex-wrap: wrap;
    }
    .input {
      flex: 1;
    }
  }
` as typeof MuiTextField;

class JuiDownshiftTextField extends React.PureComponent<
  JuiDownshiftTextFieldProps,
  JuiDownshiftTextFieldStates
> {
  state: JuiDownshiftTextFieldStates = {
    showPlaceholder: true,
    shrink: false,
  };
  handleFocus = () => {
    this.setState({
      showPlaceholder: false,
      shrink: true,
    });
  }
  handleBlur = (event: MouseEvent) => {
    const { inputValue, selectedItems } = this.props;
    if (!String(inputValue).length && !selectedItems.length) {
      this.setState({
        showPlaceholder: true,
        shrink: false,
      });
    }
  }
  handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { autoSwitchEmail, onSelectChange, onInputChange } = this.props;
    const { value } = event.target;
    const emailRegExp = /\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*\s/;
    const { selectedItems } = this.props;

    if (
      autoSwitchEmail &&
      emailRegExp.test(value) &&
      selectedItems.findIndex((item: SelectedItem) => item.email === value) ===
        -1
    ) {
      onSelectChange([
        ...selectedItems,
        {
          label: value,
          email: value,
        },
      ]);
      onInputChange('');
    }
    onInputChange(value);
  }
  handleKeyDown = (event: Event) => {
    const { onSelectChange, inputValue, selectedItems } = this.props;
    if (
      selectedItems.length &&
      !inputValue.length &&
      keycode(event) === 'backspace'
    ) {
      onSelectChange(selectedItems.slice(0, selectedItems.length - 1));
    }
  }
  handleDelete = (item: SelectedItem) => () => {
    const { onSelectChange, inputValue } = this.props;
    let { selectedItems } = this.props;
    selectedItems = [...selectedItems];
    selectedItems.splice(selectedItems.indexOf(item), 1);
    const shrink = selectedItems.length !== 0 || inputValue.length !== 0;
    const showPlaceholder = !String(inputValue).length && !selectedItems.length;
    this.setState({
      shrink,
      showPlaceholder,
    });
    onSelectChange(selectedItems);
  }

  render() {
    const {
      ref,
      label,
      placeholder,
      InputItem,
      nameError,
      emailError,
      helperText,
      getInputProps,
      selectedItems,
    } = this.props;
    const { showPlaceholder, shrink } = this.state;
    return (
      <StyledTextField
        label={showPlaceholder ? placeholder : label}
        fullWidth={true}
        error={nameError}
        helperText={nameError ? helperText : ''}
        InputProps={{
          ...getInputProps({
            startAdornment: selectedItems.map((item: SelectedItem) => {
              return InputItem ? (
                <InputItem
                  key={item.id}
                  tabIndex={0}
                  isError={emailError === item.label.trim()}
                  id={item.id}
                  onDelete={this.handleDelete(item)}
                />
              ) : null;
            }),
            inputRef: ref,
            onFocus: this.handleFocus,
            onBlur: this.handleBlur,
            onChange: this.handleInputChange,
            onKeyDown: this.handleKeyDown,
            classes: {
              root: 'inputRoot',
              input: 'input',
            },
            placeholder: `${
              selectedItems.length === 0 && showPlaceholder ? placeholder : ''
            }`,
          } as any),
        }}
        InputLabelProps={{
          shrink,
        }}
      />
    );
  }
}

export { JuiDownshiftTextField, SelectedItem };
