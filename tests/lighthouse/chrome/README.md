### Requirements

---

- [lighthouse](https://github.com/GoogleChrome/lighthouse) : collect PWA performance metrics
- [puppeteer](https://github.com/GoogleChrome/puppeteer) : control Chrome to do something
- [sequelize](https://github.com/sequelize/sequelize) : js orm framework

### Usage

---

```bash
# install requirements
npm install
# run script
npm run perf
```

### .env

```bash
# juipter
JUPITER_URL=https://develop.fiji.gliprc.com
JUPITER_ENV=GLP-CI1-XMN
JUPITER_LOGIN_URL=https://login-glpci1xmn.lab.nordigy.ru
JUPITER_GLIP_URL=https://glpci1xmn.asialab.glip.net
JUIPTER_USER_CREDENTIAL=
JUIPTER_USER_PIN=
JUIPTER_USER_PASSWORD=
JUPITER_APP_KEY=
JUPITER_SCERET=

# mock
MOCK_GLOBAL_SWITCH=false

# report
REPORT_URI=reports

# db config
DB_NAME=juipter_performance
DB_DIALECT=mysql
DB_USER=
DB_PASSWORD=
DB_HOST=
DB_PORT=
DB_POOL_MAX=5
DB_POOL_MIN=0
DB_POOL_ACQUIRE=30000
DB_POOL_IDLE=10000

# logger config
LOGGER_LEVEL=info
```

### Chrome Extension

---

path: extension/menifest.json

extension_id: ijjcejlmgpmagghhloglnenalapepejo

```json
{
    ...
    "externally_connectable": {
        "matches": [
            // allow website send message to this extension
            "*://*.ringcentral.com/*"
        ]
    }
    ...
}
```
