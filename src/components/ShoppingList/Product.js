import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Checkbox,
  Typography,
  FormControlLabel,
  withStyles,
} from '@material-ui/core';

const styles = () => ({
  checkbox: {
    padding: 0,
  },
  label: {
    margin: 0,
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
    };
  }

  handleInputChange = ({ target }) => {
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
    const { status } = this.state;
    socket.emit('UPDATE_STATUS_PRODUCT', {
      data: {
        categoryId,
        productId: product._id,
        status,
      },
    });
  };

  render() {
    const { product, classes } = this.props;
    return (
      <form>
        <FormControlLabel
          className={classes.label}
          control={
            <Checkbox
              id="product_status"
              type="checkbox"
              checked={product.status}
              onChange={this.handleInputChange}
              color="primary"
              className={classes.checkbox}
            />
          }
          label={product.name}
        />
      </form>
    );
  }
}

Product.propTypes = {};

export default withStyles(styles)(Product);
