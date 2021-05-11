import React,{ Component } from 'react';
import ReactDom from 'react-dom'
import App from './App.js'
import { BASE_URL } from './utils';
import axios from 'axios';
import './assets/css/reset.css' //全局导入样式重置
import './assets/js/set_root' // 全局导入设置html文字大小的js文件，方便我们使用rem单位
import './assets/css/iconfont.css'; // 全局导入iconfont样式
import 'antd-mobile/dist/antd-mobile.css'; //全局导入antd-mobile的样式
// 将axios绑定到Component类的原型对象上，这样，所有的组件就会拥有axios属性，可以直接使用，不用重新导入axios了
Component.prototype.axios = axios;
axios.defaults.baseURL = BASE_URL;

ReactDom.render(<App/>, document.getElementById('root'))

