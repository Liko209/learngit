/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-08-20 09:21:51
 * Copyright © RingCentral. All rights reserved.
 */
import styled from '../../styled-components';
import React from 'react';
import Search from '@material-ui/icons/Search';
import Typography from '@material-ui/core/Typography';
import Select, { components } from 'react-select';
import { ControlProps } from 'react-select/lib/components/Control';
import { OptionProps } from 'react-select/lib/components/Option';
import { ValueType } from 'react-select/lib/types';

type TSearchBarProps = {
  awake?: boolean;
  className?: string;
  setSearchBarState: Function;
};

const suggestions = [
  { label: 'Afghanistan' },
  { label: 'Aland Islands' },
  { label: 'Albania' },
  { label: 'Algeria' },
  { label: 'American Samoa' },
  { label: 'Andorra' },
  { label: 'Angola' },
  { label: 'Anguilla' },
  { label: 'Antarctica' },
  { label: 'Antigua and Barbuda' },
  { label: 'Argentina' },
  { label: 'Armenia' },
  { label: 'Aruba' },
  { label: 'Australia' },
  { label: 'Austria' },
  { label: 'Azerbaijan' },
  { label: 'Bahamas' },
  { label: 'Bahrain' },
  { label: 'Bangladesh' },
  { label: 'Barbados' },
  { label: 'Belarus' },
  { label: 'Belgium' },
  { label: 'Belize' },
  { label: 'Benin' },
  { label: 'Bermuda' },
  { label: 'Bhutan' },
  { label: 'Bolivia, Plurinational State of' },
  { label: 'Bonaire, Sint Eustatius and Saba' },
  { label: 'Bosnia and Herzegovina' },
  { label: 'Botswana' },
  { label: 'Bouvet Island' },
  { label: 'Brazil' },
  { label: 'British Indian Ocean Territory' },
  { label: 'Brunei Darussalam' },
].map(suggestion => ({
  value: suggestion.label,
  label: suggestion.label,
}));

const Indicators = styled.div`
  position: absolute;
  top: ${({ theme }) => `${theme.spacing.unit * 2}px`};
  left: 0;
  color: ${({ theme }) => theme.palette.grey[500]};
  &:hover {
    color: ${({ theme }) => theme.palette.grey[500]};
  }
`;
const IconSearch = styled(Search)`
  margin: 0 ${({ theme }) => `${theme.spacing.unit * 3}px`};
`;
const IndicatorsContainer = () => {
  return (
    <Indicators>
      <IconSearch />
    </Indicators>
  );
};

const DropdownIndicator = (props: any) => {
  return (
    components.DropdownIndicator && <components.DropdownIndicator {...props} />
  );
};

const Placeholder = (props: React.Props<any>) =>
  (
    <Typography
      style={{ position: 'absolute', left: '48px', color: '#9E9E9E' }}
    >
      {props.children}
    </Typography>
  );

// const StyledControl = styled(components.Control)`
//   && {
//     background-color: ${props => props.isFocused ? '#fff !important' : '#F5F5F5'};
//     border: ${props => props.isFocused
//     ? '1px solid #ccc !important'
//     : '1px solid #F5F5F5'};
//     max-width: 640px;
//     height: 40px;
//     box-shadow: 0;
//     &:hover {
//       backgroundColor: #E0E0E0;
//       border: 1px solid #E0E0E0;
//     };
//   }
// ` as ComponentType<ControlProps<any>>;

// const Control = (props: ControlProps<any>) => (<StyledControl {...props} />);

const colourStyles = {
  container: (styles: React.CSSProperties) => {
    return { ...styles, width: '100%', margin: '0 20px', maxWidth: '1308px' };
  },
  control: (styles: React.CSSProperties, state: ControlProps<any>) => {
    return {
      ...styles,
      backgroundColor: state.isFocused ? '#fff !important' : '#F5F5F5', // 100
      border: state.isFocused
        ? '1px solid #ccc !important'
        : '1px solid #F5F5F5',
      height: '40px',
      boxShadow: '0',
      ':hover': {
        backgroundColor: '#E0E0E0', // 300
        border: '1px solid #E0E0E0',
      },
    };
  },
  menuList: (styles: React.CSSProperties) => {
    return {
      ...styles,
      color: '#616161 !important', // 700
      backgroundColor: '#fff',
    };
  },
  option: (styles: React.CSSProperties, state: OptionProps<any>) => {
    return {
      ...styles,
      color: state.isSelected
        ? '#fff !important'
        : state.isFocused
          ? '#555 !important'
          : '#555', // 700
      backgroundColor: state.isSelected
        ? '#0684bd !important'
        : state.isFocused
          ? '#EBF6FA !important'
          : 'transparent',
      '&:hover': {
        backgroundColor: '#f4f4f4',
        color: '#515151 !important',
      },
    };
  },
  input: (styles: React.CSSProperties) => {
    return {
      ...styles,
      margin: '2px 2px 2px 40px',
    };
  },
  singleValue: (styles: React.CSSProperties) => {
    return {
      ...styles,
      margin: '2px 2px 2px 40px',
    };
  },
};

// type TSelectWithThemeProps<OptionType> = {
//   theme?: Theme;
//   awake?: boolean;
// } & Props<OptionType>;

// class SelectWithTheme<OptionType> extends Select<TSelectWithThemeProps<OptionType>, <State>> {
//   render() {
//     return (
//       <Select
//         {...this.props}
//       />
//     );
//   }
// }

class SearchBar extends React.Component<TSearchBarProps, {
  value:
  ValueType<{ value: string; label: string; }>,
}> {
  constructor(props: TSearchBarProps) {
    super(props);
    this.state = {
      value: null,
    };
  }
  handleChange = (value: ValueType<{ value: string; label: string; }>) => {
    this.setState({
      value,
    });
  }

  onBlur = () => {
    this.props.setSearchBarState(false);
  }

  render() {
    return (
      <Select
        className={this.props.className}
        classNamePrefix="react-select"
        value={this.state.value}
        placeholder="Search"
        onChange={this.handleChange}
        options={suggestions}
        styles={colourStyles}
        onBlur={this.onBlur}
        components={{
          DropdownIndicator,
          IndicatorsContainer,
          Placeholder,
        }}
      />
    );
  }
}

export default SearchBar;
