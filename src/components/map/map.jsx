import React, { Component } from 'react';
import './map.scss';
import store from '@/store';

import { Toast } from 'antd-mobile';
import { BASE_URL } from '@/utils'

// 将BMap对象设置为全局变量，以便多个方法中访问这个对象
let BMap = window.BMap;

class Map extends Component {
    constructor(props){
        super(props);
        this.state = {
            oCurrentCity:store.getState(),
            sClass:'houseList',
            aHoustList:[]
        }
        this.unsubscribe = store.subscribe( this.fnStoreChange )
    }

    componentWillUnmount(){
        this.unsubscribe()
    }
    fnStoreChange=()=>{
        this.setState({
            oCurrentCity:store.getState()
        })
    }
    componentDidMount(){ 
        // 在this上定义一个属性来存储当前地图的缩放级别
        this.level = 11;
        
        // 创建地图实例  
        this.map = new BMap.Map("baidu_map");
        // 创建点坐标  
        /* 
        let point = new BMap.Point(116.404, 39.915);
        map.centerAndZoom(point, 15); 
        */

        // 给地图绑定movestart事件，在地图移动时，将房屋列表隐藏
        this.map.addEventListener('movestart',()=>{
            this.setState({
                sClass:'houseList'
            })
        })


        // 使用逆地址解析，从当前城市名解析出坐标点，再以这个坐标点为中心显示地图
        let myGeo = new BMap.Geocoder();      
        // 将地址解析结果显示在地图上，并调整地图视野    
        myGeo.getPoint(this.state.oCurrentCity.label, point=>{      
            if (point) {          
                // 调用在地图上放文字标签的方法
                this.fnAddOverLay(point,this.state.oCurrentCity.value,this.level);

            }      
        }, 
        this.state.oCurrentCity.label);
        // 给地图加上比例尺和缩放按钮控件
        this.map.enableScrollWheelZoom(true);     //开启鼠标滚轮缩放
        this.map.addControl(new BMap.NavigationControl());    
        this.map.addControl(new BMap.ScaleControl());   
    }

    // 定义在地图上放文字标签的方法
    fnAddOverLay=async (point,id,level)=>{
        // 第一次调用fnAddOverLay方法时，会给level参数传值
        // 第二次和第三次，不给level传值，这样可以标注出什么时候是第一次传值
        if(level){
            this.level = 11
        }else if( this.level === 11 ){
            this.level = 13;
        }else{
            this.level = 15;
        }

        this.map.centerAndZoom(point,this.level);

        // 增加loading效果
        // 时间设置为0是指弹框不会自己关闭，需要手动关闭
        Toast.loading('加载中...',0);

        // 请求地图上显示的房屋列表数据
        let oRes = await this.axios.get('/area/map?id='+id);

        // 关闭loading
        Toast.hide()

        //console.log(oRes.data.body);
        let aList = oRes.data.body;
        // 如果是第一个级别和第二个级别的label

        if( this.level !== 15 ){
            aList.forEach(item=>{
                // 获取item中的经纬度值
                let { longitude,latitude } = item.coord;
                // 用这个经纬度生成百度的坐标点
                let pos = new BMap.Point(longitude,latitude);
    
                let opts = {
                    position: pos, // 指定文本标注所在的地理位置
                    offset: new BMap.Size(-37, -37) // 设置文本偏移量
                };
                // 创建文本标注对象
                let label = new BMap.Label(`<div class="map_label01">${ item.label }<br>${ item.count }套</div>`, opts);
                // 自定义文本标注样式
                label.setStyle({
                    border: '0px',
                    backgroundColor: 'transparent'
                });
    
                // 绑定点击事件
                label.addEventListener('click',()=>{
                    //alert(item.label);
                    this.fnRefreshMap(pos,item.value);
                })
        
                this.map.addOverlay(label);
            }) 
        }else{ // 如果是第三个级别的label
            aList.forEach(item=>{
                // 获取item中的经纬度值
                let { longitude,latitude } = item.coord;
                // 用这个经纬度生成百度的坐标点
                let pos = new BMap.Point(longitude,latitude);
    
                let opts = {
                    position: pos, // 指定文本标注所在的地理位置
                    offset: new BMap.Size(-60, -50) // 设置文本偏移量
                };
                // 创建文本标注对象
                let label = new BMap.Label(`<div class="map_label02">${ item.label }&nbsp;&nbsp;${ item.count }套</div>`, opts);
                // 自定义文本标注样式
                label.setStyle({
                    border: '0px',
                    backgroundColor: 'transparent'
                });
    
                // 绑定点击事件
                label.addEventListener('click',(e)=>{
                    // console.log(e.changedTouches[0]);
                    // 获取手指点击的位置的x,y的像素值
                    let { clientX,clientY } = e.changedTouches[0];
                    // 计算点击的位置移动到页面上部中心点位置需要水平和垂直移动的像素值
                    let moveX = window.innerWidth/2 - clientX;
                    let moveY = window.innerHeight/4 - clientY;

                    //alert('第三级别的label');
                    this.fnShowHouseList(item.value,{moveX,moveY})
                })
        
                this.map.addOverlay(label);
            }) 

        }       
    }

    // 定义显示房屋列表的方法
    fnShowHouseList=async (id,oBj)=>{
        // 让地图水平和垂直移动一定位置，使得点击的标签去到页面上部中心点
        this.map.panBy(oBj.moveX,oBj.moveY);

        Toast.loading('加载中...', 0);
        let oRes = await this.axios.get('/houses?cityId='+id);
        //console.log(oRes.data.body.list);

        Toast.hide();

        this.setState({
            aHoustList:oRes.data.body.list,
            sClass:'houseList houseListShow'
        })
    }


    // 定义在地图重新生成新的label的方法
    fnRefreshMap=(point,id)=>{
        // 清除地图上原来的label
        // 给方法包裹定时器是为了解决它执行时报错的问题
        setTimeout(()=>{
            this.map.clearOverlays();
        },0);

        this.fnAddOverLay(point,id);
        
    }

    render() {
        let { aHoustList } = this.state;
        return (
            <div>
                <div className="common_title">
                    <span className="back iconfont icon-prev" onClick={ ()=>this.props.history.goBack() }></span>
                    <h3>地图找房</h3>
                </div>
                <div className="map_com">
                    <div id="baidu_map" style={{'width':'100%','height':'100%'}}></div>
                </div>

                <div className={ this.state.sClass }>
                    <div className="titleWrap">
                        <h1 className="listTitle">房屋列表</h1>
                        <a className="titleMore" href="/house/list">
                            更多房源
                        </a>
                    </div>

                    <div className="houseItems">
                        {
                            aHoustList.map(item=>(
                                <div className="house" key={ item.houseCode }>
                                    <div className="imgWrap">
                                        <img className="img" src={BASE_URL + item.houseImg} alt="house" />
                                    </div>
                                    <div className="content">
                                        <h3 className="title">{item.title}</h3>
                                        <div className="desc">{item.desc}</div>
                                        <div>
                                            {
                                                item.tags.map((val,i)=><span key={i} className={"tag tag"+i}>{val}</span>)
                                            }
                                        </div>
                                        <div className="price">
                                            <span className="priceNum">{item.price}</span> 元/月
                                        </div>
                                    </div>
                                </div>
                            ))
                        }                     
                    </div>
                </div>
            </div>
        );
    }
}

export default Map;