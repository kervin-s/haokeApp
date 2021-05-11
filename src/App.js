import React from "react";
import {HashRouter, Route, Redirect, Switch} from "react-router-dom";
import Layout from "./pages/layout/layout.jsx";


function App() {
    return (
        <HashRouter>
            <Switch>
                <Route path='/layout' component={Layout}/>
                {/* 加上exact是为了让path精确匹配，否则“/”和“/china”的路径会同时匹配 */}
                <Redirect exact from="/" to="/layout"/>
            </Switch>
        </HashRouter>
    )
}

export default App
