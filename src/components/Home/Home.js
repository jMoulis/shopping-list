import React from 'react';
import { NavLink } from 'react-router-dom';
import PropTypes from 'prop-types';
import idb from 'idb';
import NewShoppingList from 'components/ShoppingList/NewShoppingList';
import {
  List,
  ListItem,
  Button,
  withStyles,
  Typography,
  SwipeableDrawer,
  CircularProgress,
} from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import DeleteIcon from '@material-ui/icons/Delete';
import LinkOffIcon from '@material-ui/icons/LinkOff';
import LinkIcon from '@material-ui/icons/Link';
import MyCircularProgress from '../global/MyCircularProgress';

const styles = theme => ({
  root: {
    paddingTop: theme.spacing.unit * 10,
  },
  button: {
    margin: theme.spacing.unit,
  },
  navLink: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  menu: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    display: 'flex',
    justifyContent: 'flex-end',
    padding: theme.spacing.unit * 2,
  },
  title: {
    paddingLeft: theme.spacing.unit * 2,
    paddingRigth: theme.spacing.unit * 2,
  },
});

class Home extends React.Component {
  static propTypes = {
    socket: PropTypes.object.isRequired,
  };

  state = {
    data: [],
    error: null,
    showAddListForm: false,
    showSelectMenu: false,
  };

  constructor(props) {
    super(props);
    this.idb = idb.open('shopping-lists-store', 1, db => {
      db.createObjectStore('shopping-lists', { keyPath: '_id' });
    });
  }

  async componentDidMount() {
    const { socket } = this.props;

    // if (!navigator.onLine) {
    //   try {
    //     this.fetchListFromIdb();
    //   } catch (error) {}
    // }
    this.fetchShoppingList();

    socket.on('CREATE_NEW_SHOPPING_LIST_SUCCESS', ({ payload }) =>
      this.addNewValue(payload),
    );
    socket.on('CREATE_NEW_SHOPPING_LIST_FAILURE', ({ error }) =>
      this.setError(error),
    );
    socket.on('DELETE_LIST_SUCCESS', ({ payload }) => {
      this.removeListFromState({ _id: payload._id });
    });
  }

  addNewValue = value =>
    this.setState(prevState => ({
      data: [...prevState.data, value],
    }));

  setValueToState = data => {
    this.setState(() => ({
      data,
      error: null,
    }));
  };

  setError = error => {
    this.setState(() => ({
      error,
    }));
  };

  addListToIdb = data => {
    Object.keys(data).forEach(key => {
      this.idb.then(db => {
        const tx = db.transaction('shopping-lists', 'readwrite');
        const store = tx.objectStore('shopping-lists');
        store.put(data[key]);
        return tx.complete;
      });
    });
  };

  removeListFromState = ({ _id }) => {
    const { data: shoppingLists } = this.state;
    this.setState(() => ({
      data: shoppingLists.filter(list => list._id !== _id),
    }));
  };

  fetchListFromIdb = async () => {
    const lists = await this.idb.then(db => {
      const tx = db.transaction('shopping-lists', 'readonly');
      const store = tx.objectStore('shopping-lists');
      return store.getAll();
    });
    this.setState(() => ({
      data: lists,
    }));
  };

  handleShowAddListForm = () => {
    this.setState(prevState => ({
      showAddListForm: !prevState.showAddListForm,
    }));
  };

  handleShowSelectMenu = () => {
    this.setState(prevState => ({
      showSelectMenu: !prevState.showSelectMenu,
    }));
  };

  handleDeleteList = _id => {
    const { socket } = this.props;
    socket.emit('DELETE_LIST', { _id }, ({ error }) => {
      if (error) return this.setError(error);
    });
  };

  handleJoinList = listId => {
    const { socket, loggedUserId, updateUser } = this.props;
    socket.emit('JOIN_LIST', { listId, loggedUserId }, ({ data }) => {
      updateUser(data);
      this.fetchShoppingList();
    });
  };

