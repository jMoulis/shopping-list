import React from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router';
import { Switch, Route } from 'react-router-dom';
import io from 'socket.io-client';
import Home from 'components/Home';
import NavBar from 'components/NavBar';
import ShoppingList from 'components/ShoppingList/ShoppingList';

const API_URL = process.env.REACT_APP_API;

class App extends React.Component {
  static propTypes = {};

  constructor(props) {
    super(props);

    this.state = {};
    this.socket = io(`${API_URL}`);
    this.socket.on('connect', () => {
      console.log('client connected');
    });
    this.socket.on('CONNECT_SUCCESS', ({ message }) => {
      console.log(message);
    });
    this.socket.on('CREATE_NEW_SHOPPING_LIST_SUCCESS', ({ payload }) => {
      console.log(payload);
    });
  }

  static getDerivedStateFromProps(props, state) {
    if (props.location.pathname === '/') {
      return {
        ...state,
        hideArrowBack: true,
      };
    }
    return {
      ...state,
      hideArrowBack: false,
    };
  }

  render() {
    const { hideArrowBack } = this.state;
    return (
      <main>
        <NavBar hideArrowBack={hideArrowBack} />
        <Switch>
          <Route
            exact
            path="/"
            render={router => {
              return <Home router={router} socket={this.socket} />;
            }}
          />
          <Route
            exact
            path="/list/:id"
            render={router => {
              return <ShoppingList router={router} socket={this.socket} />;
            }}
          />
        </Switch>
      </main>
    );
  }
}

export default withRouter(App);
