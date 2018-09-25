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
// import JuiSearchItem from '../SearchItem';
// import JuiChip from '../Chip';
// import JuiSearchItemText from '../../atoms/SearchItemText';
// import JuiAvatar from '../../atoms/Avatar';
import JuiTextField from '../../atoms/TextField/TextField';
import { spacing } from '../../utils/styles';
import differenceBy from 'lodash/differenceBy';

type TJuiDownshiftMultipleState = {
  inputValue: string;
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

// const StyledChip = styled(JuiChip)`
//   && {
//     margin: ${spacing(1)};
//   }
// `;

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

class JuiDownshiftMultiple extends React.PureComponent<
  TJuiDownshiftMultipleProps,
  TJuiDownshiftMultipleState
> {
  setHightLightedIndex: Function;
  state: TJuiDownshiftMultipleState = {
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

  renderSuggestion = ({
    SearchContactItem,
    suggestion,
    itemProps,
    highlightedIndex,
    index,
  }: any) => {
    // const hhh = highlightedIndex === null && index === 0 ? 0 : highlightedIndex;
    const isHighlighted = highlightedIndex === index;
    // console.log(1111, highlightedIndex);
    // console.log(2222, index);
    // const isSelected = (selectedItem.id || '').indexOf(suggestion.id) > -1;

    // console.log('---suggetions---', suggestion);
    // console.log('------is select---', isSelected);

    return SearchContactItem ? (
      <SearchContactItem
        {...itemProps}
        isHighlighted={isHighlighted}
        suggestion={suggestion}
        index={index}
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
    const { inputValue, selectedItem, shrink } = this.state;

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
