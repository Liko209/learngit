/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-09-16 18:03:44
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import keycode from 'keycode';
import Downshift from 'downshift';
import styled from '../../styled-components';
import Paper from '@material-ui/core/Paper';
import JuiSearchItem from '../SearchItem';
import JuiChip from '../Chip';
import JuiSearchItemText from '../../atoms/SearchItemText';
import JuiAvatar from '../../atoms/Avatar';
import JuiTextField from '../../atoms/TextField/TextField';
import { spacing } from '../../utils/styles';

type TJuiDownshiftMultipleState = {
  inputValue: string;
  shrink: boolean;
  selectedItem: never[];
};

type TSuggestion = {
  label: string;
  value?: number;
  email?: string;
};

export type TJuiDownshiftMultipleProps = {
  classes?: any;
  suggestions: TSuggestion[];
  onChange: (item: any) => void;
  inputChange: (value: string) => void;
  label: string;
  placeholder: string;
};

const StyledDownshiftMultipleWrapper = styled.div`
  position: relative;
`;

const StyledPaper = styled(Paper)`
  && {
    padding: ${spacing(2)} 0;
    position: absolute;
    left: 0;
    top: 50px;
    width: 100%;
    z-index: ${({ theme }) => `${theme.zIndex.drawer}`};
  }
`;

const StyledTextField = styled(JuiTextField)`
  && {
    .input {
      flex-wrap: wrap;
    }
  }
`;

const StyledChip = styled(JuiChip)`
  && {
    margin: ${spacing(1)};
  }
`;

const renderInput = (inputProps: any) => {
  const { InputProps, ref, shrink, label, ...rest } = inputProps;
  return (
    <StyledTextField
      label={label}
      fullWidth={true}
      InputProps={{
        inputRef: ref,
        ...InputProps,
      }}
      InputLabelProps={{
        shrink,
      }}
      {...rest}
    />
  );
};

const renderSuggestion = ({
  suggestion,
  index,
  itemProps,
  highlightedIndex,
  selectedItem,
}: any) => {
  const isHighlighted = highlightedIndex === index;
  const isSelected = (selectedItem || '').indexOf(suggestion.label) > -1;

  console.log('---suggetions---', suggestion);

  return (
    <JuiSearchItem
      {...itemProps}
      key={suggestion.label}
      selected={isHighlighted}
      style={{
        fontWeight: isSelected ? 500 : 400,
      }}
    >
      <JuiAvatar />
      <JuiSearchItemText
        primary={suggestion.label}
        secondary={suggestion.email}
      />
    </JuiSearchItem>
  );
};

class JuiDownshiftMultiple extends React.Component<
  TJuiDownshiftMultipleProps,
  TJuiDownshiftMultipleState
> {
  state = {
    inputValue: '',
    shrink: false,
    selectedItem: [],
  };

  handleKeyDown = (event: Event) => {
    const { inputValue, selectedItem } = this.state;
    if (
      selectedItem.length &&
      !inputValue.length &&
      keycode(event) === 'backspace'
    ) {
      this.setState({
        selectedItem: selectedItem.slice(0, selectedItem.length - 1),
      });
    }
  }

  handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    const emailRegExp = /\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*\s/;
    this.setState({ inputValue: value });

    if (emailRegExp.test(value)) {
      this.state.selectedItem.push(value as never);
      this.setState({ inputValue: '' });
    }
    this.props.inputChange(value);
  }

  handleChange = (item: never) => {
    let { selectedItem } = this.state;

    if (selectedItem.indexOf(item) === -1) {
      selectedItem = [...selectedItem, item];
    }

    this.setState(
      {
        selectedItem,
        inputValue: '',
      },
      () => {
        this.props.onChange(this.state.selectedItem);
      },
    );
  }

  handleDelete = (item: never) => () => {
    this.setState((state: TJuiDownshiftMultipleState) => {
      const selectedItem = [...state.selectedItem];
      selectedItem.splice(selectedItem.indexOf(item), 1);
      const shrink = selectedItem.length !== 0;
      return { selectedItem, shrink };
    });
  }

  render() {
    const { suggestions, label, placeholder } = this.props;
    const { inputValue, selectedItem, shrink } = this.state;

    return (
      <Downshift
        id="downshift-multiple"
        inputValue={inputValue}
        onChange={this.handleChange}
        selectedItem={selectedItem}
      >
        {({
          getRootProps,
          getInputProps,
          getItemProps,
          isOpen,
          inputValue,
          selectedItem,
          highlightedIndex,
        }) => (
          <StyledDownshiftMultipleWrapper
            {...getRootProps({ refKey: 'innerRef' })}
          >
            {renderInput({
              shrink,
              label,
              fullWidth: true,
              InputProps: getInputProps({
                startAdornment: selectedItem.map((item: never) => (
                  <StyledChip
                    key={item}
                    tabIndex={-1}
                    label={item}
                    onDelete={this.handleDelete(item)}
                  />
                )),
                onFocus: () => {
                  this.setState({
                    shrink: true,
                  });
                },
                onBlur: () => {
                  this.setState({
                    shrink:
                      selectedItem.length !== 0 ||
                      String(inputValue).length !== 0,
                  });
                },
                onChange: this.handleInputChange,
                onKeyDown: this.handleKeyDown,
                classes: {
                  root: 'input',
                },
                placeholder: `${selectedItem.length === 0 ? placeholder : ''}`,
              } as any), // Downshift startAdornment is not include in getInputProps interface
            })}
            {isOpen &&
            (String(inputValue).length !== 0 || selectedItem.length !== 0) ? (
              <StyledPaper square={true}>
                {suggestions.map((suggestion, index) =>
                  renderSuggestion({
                    suggestion,
                    index,
                    selectedItem,
                    highlightedIndex,
                    itemProps: getItemProps({ item: suggestion.label }),
                  }),
                )}
              </StyledPaper>
            ) : null}
          </StyledDownshiftMultipleWrapper>
        )}
      </Downshift>
    );
  }
}

export default JuiDownshiftMultiple;
