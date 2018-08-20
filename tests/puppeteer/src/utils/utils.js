const appUrlBase = 'https://release-0709.fiji.gliprc.com';
const routes = {
  public: {
    login: `${appUrlBase}/login`,
    conversation: `${appUrlBase}/conversation/5636102`
  },
  private: {
    home: `${appUrlBase}`
  }
};

export { appUrlBase, routes };
