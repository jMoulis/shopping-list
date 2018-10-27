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
  ListItemText,
} from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import DeleteIcon from '@material-ui/icons/Delete';

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
    socket.emit('FETCH_SHOPPING_LISTS', ({ success, error, data }) => {
      if (!success) {
        return this.setError(error);
      }
      this.addListToIdb(data);
      return this.setValueToState(data);
    });
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

  render() {
    const {
      data: shoppingLists,
      error,
      showAddListForm,
      showSelectMenu,
    } = this.state;
    const { socket, classes } = this.props;
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
          <div
            tabIndex={0}
            role="button"
            onClick={this.handleShowSelectMenu}
            onKeyDown={this.handleShowSelectMenu}
          >
            <List>
              <ListItem button onClick={this.handleShowAddListForm}>
                <ListItemText primary="New List" />
              </ListItem>
            </List>
          </div>
        </SwipeableDrawer>
        <List>
          {shoppingLists.length > 0 &&
            shoppingLists.map((list, index) => (
              <ListItem className={classes.navLink} key={index} button>
                <NavLink to={`/list/${list._id}`} href={`/list/${list._id}`}>
                  <Typography variant="h5">{list.name}</Typography>
                </NavLink>
                <Button
                  color="secondary"
                  variant="contained"
                  className={classes.button}
                  onClick={() => this.handleDeleteList({ _id: list._id })}
                >
                  <DeleteIcon />
                </Button>
              </ListItem>
            ))}
        </List>
        {showAddListForm && (
          <NewShoppingList
            socket={socket}
            onCancel={this.handleShowAddListForm}
          />
        )}
      </div>
    );
  }
}

export default withStyles(styles)(Home);
