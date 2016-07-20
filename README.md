# What is Hello Reach Engine?
A sample client application demonstrating basic Reach Engine concepts.

## Getting Started
After you have cloned this repo, please set up the application by running:

`npm install`

Once all the packages are installed you can run the application using this command

`npm start`

The default port is set to 3000, so you can access the app at this url

`http://localhost:3000`


## Authentication

To login to the Hello Reach Engine App you will need the Reach Engine server URL and the username and password to authenticate with the server

The Reach Engine URL needs to include `http://`

Example

`http://1.0.0.0:8080`


## Technology

#### Front-End Framework
[React](https://facebook.github.io/react/)

#### Build and Package Tools
[NPM](https://www.npmjs.com)

[Webpack](http://webpack.github.io)


## API Documentation

For a full list of Reach Engine APIs see our API documentation.
http://docs.reachengineapi.apiary.io/


## Examples

### How do I authenticate with the Reach Engine Server?
Take a look at this file:
[`src/components/Loginform/index.js`](src/components/Loginform/index.js)

Find this method in the file: `onLoginFormSubmit(e)`

The method is using the POST method to this URL:
`${reachEngineUrl}/reachengine/api/security/users/login`


### How do I get a list of assets and search on that list?
Take a look at this file: [`src/components/Search/index.js`](src/components/Search/index.js)

Find this method in the file: `search()`

### How do I get thumbnail images?
Take a look at this file:
[`src/components/app/search/index.js`](src/components/Search/index.js)

Find this method: `getThumbs()`

## Software Requirements

The Hello Reach Engine App has been tested with the following:

npm v2.14.7

node v4.2.1

gcc 4.8

