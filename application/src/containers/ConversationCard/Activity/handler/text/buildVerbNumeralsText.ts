type Parameter = {
  verb: string;
  numerals: number;
};

export default ({ verb, numerals }: Parameter) => {
  return {
    parameter: {
      numerals,
      translated: {
        verb,
      },
    },
    key: 'verb-numerals',
  };
};
