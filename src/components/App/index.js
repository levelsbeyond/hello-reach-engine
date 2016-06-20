import {Router, IndexRoute, Route, Redirect, hashHistory} from "react-router";
import ReactDOM from "react-dom";
import React, {Component} from "react";
import LoginForm from "../LoginForm";
import Search from "../Search"


class App extends React.Component {

	handleLogin(payload) {
		console.log(payload);
		this.setState({authenticated: true, authenticationPayload: payload})
	};

	constructor(props, context) {
		super(props, context);
		this.state = {authenticated: false};
	}

	render() {
		if (this.state.authenticated) {
			return (
				<Search {...this.state}/>
			)
		} else {
			return ( <LoginForm onLogin={this.handleLogin.bind(this)}/> )
		}
	}
}

export default App;
