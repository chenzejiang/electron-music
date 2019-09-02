/* eslint-disable react/prop-types */
// @flow
import React, { Component } from 'react';
import {withRouter, Link} from 'react-router-dom';
import { screen, shell, clipboard } from 'electron';
import { machineIdSync } from 'node-machine-id';
import path from 'path';
import os from 'os';
import routes from '../constants/routes';
import styles from './Home.css';
import Hint from '../components/Hint';
import {API} from '../config/index';
import ajax from './../utils/ajax';


const fse = require('fs-extra');

class Home extends Component {
  constructor(props){
    super(props);
    this.state = {
      isShowReg: false,
      machineCode: machineIdSync({original: true}), // 机器码
      regCode: '', // 注册码
    };
  }

  componentWillMount() {

  }

  componentDidMount(){
    console.log(machineIdSync());
  }

  /**
   * 修改注册码
   * @param key 键值
   */
  regCodeChange(event) {
    this.setState({regCode: event.target.value}, () => {

    });
  }

  /**
   * 跳转打包页面
   */
  goBuild(index) {
    const {location: propLocation, history: propHistory} = this.props;
    propHistory.push({
      pathname: routes.BUILD,
      query: {buildIndex: index}
    });
  }

  /**
   * 删除行
   */
  delLine(index) {
    const {list} = this.state;
    list.splice(index,1);
    this.setState({list}, () => {
      if (list.length === 0) {
        localStorage.removeItem('projectBuild');
      } else {
        localStorage.setItem('projectBuild', JSON.stringify(list));
      }
    });
  }

  /**
   * 复制机器码
   * @param {string}
   */
  onCopyCode(_str) {
    this.hint.show('复制成功');
    clipboard.writeText(_str);
  }

  /**
   * 获取本机ip地址
   */
  getIPAdress() {
    var interfaces = os.networkInterfaces();　　
    for (var devName in interfaces) {　　　　
      var iface = interfaces[devName];　　　　　　
      for (var i = 0; i < iface.length; i++) {
        var alias = iface[i];
        if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal) {
          return alias.address;
        }
      }
    }
  }

  /**
   * svn update
   */
  getIp() {
    const {buildInfo} = this.state;
    this.showHint(`正在执行SVN Update... (ง •_•)ง`, 999);
    return new Promise((resolve, reject) => {
      const execNow = exec('ipconfig', {cwd: buildInfo.svnPath}, (error, stdout, stderr) => {
        if (error) {
          this.showHint(`SVN Update 失败! (┬＿┬) !请确保 svn 在环境变量中`);
          return;
        }
        this.showHint(`SVN Update 成功。 ♪(＾∀＾●)ﾉ`);
        resolve();
      });
      this.setState({ execNow });
    });
  }

  /**
   * 激活机器
   */
  async onActivateMachine() {
    // console.log(process.execPath)
    // console.log(__dirname)
    // console.log(process.cwd())
    // const resourcesPath = path.join(process.cwd(), 'resources');
    // const appPath =  path.join(resourcesPath, 'czj.txt');
    // const aaa = path.join(process.cwd(), 'resources\\icons');

    // console.log(appPath);
    // await fse.copy('F:\\webj\\ssms-pc\\dist', 'F:\\webj\\walle\\test');

    // "F:\study\music\node\node.exe" "F:\study\music\UnblockNeteaseMusic-master\app.js" -p 18080

    // await fse.copy(appPath, svnFolderPath);
    // console.log(this);

    console.log(this.getIPAdress());

    // const { machineCode, regCode } = this.state;
    // const data = await ajax(API.activateCode, { machineCode, regCode });
    // console.log('激活', this);
    // console.log(data);
    // if (data.status === 200) {
    //   this.hint.show('激活成功');
    // } else {
    //   this.hint.show(data.msg);
    // }
  }

  /**
   * 渲染注册盒子
   */
  renderRegBox() {
    const {machineCode, regCode} = this.state;
    return (
      <div className={styles.regBox}>
        <div className={styles.inputBox}>
          <span>机器码：</span>
          <input className={styles.inputMachineCode} readOnly="readOnly" value={machineCode} type="text" />
        </div>
        <div className={styles.inputBox}>
          <span>注册码：</span>
          <input onChange={this.regCodeChange.bind(this)} value={regCode} type="text" />
        </div>

        <div className={styles.btnBox}>
          <button type="button" className={`${styles.button}`} onClick={ () => this.onCopyCode(machineCode) }>复制机器码</button>
          <button type="button" className={`${styles.button}`} onClick={ () => this.onActivateMachine() }>立即激活</button>
        </div>
      </div>
    );
  }

  /**
   * 渲染用户盒子
   */
  renderUserBox() {
    const {machineCode, regCode} = this.state;
    return (
      <div className={styles.regBox}>
        <div className={styles.inputBox}>
          <span>机器码2：</span>
          <input className={styles.inputMachineCode} readOnly="readOnly" value={machineCode} type="text" />
        </div>
        <div className={styles.inputBox}>
          <span>注册码：</span>
          <input onChange={this.regCodeChange.bind(this)} value={regCode} type="text" />
        </div>

        <div className={styles.btnBox}>
          <button type="button" className={`${styles.button}`} onClick={ () => this.onCopyCode(machineCode) }>复制机器码</button>
          <button type="button" className={`${styles.button}`} onClick={ () => this.onActivateMachine() }>立即激活</button>
        </div>
      </div>
    );
  }


  render() {
    const { isShowReg } = this.state;
    return (
      <div className={styles.container} data-tid="container">
        <Hint ref={(hint) => {this.hint = hint}} />
        <div className={styles.uiBox}>
          {/* <img src=""> */}
          {/* <div className={styles.logoBox}>
            <img alt="logo" className={styles.logo} src="../resources/icon.png" />
            <h1 className={styles.title}>网易云音乐解锁</h1>
          </div> */}
          { isShowReg ? this.renderRegBox() : this.renderUserBox()}
        </div>
      </div>
    );
  }
}

export default withRouter(Home);