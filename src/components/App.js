import React, {Component} from "react";
import LoginForm from "./LoginForm";

class App extends React.Component {

	handleLogin(payload) {
		document.cookie = "__sessionKey="+ payload.sessionKeyHeader.__sessionkey;
		this.setState({authenticated: true, authenticationPayload: payload});
	};

	constructor(props, context) {
		super(props, context);
		this.state = {authenticated: false};
	}

	render() {
		let routeChildrenProps = {
			authenticationPayload: this.state.authenticationPayload
		};
		let children = [];
		if (this.props.children) {
			children = React.cloneElement(this.props.children, routeChildrenProps);
		}

		if (this.state.authenticated) {
			return (
				<div className="app-container">
					{children}
				</div>
			)
		} else {
			return ( <LoginForm onLogin={this.handleLogin.bind(this)}/> )
		}
	}
}


export default App;
