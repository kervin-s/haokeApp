import React, { Component } from "react";
import "./map.scss";
import store from "@/store";

let BMap = window.BMap; // 将百度地图BMap对象设置为全局变量，以便多个方法中访问这个对象

export default class Map extends Component {
  constructor(props) {
    super(props);
    this.state = {
      oCurrentCity: store.getState(),
    };
  }

  componentWillUnmount() {
    store.subscribe(() => {
      this.setState({
        oCurrentCity: store.getState(),
      });
    });
  }

  componentDidMount() {
    // 创建地图实例
    this.map = new BMap.Map("baidu_map");
    // 创建点坐标
    /* 
         let point = new BMap.Point(116.404, 39.915);
         map.centerAndZoom(point, 15); 
         */

    // 使用逆地址解析，从当前城市名解析出坐标点，再以这个坐标点为中心显示地图
    let myGeo = new BMap.Geocoder();
    // 将地址解析结果显示在地图上，并调整地图视野
    myGeo.getPoint(
      this.state.oCurrentCity.label,
      (point) => {
        if (point) {
          this.map.centerAndZoom(point, 11);
          // 调用在地图上放文字标签的方法
          this.fnAddOverLay(point);
        }
      },
      this.state.oCurrentCity.label
    );
    // 给地图加上比例尺和缩放按钮控件
    this.map.addControl(new BMap.NavigationControl());
    this.map.addControl(new BMap.ScaleControl());
  }

  // 定义在地图上放文字标签的方法
  fnAddOverLay = (point) => {
    let opts = {
      position: point, // 指定文本标注所在的地理位置
      offset: new BMap.Size(-37, -37), // 设置文本偏移量
    };
    // 创建文本标注对象
    var label = new BMap.Label(
      '<div class="map_label01">西丽小区<br>88套</div>',
      opts
    );
    // 自定义文本标注样式
    label.setStyle({
      border: "0px",
      backgroundColor: "transparent",
    });

    this.map.addOverlay(label);
  };

  render() {
    return <div></div>;
  }
}
