const  dotenv = require('dotenv');
dotenv.config();
const fs =  require('fs');

const writeElectronConfigFile = ()=> {
    const electronRunConfig = {
      mainWindowUrl: process.env.MAIN_WINDOW_URL  || 'http://localhost:3000', /* Specifies the URL of the application's main window page */
      electronPath:  process.env.ELECTRON_PATH || '/Applications/Jupiter.app/Contents/MacOS/Jupiter' /* Specifies a path to the electron binary */
    };
    fs.writeFileSync('.testcafe-electron-rc', JSON.stringify(electronRunConfig, null, 4));
};
writeElectronConfigFile();

