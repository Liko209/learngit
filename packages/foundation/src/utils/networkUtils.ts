function isOnline() {
  return global['navigator'] ? global['navigator']['onLine'] : true;
}

export { isOnline };
