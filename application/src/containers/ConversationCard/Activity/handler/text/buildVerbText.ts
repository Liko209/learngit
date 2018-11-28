type Parameter = {
  verb: string;
};

export default ({ verb }: Parameter) => {
  return {
    parameter: {
      translated: {
        verb,
      },
    },
    key: 'verb',
  };
};
