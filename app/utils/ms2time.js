/**
 * ms转换可视化阅读时间
 * @param {_time} number
 * @returns {string) 2分44秒888毫秒
 */
const ms2time = (_time = 1000) => {
    let ms = Number(_time.toString().substr(-3));
    let seconds = parseInt((_time / 1000) % 60);
    let min = parseInt(_time / 1000 / 60);
    return `${min}分${seconds}秒${ms}毫秒`;
};
export default ms2time;