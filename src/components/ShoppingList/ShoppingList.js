import React from 'react';
import PropTypes from 'prop-types';
import {
  Grid,
  Typography,
  withStyles,
  TextField,
  Button,
} from '@material-ui/core';
import Category from './Category';

const styles = theme => ({
  root: {
    padding: theme.spacing.unit,
    paddingTop: theme.spacing.unit * 10,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
  },
  button: {
    margin: theme.spacing.unit,
  },
});
class ShoppingList extends React.Component {
  static propTypes = {
    socket: PropTypes.object.isRequired,
    router: PropTypes.object.isRequired,
  };

  state = {
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
  };

  componentDidMount() {
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
          return this.setError(error);
        }

        return this.setValueToState(data);
      },
    );
    socket.on('CREATE_CATEGORY_SUCCESS', ({ payload }) =>
      this.addCategoryToList(payload),
    );
    socket.on('CREATE_PRODUCT_SUCCESS', ({ payload }) =>
      this.addProductsToCategory(payload),
    );
  }

  addCategoryToList = data => {
    this.setState(prevState => ({
      data: {
        ...prevState.data,
        categories: [...prevState.data.categories, data],
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

  handleShowInputAddCat = () =>
    this.setState(prevState => ({
      inputAddCat: !prevState.inputAddCat,
    }));

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
    }));
  };

  render() {
    const { error, data: list, inputAddCat, form } = this.state;
    const { socket, classes } = this.props;
    if (error) return <span>{error}</span>;
    if (Object.keys(list).length === 0) return <span>loading</span>;
    return (
      <Grid container direction="column" className={classes.root}>
        <Typography variant="h4">{list.name}</Typography>
        {inputAddCat && (
          <form className={classes.form} onSubmit={this.handleCategoryOnSubmit}>
            <TextField
              label="Category name"
              margin="dense"
              name="name"
              onChange={this.handleInputCategoryChange}
              value={form.category.name}
              className={classes.textField}
              variant="outlined"
            />
            <div>
              <Button
                variant="contained"
                color="primary"
                size="small"
                type="submit"
                className={classes.button}
                disabled={form.category.name.length === 0}
              >
                Create
              </Button>
              <Button
                variant="contained"
                color="secondary"
                size="small"
                type="button"
                className={classes.button}
                onClick={this.handleShowInputAddCat}
              >
                Cancel
              </Button>
            </div>
          </form>
        )}
        {!inputAddCat && (
          <Button
            variant="contained"
            color="primary"
            size="small"
            type="button"
            onClick={this.handleShowInputAddCat}
          >
            New cat
          </Button>
        )}
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
