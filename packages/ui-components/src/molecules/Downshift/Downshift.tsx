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
import JuiTextField from '../../atoms/TextField/TextField';
import { spacing } from '../../utils/styles';
import differenceBy from 'lodash/differenceBy';

type TJuiDownshiftMultipleState = {
  inputValue: string;
  showPlaceholder: boolean;
  shrink: boolean;
  selectedItem: TSuggestion[];
};

type TSuggestion = {
  label: string;
  id?: number;
  email?: string;
};

export type TJuiDownshiftMultipleProps = {
  classes?: any;
  suggestions: TSuggestion[];
  onChange: (item: any) => void;
  inputChange: (value: string) => void;
  label: string;
  placeholder: string;
  Chip?: React.ComponentType<any>;
  SearchContactItem?: React.ComponentType<any>;
};

const StyledDownshiftMultipleWrapper = styled.div`
  position: relative;
`;

const StyledPaper = styled(Paper)`
  && {
    padding: ${spacing(2)} 0;
    position: absolute;
    left: 0;
    bottom: 0;
    transform: translateY(100%);
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

const renderInput = (inputProps: any) => {
  const {
    InputProps,
    ref,
    shrink,
    label,
    placeholder,
    showPlaceholder,
    ...rest
  } = inputProps;
  return (
    <StyledTextField
      label={showPlaceholder ? placeholder : label}
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

class JuiDownshiftMultiple extends React.PureComponent<
  TJuiDownshiftMultipleProps,
  TJuiDownshiftMultipleState
> {
  setHightLightedIndex: Function;
  state: TJuiDownshiftMultipleState = {
    inputValue: '',
    showPlaceholder: true,
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

  renderSuggestion = ({
    SearchContactItem,
    suggestion,
    itemProps,
    highlightedIndex,
    index,
  }: any) => {
    const isHighlighted = highlightedIndex === index;

    return SearchContactItem ? (
      <SearchContactItem
        {...itemProps}
        isHighlighted={isHighlighted}
        suggestion={suggestion}
        key={index}
      />
    ) : null;
  }
  handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    const emailRegExp = /\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*\s/;
    const { selectedItem } = this.state;

    this.setState({ inputValue: value });

    if (
      emailRegExp.test(value) &&
      selectedItem.findIndex(item => item.email === value) === -1
    ) {
      this.setState(
        {
          selectedItem: [
            ...selectedItem,
            {
              label: value,
              email: value,
            },
          ],
          inputValue: '',
        },
        () => {
          this.props.onChange(this.state.selectedItem);
        },
      );
    }
    this.props.inputChange(value);
  }

  handleChange = (item: TSuggestion) => {
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

  handleDelete = (item: TSuggestion) => () => {
    this.setState(
      (state: TJuiDownshiftMultipleState) => {
        const selectedItem = [...state.selectedItem];
        selectedItem.splice(selectedItem.indexOf(item), 1);
        const shrink = selectedItem.length !== 0;
        return { selectedItem, shrink };
      },
      () => {
        this.props.onChange(this.state.selectedItem);
      },
    );
  }

  render() {
    const {
      suggestions,
      label,
      placeholder,
      Chip,
      SearchContactItem,
    } = this.props;
    const { inputValue, selectedItem, shrink, showPlaceholder } = this.state;

    const filterSuggestions = differenceBy(suggestions, selectedItem, 'id');

    return (
      <Downshift
        id="downshift-multiple"
        inputValue={inputValue}
        onChange={this.handleChange}
        selectedItem={selectedItem}
        defaultHighlightedIndex={0}
        itemToString={item => (item ? item.label : '')}
      >
        {({
          getRootProps,
          getInputProps,
          getItemProps,
          isOpen,
          inputValue,
          selectedItem,
          highlightedIndex,
        }) => {
          return (
            <StyledDownshiftMultipleWrapper
              {...getRootProps({ refKey: 'innerRef' })}
            >
              {renderInput({
                shrink,
                label,
                placeholder,
                showPlaceholder,
                fullWidth: true,
                InputProps: getInputProps({
                  startAdornment: selectedItem.map(
                    (item: TSuggestion, index: number) =>
                      Chip ? (
                        <Chip
                          key={index}
                          tabIndex={-1}
                          label={item.label}
                          id={item.id}
                          onDelete={this.handleDelete(item)}
                        />
                      ) : null,
                  ),
                  onFocus: () => {
                    this.setState({
                      showPlaceholder: false,
                      shrink: true,
                    });
                  },
                  onBlur: () => {
                    this.setState({
                      showPlaceholder: true,
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
                  placeholder: `${
                    selectedItem.length === 0 && showPlaceholder
                      ? placeholder
                      : ''
                  }`,
                } as any), // Downshift startAdornment is not include in getInputProps interface
              })}
              {isOpen && filterSuggestions.length ? (
                <StyledPaper square={true}>
                  {filterSuggestions.map((suggestion: TSuggestion, index) =>
                    this.renderSuggestion({
                      SearchContactItem,
                      suggestion,
                      index,
                      selectedItem,
                      highlightedIndex,
                      itemProps: getItemProps({ item: suggestion }),
                    }),
                  )}
                </StyledPaper>
              ) : null}
            </StyledDownshiftMultipleWrapper>
          );
        }}
      </Downshift>
    );
  }
}

export default JuiDownshiftMultiple;
