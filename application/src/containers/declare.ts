declare global {
  // tslint:disable-next-line:interface-name
  interface Window {
    jupiterElectron: any;
  }
}

window.jupiterElectron = window.jupiterElectron || {};

export default global;
