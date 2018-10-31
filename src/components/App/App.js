import React from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router';
import { Switch, Route, Redirect } from 'react-router-dom';
import io from 'socket.io-client';
import Home from 'components/Home';
import NavBar from 'components/NavBar';
import ShoppingList from 'components/ShoppingList/ShoppingList';
import Login from '../Login';
import Register from '../Register';

const API_URL = process.env.REACT_APP_API;

class App extends React.Component {
  static propTypes = {};

  constructor(props) {
    super(props);
    this.state = {
      loggedUserId: localStorage.getItem('loggedUserId') || null,
      loggedUser: null,
      isOnLine: true,
    };

    this.socket = io(`${API_URL}`);
    this.socket.on('connect', () => {
      console.log('client connected');
    });

    this.socket.on('connect_error', error => {
      this.setState(() => ({
        isOnLine: false,
      }));
    });
    this.socket.on('reconnect', () => {
      this.setState(() => ({
        isOnLine: true,
      }));
    });
    this.socket.on('CONNECT_SUCCESS', ({ message }) => {
      console.log(message);
    });
    this.socket.on('CREATE_NEW_SHOPPING_LIST_SUCCESS', ({ payload }) => {});
    this.socket.on('NOTIFICATION', ({ type, user }) => {
      switch (type) {
        case 'new_invitation': {
          this.updateUser(user);
          break;
        }
        default:
      }
    });
  }

  static getDerivedStateFromProps(props, state) {
    if (
      props.location.pathname === '/' ||
      props.location.pathname === '/login'
    ) {
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

  componentDidMount() {
    const { loggedUserId } = this.state;
    this.socket.emit(
      'FETCH_USER',
      { loggedUserId },
      ({ data: user, success }) => {
        if (success) return this.setUserToState(user);
      },
    );
  }

  setUserToState = user => {
    this.setState(() => ({
      loggedUser: user,
    }));
  };

  setLoggedUser = loggedUserId => {
    localStorage.setItem('loggedUserId', loggedUserId);
    this.setState(() => ({
      loggedUserId,
    }));
  };

  updateUser = user => {
    this.setState(() => ({
      loggedUser: user,
    }));
  };

  render() {
    const { isOnLine, hideArrowBack, loggedUser, loggedUserId } = this.state;
    return (
      <main>
        <NavBar hideArrowBack={hideArrowBack} />
        <Switch>
          <Route
            exact
            path="/"
            render={router => {
              if (!loggedUserId) return <Redirect to="/login" />;
              return (
                <Home
                  router={router}
                  socket={this.socket}
                  loggedUser={loggedUser}
                  loggedUserId={loggedUserId}
                  updateUser={this.updateUser}
                  isOnLine={isOnLine}
                />
              );
            }}
          />
          <Route
            exact
            path="/login"
            render={router => {
              if (loggedUserId) return <Redirect to="/" />;
              return (
                <Login
                  router={router}
                  socket={this.socket}
                  setLoggedUser={this.setLoggedUser}
                />
              );
            }}
          />
          <Route
            exact
            path="/register"
            render={router => {
              if (loggedUserId) return <Redirect to="/" />;
              return (
                <Register
                  router={router}
                  socket={this.socket}
                  setLoggedUser={this.setLoggedUser}
                  isOnLine={isOnLine}
                />
              );
            }}
          />
          <Route
            exact
            path="/list/:id"
            render={router => {
              return (
                <ShoppingList
                  router={router}
                  socket={this.socket}
                  loggedUser={loggedUser}
                  isOnLine={isOnLine}
                />
              );
            }}
          />
        </Switch>
      </main>
    );
  }
}

export default withRouter(App);
