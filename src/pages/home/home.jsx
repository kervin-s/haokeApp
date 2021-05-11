import React, {Component} from 'react';
import {Link} from "react-router-dom";
import { BASE_URL } from '../../utils';
import './home.scss'
import {Carousel} from "antd-mobile";  //轮播图组件

class Slide extends Component {
    state = {
        data: []
    }
    componentDidMount() {
        this.fnGetData()
        console.log(112233);
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
                    this.state.data.length > 0 && <Carousel
                        autoplay={true}
                        infinite
                    >
                        {this.state.data.map(val => (
                            <a
                                key={val.id}
                                href="http://www.itcast.cn"
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

class Home extends Component {
    render() {
        return (
            <div>
                <Slide/>
            </div>
        );
    }
}

export default Home;
