import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import ExpandLessIcon from '@material-ui/icons/ExpandLess';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
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
  Input,
  Grid,
  IconButton,
} from '@material-ui/core';
import Product from './Product';

const styles = theme => ({
  subheader: {
    lineHeight: '24px',
    display: 'flex',
    justifyContent: 'space-between',
    padding: theme.spacing.unit,
    backgroundColor: theme.palette.grey[100],
    alignItems: 'center',
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
  noPadding: {
    padding: 0,
  },
  listItem: {
    padding: theme.spacing.unit,
    paddingLeft: 0,
  },
  categoryName: {
    marginLeft: theme.spacing.unit,
  },
});
class Category extends Component {
  static propTypes = {
    socket: PropTypes.object.isRequired,
    category: PropTypes.object.isRequired,
  };

  constructor(props) {
    super(props);
    console.log(props.category.name);
    this.state = {
      form: {
        product: {
          name: '',
        },
      },
      categoryName: props.category.name || 'Enter name',
      open: true,
    };
  }

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

  handleShowAddProductForm = () => {
    this.setState(prevState => ({
      showAddProductForm: !prevState.showAddProductForm,
    }));
  };

  handleClick = () => {
    this.setState(state => ({ open: !state.open }));
  };

  countProductUnchecked = products =>
    products.filter(product => !product.status).length;

  handleEditable = () => {
    this.setState(prevState => ({
      editable: !prevState.editable,
    }));
  };

  handleCategoryNameChange = ({ target }) => {
    const { value } = target;
    this.setState(() => ({
      categoryName: value,
    }));
  };

  handleOnBlur = () => {
    const { socket, category } = this.props;
    const { categoryName } = this.state;
    socket.emit('UPDATE_CATEGORY', {
      data: { categoryId: category._id, name: categoryName },
    });
    this.setState(() => ({
      editable: false,
    }));
  };

  renderSubHeader = (classes, category, categoryName, editable, open) => (
    <ListSubheader className={classes.subheader} component="div">
      <Grid container alignItems="center">
        <IconButton
          size="small"
          className={classes.noPadding}
          onClick={this.handleClick}
        >
          {open ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </IconButton>
        {editable ? (
          <Input
            autoFocus
            value={categoryName}
            onBlur={this.handleOnBlur}
            className={classes.input}
            onChange={this.handleCategoryNameChange}
          />
        ) : (
          <Typography
            variant="h6"
            className={classes.categoryName}
            onClick={this.handleEditable}
          >
            {category.name || 'Enter a name'}
          </Typography>
        )}
      </Grid>
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
    const {
      form,
      showAddProductForm,
      open,
      editable,
      categoryName,
    } = this.state;
    return (
      <li className={classes.category}>
        <List
          className="category-products"
          dense
          subheader={this.renderSubHeader(
            classes,
            category,
            categoryName,
            editable,
            open,
          )}
        >
          {category.products.map((product, index) => (
            <Collapse key={index} in={open} timeout="auto" unmountOnExit>
              <ListItem classes={{ root: classes.listItem }}>
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
              autoFocus
              autoComplete="false"
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
              <Typography
                className={classes.button}
                onClick={this.handleShowAddProductForm}
              >
                + add a product
              </Typography>
            )}
          </Fragment>
        )}
      </li>
    );
  }
}

export default withStyles(styles)(Category);
