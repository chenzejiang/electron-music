>  技术栈
- React
- Electron
- Redux
- React-Router
- Node

使用脚手架 [electron-react-boilerplate](https://github.com/electron-react-boilerplate/electron-react-boilerplate)

yarn 环境  [yarn安装](https://yarn.bootcss.com/docs/install/#windows-stable) 

##说明
基于公司原型没有一个统一查看的地方，与每次去查找地址的繁琐，所以开发了这个工具，便于日常查看原型

![产品演示](http://img.chenzejiang.com/github/prototype-electron/help.gif "123")

## 安装

```
$ 安装 
$ git clone http://192.168.1.205:90/feadmin/tool.git your-project-name
$ cd your-project-name
$ yarn
```

## 运行

```
$ yarn dev
```

## 打包

```
$ yarn package
```

## CSS 模块

- 字体图标 https://fontawesome.com/

- 全局css文件 app.global.css

- 如果你想要导入全局css库（像bootstrap），你可以仅写以下代码到全局css

```
@import '~bootstrap/dist/css/bootstrap.css';
```

## SASS 支持

如果你想要在你的app使用sass,你仅需要去导入sass后缀名称的文件去取代css后缀名称的文件

```
import './app.global.scss';
```

<br>

#### 题外话：git提交 eslint 检查不让提交
```
rm -rf ./git/hooks/pre-commit
```

> 文档编写：webJ 820289461@qq.com
