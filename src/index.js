import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';

import  Amplify from 'aws-amplify';
import config from './aws-exports';

import { withAuthenticator } from 'aws-amplify-react'
const AppWithAuth = withAuthenticator(App, true);
const federated = {
  google_client_id: '742418607389-s3e9032dupbdmvb5km8iarotsu4s0f8e.apps.googleusercontent.com',
  facebook_app_id: '508487719679039',
};

Amplify.configure(config)

ReactDOM.render(<AppWithAuth federated={federated}/>, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
