import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { NavLink } from 'react-router-dom';
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
      loginPending: true,
    }));
    socket.emit(
      'LOGIN',
      { email, password },
      ({ success, error, data: loggedUserId }) => {
        if (!success) {
          return this.setError(error);
        }
        this.setState(() => ({
          loginPending: false,
        }));
        setLoggedUser(loggedUserId);
      },
    );
  };

  setError = error => {
    this.setState(() => ({
      error,
    }));
  };

  render() {
    const { classes } = this.props;
    const { email, password, error, loginPending } = this.state;
    return (
      <Container>
        <Typography variant="title">Déjà un compte</Typography>
        <form onSubmit={this.handleSubmit}>
          <TextField
            autoComplete="false"
            autoFocus
            label="Email"
            type="email"
            name="email"
            value={email}
            onChange={this.handleChange}
            fullWidth
            className={classes.input}
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
          />
          <Button
            variant="contained"
            type="submit"
            color="primary"
            disabled={
              email.length === 0 || password.length === 0 || loginPending
            }
          >
            Connexion
          </Button>
        </form>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            paddingTop: '1rem',
          }}
        >
          <Typography variant="title">où</Typography>
          <NavLink to="/register">
            <Button variant="contained" type="button" color="primary">
              Register
            </Button>
          </NavLink>
        </div>
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
