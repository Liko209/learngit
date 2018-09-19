
const fs =  require('fs');

const writeElectronConfigFile = ()=> {
    const electronRunConfig = {
      mainWindowUrl: process.env.ELECTRON_INIT_URL  || 'https://release.fiji.gliprc.com/', /* Specifies the URL of the application's main window page */
      electronPath:  process.env.ELECTRON_PATH || '/Applications/Jupiter.app/Contents/MacOS/Jupiter' /* Specifies a path to the electron binary */
    };
    fs.writeFileSync('.testcafe-electron-rc', JSON.stringify(electronRunConfig, null, 4));
};

writeElectronConfigFile();

