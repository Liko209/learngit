/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2019-04-02 14:26:39
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { GetInputPropsOptions } from 'downshift';
import { isEmailByReg } from '../../foundation/utils';
import { StyledTextField } from './styles';

type SelectedItem = {
  label: string;
  id?: number;
  email?: string;
};

type JuiDownshiftTextFieldStates = {
  showPlaceholder: boolean;
};

// https://github.com/downshift-js/downshift#customizing-handlers
type JuiDownshiftTextFieldKeyDownEvent = React.KeyboardEvent & {
  nativeEvent: { preventDownshiftDefault: boolean };
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
  onKeyDown?: (event: JuiDownshiftTextFieldKeyDownEvent) => void;
  autoFocus?: boolean;
  onComposition: (isComposition: boolean) => void;
  openMenu: () => void;
};

class JuiDownshiftTextField extends React.PureComponent<
  JuiDownshiftTextFieldProps,
  JuiDownshiftTextFieldStates
> {
  state: JuiDownshiftTextFieldStates = {
    showPlaceholder: true,
  };
  handleFocus = () => {
    const { inputValue, openMenu } = this.props;
    if (inputValue) {
      openMenu();
    }
    this.setState({
      showPlaceholder: false,
    });
  };
  handleBlur = () => {
    const { inputValue, selectedItems } = this.props;
    if (!inputValue.length && !selectedItems.length) {
      this.setState({
        showPlaceholder: true,
      });
    }
  };
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
  };
  handleKeyDown = (event: JuiDownshiftTextFieldKeyDownEvent) => {
    const { onSelectChange, inputValue, selectedItems, onKeyDown } = this.props;
    if (selectedItems.length && !inputValue.length && event.keyCode === 8) {
      onSelectChange(selectedItems.slice(0, selectedItems.length - 1));
    }

    onKeyDown && onKeyDown(event);
  };

  handleCompositionStart = () => {
    this.props.onComposition(true);
  };

  handleCompositionEnd = () => {
    this.props.onComposition(false);
    const { inputValue, openMenu } = this.props;
    if (inputValue) {
      openMenu();
    }
  };

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
  };

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
      autoFocus,
    } = this.props;
    const { showPlaceholder } = this.state;
    const placeholderText =
      selectedItems.length === 0 && showPlaceholder ? placeholder : '';
    /* eslint-disable react/jsx-no-duplicate-props */
    return (
      <StyledTextField
        label={label}
        fullWidth
        error={nameError}
        helperText={nameError ? helperText : ''}
        InputProps={{
          ...getInputProps({
            autoFocus,
            startAdornment: selectedItems.map((item: SelectedItem) =>
              InputItem ? (
                <InputItem
                  label={item.label}
                  key={item.id}
                  tabIndex={0}
                  isError={emailError === item.label.trim()}
                  id={item.id}
                  onDelete={this.handleDelete(item)}
                />
              ) : null,
            ),
            inputRef: messageRef,
            onFocus: this.handleFocus,
            onBlur: this.handleBlur,
            onChange: this.handleInputChange,
            onKeyDown: this.handleKeyDown,
            classes: {
              root: multiple ? 'inputRoot' : '',
              input: multiple ? 'multiple' : 'input',
            },
            placeholder: placeholderText,
            readOnly: !multiple && selectedItems.length > 0,
          } as any),
        }}
        inputProps={{
          maxLength,
          onCompositionStart: this.handleCompositionStart,
          onCompositionEnd: this.handleCompositionEnd,
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

export {
  JuiDownshiftTextField,
  JuiDownshiftTextFieldKeyDownEvent,
  SelectedItem,
};
