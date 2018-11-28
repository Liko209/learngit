type Parameter = {
  verb: string;
  noun: string;
};

export default ({ verb, noun }: Parameter) => {
  return {
    parameter: {
      translated: {
        verb,
        noun,
      },
    },
    key: 'verb-noun',
  };
};
