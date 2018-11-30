type Parameter = {
  verb: string;
  noun: string;
  user: string;
};

export default ({ verb, noun, user }: Parameter) => {
  return {
    parameter: {
      verb,
      noun,
      user,
    },
    key: 'verb-noun-user',
  };
};
