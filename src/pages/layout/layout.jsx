import React, {Component} from 'react';
import {Link, Route} from "react-router-dom";
import './layout.scss'
import Home from '@/pages/home/home';
import Info from '@/pages/info/info';
import User from '@/pages/user/user';
import HouseList from '@/pages/houseList/houseList';

// 定义自定义路由组件
const CustomLink = ({label, to, exact, sClass}) => {
    return <Route
        path={to}
        exact={exact}
        /* match参数是系统传入的，它是一个布尔值，匹配当前路由，就是true
         不匹配当前路由，就是false*/
        children={({match}) => {
            return (
                <li className={match ? "active" : ""}>
                    <Link to={to} className={"iconfont " + sClass}/>
                    <h4>{label}</h4>
                </li>
            )
        }
        }
    />
}

class Layout extends Component {
    render() {
        return (
            <div>
                {/*定义组件的容器标签*/}
                <Route exact path="/layout" component={Home}/>
                <Route path="/layout/houseList" component={HouseList}/>
                <Route path="/layout/info" component={Info}/>
                <Route path="/layout/user" component={User}/>
                <footer>
                    <ul>
                        {/*
                        原始方法
                        <li className="active">
                            <Link to="/layout" className="iconfont icon-home1"/>
                            <h4>首页</h4>
                        </li>
                        <li>
                            <Link to="/layout/houselist" className="iconfont icon-ziyuan"/>
                            <h4>找房</h4>
                        </li>
                        <li>
                            <Link to="/layout/info" className="iconfont icon-zixun"/>
                            <h4>资讯</h4>
                        </li>
                        <li>
                            <Link to="/layout/user" className="iconfont icon-wode"/>
                            <h4>我的</h4>
                        </li>*/}
                        <CustomLink label="首页" to="/layout" exact={true} sClass="icon-home1"/>
                        <CustomLink label="找房" to="/layout/houseList" sClass="icon-ziyuan"/>
                        <CustomLink label="资讯" to="/layout/info" sClass="icon-zixun"/>
                        <CustomLink label="我的" to="/layout/user" sClass="icon-wode"/>
                    </ul>
                </footer>
            </div>
        );
    }
}

export default Layout;
