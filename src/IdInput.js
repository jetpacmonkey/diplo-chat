import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { getGame } from './api';

export default class IdInput extends Component {
  static propTypes = {
    onSuccess: PropTypes.func.isRequired,
  };

  state = {
    error: null,
    value: '',
  };

  onChange = e => {
    this.setState({
      error: null,
      value: e.currentTarget.value,
    });
  };

  onSubmit = e => {
    e.preventDefault();

    const { value } = this.state;
    getGame(value)
      .then(info => this.props.onSuccess({ id: value, info }))
      .catch(error => {
        this.setState({ error });
      });
  };

  render() {
    const { error, value } = this.state;

    return (
      <form onSubmit={this.onSubmit}>
        {error && <div className="error">{error}</div>}
        <input value={value} onChange={this.onChange} />
        <button type="submit">Submit</button>
      </form>
    );
  }
}
