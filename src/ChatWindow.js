import React, { Component } from 'react';
import PropTypes from 'prop-types';

function Message({ line }) {
  const [name, ...message] = line.split(':');
  return (
    <div className="one-message">
      <span className="message-sender">{name}</span>
      <span className="message-body">{message.join(':')}</span>
    </div>
  );
}

Message.propTypes = {
  line: PropTypes.string.isRequired,
};

export default class ChatWindow extends Component {
  static propTypes = {
    messages: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    noChat: PropTypes.bool.isRequired,
    sendMessage: PropTypes.func.isRequired,
  };

  state = {
    newMessage: '',
    sending: false,
  };

  ref = React.createRef();

  componentDidMount() {
    this.ref.current.scrollTop = 99999;
  }

  getSnapshotBeforeUpdate(prevProps) {
    if (this.props.messages.length > prevProps.messages.length) {
      const node = this.ref.current;
      return {
        scrollHeight: node.scrollHeight,
        atBottom: node.offsetHeight + node.scrollTop >= node.scrollHeight - 10,
      };
    }

    return null;
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (snapshot == null) {
      return;
    }

    const { scrollHeight, atBottom = false } = snapshot;

    if (atBottom) {
      this.ref.current.scrollTop +=
        this.ref.current.scrollHeight - scrollHeight;
    }
  }

  onSubmit = e => {
    e.preventDefault();

    const { newMessage } = this.state;

    this.setState({ sending: true });

    this.props
      .sendMessage(newMessage)
      .then(() => {
        this.setState({ newMessage: '', sending: false });
      })
      .catch(() => {
        this.setState({ sending: false });
      });
  };

  render() {
    const { messages, name, noChat } = this.props;
    const { newMessage, sending } = this.state;
    return (
      <div className="ChatWindow">
        <h3>{name}</h3>
        <div ref={this.ref} className="messages">
          {messages
            .split('\n\n')
            .filter(m => m !== '')
            .map((m, idx) => (
              <Message key={idx} line={m} />
            ))}
        </div>
        <form
          className={`new-message-form${noChat ? ' no-chat' : ''}`}
          onSubmit={this.onSubmit}
        >
          <input
            disabled={noChat || sending}
            value={newMessage}
            onChange={e => this.setState({ newMessage: e.currentTarget.value })}
          />
          <button type="submit" disabled={noChat || sending}>
            {sending ? <i className="loading-spinner" /> : 'Send'}
          </button>
        </form>
      </div>
    );
  }
}
