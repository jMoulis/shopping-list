import React from 'react';
import PropTypes from 'prop-types';
import { NavLink } from 'react-router-dom';
import { withStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import ArrowBack from '@material-ui/icons/ArrowBack';
import HomeIcon from '@material-ui/icons/Home';

const styles = {
  root: {
    flexGrow: 1,
  },
  grow: {
    flexGrow: 1,
  },
  menuButton: {
    marginLeft: -12,
    marginRight: 20,
  },
  navLink: {
    display: 'flex',
  },
};

class NavBar extends React.Component {
  handleToggleButton = () => {
    console.log('button');
  };

  render() {
    const { classes, hideArrowBack } = this.props;
    return (
      <AppBar position="fixed">
        <Toolbar>
          <IconButton
            className={classes.menuButton}
            color="inherit"
            aria-label="Menu"
          >
            <NavLink
              className={classes.navLink}
              to="/"
              href="/"
              onClick={this.handleToggleButton}
            >
              {!hideArrowBack ? <ArrowBack /> : <HomeIcon />}
            </NavLink>
          </IconButton>
          <Typography variant="h6" color="inherit" className={classes.grow}>
            Shopping List
          </Typography>
        </Toolbar>
      </AppBar>
    );
  }
}

NavBar.propTypes = {};

export default withStyles(styles)(NavBar);
