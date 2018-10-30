import React from 'react';
import PropTypes from 'prop-types';
import { withStyles, CircularProgress } from '@material-ui/core';

const styles = () => ({
  progress: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 0,
    left: 0,
    margin: 'auto',
  },
});
const MyCircularProgress = ({ classes }) => {
  return <CircularProgress className={classes.progress} />;
};

MyCircularProgress.propTypes = {};

export default withStyles(styles)(MyCircularProgress);
