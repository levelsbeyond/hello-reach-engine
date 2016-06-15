import React, {Component, PropTypes} from "react";
import request from "superagent-bluebird-promise";
import style from './style.css';

class LoginForm extends Component {

	constructor(props, context) {
		super(props, context);

		this.state = {
			reachEngineUrl: '',
			username: '',
			password: ''
		};
	}

	onReachEngineUrlChange(e) {
		this.setState({reachEngineUrl: e.target.value});
	}

	onUsernameChange(e) {
		this.setState({username: e.target.value});
	}

	onPasswordChange(e) {
		this.setState({password: e.target.value});
	}

	onLoginFormSubmit(e) {
		e.preventDefault();
		const {username, password, reachEngineUrl} = this.state;
		request
			.post(`${reachEngineUrl}/reachengine/api/security/users/login`)
			.type('application/json')
			.send({
				auth_user: username,
				auth_password: password
			})
			.promise()
			.then(res => {
				const payload = {
					user: res.body,
					reachEngineUrl: reachEngineUrl,
					sessionKeyHeader: {__sessionkey: res.headers.__sessionkey}
				};
				this.props.onLogin(payload);

			})
			.catch(console.error);
	}

	render() {
		return (
			<form className='loginForm' onSubmit={::this.onLoginFormSubmit}>
				<h3>Login</h3>
				<input type="url" name="reachEngineUrl" placeholder="Reach Engine Url" required
				       defaultValue={this.state.reachEngineUrl}
				       onChange={::this.onReachEngineUrlChange}/>
				<input type="text" name="username" placeholder="Username" required
				       defaultValue={this.state.username}
				       onChange={::this.onUsernameChange}/>
				<input type="password" name="password" placeholder="Password" required
				       defaultValue={this.state.password}
				       onChange={::this.onPasswordChange}/>
				<button type="submit">Log In</button>
			</form>
		);
	}
}

LoginForm.propTypes = {
	username: PropTypes.string,
	password: PropTypes.string,
	reachEngineUrl: PropTypes.string,
	onLogin: PropTypes.func.isRequired
};

export default LoginForm