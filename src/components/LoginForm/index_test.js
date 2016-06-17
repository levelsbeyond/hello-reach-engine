'use strict';
import LoginForm from "./index";
import {shallow} from "enzyme";
import {expect} from "chai";
import sinon from "sinon";
import nock from "nock";

describe('LoginForm', function () {

	var API;


	it('should login', function (done) {

		let onLogin = function (data) {
			expect(data).to.eql({
				user: {username: 'myUser'},
				reachEngineUrl: 'http://docker:8080',
				sessionKeyHeader: {__sessionkey: 'test'}
			});
			done();
		};

		let loginForm = shallow(<LoginForm onLogin={onLogin}/>);
		let urlInput = loginForm.find('input').get(0);
		let usernameInput = loginForm.find('input').get(1);
		let passwordInput = loginForm.find('input').get(2);
		urlInput.props.onChange({target: {value: 'http://docker:8080'}});
		usernameInput.props.onChange({target: {value: 'myUser'}});
		passwordInput.props.onChange({target: {value: 'myPassword'}});

		let form = loginForm.find('form').get(0);

		let user = {'username': 'myUser'};
		nock('http://docker:8080').post('/reachengine/api/security/users/login', {
			auth_user: 'myUser',
			auth_password: 'myPassword'
		}).reply(200, user, {__sessionkey: 'test'});

		let eventMock = {preventDefault: sinon.spy()};

		form.props.onSubmit(eventMock);


	});

});