  fetchShoppingList = () => {
    const { socket, loggedUserId } = this.props;
    this.setState(() => ({
      fetchShoppingListsPending: true,
    }));
    return socket.emit(
      'FETCH_SHOPPING_LISTS',
      { loggedUser: loggedUserId },
      ({ success, error, data }) => {
        if (!success) {
          this.setState(() => ({
            fetchShoppingListsPending: false,
          }));
          return this.setError(error);
        }
        this.setState(() => ({
          fetchShoppingListsPending: false,
        }));
        this.addListToIdb(data);
        return this.setValueToState(data);
      },
    );
  };

  handleLeaveList = listId => {
    const { socket, loggedUserId, updateUser } = this.props;
    socket.emit(
      'LEAVE_LIST',
      { loggedUser: loggedUserId, listId },
      ({ data, success, error }) => {
        updateUser(data);
        this.fetchShoppingList();
      },
    );
  };

  render() {
    const {
      data: shoppingLists,
      error,
      showSelectMenu,
      fetchShoppingListsPending,
    } = this.state;
    const { socket, classes, loggedUserId, loggedUser } = this.props;
    if (fetchShoppingListsPending) return <MyCircularProgress />;
    if (error) return <span>{error}</span>;
    return (
      <div className={classes.root}>
        <div className={classes.menu}>
          <Button
            variant="fab"
            color="primary"
            type="button"
            onClick={this.handleShowSelectMenu}
          >
            <AddIcon />
          </Button>
        </div>
        <SwipeableDrawer
          anchor="bottom"
          open={showSelectMenu}
          onClose={this.handleShowSelectMenu}
          onOpen={this.handleShowSelectMenu}
        >
          <div tabIndex={0}>
            <NewShoppingList
              socket={socket}
              onCancel={this.handleShowSelectMenu}
              loggedUser={loggedUserId}
            />
          </div>
        </SwipeableDrawer>
        {loggedUser &&
          loggedUser.invitations.length > 0 && (
            <div>
              <Typography className={classes.title} variant="title">
                New Invitations
              </Typography>
              <List
                style={{
                  padding: 0,
                }}
              >
                {loggedUser &&
                  loggedUser.invitations &&
                  loggedUser.invitations.map(({ list }) => {
                    return (
                      <ListItem className={classes.navLink} key={list._id}>
                        <Typography variant="h5">
                          {list && list.name}
                        </Typography>
                        <Button
                          color="primary"
                          variant="contained"
                          className={classes.button}
                          onClick={() => this.handleJoinList(list._id)}
                        >
                          <LinkIcon />
                        </Button>
                      </ListItem>
                    );
                  })}
              </List>
            </div>
          )}
        {shoppingLists &&
          shoppingLists.length === 0 && (
            <Typography className={classes.title} variant="body1">
              Vous n'avez aucune liste
            </Typography>
          )}
        <List>
          {shoppingLists.length > 0 &&
            shoppingLists.map((list, index) => (
              <ListItem className={classes.navLink} key={index} button>
                <NavLink
                  to={`/list/${list._id}`}
                  href={`/list/${list._id}`}
                  onClick={() => this.handleJoinList(list._id)}
                >
                  <Typography variant="h5">{list.name}</Typography>
                </NavLink>
                {list.user.toString() === loggedUserId ? (
                  <Button
                    color="secondary"
                    variant="contained"
                    className={classes.button}
                    onClick={() => this.handleDeleteList({ _id: list._id })}
                  >
                    <DeleteIcon />
                  </Button>
                ) : (
                  <Button
                    color="primary"
                    variant="contained"
                    className={classes.button}
                    onClick={() => this.handleLeaveList({ _id: list._id })}
                  >
                    <LinkOffIcon />
                  </Button>
                )}
              </ListItem>
            ))}
        </List>
      </div>
    );
  }
}

export default withStyles(styles)(Home);
