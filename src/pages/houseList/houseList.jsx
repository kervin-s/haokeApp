import React, { Component } from 'react';
import './houseList.scss';
import Citybar from '../../components/citybar/citybar';

//导入pickerView组件，用来显示过滤数据
import { PickerView,Toast } from 'antd-mobile';

import store from '@/store';

// 导入长列表优化组件：可视区渲染组件
import {List,AutoSizer,InfiniteLoader} from 'react-virtualized';

import { BASE_URL } from '../../utils';


class FilterBar extends Component{
    constructor(props){
        super(props);
        this.state = {
            oCurrentCity:store.getState(),
            bShowPicker:false, // 控制弹框一的显示和隐藏
            bShowTags:false,  // 控制弹框二的显示和隐藏
            aFilterBarData:[  // 列表渲染过滤条结构的数据
                {title:'区域',type:'area'},
                {title:'方式',type:'mode'},
                {title:'租金',type:'price'},
                {title:'筛选',type:'more'}
            ],
            oAllFilterData:{},  // 存储所有的过滤数据
            aCurrentFilterData:[], // 存储pickerView当前的过滤数据
            cols:1,  // 存储PickerView组件的列表
            sType:'', // 存储当前过滤条点击的类型
            aTagsData:[], // 存储弹框二的过滤数据
            oPickerVal:{ // 存储PickerView中选中的值
                area:["area", "null"],
                mode:['null'],
                price:['null']
            },
            aTagsVal:[], // 存储弹框二选中的值
            oFilterBarState:{ // 控制过滤条文字高亮
                area:false,
                mode:false,
                price:false,
                more:false
            }
        } 
        this.unsubscribe = store.subscribe( this.fnStoreChange )
    }

    // 定义方法根据oPickerVal、aTagsVal是否是初始值来改oFilterBarState里面的布尔值
    // 从而实现动态设置过滤条文字高亮的效果
    fnSetFilterState=()=>{
        this.setState(state=>{
            let oNowPickerVal = state.oPickerVal;
            let aNowTagsVal = state.aTagsVal;
            let oNowFilterBarState = state.oFilterBarState;

            if( oNowPickerVal.area[0]==='area'&&oNowPickerVal.area[1]==='null'){
                oNowFilterBarState.area = false;
            }else{
                oNowFilterBarState.area = true;
            }

            if( oNowPickerVal.mode[0]==='null'){
                oNowFilterBarState.mode = false;
            }else{
                oNowFilterBarState.mode = true;
            }

            if( oNowPickerVal.price[0]==='null'){
                oNowFilterBarState.price = false;
            }else{
                oNowFilterBarState.price = true;
            }

            if( aNowTagsVal.length===0){
                oNowFilterBarState.more = false;
            }else{
                oNowFilterBarState.more = true;
            }

            return {
                oFilterBarState:oNowFilterBarState
            }

        })

    }

    componentWillUnmount(){
        this.unsubscribe()
    }

    fnStoreChange=()=>{
        this.setState({
            oCurrentCity:store.getState()
        },()=>{
            // 在改变了当前城市时候，重新获取过滤数据
            this.fnGetData();
            // 重置之前的过滤选中的值
            this.setState({
                oPickerVal:{
                    area:["area", "null"],
                    mode:['null'],
                    price:['null']
                },
                aTagsVal:[],
                oFilterBarState:{
                    area:false,
                    mode:false,
                    price:false,
                    more:false
                }
            })
        })
    }

    componentDidMount(){
        this.fnGetData()
    }

    fnGetData=async ()=>{
        let sAllFilterData = localStorage.getItem('haoke_filter_data_'+this.state.oCurrentCity.value);
        let oAllFilterData = {}
        if( sAllFilterData ){
            oAllFilterData = JSON.parse( sAllFilterData )
        }else{
            let oRes = await this.axios.get('/houses/condition?id='+this.state.oCurrentCity.value);
            oAllFilterData = oRes.data.body;
            localStorage.setItem('haoke_filter_data_'+this.state.oCurrentCity.value,JSON.stringify(oRes.data.body))
        }
        
        console.log( oAllFilterData );

        this.setState({
            oAllFilterData
        },()=>{
            this.setState(state=>{
                let { characteristic,floor,oriented,roomType } = state.oAllFilterData;
                return {
                    aTagsData:[
                        {title:'户型',data:roomType},
                        {title:'朝向',data:oriented},
                        {title:'楼层',data:floor},
                        {title:'房屋亮点',data:characteristic}
                    ]
                }
            })
        })
    }

