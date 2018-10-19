import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import {
  List,
  ListItem,
  ListSubheader,
  withStyles,
  TextField,
  Button,
  Collapse,
  Badge,
  Typography,
} from '@material-ui/core';
import grey from '@material-ui/core/colors/grey';
import AddIcon from '@material-ui/icons/Add';
import Product from './Product';

const styles = theme => ({
  subheader: {
    lineHeight: '24px',
    display: 'flex',
    justifyContent: 'space-between',
    padding: theme.spacing.unit * 2,
    backgroundColor: theme.palette.grey[400],
  },
  category: {
    marginTop: '1rem',
  },
  button: {
    marginLeft: 16,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    paddingLeft: 16,
    paddingRight: 16,
  },
  btnContainer: {
    button: {
      margin: theme.spacing.unit,
    },
  },
  badge: {
    position: 'relative',
    top: 0,
    right: 0,
  },
});
class Category extends Component {
  static propTypes = {
    socket: PropTypes.object.isRequired,
    category: PropTypes.object.isRequired,
  };

  state = {
    form: {
      product: {
        name: '',
      },
    },
    open: true,
  };

  handleProductSubmit = ({ evt, category }) => {
    evt.preventDefault();
    const { socket } = this.props;
    const {
      form: { product },
    } = this.state;
    socket.emit(
      'CREATE_PRODUCT',
      {
        data: { ...product, category: category._id },
      },
      () => {
        this.setState(() => ({
          form: {
            product: {
              name: '',
            },
          },
          showAddProductForm: false,
        }));
      },
    );
  };

  handleProductNameChange = ({ target }) => {
    const { value } = target;
    this.setState(prevState => ({
      form: {
        ...prevState.form,
        product: {
          ...prevState.form.product,
          name: value,
        },
      },
    }));
  };

  handleShowAddProductForm = () =>
    this.setState(prevState => ({
      showAddProductForm: !prevState.showAddProductForm,
    }));

  handleClick = () => {
    this.setState(state => ({ open: !state.open }));
  };

  countProductUnchecked = products =>
    products.filter(product => !product.status).length;

  renderSubHeader = (classes, category) => (
    <ListSubheader
      onClick={this.handleClick}
      className={classes.subheader}
      component="div"
    >
      <Typography>{category.name}</Typography>
      <Badge
        classes={{ badge: classes.badge }}
        badgeContent={this.countProductUnchecked(category.products)}
        color={
          this.countProductUnchecked(category.products) === 0
            ? 'primary'
            : 'error'
        }
      >
        <span />
      </Badge>
    </ListSubheader>
  );

  render() {
    const { category, socket, classes } = this.props;
    const { form, showAddProductForm, open } = this.state;
    return (
      <li className={classes.category}>
        <List
          className="category-products"
          dense
          subheader={this.renderSubHeader(classes, category)}
        >
          {category.products.map(product => (
            <Collapse in={open} timeout="auto" unmountOnExit>
              <ListItem button>
                <Product
                  key={product._id}
                  product={product}
                  categoryId={category._id}
                  socket={socket}
                />
              </ListItem>
            </Collapse>
          ))}
        </List>

        {showAddProductForm && open ? (
          <form
            className={classes.form}
            onSubmit={evt => this.handleProductSubmit({ evt, category })}
          >
            <TextField
              label="Product name"
              margin="dense"
              name="name"
              variant="outlined"
              onChange={this.handleProductNameChange}
              value={form.product.name}
              className={classes.textField}
            />
            <div className={classes.btnContainer}>
              <Button
                variant="contained"
                color="primary"
                size="small"
                type="submit"
                className={classes.btnContainer.button}
                disabled={form.product.name.length === 0}
              >
                Create
              </Button>
              <Button
                variant="contained"
                color="secondary"
                size="small"
                type="button"
                className={classes.button}
                onClick={this.handleShowAddProductForm}
              >
                Cancel
              </Button>
            </div>
          </form>
        ) : (
          <Fragment>
            {open && (
              <Button
                color="primary"
                variant="contained"
                className={classes.button}
                onClick={this.handleShowAddProductForm}
                size="small"
              >
                <AddIcon />
              </Button>
            )}
          </Fragment>
        )}
      </li>
    );
  }
}

export default withStyles(styles)(Category);
