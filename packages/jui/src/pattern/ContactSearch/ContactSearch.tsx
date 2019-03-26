/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-10-11 14:09:26
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import keycode from 'keycode';
import Downshift from 'downshift';
import { differenceBy } from 'lodash';
import styled from '../../foundation/styled-components';
import { JuiPaper } from '../../components/Paper';
import { JuiTextField } from '../../components/Forms/TextField';
import { spacing, height } from '../../foundation/utils/styles';

type State = {
  inputValue: string;
  showPlaceholder: boolean;
  shrink: boolean;
  selectedItem: Suggestion[];
};

type Suggestion = {
  label: string;
  id?: number;
  email?: string;
};

export type Props = {
  classes?: any;
  suggestions: Suggestion[];
  onSelectChange: (item: any) => void;
  inputChange: (value: string) => void;
  label: string;
  placeholder: string;
  Chip?: React.ComponentType<any>;
  ContactSearchItem?: React.ComponentType<any>;
  error?: boolean;
  helperText?: string;
  automationId?: string;
  errorEmail?: string;
  messageRef?: React.RefObject<HTMLInputElement>;
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
      this.setState(
        { selectedItem: selectedItem.slice(0, selectedItem.length - 1) },
        () => {
          this.props.onSelectChange(this.state.selectedItem);
        },
      );
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
        uid={suggestion.id}
        key={suggestion.id}
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
      selectedItem.findIndex((item: Suggestion) => item.email === value) === -1
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
          this.props.onSelectChange(this.state.selectedItem);
        },
      );
    }
    this.props.inputChange(value);
  }

  handleChange = (item: Suggestion) => {
    let { selectedItem } = this.state;

    if (selectedItem.indexOf(item) === -1) {
      selectedItem = [...selectedItem, item];
    }

    setTimeout(() => {
      this.setState(
        {
          selectedItem,
          inputValue: '',
        },
        () => {
          this.props.onSelectChange(this.state.selectedItem);
        },
      );
    },         0);
  }

  handleDelete = (item: Suggestion) => () => {
    this.setState(
      (state: State) => {
        const selectedItem = [...state.selectedItem];
        selectedItem.splice(selectedItem.indexOf(item), 1);
        const shrink =
          selectedItem.length !== 0 || state.inputValue.length !== 0;
        return { selectedItem, shrink };
      },
      () => {
        this.props.onSelectChange(this.state.selectedItem);
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
      automationId,
      errorEmail,
      messageRef,
    } = this.props;
    const { inputValue, selectedItem, shrink, showPlaceholder } = this.state;

    let filterSuggestions = suggestions;

    if (selectedItem && selectedItem.length) {
      filterSuggestions = differenceBy(suggestions, selectedItem, 'id');
    }

    return (
      <Downshift
        id="downshift-multiple"
        inputValue={inputValue}
        onChange={this.handleChange}
        selectedItem={selectedItem}
        defaultHighlightedIndex={0}
        itemToString={(item: Suggestion) => (item ? item.label : '')}
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
                  ref: messageRef,
                  InputProps: getInputProps({
                    startAdornment: selectedItem.map(
                      (item: Suggestion, index: number) => {
                        return Chip ? (
                          <Chip
                            key={index}
                            tabIndex={0}
                            label={item.label}
                            isError={errorEmail === item.label.trim()}
                            uid={item.id}
                            onDelete={this.handleDelete(item)}
                          />
                        ) : null;
                      },
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
                  <StyledPaper
                    square={true}
                    data-test-automation-id={automationId}
                  >
                    {filterSuggestions.map((suggestion: Suggestion, index) =>
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
