import puppeteer from 'puppeteer-core'
import getChromePath from '../utils/getChromePath';
import { WALLE_ADDRESS } from '../config/index';

const walleAutoDeploy = (obj) => {
  const WALLE_USERNAME  = obj.walleUserName;
  const WALLE_PASSWORD  = obj.wallePassword;
  const PROJECT_NAME    = obj.walleProjectName;
  const COMMIT_REVISION = obj.commitId;
  const deploy = new Promise((resolve) => {
    (async () => {
      try {
        const browser = await puppeteer.launch({
          headless: true,
          executablePath: getChromePath()
        });
        const page = await browser.newPage();
        await page.setViewport({
              width: 1920,
              height: 1080
        });
        await page.goto(WALLE_ADDRESS);
        await page.evaluate(() => {
          return {
            width: document.documentElement.clientWidth,
            height: document.documentElement.clientHeight,
            deviceScaleFactor: window.devicePixelRatio
          };
        });
        /* 1.输入帐号密码进行点击登陆 */
        await page.evaluate((user, pass) => {
          document.querySelector('#loginform-username').value = user;
          document.querySelector('#loginform-password').value = pass;
        }, WALLE_USERNAME, WALLE_PASSWORD);
        await page.waitFor(2000);
        await page.$eval('.btn-primary',a => a.click());
        await page.waitFor(2000);
        /* 2.切换到提交上线单页面 */
        await page.goto(`${WALLE_ADDRESS}/task/submit/`);
        await page.waitForSelector('.box')
        /* 3.筛选要提交的环境 */
        // eslint-disable-next-line arrow-body-style
        const projectBtn = await page.$$eval('.box .btn', (tags) => {
          return tags.map((item) => {
            return {
              text: item.innerText,
              href: item.getAttribute('href')
            }
          });
        }).then((tags) => tags.filter(item => item.text.indexOf(`${PROJECT_NAME}`) >= 0)[0]);
        console.log(`正在部署${projectBtn.text}...`);
        /* 4.进入要部署的环境页面 */
        await page.goto(`${WALLE_ADDRESS}${projectBtn.href}`);
        await page.waitForSelector('#task-commit_id option');
        await page.waitFor(2000);
        /**
         * 5. 选择要提交的上线单的版本
         * @return {['93707', '1.6 测试环境更新']}
         */
        await page.select('#task-commit_id', COMMIT_REVISION);
        await page.waitFor(1000);
        const selectInfo = await page.evaluate(() => {
          const selectTag = document.querySelector('#task-commit_id');
          const selectTagIndex = selectTag.selectedIndex;
          return (selectTag.options[selectTagIndex].text).split(' - ');
        });
        await page.waitFor(3000);
        /* 6.填写上线单标题 */
        await page.evaluate((commitDetail) => {
          document.querySelector('#task-title').value = commitDetail;
        }, selectInfo[1]);
        await page.waitFor(1000);
        console.log(`正在上线版本号${selectInfo[0]} === 版本描述${selectInfo[1]}`);
        /* 7.提交上线单 */
        await page.$eval('.btn-primary', a => a.click());
        await page.waitFor(2000);
        /* 8.提交后自动切换到我的上线单页面，筛选本次提交的上线单，并点击上线 */
        await page.waitForSelector('table');
        await page.evaluate((cId) => {
          let targetTr = null;
          const trList = document.querySelectorAll('table tr');
          for (let i = 0; i < trList.length; i++) {
            if (i !== 0) {
              const commitId = trList[i].querySelectorAll('td')[4].innerText;
              if (Number(cId) === Number(commitId)) {
                targetTr = trList[i];
                break;
              }
            }
          }
          targetTr.querySelector('.green').click();
        }, selectInfo[0]);
        await page.waitFor(4000);
        /* 9.到达部署上线页面并且点击部署 */
        await page.waitForSelector('.box');
        await page.click('button[type="submit"]')
        /* 10.等待部署成功返回结果 */
        await page.waitForSelector('.result-success', {
          'visible': true,
          'timeout': 5 * 60 * 1000
        // eslint-disable-next-line promise/always-return
        }).then(() => {
          console.log(`Walle已成功部署上线，请到线上查看o(∩_∩)o `);
          console.log(`${selectInfo[0]}${selectInfo[1]}`);
          resolve(200);
        });
        await browser.close();
      } catch (error) {
        resolve(500);
        await browser.close();
      }
    })();
  });
  return deploy;
}
export default walleAutoDeploy;