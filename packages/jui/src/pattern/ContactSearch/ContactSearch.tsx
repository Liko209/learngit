/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-10-11 14:09:26
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import keycode from 'keycode';
import Downshift from 'downshift';
import differenceBy from 'lodash/differenceBy';
import styled from '../../foundation/styled-components';
import { JuiPaper } from '../../components/Paper';
import { JuiTextField } from '../../components/Forms/TextField';
import { spacing, height } from '../../foundation/utils/styles';

type State = {
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

export type Props = {
  classes?: any;
  suggestions: TSuggestion[];
  onChange: (item: any) => void;
  inputChange: (value: string) => void;
  label: string;
  placeholder: string;
  Chip?: React.ComponentType<any>;
  ContactSearchItem?: React.ComponentType<any>;
  error?: boolean;
  helperText?: string;
};

const StyledDownshiftMultipleWrapper = styled.div`
  position: relative;
`;

const StyledPaper = styled(JuiPaper)`
  && {
    padding: ${spacing(2)} 0;
    position: absolute;
    left: 0;
    bottom: 0;
    transform: translateY(100%);
    width: 100%;
    max-height: ${height(50)};
    overflow: auto;
    z-index: ${({ theme }) => `${theme.zIndex.drawer}`};
  }
`;

const StyledTextField = styled(JuiTextField)`
  && {
    .inputRoot {
      flex-wrap: wrap;
    }
    .input {
      flex: 1;
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
    error,
    helperText,
    ...rest
  } = inputProps;

  return (
    <StyledTextField
      label={showPlaceholder ? placeholder : label}
      fullWidth={true}
      error={error}
      helperText={error && helperText}
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

class JuiContactSearch extends React.PureComponent<Props, State> {
  setHightLightedIndex: Function;
  state: State = {
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
    ContactSearchItem,
    suggestion,
    itemProps,
    highlightedIndex,
    index,
  }: any) => {
    const isHighlighted = highlightedIndex === index;
    return ContactSearchItem ? (
      <ContactSearchItem
        {...itemProps}
        isHighlighted={isHighlighted}
        suggestion={suggestion}
        key={index}
        uid={suggestion.id}
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
      (state: State) => {
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
      ContactSearchItem,
      error,
      helperText,
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
          getInputProps,
          getItemProps,
          isOpen,
          inputValue,
          selectedItem,
          highlightedIndex,
        }) => {
          return (
            <div>
              <StyledDownshiftMultipleWrapper>
                {renderInput({
                  shrink,
                  label,
                  placeholder,
                  showPlaceholder,
                  error,
                  helperText,
                  fullWidth: true,
                  InputProps: getInputProps({
                    startAdornment: selectedItem.map(
                      (item: TSuggestion, index: number) =>
                        Chip ? (
                          <Chip
                            key={index}
                            tabIndex={0}
                            label={item.label}
                            uid={item.id}
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
                      if (
                        String(inputValue).length === 0 &&
                        selectedItem.length === 0
                      ) {
                        this.setState({
                          showPlaceholder: true,
                          shrink: false,
                        });
                      }
                    },
                    onChange: this.handleInputChange,
                    onKeyDown: this.handleKeyDown,
                    classes: {
                      root: 'inputRoot',
                      input: 'input',
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
                        ContactSearchItem,
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
            </div>
          );
        }}
      </Downshift>
    );
  }
}

export { JuiContactSearch };
