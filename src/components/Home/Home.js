import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import NewShoppingList from 'components/ShoppingList/NewShoppingList';
import {
  List,
  ListItem,
  Button,
  withStyles,
  Typography,
} from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';

const styles = theme => ({
  root: {
    paddingTop: theme.spacing.unit * 10,
  },
  button: {
    margin: theme.spacing.unit,
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
  };

  componentDidMount() {
    const { socket } = this.props;
    socket.emit('FETCH_SHOPPING_LISTS', ({ success, error, data }) => {
      if (!success) {
        return this.setError(error);
      }
      return this.setValueToState(data);
    });
    socket.on('CREATE_NEW_SHOPPING_LIST_SUCCESS', ({ payload }) =>
      this.addNewValue(payload),
    );
    socket.on('CREATE_NEW_SHOPPING_LIST_FAILURE', ({ error }) =>
      this.setError(error),
    );
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

  handleShowAddListForm = () => {
    this.setState(prevState => ({
      showAddListForm: !prevState.showAddListForm,
    }));
  };

  render() {
    const { data: shoppingLists, error, showAddListForm } = this.state;
    const { socket, classes } = this.props;
    if (error) return <span>{error}</span>;
    return (
      <div className={classes.root}>
        {showAddListForm ? (
          <NewShoppingList
            socket={socket}
            onCancel={this.handleShowAddListForm}
          />
        ) : (
          <Button
            color="primary"
            variant="contained"
            className={classes.button}
            onClick={this.handleShowAddListForm}
          >
            <AddIcon />
            Add List
          </Button>
        )}
        <List>
          {shoppingLists.length > 0 &&
            shoppingLists.map((list, index) => (
              <ListItem key={index} button>
                <Link to={`/list/${list._id}`} href={`/list/${list._id}`}>
                  <Typography>{list.name}</Typography>
                </Link>
              </ListItem>
            ))}
        </List>
      </div>
    );
  }
}

export default withStyles(styles)(Home);
