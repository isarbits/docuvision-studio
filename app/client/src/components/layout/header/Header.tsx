import React from 'react';
import { githubRepo } from '../../../config';
import './header.scss';
import { NavLink } from 'react-router-dom';

export class Header extends React.Component<{}> {
    render() {
        return (
            <>
                <header className="app-header app-grid-header">
                    <div className="header-content">
                        <span>Docuvision Studio</span>
                        <a
                            href={githubRepo}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Docuvision Studio on Github"
                        >
                            <img src="/GitHub-Mark-Light-64px.png" alt="Docuvision GitHub" />
                        </a>
                    </div>
                    <div className="links">
                        <nav>
                            <NavLink exact={true} to="/">
                                Home
                            </NavLink>
                            <NavLink exact={true} to="/search">
                                Search
                            </NavLink>
                            <NavLink exact={true} to="/queues">
                                Queues
                            </NavLink>
                        </nav>
                    </div>
                </header>
            </>
        );
    }
}
