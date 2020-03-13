import React from 'react';
import { Route, BrowserRouter, Switch } from 'react-router-dom';
import './app.scss';
import { Search } from './components/search/Search';
import { Queues } from './components/queues/Queues';
import { Header } from './components/layout/header/Header';
import { baseUrl } from './config';

class App extends React.Component<{}, { errors: string[]; }> {

    state = { errors: [] };

    errorsRef = React.createRef<HTMLDivElement>();

    submit = event => {
        event.preventDefault();

        const form = event.currentTarget;

        const data = new FormData()
        data.append('file', form.file.files[0]);
        data.append('path', form.path.value);

        fetch(`${baseUrl}/documents`, { method: 'POST', body: data })
            .then((response: Response) => {
                if (response.status < 200 || response.status >= 300) {
                    return response.json().then(res => this.setState({ errors: [res.message] }));
                }
                // window.location.href = '/queues';
            })
            .catch(e => alert(e));
    }

    render() {
        return (
            <BrowserRouter>
                <Header />
                <Switch>
                    <Route exact={true} path="/">
                        {/*<Home />*/}
                        <h2 style={{ paddingTop: '1rem', marginBottom: 0, textAlign: 'center' }} >Welcome Home</h2>
                        <div className="pa-2 flex-column flex-align-center">
                            <form
                                onSubmit={this.submit}
                                className="flex-column border-grey pa-2"
                                style={{ maxWidth: '600px', alignItems: 'start', borderRadius: '6px' }}
                            >
                                <input className="my-2" type="file" name="file" />
                                <input className="my-2" type="text" placeholder="Folder path (optional)" name="path" />
                                <input className="my-2" type="submit" />
                            </form>
                            <div ref={this.errorsRef} className="errors fg-red">
                                {this.state.errors.map((e, i) => <p key={i}>{e}</p>)}
                            </div>
                        </div>
                    </Route>
                    <Route exact={true} path="/search">
                        {/*<Home />*/}
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

export default App;
