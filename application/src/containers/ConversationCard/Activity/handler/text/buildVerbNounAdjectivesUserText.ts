type Parameter = {
  verb: string;
  adjectives: string;
  noun: string;
  user: string;
};

export default ({ verb, adjectives, noun, user }: Parameter) => {
  return {
    parameter: {
      verb,
      noun,
      adjectives,
      user,
    },
    key: 'verb-noun-adjectives-user',
  };
};
