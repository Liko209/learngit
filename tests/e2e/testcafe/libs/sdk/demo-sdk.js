const {SDK, PostAPI} = require('.');

const chris_sandbox = {
  "rc": {
    "server": "https://api-glpdevxmn.lab.nordigy.ru",
    "apiPlatform": "/restapi",
    "clientId": "FVKGRbLRTxGxPempqg5f9g",
    "clientSecret": "bkUvnRtBQeCLi2n3EEwczQqv-HRcJmRbG4ec4pHI9wiQ",
    "redirectUri": "glip://rclogin"
  },
  "glip2": {
    "server": "https://api-glpdevxmn.lab.nordigy.ru",
    "apiPlatform": "/restapi",
    "clientId": "FVKGRbLRTxGxPempqg5f9g",
    "clientSecret": "bkUvnRtBQeCLi2n3EEwczQqv-HRcJmRbG4ec4pHI9wiQ",
    "redirectUri": "${deployHost}/unified-login/",
    "brandId": 1210
  },
  "glip": {
    "server": "https://aws13-g04-uds02.asialab.glip.net:11904",
    "apiPlatform": "/api"
  },
  "glip_desktop": {
    "server": "https://aws13-g04-uds02.asialab.glip.net:11904",
    "apiPlatformVersion": "v1.0",
    "apiPlatform": "/desktop"
  },
  "upload": {
    "server": "https://aws13-g04-uds02.asialab.glip.net:11906",
    "apiPlatform": ""
  }
};
async function main() {
  const sdk = new SDK(chris_sandbox);
  const platform = sdk.platform();
  const res = await platform.login({ username:'18662032065', password:'Test!123', extension:'103' });
  console.log(res)
  console.log(await PostAPI.sendPost({at_mention_item_ids: [],
    at_mention_non_item_ids: [],
    created_at: 1534473959146,
    creator_id: 1409027,
    from_group_id: 532486,
    group_id: 532486,
    is_new: true,
    item_ids: [],
    model_size: 0,
    new_version: 7204298469661554,
    post_ids: [],
    text: "1"}))
}

main();

