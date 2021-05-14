import React, {Component} from 'react';
import {Link} from "react-router-dom";
import {BASE_URL} from '../../utils';
import './home.scss'
import store from '../../store'
import {Carousel} from "antd-mobile";  //轮播图组件

class SearchBar extends Component {
    componentDidMount() {
        let sCurrentCity = sessionStorage.getItem('haoke_current_city');
        // 判断下本地是否有缓存数据
        if (sCurrentCity) {
            // 如果能获取到当前城市数据,将这个数据存到数据中心，方便其他组件使用
            store.dispatch({
                type: 'change_current_city',
                value: JSON.parse(sCurrentCity)
            });
        } else {
            // BMap对象在组件内访问不到，可以去window对象上获取
            let BMap = window.BMap;
            // 调用IP定位
            let myCity = new BMap.LocalCity();
            // 定位成功后的钩子函数
            myCity.get(async (r) => {
                let {data: {body: cityData}} = await this.axios.get('/area/info?name=' + r.name)
                sessionStorage.setItem('haoke_current_city', JSON.stringify(cityData))
                // 同时在数据中心也存储一份
                store.dispatch({
                    type: 'change_current_city',
                    value: cityData
                });
            })
        }
    }

    fnSwitch = (sClass) => {
        this.setState({
            sClass
        })
    }

    render() {
        return (
            <div className="search_bar">
                <div className="search_con">
                    <span className="city">深圳</span>
                    <i className="iconfont icon-xialajiantouxiangxia"></i>
                    <span className="village" onClick={() => {
                        this.fnSwitch('city_wrap slideUp')
                    }}><i className="iconfont icon-fangdajing"></i> {/*this.state.oCurrentCity.label*/}</span>
                </div>
                <i className="iconfont icon-ic-maplocation-o tomap"></i>
            </div>

        )
    }
}

class Slide extends Component {
    state = {
        data: []
    }

    componentDidMount() {
        this.fnGetData()
    }

    // 定义请求数据的方法
    fnGetData = async () => {
        let oRes = await this.axios.get('/home/swiper');

        this.setState({
            data: oRes.data.body
        })
    }

    render() {
        return (
            <div className="slide_con">
                {
                    // 条件渲染
                    this.state.data.length > 0 && <Carousel
                        autoplay={true}
                        infinite
                    >
                        {this.state.data.map(val => (
                            <a
                                key={val.id}
                                href={BASE_URL + val.imgSrc}
                                style={{display: 'inline-block', width: '100%', height: '10.6rem'}}
                            >
                                <img
                                    src={BASE_URL + val.imgSrc}
                                    alt=""
                                    style={{width: '100%', verticalAlign: 'top'}}
                                />
                            </a>
                        ))}
                    </Carousel>
                }
            </div>
        )
    }
}

function Menu() {
    return (
        <ul className="menu_con">
            <li>
                <Link to="/"><i className="iconfont icon-zufang1"/></Link>
                <h4>整租</h4>
            </li>
            <li>
                <Link to="/"><i className="iconfont icon-usergroup"/></Link>
                <h4>合租</h4>
            </li>
            <li>
                <Link to="/"><i className="iconfont icon-ic-maplocation-o"/></Link>
                <h4>地图找房</h4>
            </li>
            <li>
                <Link to="/"><i className="iconfont icon-zufang"/></Link>
                <h4>去出租</h4>
            </li>
        </ul>
    )
}

class Group extends Component {
    state = {data: []}

    async componentDidMount() {
        let res = await this.axios.get('/home/groups?area=AREA%7C88cff55c-aaa4-e2e0')
        this.setState({
            data: res.data.body
        })
    };

    render() {
        const {data} = this.state
        return (
            <div className="model2">
                <div className="title_con">
                    <h3>租房小组</h3>
                    <Link to="/" className="iconfont icon-next"/>
                </div>
                <ul className="house_list">
                    {
                        data.map(item => (
                            <li key={item.id}>
                                <p className="fl">{item.title}</p>
                                <img src={BASE_URL + item.imgSrc} alt="" className="fr"/>
                                <span className="fl">{item.desc}</span>
                            </li>
                        ))
                    }
                </ul>
            </div>
        )
    }
}

class News extends Component {
    state = {
        data: []
    }

    async componentDidMount() {
        let oRes = await this.axios.get('/home/news?area=AREA%7C88cff55c-aaa4-e2e0');
        this.setState({
            data: oRes.data.body
        })
    }

    render() {
        const {data} = this.state
        return (
            <div className="model mb120">
                <div className="title_con">
                    <h3>最新资讯</h3>
                    <Link to="/" className="iconfont icon-next"/>
                </div>
                <ul className="list">
                    {
                        data.map(item => (
                            <li key={item.id}>
                                <Link to="/"><img src={BASE_URL + item.imgSrc} alt=""/></Link>
                                <div className="detail_list">
                                    <h4>{item.title}</h4>
                                    <div className="detail">
                                        <span>{item.from}</span>
                                        <em>{item.date}</em>
                                    </div>
                                </div>
                            </li>
                        ))
                    }
                </ul>
            </div>
        )
    }
}

class Home extends Component {
    render() {
        return (
            <div>
                <SearchBar/>
                <Slide/>
                <Menu/>
                <Group/>
                <News/>
            </div>
        );
    }
}
export default Home;
