export const PROJECT_CONFIG_INFO = [
  {
    "name": "pc-门店管理系统",
    "data": {
      "alpha": {
        "cmd": "npm run build",
        "name": "测试",
        "folder": "test",
        "walleProject": "pc-门店管理系统-alpha",
        "link": "http://192.168.1.206/ssms-pc/#/"
      },
      "beta": {
        "cmd": "npm run build-beta",
        "name": "公测",
        "folder": "test",
        "walleProject": "pc-门店管理系统-beta",
        "link": "http://test-cms.carisok.com/#/"
      },
      "abtest": {
        "cmd": "npm run build-abtest",
        "name": "灰度",
        "folder": "test",
        "walleProject": "pc-门店管理系统-abtest",
        "link": "http://abtest-cms.carisok.com/#/"
      },
      "release": {
        "cmd": "npm run build-release",
        "name": "正式",
        "folder": "release",
        "walleProject": "pc-门店管理系统-release",
        "link": "http://cms.carisok.com/#/"
      }
    }
  }
]
export const WALLE_ADDRESS   = 'http://192.168.1.222:8088';
export const VERSION = require('../../package.json').version;
