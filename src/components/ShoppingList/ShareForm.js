import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  TextField,
  Button,
  SwipeableDrawer,
  withStyles,
} from '@material-ui/core';

const styles = theme => ({
  form: {
    padding: theme.spacing.unit,
    display: 'flex',
    flexDirection: 'column',
  },
  input: {
    marginBottom: theme.spacing.unit,
  },
});

class ShareForm extends Component {
  state = {
    email: '',
  };

  handleShare = evt => {
    evt.preventDefault();
    const { socket, onClose, listId, loggedUser } = this.props;
    const { email } = this.state;
    socket.emit('INVITE_LIST', { loggedUser, email, listId }, ({ success }) => {
      if (success) return onClose();
    });
  };

  handleInputChange = ({ target }) => {
    const { value } = target;
    this.setState(() => ({
      email: value,
    }));
  };

  render() {
    const { email } = this.state;
    const { show, onClose, onOpen, classes } = this.props;
    return (
      <SwipeableDrawer
        anchor="bottom"
        open={show}
        onClose={onClose}
        onOpen={onOpen}
      >
        <form className={classes.form} onSubmit={this.handleShare}>
          <TextField
            autoFocus
            value={email}
            name={email}
            type="email"
            onChange={this.handleInputChange}
            required
            label="Email de l'invité"
            className={classes.input}
          />
          <Button color="primary" variant="contained" type="submit">
            Inviter
          </Button>
        </form>
      </SwipeableDrawer>
    );
  }
}

ShareForm.propTypes = {};

export default withStyles(styles)(ShareForm);
