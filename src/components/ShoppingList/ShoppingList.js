import React from 'react';
import PropTypes from 'prop-types';
import AddIcon from '@material-ui/icons/Add';
import idb from 'idb';
import ShareIcon from '@material-ui/icons/Share';
import {
  Grid,
  Typography,
  withStyles,
  TextField,
  Button,
  SwipeableDrawer,
  IconButton,
} from '@material-ui/core';
import Category from './Category';
import ShareForm from './ShareForm';
import MyCircularProgress from '../global/MyCircularProgress';

const styles = theme => ({
  root: {
    padding: theme.spacing.unit,
    paddingTop: theme.spacing.unit * 10,
  },
  button: {
    margin: theme.spacing.unit,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    padding: theme.spacing.unit,
    alignItems: 'flex-end',
  },
  input: {
    width: '100%',
  },
});
class ShoppingList extends React.Component {
  static propTypes = {
    socket: PropTypes.object.isRequired,
    router: PropTypes.object.isRequired,
  };

  constructor(props) {
    super(props);
    this.idb = idb.open('shopping-lists-store', 1, db => {
      db.createObjectStore('shopping-lists', { keyPath: '_id' });
    });
    this.state = {
      data: {},
      error: null,
      inputAddCat: false,
      form: {
        category: {
          name: '',
          list: {},
        },
        product: {
          name: '',
        },
      },
      showSharePanel: false,
    };
  }

  componentDidMount() {
    const { socket } = this.props;
    if (!window.navigator.onLine) {
      this.fetchListFromIdb();
    } else {
      this.fetchShoppingList();
    }
    this.fetchListFromIdb();
    socket.on('CREATE_CATEGORY_SUCCESS', ({ payload }) =>
      this.addCategoryToList(payload),
    );
    socket.on('UPDATE_CATEGORY_SUCCESS', ({ payload }) =>
      this.updateCategory(payload),
    );
    socket.on('CREATE_PRODUCT_SUCCESS', ({ payload }) =>
      this.addProductsToCategory(payload),
    );
  }

  fetchListFromIdb = async () => {
    const {
      router: { match },
    } = this.props;
    const { id } = match.params;
    const lists = await this.idb.then(db => {
      const tx = db.transaction('shopping-lists', 'readonly');
      const store = tx.objectStore('shopping-lists');
      return store.getAll();
    });
    const list = lists.find(item => item._id === id);
    if (list) {
      this.setState(() => ({
        data: list,
      }));
    }
  };

  fetchShoppingList = () => {
    this.setState(() => ({
      fetchShoppingListPending: true,
    }));
    const {
      socket,
      router: { match },
    } = this.props;
    const { id } = match.params;
    socket.emit(
      'FETCH_SHOPPING_LIST',
      { _id: id },
      ({ error, data, success }) => {
        if (!success) {
          this.setState(() => ({
            fetchShoppingListPending: false,
          }));
          return this.setError(error);
        }
        this.setState(() => ({
          fetchShoppingListPending: false,
        }));
        return this.setValueToState(data);
      },
    );
  };

  addCategoryToList = data => {
    this.setState(prevState => ({
      data: {
        ...prevState.data,
        categories: [...prevState.data.categories, data],
      },
    }));
  };

  updateCategory = data => {
    const { data: list } = this.state;
    const newList = list.categories.map(category => {
      if (category._id === data._id) {
        return data;
      }
      return category;
    });
    this.setState(prevState => ({
      data: {
        ...prevState.data,
        categories: newList,
      },
    }));
  };

  addProductsToCategory = ({ products, _id }) => {
    const { data: list } = this.state;
    const newList = list.categories.map(category => {
      if (category._id === _id) {
        return {
          ...category,
          products,
        };
      }
      return category;
    });
    this.setState(prevState => ({
      data: {
        ...prevState.data,
        categories: newList,
      },
    }));
  };

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

  handleShowInputAddCat = () => {
    this.setState(prevState => ({
      inputAddCat: !prevState.inputAddCat,
    }));
  };

  handleInputCategoryChange = ({ target }) => {
    const { value } = target;
    this.setState(prevState => ({
      form: {
        ...prevState.form,
        category: {
          ...prevState.form.category,
          name: value,
        },
      },
    }));
  };

  handleCategoryOnSubmit = evt => {
    evt.preventDefault();
    const { socket } = this.props;
    const {
      form: { category },
      data: list,
    } = this.state;
    socket.emit('CREATE_CATEGORY', {
      data: { ...category, list: list._id },
    });
    this.setState(() => ({
      form: {
        category: {
          name: '',
        },
      },
      inputAddCat: false,
    }));
  };

  handleShare = () => {
    this.setState(prevState => ({
      showSharePanel: !prevState.showSharePanel,
    }));
  };

  render() {
    const {
      error,
      data: list,
      inputAddCat,
      form,
      showSharePanel,
      fetchShoppingListPending,
    } = this.state;
    const { socket, classes, loggedUser } = this.props;
    if (fetchShoppingListPending) return <MyCircularProgress />;
    if (error) return <span>{error}</span>;
    if (Object.keys(list).length === 0) return <span>loading</span>;
    return (
      <Grid container direction="column" className={classes.root}>
        <Grid container justify="space-between" alignItems="center">
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
            }}
          >
            {loggedUser &&
              loggedUser._id === list.user && (
                <IconButton onClick={this.handleShare}>
                  <ShareIcon />
                </IconButton>
              )}

            <Typography variant="h4">{list.name}</Typography>
          </div>
          <Button
            variant="contained"
            color="primary"
            type="button"
            onClick={this.handleShowInputAddCat}
          >
            <AddIcon />
            Catégorie
          </Button>
        </Grid>
        <SwipeableDrawer
          anchor="bottom"
          open={inputAddCat}
          onClose={this.handleShowInputAddCat}
          onOpen={this.handleShowInputAddCat}
        >
          <div tabIndex={0} role="button">
            <form
              className={classes.form}
              onSubmit={this.handleCategoryOnSubmit}
            >
              <TextField
                autoFocus
                autoComplete="false"
                label="Category name"
                margin="dense"
                name="name"
                onChange={this.handleInputCategoryChange}
                value={form.category.name}
                className={classes.textField}
                variant="outlined"
                classes={{ root: classes.input }}
              />

              <Button
                variant="contained"
                color="primary"
                type="submit"
                className={classes.button}
                disabled={form.category.name.length === 0}
              >
                Create
              </Button>
            </form>
          </div>
        </SwipeableDrawer>
        <ShareForm
          show={showSharePanel}
          onClose={this.handleShare}
          onOpen={this.handleShare}
          socket={socket}
          listId={list._id}
          loggedUser={loggedUser}
        />
        <ul>
          {list.categories.map((category, index) => (
            <Category key={index} socket={socket} category={category} />
          ))}
        </ul>
      </Grid>
    );
  }
}

export default withStyles(styles)(ShoppingList);
