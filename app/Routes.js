/* eslint flowtype-errors/show-errors: 0 */
import React from 'react';
import {Switch, Route} from 'react-router';
import routes from './constants/routes.json';
import App from './containers/App';
import IndexPage from './containers/IndexPage';
import PostIndexPage from './containers/PostIndexPage'

export default () => (
    <App>
        <Switch>
            <Route exact path="/:filter" component={PostIndexPage}/>
            <Route exact path="/:filter/:tag" component={PostIndexPage}/>
            <Route path={routes.HOME} component={IndexPage}/>
        </Switch>
    </App>
);