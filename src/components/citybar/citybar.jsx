import React, { Component } from "react";
import City from "../city/city";
import "./citybar.scss";
import store from "@/store";

export default class cityBar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      oCurrentCity: store.getState(),
      sClass: "city_wrap",
    };

    this.unsubscribe = store.subscribe(this.fnStoreChange);
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  fnStoreChange = () => {
    this.setState({
      oCurrentCity: store.getState(),
    });
  };

  fnSwitch = (sClass) => {
    this.setState({
      sClass,
    });
  };
  render() {
    return (
      <div className="search_con">
        <span
          className="city"
          onClick={() => this.fnSwitch("city_wrap slideUp")}
        >
          {this.state.oCurrentCity.label}
        </span>
        <i className="iconfont icon-xialajiantouxiangxia"></i>
        <span className="village">
          <i className="iconfont icon-fangdajing"></i> 请输入小区名
        </span>
        <City sClass={this.state.sClass} fnSwitch={this.fnSwitch} />
      </div>
    );
  }
}
