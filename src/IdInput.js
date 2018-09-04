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
      <form onSubmit={this.onSubmit} className="IdInput">
        <div className="IdInput-inner">
          {error && <div className="error">{error}</div>}
          <label htmlFor="id-input">Enter your player ID for this game:</label>
          <input
            id="id-input"
            value={value}
            onChange={this.onChange}
            placeholder="http://gamesbyemail.com/Games/Play?<this thing here>"
          />
          <button type="submit">Submit</button>
        </div>
      </form>
    );
  }
}
