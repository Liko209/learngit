/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2019-04-02 14:26:39
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import MuiTextField, { TextFieldProps } from '@material-ui/core/TextField';
import styled from '../../foundation/styled-components';
import { JuiTextField } from '../../components/Forms/TextField';
import { GetInputPropsOptions } from 'downshift';
import { isEmailByReg } from '../../foundation/utils';

type SelectedItem = {
  label: string;
  id?: number;
  email?: string;
};

type JuiDownshiftTextFieldStates = {
  showPlaceholder: boolean;
};

type JuiDownshiftTextFieldProps = {
  multiple?: boolean;
  inputValue: string;
  selectedItems: SelectedItem[];
  label: string;
  helperText?: string;
  placeholder: string;
  getInputProps: (options?: GetInputPropsOptions | undefined) => any;
  InputItem?: React.ComponentType<any>;
  nameError?: boolean;
  emailError?: string;
  messageRef?: React.RefObject<HTMLInputElement>;
  autoSwitchEmail?: boolean;
  onSelectChange: (selectedItems: SelectedItem[]) => void;
  onInputChange: (value: string) => void;
  maxLength?: number;
};

const StyledTextField = styled<TextFieldProps>(JuiTextField)`
  && {
    .inputRoot {
      flex-wrap: wrap;
    }
    .input {
      flex: 1;
    }
    .downshift-label {
      width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
` as typeof MuiTextField;

class JuiDownshiftTextField extends React.PureComponent<
  JuiDownshiftTextFieldProps,
  JuiDownshiftTextFieldStates
> {
  state: JuiDownshiftTextFieldStates = {
    showPlaceholder: true,
  };
  handleFocus = () => {
    this.setState({
      showPlaceholder: false,
    });
  }
  handleBlur = () => {
    const { inputValue, selectedItems } = this.props;
    if (!inputValue.length && !selectedItems.length) {
      this.setState({
        showPlaceholder: true,
      });
    }
  }
  handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const {
      autoSwitchEmail,
      onSelectChange,
      onInputChange,
      selectedItems,
      multiple,
    } = this.props;
    const { value } = event.target;

    onInputChange(value);
    if (
      autoSwitchEmail &&
      isEmailByReg(value) &&
      selectedItems.findIndex((item: SelectedItem) => item.email === value) ===
        -1
    ) {
      if (multiple) {
        onSelectChange([
          ...selectedItems,
          {
            label: value,
            email: value,
          },
        ]);
      } else {
        onSelectChange([
          {
            label: value,
            email: value,
          },
        ]);
      }

      onInputChange('');
    }
  }
  handleKeyDown = (event: KeyboardEvent) => {
    const { onSelectChange, inputValue, selectedItems } = this.props;
    if (selectedItems.length && !inputValue.length && event.keyCode === 8) {
      onSelectChange(selectedItems.slice(0, selectedItems.length - 1));
    }
  }
  handleDelete = (item: SelectedItem) => () => {
    const { onSelectChange, inputValue } = this.props;
    let { selectedItems } = this.props;
    selectedItems = [...selectedItems];
    selectedItems.splice(selectedItems.indexOf(item), 1);

    const showPlaceholder = !inputValue.length && !selectedItems.length;
    this.setState({
      showPlaceholder,
    });
    onSelectChange(selectedItems);
  }

  render() {
    const {
      messageRef,
      label,
      placeholder,
      InputItem,
      nameError,
      emailError,
      helperText,
      getInputProps,
      selectedItems,
      maxLength,
      multiple,
    } = this.props;
    const { showPlaceholder } = this.state;
    const placeholderText =
      selectedItems.length === 0 && showPlaceholder ? placeholder : '';
    return (
      <StyledTextField
        label={label}
        fullWidth={true}
        error={nameError}
        helperText={nameError ? helperText : ''}
        InputProps={{
          ...getInputProps({
            startAdornment: selectedItems.map((item: SelectedItem) => {
              return InputItem ? (
                <InputItem
                  label={item.label}
                  key={item.id}
                  tabIndex={0}
                  isError={emailError === item.label.trim()}
                  id={item.id}
                  onDelete={this.handleDelete(item)}
                />
              ) : null;
            }),
            inputRef: messageRef,
            onFocus: this.handleFocus,
            onBlur: this.handleBlur,
            onChange: this.handleInputChange,
            onKeyDown: this.handleKeyDown,
            classes: {
              root: 'inputRoot',
              input: 'input',
            },
            placeholder: placeholderText,
            readOnly: !multiple && selectedItems.length > 0,
          } as any),
        }}
        inputProps={{
          maxLength,
        }}
        InputLabelProps={{
          classes: {
            root: 'downshift-label',
          },
        }}
      />
    );
  }
}

export { JuiDownshiftTextField, SelectedItem };
