import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import green from '@material-ui/core/colors/green';
import {
  Checkbox,
  withStyles,
  Input,
  Typography,
  Grid,
  IconButton,
} from '@material-ui/core';
import DeleteIcon from '@material-ui/icons/Delete';

const styles = theme => ({
  root: {
    display: 'flex',
    justifyContent: 'space-between',
    width: '100%',
    alignItems: 'center',
  },
  checkbox: {
    color: green[600],
    '&$checked': {
      color: green[500],
    },
  },
  checked: {},
  label: {
    margin: 0,
    fontSize: '1.3rem',
    marginLeft: '.5rem',
  },
  input: {
    fontSize: '1rem',
  },
  iconButton: {
    padding: 0,
  },
  lineThrough: {
    textDecoration: 'line-through',
    color: theme.palette.grey[600],
  },
});

class Product extends Component {
  static propTypes = {
    product: PropTypes.object.isRequired,
    categoryId: PropTypes.string.isRequired,
    socket: PropTypes.object.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {
      status: props.product && props.product.status,
      name: props.product && props.product.name,
    };
  }

  handleCheckBoxChange = ({ target }) => {
    const { checked } = target;
    this.setState(
      () => ({
        status: checked,
      }),
      () => {
        this.handleSubmitProduct();
      },
    );
  };

  handleSubmitProduct = () => {
    const { categoryId, product, socket } = this.props;
    const { status, name } = this.state;
    socket.emit('UPDATE_STATUS_PRODUCT', {
      data: {
        categoryId,
        productId: product._id,
        status,
        name,
      },
    });
  };

  handleDeleteProduct = () => {
    const { categoryId, product, socket } = this.props;
    socket.emit('DELETE_PRODUCT', {
      data: {
        categoryId,
        productId: product._id,
      },
    });
  };

  handleEditable = () => {
    this.setState(prevState => ({
      editable: !prevState.editable,
    }));
  };

  handleInputChange = ({ target }) => {
    const { value } = target;
    this.setState(() => ({
      name: value,
    }));
  };

  handleOnBlur = () => {
    this.setState(
      prevState => ({
        editable: !prevState.editable,
      }),
      () => {
        this.handleSubmitProduct();
      },
    );
  };

  render() {
    const { product, classes } = this.props;
    const { editable, name } = this.state;
    return (
      <div className={classes.root}>
        <Grid container alignItems="center">
          <Checkbox
            id="product_status"
            type="checkbox"
            checked={product.status}
            onChange={this.handleCheckBoxChange}
            color="primary"
            classes={{ root: classes.checkbox, checked: classes.checked }}
          />
          {editable ? (
            <Input
              autoFocus
              value={name}
              onBlur={this.handleOnBlur}
              className={classes.input}
              onChange={this.handleInputChange}
            />
          ) : (
            <Typography
              className={classNames(
                classes.label,
                product.status && classes.lineThrough,
              )}
              onClick={this.handleEditable}
            >
              {product.name}
            </Typography>
          )}
        </Grid>
        <IconButton
          color="secondary"
          variant="contained"
          className={classes.iconButton}
          onClick={() => this.handleDeleteProduct()}
        >
          <DeleteIcon />
        </IconButton>
      </div>
    );
  }
}

Product.propTypes = {};

export default withStyles(styles)(Product);
