import { parsePhoneNumber } from 'libphonenumber-js';

function compareCharacters(a: string, b: string) {
  if (a === b) {
    return 0;
  }
  const priority = (char: string) =>
    !char ? 0 : /[a-z]/i.test(char) ? 1 : /[0-9]/.test(char) ? 2 : 3;
  return (
    priority(a) - priority(b) || a.toLowerCase().localeCompare(b.toLowerCase())
  );
}

function compareName(nameOne: string, nameTwo: string) {
  const maxLength = Math.max(nameOne.length, nameTwo.length);
  for (let i = 0; i < maxLength; i += 1) {
    const result = compareCharacters(nameOne[i], nameTwo[i]);
    if (result !== 0) {
      return result;
    }
  }
  return 0;
}

function isOnlyLetterOrNumbers(value: string) {
  const REG_NUM_LETTER = /^[0-9A-Za-z\s\-~`!@#$%^&*()-_+=\[\]{};:"',<.>\/?，。？￥！……【】’“；《》（）]+$/;
  return REG_NUM_LETTER.test(value);
}

function toUpperCase(name: string | undefined) {
  return (name && name.slice(0, 1).toUpperCase()) || '';
}

function handleOnlyLetterOrNumbers(firstName: string, lastName: string) {
  const firstLetter = toUpperCase(firstName!);
  const lastLetter = toUpperCase(lastName!);
  return `${firstLetter}${lastLetter}`;
}

function handleOneOfName(firstName: string, lastName: string) {
  if (!isOnlyLetterOrNumbers(firstName) && !isOnlyLetterOrNumbers(lastName)) {
    return '';
  }
  const names =
    (!!firstName && firstName!.split(/\s+/)) ||
    (!!lastName && lastName!.split(/\s+/));
  const firstLetter = toUpperCase(names[0]);
  const lastLetter = toUpperCase(names[1]);
  return `${firstLetter}${lastLetter}`;
}

function phoneNumberDefaultFormat(num: string) {
  try {
    const phoneNumber = parsePhoneNumber(num);
    // currently use US phone number format, for other regions, use phoneNumber.formatInternational()
    return phoneNumber.formatNational();
  } catch (error) {
    return num;
  }
}

export {
  compareName,
  isOnlyLetterOrNumbers,
  handleOnlyLetterOrNumbers,
  handleOneOfName,
  phoneNumberDefaultFormat,
};
