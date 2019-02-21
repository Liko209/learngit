type Parameter = {
  verb: string;
  numerals: number;
  noun: string;
};

export default ({ verb, numerals, noun }: Parameter) => {
  return {
    parameter: {
      verb,
      noun,
      count: numerals,
    },
    key: 'item.activity.verb-numerals-noun',
  };
};
