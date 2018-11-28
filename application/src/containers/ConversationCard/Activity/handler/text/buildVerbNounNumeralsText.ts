type Parameter = {
  verb: string;
  numerals: number;
  noun: string;
};

export default ({ verb, numerals, noun }: Parameter) => {
  return {
    parameter: {
      numerals,
      translated: {
        verb,
        noun,
      },
    },
    key: 'verb-noun-numerals',
  };
};
