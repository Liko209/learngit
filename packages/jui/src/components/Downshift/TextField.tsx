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
  handleBlur = () => {
    const { inputValue, selectedItems } = this.props;
    if (!inputValue.length && !selectedItems.length) {
      this.setState({
        showPlaceholder: true,
        shrink: false,
      });
    }
  }
  handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const {
      autoSwitchEmail,
      onSelectChange,
      onInputChange,
      selectedItems,
    } = this.props;
    const { value } = event.target;

    onInputChange(value);
    if (
      autoSwitchEmail &&
      isEmailByReg(value) &&
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
    const shrink = selectedItems.length !== 0 || inputValue.length !== 0;
    const showPlaceholder = !inputValue.length && !selectedItems.length;
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
    const placeholderText =
      selectedItems.length === 0 && showPlaceholder ? placeholder : '';
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
                  label={item.label}
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
            placeholder: placeholderText,
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
