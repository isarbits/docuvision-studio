import React from 'react';
import { Route, BrowserRouter, Switch } from 'react-router-dom';
import './App.scss';
import { Search } from './components/search/Search';
import { Queues } from './components/queues/Queues';
import { Header } from './components/layout/header/Header';

class App extends React.Component {
    render() {
        return (
            <BrowserRouter>
                <div className="application">
                    <Header />
                    <div className="app-content">
                        <Switch>
                            <Route exact={true} path="/">
                                {/*<Home />*/}
                                <h2 style={{ padding: '2rem' }}>Welcome Home</h2>
                            </Route>
                            <Route exact={true} path="/search">
                                {/*<Home />*/}
                                <Search />
                            </Route>
                            <Route exact={true} path="/queues">
                                <Queues />
                            </Route>
                        </Switch>
                    </div>
                </div>
            </BrowserRouter>
        );
    }
}

export default App;
