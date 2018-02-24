//------------------------------------------------------------------------------
// Author: Lukasz Janyst <lukasz@jany.st>
// Date: 21.02.2018
//------------------------------------------------------------------------------

import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { ListGroupItem, Button, Glyphicon } from 'react-bootstrap';
import moment from 'moment-timezone';

import { BACKEND_OPENED } from '../actions/backend';
import { capitalizeFirst } from '../utils/helpers';

//------------------------------------------------------------------------------
// Convert status to label class
//------------------------------------------------------------------------------
const statusToLabel = (status) => {
  switch(status) {
  case 'SCHEDULED': return 'label-primary';
  case 'PENDING': return 'label-warning';
  case 'RUNNING': return 'label-success';
  case 'CANCELED': return 'label-warning';
  case 'SUCCESSFUL': return 'label-success';
  case 'FAILED': return 'label-danger';
  default: return 'label-default';
  }
};

//------------------------------------------------------------------------------
// Get log URL
//------------------------------------------------------------------------------
const getLogURL = (jobID, isError) => {
  const logType = isError ? 'err' : 'out';
  return `/get-log/data/${jobID}.${logType}`;
};

//------------------------------------------------------------------------------
// Job List Item
//------------------------------------------------------------------------------
class JobListItem extends Component {
  //----------------------------------------------------------------------------
  // Property types
  //----------------------------------------------------------------------------
  static propTypes = {
    jobId: PropTypes.string.isRequired,
    jobList: PropTypes.string.isRequired
  }

  //----------------------------------------------------------------------------
  // Render the component
  //----------------------------------------------------------------------------
  render() {
    const job = this.props;
    const timestamp = moment.unix(job.timestamp);
    const dateTime = timestamp.tz(this.props.timezone)
          .format('YYYY-MM-DD HH:mm:ss');

    //--------------------------------------------------------------------------
    // Cancellation button
    //--------------------------------------------------------------------------
    let secondaryPanel = (
      <div className='item-panel' title={dateTime}>
        <Button
          bsSize="xsmall"
          disabled={!this.props.connected}
        >
          <Glyphicon glyph='remove-circle'/> Cancel
        </Button>

      </div>
    );

    //--------------------------------------------------------------------------
    // Logs
    //--------------------------------------------------------------------------
    if(this.props.jobList === 'COMPLETED') {
      secondaryPanel = (
        <div className='item-panel'>
          {
            job.outLog
              ? (<a href={getLogURL(job.identifier, false)}>Out Log</a>)
              : ''}
          {job.outLog && job.errLog ? ' ' : ''}
          {
            job.errLog
              ? (<a href={getLogURL(job.identifier, true)}>Error Log</a>)
              : ''
          }
          </div>
      );
    }

    //--------------------------------------------------------------------------
    // Render the whole thing
    //--------------------------------------------------------------------------
    return (
      <ListGroupItem>
        <div className='list-item'>
          <div className='item-panel' title={dateTime}>
            {timestamp.fromNow()}
          </div>
          <span className={`label ${statusToLabel(job.status)}`}>
            {job.status}
          </span>
          <strong> {job.spider}</strong> ({job.project})
        </div>
        <div className='list-item-secondary'>
          {secondaryPanel}
          Scheduled to run {job.schedule} by {capitalizeFirst(job.actor)}.
        </div>
      </ListGroupItem>
    );
  }
}

//------------------------------------------------------------------------------
// The redux connection
//------------------------------------------------------------------------------
function mapStateToProps(state, ownProps) {
  return {
    ...state.jobs[ownProps.jobList][ownProps.jobId],
    timezone: state.status.timezone,
    connected: state.backend.status === BACKEND_OPENED
  };
}

function mapDispatchToProps(dispatch) {
  return {};
}

export default connect(mapStateToProps, mapDispatchToProps)(JobListItem);