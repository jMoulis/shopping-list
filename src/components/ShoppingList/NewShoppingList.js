import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles, Button, Input, TextField } from '@material-ui/core';
import classNames from 'classnames';

const styles = theme => ({
  button: {
    margin: theme.spacing.unit,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
  },
  textField: {
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit,
  },
});
class NewShoppingList extends Component {
  state = {
    form: {
      name: '',
    },
  };

  handleSubmit = evt => {
    evt.preventDefault();
    const { socket, onCancel, loggedUser } = this.props;
    const { form } = this.state;
    socket.emit('CREATE_NEW_SHOPPING_LIST', { data: form, loggedUser });
    onCancel();
  };

  handleInputChange = ({ target }) => {
    const { name, value } = target;
    this.setState(prevState => ({
      form: {
        ...prevState.form,
        [name]: value,
      },
    }));
  };

  render() {
    const {
      form: { name },
    } = this.state;
    const { classes, onCancel } = this.props;
    return (
      <form className={classes.form} onSubmit={this.handleSubmit}>
        <TextField
          label="List name"
          margin="dense"
          name="name"
          onChange={this.handleInputChange}
          value={name}
          className={classes.textField}
          autoFocus
        />
        <div>
          <Button
            variant="contained"
            color="primary"
            size="small"
            type="submit"
            className={classNames(classes.button)}
            disabled={name.length === 0}
          >
            Create
          </Button>
          <Button
            variant="contained"
            color="secondary"
            size="small"
            type="button"
            className={classNames(classes.button)}
            onClick={onCancel}
          >
            Cancel
          </Button>
        </div>
      </form>
    );
  }
}

NewShoppingList.propTypes = {};

export default withStyles(styles)(NewShoppingList);
