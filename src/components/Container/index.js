import React, { Children } from 'react';
import PropTypes from 'prop-types';
import { withStyles, Grid } from '@material-ui/core';

const styles = theme => ({
  root: {
    paddingTop: theme.spacing.unit * 10,
    padding: theme.spacing.unit,
  },
});
const Container = ({ children, classes }) => {
  return (
    <Grid container justify="center" className={classes.root}>
      {children}
    </Grid>
  );
};

Container.propTypes = {};

export default withStyles(styles)(Container);