    /* 
        area的值的处理：
        1、["area", "null"]  处理成： area:"null"
        2、["area", "AREA|acdacb70-3025-74c3", "null"]  处理成： area:"AREA|acdacb70-3025-74c3"
        3、["area", "AREA|acdacb70-3025-74c3", "AREA|8cd0bd89-c51a-eba3"] 处理成： area:"AREA|8cd0bd89-c51a-eba3"
        4、["subway", "null"]  处理成： subway:"null"
        5、["subway", "2号线(蛇口线)", "null"]  处理成： subway:"2号线(蛇口线)"
        6、["subway", "2号线(蛇口线)", "SUY|1958f68b-bc87-0303"]  处理成：subway:"SUY|1958f68b-bc87-0303"

        mode的值的处理：
        1、["null"]  处理成：rentTyp:"null"
        2、["true"]    处理成：rentTyp:"true" 
        3、["false"]  处理成：rentTyp:"false"
    
        price的值的处理：
        1、["null"]  处理成：price:"null"
        2、["PRICE|2000"]    处理成：price:"2000" 

        more的值的处理
        1、["ROOM|d4a692e4-a177-37fd", "ORIEN|61e99445-e95e-7f37", "FLOOR|3"]
        处理成：more:"ROOM|d4a692e4-a177-37fd,ORIEN|61e99445-e95e-7f37,FLOOR|3"
    
    */
    fnFormatParams=()=>{
        this.setState(state=>{
            let oNowPickerVal = state.oPickerVal;
            let aNowTagsVal = state.aTagsVal;
            let oParams = {}

            // 处理oPickerVal中area对应的值
            if( oNowPickerVal.area.length === 2 ){
                oParams[oNowPickerVal.area[0]] = oNowPickerVal.area[1]
            }else if( oNowPickerVal.area[2]==="null" ){
                oParams[oNowPickerVal.area[0]] = oNowPickerVal.area[1]
            }else{
                oParams[oNowPickerVal.area[0]] = oNowPickerVal.area[2]
            }

            // 处理oPickerVal中mode对应的值
            oParams.rentType = oNowPickerVal.mode[0];

            // 处理oPickerVal中price对应的值
            if(oNowPickerVal.price[0]==="null"){
                oParams.price = "null"
            }else{
                oParams.price = oNowPickerVal.price[0].split("|")[1]
            }

            // 处理aTagsVal中的值
            oParams.more = aNowTagsVal.join(",");

            // 调用父组件传入的方法，同时将oParams对象传出去
            this.props.fnGetParams(oParams);

            // console.log( oParams );

            return {
                bShowPicker:false,
                bShowTags:false,
                sType:''
            } 

        })
    }



    // 定义显示弹框的方法
    fnShowPop=(sType)=>{
        if(sType!=='more'){
            //console.log( this.state.oAllFilterData );
            let { area,subway,price,rentType } = this.state.oAllFilterData;
            let aCurrentFilterData = [];
            let cols = 1;
            if(sType==='area'){
                aCurrentFilterData = [area,subway];
                cols = 3;
            }else if( sType==='mode' ){
                aCurrentFilterData = rentType
            }else{
                aCurrentFilterData = price
            }

            this.setState({
                bShowPicker:true,
                bShowTags:false,
                aCurrentFilterData,
                cols,
                sType
            })
        }else{
            this.setState({
                bShowPicker:false,
                bShowTags:true,
                sType
            })
        }
    }

    // 定义隐藏弹框的方法
    fnHidePop=()=>{
        this.setState({
            bShowPicker:false,
            bShowTags:false,
            sType:''
        })
    }

