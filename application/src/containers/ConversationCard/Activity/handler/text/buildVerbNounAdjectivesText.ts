type Parameter = {
  verb: string;
  adjectives: string;
  noun: string;
};

export default ({ verb, adjectives, noun }: Parameter) => {
  return {
    parameter: {
      verb,
      noun,
      adjectives,
    },
    key: 'verb-noun-adjectives',
  };
};
