/**
 * commandStr 
 * @param {obj} object
 * @returns string
 */
const commandStr = (obj) => {
    let resultStr = '';
    for(let x in obj){
        resultStr += `${x}=${obj[x]} `;
    }
    return resultStr;
};
export default commandStr;