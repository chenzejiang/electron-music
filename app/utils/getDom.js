import request from 'request';
import cheerio from  'cheerio';

/**
 * 获取页面的Dom
 * @param {_url} string
 * @returns {${jq}) object
 */
const getDom = (_url = '') => {
    const result = new Promise(((resolve) => {
        request(_url, (error, response, body) => {
          if (error === null) {
            const rawHeaders = response.rawHeaders.join('');
            const $ = rawHeaders.indexOf('text/html') !== -1 ? cheerio.load(body) : null;
            resolve($);
          } else {
            resolve(null);
          }
        })
    }))
    return result;
};
export default getDom;

