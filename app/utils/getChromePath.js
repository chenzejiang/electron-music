/**
 * 获取chrome默认路径
 */
export default function getChromePath () {
	if (process.platform === 'win32') {
		return 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe'
	} 
	return '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
}