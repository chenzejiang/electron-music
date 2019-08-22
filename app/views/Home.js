/* eslint-disable react/prop-types */
// @flow
import React, { Component } from 'react';
import {withRouter, Link} from 'react-router-dom';
import { screen, shell, clipboard } from 'electron';
import { machineIdSync } from 'node-machine-id';
import routes from '../constants/routes';
import styles from './Home.css';
import Hint from '../components/Hint';

class Home extends Component {
  constructor(props){
    super(props);
    this.state = {
      machineId: machineIdSync({original: true}), // 机器码
      regCode: '', // 注册码
      list:[{
        name: '',
        data: {}
      }],
      walleInfo:{
        username: '',
        password: ''
      }
    };
  }

  componentWillMount() {
    if(localStorage.getItem('projectBuild') !== null ){
      const list = JSON.parse(localStorage.getItem('projectBuild'));
      this.setState( {list} );
    }
    if(localStorage.getItem('walleInfo') !== null ){
      const walleInfo = JSON.parse(localStorage.getItem('walleInfo'));
      this.setState( {walleInfo} );
    }
  }

  componentDidMount(){
    console.log(machineIdSync());
  }

  /**
   * 项目名称文本框改变
   * @param index
   * @param event
   */
  handelChange(index, event) {
    const {list} = this.state;
    list[index].name = event.target.value;
    this.setState({list}, () => {
      localStorage.setItem('projectBuild', JSON.stringify(list));
    });
  }

  /**
   * 修改注册码
   * @param key 键值
   */
  regCodeChange(event) {
    // localStorage.setItem('walleInfo', JSON.stringify(walleInfo));
    this.setState({regCode: event.target.value}, () => {

    });
  }

  /**
   * 跳转打包页面
   */
  goBuild(index) {
    const {walleInfo} = this.state;
    const {location: propLocation, history: propHistory} = this.props;
    if (walleInfo.username !== '' && walleInfo.password !== '') {
      localStorage.setItem('autoBuildIndex', index);
      propHistory.push({
        pathname: routes.BUILD,
        query: {buildIndex: index}
      });
    } else {
      this.hint.show(`请输入完整的Walle帐号密码信息..`);
    }
  }

  /**
   * 渲染列表
   */
  listDom () {
    const {list} = this.state;
    const listItems = list.map((item,index) =>
      <tr key={`${index}`}>
        <td>{index+1}</td>
        <td>
          <input onChange={this.handelChange.bind(this,index)} value={item.name} className={styles.project} />
        </td>
        <td>
          <button type="button" onClick={() => this.goBuild(index)} className={`${styles.button} ${styles.success}`}>立即跳转</button>
          <button type="button" onClick={() => this.delLine(index)} className={`${styles.button} ${styles.del}`}>移除项目</button>
        </td>
      </tr>
    );

    return (
      <table>
        <thead>
        <tr>
          <th width={200}>序号</th>
          <th>项目名称</th>
          <th width={400}>操作</th>
        </tr>
        </thead>
        <tbody>
        {listItems}
        </tbody>
      </table>
    );
  }
  
  /* 添加行 */
  addLine() {
    const {list} = this.state;
    const addArr = [{
      name: '',
      data: {}
    }];
    this.setState({list:list.concat(addArr)});
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
   * 检查walle用户名密码是否正确
   */
  checkWalleUserInfoBtn(){

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
  onActivateMachine() {
    console.log('激活');
  }

  render() {
    const {walleInfo, machineId, regCode} = this.state;
    return (
      <div className={styles.container} data-tid="container">
        <Hint ref={(hint) => {this.hint = hint}} />

        {/* <div className="header">
          <h2>网易云音乐 - 无版权解锁</h2>
          <div className="helpButton">
            <Link to={{ pathname: routes.HELP }}>
              <i className="fa fa-question-circle fa-3x" />
            </Link>
          </div>
        </div> */}

        {/* <div className={styles.HomeBox} style={{height: `${screen.getPrimaryDisplay().workAreaSize.height - 140  }px`}}>
          {this.listDom()}
          <a href="javascript:void(0)" onClick={() => this.addLine()} className={styles.addLine}>+</a>
        </div> */}

        <div className={styles.footer}>
          {/* <img src=""> */}
          <div className={styles.logoBox}>
            <img alt="logo" className={styles.logo} src="../resources/icon.png" />
            <h1 className={styles.title}>网易云音乐解锁</h1>
          </div>
          <div className={styles.inputBox}>
            <span>机器码：</span>
            <input readOnly="readOnly" value={machineId} type="text" />
          </div>
          <div className={styles.inputBox}>
            <span>注册码：</span>
            <input onChange={this.regCodeChange.bind(this)} value={regCode} type="text" />
          </div>

          <div className={styles.btnBox}>
            <button className={`${styles.button}`} onClick={ () => this.onCopyCode(machineId) }>复制机器码</button>
            <button className={`${styles.button}`} onClick={ () => this.onActivateMachine() }>立即激活</button>
          </div>
        </div>
      </div>
    );
  }
}

export default withRouter(Home);