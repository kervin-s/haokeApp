let reducer = (state={"label":"深圳","value":"AREA|a6649a11-be98-b150"},action)=>{
    if(action.type==='change_current_city'){
        // 将组件传入的新对象返回，它就会替换原来的数据作为数据中心最新的数据
        return action.value;
    }

    return state;
}

export default reducer;