    // 定义获取PickerView值的方法
    fnGetPickerVal=(val)=>{
        //console.log(val);
        this.setState(state=>{
            let oNowPickerVal = state.oPickerVal;
            oNowPickerVal[state.sType] = val;
            return {
                oPickerVal:oNowPickerVal
            }
        },()=>{
            //console.log( this.state.oPickerVal )
            this.fnSetFilterState()
        })
    }

    // 定义存储弹框二选中的值的方法
    fnGetTagsVal=(val)=>{
        this.setState(state=>{
            let aNowTagsVal = state.aTagsVal;
            // 判断点击的tags的value值是否已存储到aTagsVal数组中
            if( aNowTagsVal.includes( val ) ){
                aNowTagsVal = aNowTagsVal.filter(item=>item!==val)
            }else{
                aNowTagsVal.push( val )
            }
            
            return {
                aTagsVal:aNowTagsVal
            }
        },()=>{
            console.log( this.state.aTagsVal )
            this.fnSetFilterState()
        })
    }

    render(){
        let {
            bShowPicker, // 控制弹框一的显示和隐藏
            bShowTags,  // 控制弹框二的显示和隐藏
            aFilterBarData, // 列表渲染过滤条结构的数据
            aCurrentFilterData, // 存储pickerView当前的过滤数据
            cols, // 存储PickerView组件的列表
            sType, // 存储当前过滤条点击的类型
            aTagsData, // 存储弹框二的过滤数据
            oPickerVal,// 存储PickerView中选中的值
            aTagsVal, // 存储弹框二选中的值
            oFilterBarState // 控制过滤条文字高亮

        } = this.state;
        return (
            // 组件最外层的div可以写成空标签的形式
            <>
                <ul className="filter_list">
                    {
                        aFilterBarData.map(item=>(
                            <li 
                                key={ item.type } 
                                onClick={ ()=>this.fnShowPop( item.type ) } 
                                className={((item.type===sType)?"current ":"")+((oFilterBarState[item.type])?"active":"")} 
                            >
                                <span>{ item.title }</span>
                                <i className="iconfont icon-xialajiantouxiangxia"></i>
                            </li>
                        ))
                    }  
                </ul>

                {/* 弹框一的结构 */}
                <div className={bShowPicker?"slide_pannel pannel_in":"slide_pannel pannel_out"}>
                    <div className="slide_comp">
                        <PickerView
                            data={aCurrentFilterData}
                            // 设置是否级联
                            cascade={true}
                            // 设置列数
                            cols={ cols }
                            // 绑定onChange,关联一个方法，这个方法会接收到当前Pickerview选中的值
                            onChange={ this.fnGetPickerVal }

                            //设置PickerView选中的值
                            value={ oPickerVal[sType] }
                        />
                    </div>
                    <div className="slide_btns">
                        <span onClick={ this.fnHidePop }>取消</span>
                        <b onClick={ this.fnFormatParams }>确定</b>
                    </div>
                </div>
                <div className={bShowPicker?"mask mask_in":"mask mask_out"}  onClick={ this.fnHidePop }></div>

                {/* 弹框二的结构 */}
                <div className={bShowTags?"tags_pannel tags_pannel_in":"tags_pannel tags_pannel_out"}>
                    <div className="tags_list">
                        {
                            aTagsData.map((item,i)=>(
                                <div key={i}>
                                    <h3>{item.title}</h3>
                                        <div className="ul_wrap">
                                            <ul>
                                               {
                                                   item.data.map(val=><li className={(aTagsVal.includes( val.value ))?"active":""} key={ val.value } onClick={ ()=>this.fnGetTagsVal(val.value) }>{ val.label }</li>)
                                               }
                                            </ul>
                                        </div>
                                </div>
                            ))
                        }
                    </div>
                    <div className="tags_btns">
                        <span  onClick={ this.fnHidePop }>取消</span>
                        <b onClick={ this.fnFormatParams }>确定</b>
                    </div>
                </div>    
                <div className={bShowTags?"mask2 mask_in":"mask2 mask_out"} onClick={ this.fnHidePop }></div>
            </>
        )
    }
}

class Houselist extends Component {
    constructor(props){
        super(props);
        this.state = {
            oCurrentCity:store.getState(),
            aHouseList:[],
            count:0
        }
        this.unsubscribe = store.subscribe( this.fnStoreChange )
    }

