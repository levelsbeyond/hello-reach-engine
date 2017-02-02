import { Router, IndexRoute, Route, Redirect, hashHistory } from "react-router";
import { render } from "react-dom";
import React, { Component } from "react";
import App from "./components/App";
import AssetPage from "./components/AssetPage";
import Search from "./components/Search";
import normalize from "normalize.css";
import style from './style.css';

render((
    <Router history={hashHistory}>
      <Route path="/" component={App}>
	      <IndexRoute component={Search}/>
	      <Route path="/assets/:type/:id" component={AssetPage}/>
      </Route>
    </Router>
), document.body);
