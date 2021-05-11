import React from 'react';
import ReactDom from 'react-dom'
import App from './App'
import './assets/css/reset.css' //全局导入样式重置
import './assets/js/set_root' // 全局导入设置html文字大小的js文件，方便我们使用rem单位

ReactDom.render(<App/>, document.getElementById('root'))
