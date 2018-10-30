import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  TextField,
  Button,
  withStyles,
  Typography,
  Snackbar,
  SnackbarContent,
} from '@material-ui/core';
import Container from '../Container';

const styles = theme => ({
  input: {
    paddingBottom: theme.spacing.unit,
  },
  error: {
    backgroundColor: theme.palette.error.dark,
  },
});
class Login extends Component {
  static propTypes = {};

  state = {
    email: '',
    password: '',
    confirmation: '',
    firstName: '',
    checkPassword: true,
    error: null,
  };

  handleChange = ({ target }) => {
    const { name, value } = target;
    this.setState(() => ({
      [name]: value,
    }));
  };

  handleSubmit = evt => {
    evt.preventDefault();
    const { socket, setLoggedUser } = this.props;
    const { email, password } = this.state;
    this.setState(() => ({
      registerPending: true,
    }));
    socket.emit('REGISTER', { email, password }, ({ success, error, data }) => {
      if (!success) {
        this.setState(() => ({
          registerPending: false,
        }));
        return this.setError(error);
      }
      this.setState(() => ({
        registerPending: false,
      }));
      setLoggedUser(data);
    });
  };

  setError = error => {
    this.setState(() => ({
      error,
    }));
  };

  isPasswordEqual = (password, confirmation) => {
    if (password === confirmation) {
      return true;
    }
    return false;
  };

  handleOnBlur = () => {
    const { confirmation, password } = this.state;
    if (confirmation.length > 0) {
      this.setState(() => ({
        checkPassword: this.isPasswordEqual(password, confirmation),
        error: null,
      }));
    }
  };

  render() {
    const { classes } = this.props;
    const {
      email,
      password,
      confirmation,
      checkPassword,
      registerPending,
      firstName,
      error,
    } = this.state;
    return (
      <Container>
        <Typography variant="title">Créer un compte</Typography>
        <form onSubmit={this.handleSubmit}>
          <TextField
            autoComplete="false"
            autoFocus
            label="Prénom"
            type="text"
            name="firstName"
            value={firstName}
            onChange={this.handleChange}
            fullWidth
            className={classes.input}
            required
          />
          <TextField
            autoComplete="false"
            label="Email"
            type="email"
            name="email"
            value={email}
            onChange={this.handleChange}
            fullWidth
            className={classes.input}
            required
          />
          <TextField
            autoComplete="false"
            label="Mot de passe"
            type="password"
            name="password"
            value={password}
            onChange={this.handleChange}
            fullWidth
            className={classes.input}
            onBlur={this.handleOnBlur}
            required
          />
          <TextField
            autoComplete="false"
            label="Confirmation"
            type="password"
            name="confirmation"
            value={confirmation}
            onChange={this.handleChange}
            fullWidth
            className={classes.input}
            onBlur={this.handleOnBlur}
            required
          />
          <Button
            variant="contained"
            type="submit"
            color="primary"
            disabled={
              email.length === 0 ||
              password.length === 0 ||
              !checkPassword ||
              confirmation.length === 0 ||
              registerPending
            }
          >
            Créer
          </Button>
        </form>
        <Snackbar
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          open={!checkPassword}
          autoHideDuration={3000}
        >
          <SnackbarContent
            className={classes.error}
            message={<span>Les mots passes doivent correspondre</span>}
          />
        </Snackbar>
        <Snackbar
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          open={error}
          autoHideDuration={3000}
        >
          <SnackbarContent
            className={classes.error}
            message={<span>{error}</span>}
          />
        </Snackbar>
      </Container>
    );
  }
}

export default withStyles(styles)(Login);
