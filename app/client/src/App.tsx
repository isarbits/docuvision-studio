import React from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import './app.scss';
import { Header } from './components/layout/header/Header';
import { Queues } from './components/queues/Queues';
import { Search } from './components/search/Search';

export class App extends React.Component<{}, {}> {
    render() {
        return (
            <BrowserRouter>
                <Header />
                <Switch>
                    <Route exact={true} path="/">
                        <Search />
                    </Route>
                    <Route exact={true} path="/queues">
                        <Queues />
                    </Route>
                </Switch>
            </BrowserRouter>
        );
    }
}
