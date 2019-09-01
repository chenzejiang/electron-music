/**
 * 封装 get方法
 * @param url
 * @param data
 * @returns {Promise}
 */
import axios from 'axios';
import { DOMAIN } from './../config/index';

export function ajax(url, params = {}) {
  return new Promise((resolve, reject) => {
    axios.get(DOMAIN + url, {
        params
    })
    .then(response => {
        resolve(response.data);
    })
    .catch(err => {
        reject(err)
    })
  })
};

export default ajax;
