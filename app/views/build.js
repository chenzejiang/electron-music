/* eslint-disable react/prop-types */
// @flow
import React, { Component } from 'react';
import {withRouter, Link} from 'react-router-dom';
import { screen, shell, clipboard } from 'electron';
import { exec } from 'child_process';
import routes from '../constants/routes';
import styles from './Build.css';
import Hint from '../components/Hint'
import Progress from '../components/Progress'
import { PROJECT_CONFIG_INFO } from '../config/index';
import sleep from '../utils/sleep';
import ms2time from '../utils/ms2time';

const fse = require('fs-extra');
const {dialog} = require('electron').remote;

class Build extends Component {
  constructor(props){
    super(props);
    this.state = {
      selectCopyContent: '', // 复制模板的内容
      isShowConfig: false, // 是否显示配置文件
      configObj: {}, // 信息
      buildType: '', // 打包类型

      buildInfo:{
        commitAnnotation: '', // commit 注释
        projectPath: '', // 项目地址
        svnPath: '', // svn 提交地址
        configObj: '{}', // config 配置文件
      },

      svnFolderPath: '', // svn文件夹地址
      commitId: '', // 提交版本
      progressPer: 0, // 打包进度
      progressAllNum: 11, // 总进度数量
      buildHistory: [], // 打包过程记录
      execNow: '', // 当前执行的 exec 进程
      buildIndex: localStorage.getItem('autoBuildIndex')
    };
  }

  componentWillMount() {
    /* 从home获取参数 */
    // const {location: propLocation} = this.props;
    // if (propLocation.query) {
    //   const buildIndex = propLocation.query.buildIndex; // 索引
    //   this.setState({ buildIndex });
    //   console.log(buildIndex);
    // }
    
    /* 设置默认信息 */
    const {buildIndex, buildInfo} = this.state;
    const projectBuildData = JSON.parse(localStorage.getItem('projectBuild'))[buildIndex].data;
    const newBuildInfo = Object.assign(buildInfo, projectBuildData);
    this.setState({ buildInfo: newBuildInfo });
  }

  componentDidMount() {

  }

  /**
   * 设置打包部署信息
   * @param {obj} {key,val} 
   */
  setBuildInfo(obj) {
    const {buildInfo, buildIndex} = this.state;
    const projectBuild = JSON.parse(localStorage.getItem('projectBuild'));
    buildInfo[obj.key] = obj.val;
    projectBuild[buildIndex].data = buildInfo;
    this.setState({ buildInfo }, () => {
      localStorage.setItem('projectBuild', JSON.stringify(projectBuild));
    });
  }

  /**
   * 选择目录
   */
  selectDirPath(type) {
    dialog.showOpenDialog({
      properties: ['openDirectory']
    }, (files) => {
      if (files && files.length > 0) {
        const path = files[0];
        this.setBuildInfo({key:type, val:path});
      }
    });
  }

  /**
   * 显示提示
   */
  showHint(_str = '', _time = 3) {
    const {progressPer, buildHistory} = this.state;
    this.hint.show(_str, _time);
    this.setState({
      buildHistory: buildHistory.concat(_str),
      progressPer: progressPer + 1
    });
  }

  /**
   * 打包命令
   */
  buildLine(type) {
    const {buildInfo} = this.state;
    const configObj = JSON.parse(buildInfo.configObj);
    const buildCommandLine = configObj[type].cmd;
    const buildCommandName = configObj[type].name;
    const cmdPath = buildInfo.projectPath;
    this.showHint(`正在执行${buildCommandName} \r\n ${buildCommandLine} \r\n 打包工作，请稍等... (ง •_•)ง`, 999);
    return new Promise((resolve, reject) => {
      const execNow = exec(buildCommandLine, {cwd: cmdPath}, (error, stdout, stderr) => {
        if (error) {
          this.showHint(`打包失败! (┬＿┬) ! 请检查程序   ${error}`);
          console.log(error);
          return;
        }
        console.log(stdout);
        console.log(stderr);
        this.showHint(`${buildCommandName}环境-${buildCommandLine}\n打包成功。 ♪(＾∀＾●)ﾉ`);
        resolve();
      });
      this.setState({ execNow });
    });
  }

  /**
   * 执行walle部署
   */
  walleDeploy() {
    const {commitId, buildType, buildInfo} = this.state;
    const configObj = JSON.parse(buildInfo.configObj);
    const walleInfo = JSON.parse(localStorage.getItem('walleInfo'));
    const walleUserName = walleInfo.username;
    const wallePassword = walleInfo.password;
    const walleProjectName = configObj[buildType].walleProject;
    this.showHint(`正在执行部署Walle (ง •_•)ง`, 999);
    const configParam = {
      walleUserName,
      wallePassword,
      walleProjectName,
      commitId
    };
    return new Promise((resolve, reject) => {
      if(buildType === 'release'){
        this.showHint(`正式环境不直接部署，请联系负责人手工部署 ♪(＾∀＾●)ﾉ`);
        resolve(200);
        return;
      }
    });
  }

