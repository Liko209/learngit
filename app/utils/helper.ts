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

export { compareName, toTitleCase };
