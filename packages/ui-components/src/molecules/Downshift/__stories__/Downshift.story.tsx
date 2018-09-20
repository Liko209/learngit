/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-09-16 18:15:59
 * Copyright © RingCentral. All rights reserved.
 */
/// <reference path="../../../../.storybook/storybook.d.ts" />
// import * as React from 'react';
// import deburr from 'lodash/deburr';
// import { storiesOf } from '@storybook/react';
// import { withInfoDecorator } from '../../../utils/decorators';

// import JuiDownshiftMultiple from '..';

// import avatar from '../../../atoms/Avatar/__stories__/img/avatar.jpg';
// const suggestions = [
//   { label: 'Afghanistan' },
//   { label: 'Aland Islands' },
//   { label: 'Albania' },
//   { label: 'Algeria' },
//   { label: 'American Samoa' },
//   { label: 'Andorra' },
//   { label: 'Angola' },
//   { label: 'Anguilla' },
//   { label: 'Antarctica' },
//   { label: 'Antigua and Barbuda' },
//   { label: 'Argentina' },
//   { label: 'Armenia' },
//   { label: 'Aruba' },
//   { label: 'Australia' },
//   { label: 'Austria' },
//   { label: 'Azerbaijan' },
//   { label: 'Bahamas' },
//   { label: 'Bahrain' },
//   { label: 'Bangladesh' },
//   { label: 'Barbados' },
//   { label: 'Belarus' },
//   { label: 'Belgium' },
//   { label: 'Belize' },
//   { label: 'Benin' },
//   { label: 'Bermuda' },
//   { label: 'Bhutan' },
//   { label: 'Bolivia, Plurinational State of' },
//   { label: 'Bonaire, Sint Eustatius and Saba' },
//   { label: 'Bosnia and Herzegovina' },
//   { label: 'Botswana' },
//   { label: 'Bouvet Island' },
//   { label: 'Brazil' },
//   { label: 'British Indian Ocean Territory' },
//   { label: 'Brunei Darussalam' },
// ];

// let filterSuggestions = [];
// const handleInputChange = (value: string) => {
//   const inputValue = deburr(value.trim()).toLowerCase();
//   const inputLength = inputValue.length;
//   let count = 0;
//   const keeps = suggestions.filter((suggestion: { label: string }) => {
//     const keep =
//       count < 5 &&
//       suggestion.label.slice(0, inputLength).toLowerCase() === inputValue;

//     if (keep) {
//       count += 1;
//     }

//     return keep;
//   });
//   return inputLength === 0
//     ? (filterSuggestions = [])
//     : (filterSuggestions = keeps);
// };
// const onChange = (item: any) => {
//   console.log(item);
// };

// storiesOf('Molecules/Downshift', module)
//   .addDecorator(withInfoDecorator(JuiDownshiftMultiple, { inline: true }))
//   .addWithJSX('Multiple Downshift', () => {
//     return (
//       <JuiDownshiftMultiple
//         inputChange={handleInputChange}
//         suggestions={filterSuggestions}
//         onChange={onChange}
//         label="Members"
//         placeholder="Members"
//       />
//     );
//   });
