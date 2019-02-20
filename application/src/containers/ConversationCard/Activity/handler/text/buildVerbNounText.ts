type Parameter = {
  verb: string;
  noun: string;
};

export default ({ verb, noun }: Parameter) => {
  return {
    parameter: {
      verb,
      noun,
    },
    key: 'item.activity.verb-noun',
  };
};
