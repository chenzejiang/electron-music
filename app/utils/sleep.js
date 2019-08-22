/**
 * 等待睡眠时间
 * @param {delay} number
 */
const sleep = (delay = 1000) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        resolve(1)
      } catch(e) {
        reject(0)
      }
    }, delay);
  })
}
export default sleep;