    componentWillUnmount(){
        this.unsubscribe()
    }

    fnStoreChange=()=>{
        this.setState({
            oCurrentCity:store.getState()
        },()=>{
            // 在修改了当前城市之后，重新请求城市列表数据
            this.fnGetData({})
        })
    }

    componentDidMount(){
        this.params = {};
        this.fnGetData({})
    }

    fnGetData=async (params)=>{
        this.params = params;
        Toast.loading('加载中...');
        let oRes = await this.axios.get('/houses',{params:{
            ...params,
            cityId:this.state.oCurrentCity.value,
            start:1,
            end:20
        }})
        Toast.hide();
        // console.log(oRes);
        this.setState({
            aHouseList:oRes.data.body.list,
            count:oRes.data.body.count
        },()=>{
            // 让List列表滚动到第一行
            this.list.scrollToRow(0);
        })
    }
    /* 
        {
            desc: "三室/63/南|北/银河城春晓苑"
            houseCode: "5cc477061439630e5b467b0b"
            houseImg: "/newImg/7bjfdalho.jpg"
            price: 1300
            tags: ["双卫生间"]
            title: "整租 · 出租 银河城春晓苑一期 中间楼层，阳光好。"
                    }
    */

    rowRenderer=({key,index,style})=>{
        let item = this.state.aHouseList[index];        
        if(!item){
            return <div className="reload" key={key} style={style}><div>Loading...</div></div>
        }
        return (
            <div className="house_wrap" key={ key } style={ style } onClick={ ()=>this.props.history.push('/detail/'+item.houseCode) }>
                <div className="house_item">
                    <div className="imgWrap">
                        <img className="img" src={ BASE_URL + item.houseImg} alt="" />
                    </div>
                    <div className="content">
                        <h3 className="title">{item.title}</h3>
                        <div className="desc">{item.desc}</div>
                        <div>
                            {
                                item.tags.map((val,i)=>  <span className={"tag tag"+i} key={i}>{val}</span>)
                            }
                        </div>
                        <div className="price">
                            <span className="priceNum">{item.price}</span> 元/月
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    // 此方法是InfiniteLoader组件内部判断某一行是否加载的方法
    isRowLoaded=({ index })=>{
        return !!this.state.aHouseList[index];
    }

    // 定义加载更多行的方法
    loadMoreRows=({ startIndex, stopIndex })=>{
        return this.axios.get('/houses',{params:{
            ...this.params,
            cityId:this.state.oCurrentCity.value,
            start:startIndex,
            end:stopIndex
        }}).then(res=>{
            this.setState(state=>{
                return {
                    // 将新的请求返回的数据加到原来的数组中
                    aHouseList:[...state.aHouseList,...res.data.body.list]
                }
            })
        })
    }

    render() {
        let { count } = this.state;
        return (
            <div>
                <div className="list_title">
                    <span className="back iconfont icon-prev" onClick={ ()=>this.props.history.goBack() }></span>
                    <Citybar />
                    <i className="iconfont icon-ic-maplocation-o tomap" onClick={ ()=>this.props.history.push('/map') }></i>
                </div>
                <FilterBar fnGetParams={ this.fnGetData }  />
                <div className="house_list_con">
                <InfiniteLoader
                    isRowLoaded={this.isRowLoaded}
                    loadMoreRows={this.loadMoreRows}
                    rowCount={count}
                >
                    {({ onRowsRendered, registerChild }) => (
                    <AutoSizer>
                        {({height, width}) => (
                        <List
                            onRowsRendered={onRowsRendered}
                            // 将list组件组件对象绑定到this上，以便在方法中访问list对象
                            // 同时将list对象通过registerChild方法注册给InfiniteLoader组件，以便InfiniteLoader组件使用list对象
                            ref={(list)=>{
                                this.list = list;
                                registerChild(list);
                            }}
                            width={width}
                            height={height}
                            rowCount={count}
                            rowHeight={120}
                            rowRenderer={this.rowRenderer}
                        />
                        )}
                    </AutoSizer>
                    )}
                    </InfiniteLoader>          
                </div>
            </div>
        );
    }
}

export default Houselist;