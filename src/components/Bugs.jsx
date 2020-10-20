import React, { Component } from 'react';
import { connect } from "react-redux"
import { loadBugs, resolveBug, getUnresolvedBugs } from '../store/bugs';
import BugsList from './Bugslist';

class Bugs extends Component {

  componentDidMount() {
    this.props.loadBugs()
  }

  render() {
    return (
    <>
    {/* <BugsList /> */}
      {this.props.bugs.map(bug => <li key={bug.id}>{bug.description} <button onClick={() => this.props.resolveBug(bug.id)}>Resolve</button></li>)}
      </>
      );
  }
}

const mapStateToProps = (state) => {
  return {
    bugs: getUnresolvedBugs(state)
  }
}

const mapDispatchToProps = (dispatch) => ({
  loadBugs: () => dispatch(loadBugs()),
  resolveBug: (bugId) => dispatch(resolveBug(bugId))
})

export default connect(mapStateToProps, mapDispatchToProps)(Bugs);