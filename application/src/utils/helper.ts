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

function toTitleCase(input: string) {
  const allTitleCase = input
    .toLowerCase()
    .replace(/(?:^|\s|-)\S/g, x => x.toUpperCase());
  const smallWords = /^(a|an|and|as|at|but|by|en|for|if|in|nor|of|on|or|per|the|to|v.?|vs.?|via)$/i;
  const wordSeparators = /([ :–—-])/;
  return allTitleCase
    .split(wordSeparators)
    .map((current: string) => {
      if (current.search(smallWords) > -1) {
        return current.toLowerCase();
      }
      return current;
    })
    .join('');
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

function getFileSize(bytes: number) {
  if (bytes / 1024 < 1000) {
    return `${(bytes / 1024).toFixed(1)}Kb`;
  }
  if (bytes / 1024 / 1024 < 1000) {
    return `${(bytes / 1024 / 1024).toFixed(1)}Mb`;
  }
  return `${(bytes / 1024 / 1024 / 1024).toFixed(1)}Gb`;
}

export {
  compareName,
  toTitleCase,
  isOnlyLetterOrNumbers,
  handleOnlyLetterOrNumbers,
  handleOneOfName,
  getFileSize,
};
