import React, { Component } from 'react';
import './city.scss';
import store from '@/store';

// 导入长列表优化组件：可视区渲染组件
import {List,AutoSizer} from 'react-virtualized';

// 从antd-mobile中导入 Toast弹框组件
import { Toast } from 'antd-mobile';
// 定义格式化数据的方法


function fnFormatData(aList){
    let oCityList = {};

    aList.forEach(item=>{
        // 获取城市拼音的首字母
        let sLetter = item.short.substr(0,1);

        // 判断这个字母是否是oCityList对象中的key
        if( sLetter in oCityList ){
            oCityList[sLetter].push(item);
        }else{
            oCityList[sLetter] = [item];
        }
    })

    // 将对象的Key拿出来组成一个数组,然后将字母排序
    let aCityKeys = Object.keys( oCityList ).sort();

    return {oCityList,aCityKeys};

}

// 定义处理列表标题的方法
function fnFormatName(sTr){
    if(sTr==='#'){
        return '当前定位'
    }else if(sTr==='hot'){
        return '热门城市'
    }else{
        return sTr.toUpperCase()
    }
}


class City extends Component {
    constructor(props){
        super(props);
        this.state = {
            oCurrentCity:store.getState(),
            oCityList:{},
            aCityKeys:[],
            // 存储当前列表滚动到的索引值
            iNow:0
        }
        this.oMyRef = React.createRef();
        this.unsubscribe = store.subscribe(this.fnStoreChange);
        this.bIsScroll = true;
    }
    componentWillUnmount(){
        this.unsubscribe()
    }

    fnStoreChange=()=>{
        this.setState({
            oCurrentCity:store.getState()
            // 在新的当前城市设置完成之后，再设置oCityList中的当前城市数据
        },()=>{
            this.setState(state=>{
                let oNowCityList = state.oCityList;
                oNowCityList['#'] = [state.oCurrentCity];
                return {
                    oCityList:oNowCityList
                }
            })
        })
    }
    componentDidMount(){
        this.fnGetData()
    }

    fnGetData=async ()=>{
        let sCityList = localStorage.getItem('haoke_city_list');
        let aCityList = [];
        if( sCityList ){
            aCityList = JSON.parse( sCityList )
        }else{
            let oRes = await this.axios.get('/area/city?level=1');
            localStorage.setItem('haoke_city_list',JSON.stringify(oRes.data.body));
            aCityList = oRes.data.body;
        }

        // console.log(oRes.data.body);
        let {oCityList,aCityKeys} = fnFormatData( aCityList );


        // 在处理完的数据的基础上再加上热门城市数据
        let sHotCityList = localStorage.getItem('haoke_hot_city');
        let aHotCityList = [];
        if( sHotCityList ){
            aHotCityList = JSON.parse( sHotCityList );
        }else{
            let oRes2 = await this.axios.get('/area/hot');
            localStorage.setItem('haoke_hot_city',JSON.stringify( oRes2.data.body ))
            aHotCityList = oRes2.data.body
        }

        //console.log(oRes2.data.body);
        oCityList['hot'] = aHotCityList;
        aCityKeys.unshift('hot');

        //再加上当前城市数据
        oCityList['#'] = [this.state.oCurrentCity];
        aCityKeys.unshift('#');
        this.setState({
            oCityList,
            aCityKeys
            // setState有第二个参数，它是一个回调函数，回调函数在数据设置到state中完成之后会自动执行
        },()=>{
            //console.log('this.state.oCityList',this.state.oCityList);
            //console.log('this.state.aCityKeys',this.state.aCityKeys);
        })
    }

    rowRenderer=({key,index,style})=>{
        // index是传入的索引值，通过这个索引值就可以去aCityKeys数组中拿到对应的字母
        let item = this.state.aCityKeys[index];
        return (
            <div className="city_group" key={ key } style={ style }>
                <h4>{ fnFormatName(item) }</h4>
                <ul>
                    {
                        this.state.oCityList[item].map(val=><li key={ val.value } onClick={ ()=>this.fnSetCity(val.label) }>{val.label}</li>)
                    }
                </ul>
            </div>
        )
    }

    // 定义设置当前城市的方法
    fnSetCity=async sName=>{
        //alert(sName);
        // 判断传入城市名是否就是当前城市
        if(sName===this.state.oCurrentCity.label){
            Toast.info('当前城市已选！',2);
            return;
        }

        // 将城市名称去请求一个接口，验证点击的城市是否在公司业务范围内
        let oRes = await this.axios.get('/area/info?name='+sName);
        //console.log(oRes);

        // 判断返回的城市数据，如果点击的城市名不是上海，但是返回的是上海的数据
        // 就说明点击的城市名不在公司业务范围内，就提示用户，当前城市暂无数据
        // 如果不满足上面的条件，就把返回的城市设置为当前城市
        if(sName!=='上海'&&oRes.data.body.label==='上海'){
            Toast.info('你点击的城市暂无数据！',2);
        }else{
            // 将选择的城市存储到数据中心
            store.dispatch({
                type:'change_current_city',
                value:oRes.data.body
            });

            // 将设置的新的当前城市存储到缓存中
            sessionStorage.setItem('haoke_current_city',JSON.stringify( oRes.data.body ));

            // 设置成功之后同时关闭列表页面
            this.props.fnSwitch('city_wrap');
        }

    }


    // 定义计算行高度的方法
    fnCountHeight=({index})=>{
        let item = this.state.aCityKeys[index];
        let iLen = this.state.oCityList[item].length;
        return 40 + 58*iLen
    }
    // 定义列表滚动时触发的方法
    // startIndex是List给出的当前列表滚动到的索引
    onRowsRendered=({startIndex})=>{
        if(this.bIsScroll){
            this.setState({
                iNow:startIndex
            })
        }
    }

    //定义让列表滚动到对应行的位置的方法
    fnScrollToRow=(i)=>{
        this.bIsScroll = false;
        this.setState({
            iNow:i
        });

        this.oMyRef.current.scrollToRow(i);

        setTimeout(()=>{
            this.bIsScroll = true;
        },200);

    }

    render() {
        let { aCityKeys,iNow } = this.state;
        return (
            <div className={ this.props.sClass }>
                <div className="city_title">
                    <span className="shutoff iconfont icon-shut" onClick={ ()=>this.props.fnSwitch('city_wrap') }></span>
                    <h3>选择城市</h3>
                </div>

                <div className="group_con">
                    <AutoSizer>
                        {({height, width}) => (
                            <List
                                ref = { this.oMyRef }
                                width={width}
                                height={height}
                                rowCount={aCityKeys.length}
                                rowHeight={this.fnCountHeight}
                                rowRenderer={this.rowRenderer}
                                // 定义List组件在滚动时的属性及关联的方法
                                onRowsRendered={ this.onRowsRendered }
                                // 设置scrollToRow方法的对齐方式为顶部对齐
                                scrollToAlignment="start"
                            />
                        )}
                    </AutoSizer>
                </div>
                <ul className="city_index">
                    {
                        aCityKeys.map((item,i)=><li key={item} className={(iNow===i)?"active":""} onClick={ ()=>this.fnScrollToRow(i) } ><span>{ (item==='hot')?'热':item.toUpperCase() }</span></li>)
                    }
                </ul>
            </div>
        );
    }
}

export default City;