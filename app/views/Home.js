/* eslint-disable react/prop-types */
// @flow
import React, { Component } from 'react';
import {withRouter, Link} from 'react-router-dom';
import { screen, shell, clipboard } from 'electron';
import { machineIdSync } from 'node-machine-id';
import path from 'path';

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
    await fse.copy('F:\\webj\\ssms-pc\\dist\\tip.html', 'F:\\webj\\walle\\test');
    // await fse.copy(appPath, svnFolderPath);
    return;
    
    const { machineCode, regCode } = this.state;
    const data = await ajax(API.activateCode, { machineCode, regCode });
    console.log('激活', this);
    console.log(data);
    if (data.status === 200) {
      this.hint.show('激活成功');
    } else {
      this.hint.show(data.msg);
    }
  }

  render() {
    const {machineCode, regCode} = this.state;
    return (
      <div className={styles.container} data-tid="container">
        <Hint ref={(hint) => {this.hint = hint}} />

        <div className={styles.footer}>
          {/* <img src=""> */}
          {/* <div className={styles.logoBox}>
            <img alt="logo" className={styles.logo} src="../resources/icon.png" />
            <h1 className={styles.title}>网易云音乐解锁</h1>
          </div> */}
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
      </div>
    );
  }
}

export default withRouter(Home);