  /**
   * svnDeleteFolder 提交svn删除
   */
  svnDeleteFolder() {
    const {svnFolderPath} = this.state;
    this.showHint(`正在执行svn delete js & svn delete css... (ง •_•)ง`, 999);
    return new Promise((resolve, reject) => {
      // for i in  $(svn st | grep \! | awk '{print $2}'); do svn delete $i; done
      const execNow = exec('svn delete js & svn delete css', {cwd: svnFolderPath}, (error, stdout, stderr) => {
        if (error) {
          this.showHint(`SVN 提交删除失败! (┬＿┬) !请确保 svn 在环境变量中`);
          console.log(error);
          return;
        }
        this.showHint(`SVN 提交删除文件夹成功。 ♪(＾∀＾●)ﾉ`);
        resolve();
      });
      this.setState({ execNow });
    });
  }

  /**
   * svn update
   */
  svnUpdate() {
    const {buildInfo} = this.state;
    this.showHint(`正在执行SVN Update... (ง •_•)ง`, 999);
    return new Promise((resolve, reject) => {
      const execNow = exec('svn update', {cwd: buildInfo.svnPath}, (error, stdout, stderr) => {
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
   * svn update
   */
  svnCommit() {
    const {svnFolderPath, buildInfo} = this.state;
    this.showHint(`正在执行commit 提交 (ง •_•)ง`, 999);
    return new Promise((resolve, reject) => {
      // svn add . --no-ignore --force 批量提交新的
      const execNow = exec(`svn add . --no-ignore --force & svn commit -m "${buildInfo.commitAnnotation}"`, {cwd: svnFolderPath}, (error, stdout, stderr) => {
        if (error) {
          this.showHint(`SVN 提交失败! (┬＿┬) !请确保 svn 在环境变量中`);
          console.log(error);
          return;
        }
        console.log('stdout=>', stdout);
        const commitArr = stdout.match(/Committed revision (.*)\./);
        const commitId = commitArr !== null ? commitArr[1] : '';
        console.log(stdout);
        this.showHint(`commit版本：${commitId} 提交内容: ${buildInfo.commitAnnotation} Commit Success！ ♪(＾∀＾●)ﾉ `);
        this.setState({
          commitId
        }, () => {
          resolve();
        });
      });
      this.setState({ execNow });
    });
  }

  /* 重置打包过程 */
  resetBuild() {
    this.setState({ 
      progressPer : 0,
      buildType: '',
      buildHistory: []
    });
  }
  
  /**
   * 结束打包过程
   */
  endBuild() {
    const {execNow} = this.state;
    if(execNow !== ''){
      process.kill(execNow.pid);
    } else {
      this.hint.show('当前没有进程正在运行');
    }
  }

  /* 自动打包流程 */
  async build(type) {
    const {buildInfo} = this.state;
    const configObj = JSON.parse(buildInfo.configObj);
    if(buildInfo.commitAnnotation === '' || buildInfo.projectPath === '' || buildInfo.svnPath === ''){
      this.hint.show('项目配置信息不完整，请填写.');
      return;
    }

    /* 每次打包重置state */
    await this.resetBuild();
    const startTime = window.performance.now();
    await this.setState({ 
      svnFolderPath: `${buildInfo.svnPath}\\${configObj[type].folder}`,
      buildType: type
    });
    const {svnFolderPath} = this.state;
    /* 1. 执行打包命令 */
    await this.buildLine(type);
    await sleep(1000);
    /* 2. svn更新，避免冲突 */
    await this.svnUpdate();
    await sleep(1000);
    /* 3. 删除 css js目录并提交 svn */
    await this.svnDeleteFolder();
    await sleep(1000);
    /* 4. 复制 dist目录到指定svn上传目录 */
    await fse.copy(`${buildInfo.projectPath}\\dist`, svnFolderPath);
    await sleep(1000);
    /* 5. 上传dist文件到svn */
    await this.svnCommit();
    await sleep(1000);
    /* 6. walle 自动部署，返回部署结果 */
    const walleDeployResult = await this.walleDeploy();
    await sleep(1000);
    const endTime = window.performance.now();
    const buildTime = parseInt(endTime - startTime);
    console.log('walleDeployResult', walleDeployResult);
    if(Number(walleDeployResult) === 200) {
      this.showHint(`Build Success! (๑¯∀¯๑) 共耗时：${ms2time(buildTime)}`);
    }
  }

  /**
   * 配置信息改变
   */
  configChange(name, e){
    const inputVal = e.target.value;
    try {
      console.log(JSON.parse(inputVal));
      this.setBuildInfo({key:name, val:inputVal});
    } catch (error) {
      console.log(error);
    }
    console.log(inputVal);
  }

  /**
   * 文本框改变
   */
  inputChange(name, event) {
    const inputVal = event.target.value;
    this.setBuildInfo({key:name, val:inputVal});
  }
  
  /**
   * 渲染列表
   */
  btnDom() {
    const {buildInfo} = this.state;
    const configObj = JSON.parse(buildInfo.configObj);
    const btnItems = Object.keys(configObj).map((item) =>
      <button key={configObj[item].name} type="button" className={styles.btn} onClick={() => this.build(item)}>{`${item} ${configObj[item].name}`}</button>
    );
    return (
      <div className={styles.btnBox}>
        {btnItems}
        <button type="button" className={`${styles.btn} ${styles.del}`} onClick={() => this.endBuild()}>终止打包</button>
      </div>
    );
  }

  /*
   * 显示配置信息
   */
  showConfig(){
    const {isShowConfig} = this.state;
    this.setState({
      isShowConfig: !isShowConfig
    });
  }

  /**
   * 状态信息
   */
  cmdTextDom() {
    const {buildHistory} = this.state;
    const textList = buildHistory.map((item) =>
      <p key={item}>{item}</p>
    );
    return (
      <div className={styles.buildBoxText}>
        {textList}
      </div>
    );
  }

  /**
   * 状态信息
   */
  selectConfigDom() {
    const optionDom = PROJECT_CONFIG_INFO.map((item) =>
      <option value={JSON.stringify(item.data, null, 4)} key={item.name}>{item.name}</option>
    );
    return (
      <select onChange={this.selectConfigChange}>
        <option className={styles.none} value="" />
        {optionDom}
      </select>
    );
  }

  /**
   * 复制项目配置文件
   */
  copyProjectConfig(){
    const {selectCopyContent} = this.state;
    if (selectCopyContent === '') {
      this.hint.show('请先选择项目模板', 2);
      return;
    }
    this.hint.show('Copy Success', 2);
    clipboard.writeText(selectCopyContent);
  }

  /* 配置文件模板select改变 */
  selectConfigChange = e => {
    this.setState({
      selectCopyContent: e.target.value
    });
  }
  
  render() {
    const {isShowConfig, buildInfo, configJsonDefaultPlaceholder, buildType, progressPer, progressAllNum} = this.state;
    const configObj = JSON.parse(buildInfo.configObj);
    return (
      <div className={styles.container} data-tid="container">
        <Hint ref={(hint) => {this.hint = hint}} />

        <div className="header">
          <h2>枫车 - 自动化打包部署</h2>
          
          <div className="backButton" data-tid="backButton">
            <Link to={{ pathname: routes.HOME, query : { 'skip': 'false' }}}>
              <i className="fa fa-arrow-left fa-3x" />
            </Link>
          </div>

          <div className="helpButton">
            <Link to={{ pathname: routes.HELP }}>
              <i className="fa fa-question-circle fa-3x" />
            </Link>
          </div>
        </div>

        <div className={styles.tableBox} style={{height: `${screen.getPrimaryDisplay().workAreaSize.height - 140  }px`}}>
          <table>
            <thead>
              <tr>
                <th width={300}>项目地址</th>
                <th width={300}>SVN提交地址</th>
                <th width={200}>配置文件</th>
                <th width={300}>配置文件模板</th>
                <th>提交说明</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <input readOnly disabled value={buildInfo.projectPath} placeholder="请选择项目地址路径" className={styles.project} />
                  <button type="button" className={styles.select} onClick={ () => this.selectDirPath('projectPath') } >选择路径</button>
                </td>
                <td>
                  <input readOnly disabled value={buildInfo.svnPath} placeholder="请选择SVN地址路径" className={styles.project} />
                  <button type="button" className={styles.select} onClick={ () => this.selectDirPath('svnPath') } >选择路径</button>
                </td>
                <td>
                  <button onClick={() => this.showConfig()} type="button">
                    {isShowConfig ? '隐藏' : '显示'}
                  </button>
                </td>
                <td>
                  {
                    this.selectConfigDom()
                  }
                  <button type="button" className={styles.select} onClick={() => this.copyProjectConfig()}>复制</button>
                </td>
                <td>
                  <input onChange={this.inputChange.bind(this, 'commitAnnotation')} value={buildInfo.commitAnnotation} className={styles.project} />
                </td>
              </tr>
              {
                isShowConfig ?
                <tr>
                  <td colSpan="7">
                    <div className={styles.configJson}>
                      <textarea placeholder={JSON.stringify(configJsonDefaultPlaceholder, null, 4)} onChange={this.configChange.bind(this, 'configObj')} value={buildInfo.configObj} />
                    </div>
                  </td>
                </tr> : 
                <tr className={styles.none} />
              }
            </tbody>
          </table>

          <div className={styles.buildBox}>
            <Progress maxper={progressAllNum} per={progressPer} />
            {this.cmdTextDom()}
            {
              buildType !== '' ?
              <p className={styles.buildInfo}>
                <span>Build：{buildType}</span>
                <a href="###" onClick={() => shell.openExternal(configObj[buildType].link)}>{configObj[buildType].link}</a>
              </p>
              :
              <p className={styles.buildInfo}>
                <span>Status：空闲</span>
              </p>
            }
          </div>
          
          {this.btnDom()}
        </div>
      </div>
    );
  }
}
export default withRouter(Build);
