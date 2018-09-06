import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

import ChatWindow from './ChatWindow';
import ChatWindowPlaceholder from './ChatWindowPlaceholder';

const POLL_INTERVAL = 15 * 1000;

export default class ChatGrid extends Component {
  static propTypes = {
    otherPlayers: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string.isRequired,
        chatId: PropTypes.number.isRequired,
      }).isRequired
    ).isRequired,
    fetchChat: PropTypes.func.isRequired,
    sendMessage: PropTypes.func.isRequired,
    noChat: PropTypes.bool.isRequired,
    groupChat: PropTypes.string.isRequired,
    sendGroupChat: PropTypes.func.isRequired,
  };

  state = {
    responses: this.props.otherPlayers.reduce((obj, { chatId }) => {
      obj[chatId] = null;
      return obj;
    }, {}),
  };

  _isMounted = false;

  componentDidMount() {
    this._isMounted = true;

    this.poll();
  }

  componentDidUpdate(prevProps) {
    if (this.props.otherPlayers !== prevProps.otherPlayers) {
      const curChatIds = _.map(this.props.otherPlayers, 'chatId');
      const prevChatIds = _.map(prevProps.otherPlayers, 'chatId');
      const diff = _.difference(curChatIds, prevChatIds);
      console.log({ diff });

      if (diff.length !== 0) {
        // add nulls for pending
        this.setState(({ responses }) => ({
          responses: {
            ...responses,
            ...diff.reduce((obj, id) => {
              obj[id] = null;
              return obj;
            }, {}),
          },
        }));

        // fetch actual chats
        diff.forEach(this.fetchOneChat);
      }
    }
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  fetchOneChat = id => {
    this.props.fetchChat(id).then(resp => {
      if (!this._isMounted) {
        return;
      }

      this.setState(({ responses }) => ({
        responses: {
          ...responses,
          [id]: resp,
        },
      }));
    });
  };

  sendMessage = (id, message) =>
    this.props.sendMessage(id, message).then(resp => {
      if (!this._isMounted) {
        return;
      }

      this.setState(({ responses }) => ({
        responses: {
          ...responses,
          [id]: resp,
        },
      }));
    });

  poll = () => {
    if (!this._isMounted) {
      return;
    }

    _.map(this.props.otherPlayers, 'chatId').forEach(this.fetchOneChat);

    window.setTimeout(this.poll, POLL_INTERVAL);
  };

  render() {
    const { noChat, otherPlayers, groupChat, sendGroupChat } = this.props;
    const { responses } = this.state;

    return (
      <div className="ChatGrid">
        <ChatWindow
          name="Everyone"
          messages={groupChat}
          sendMessage={sendGroupChat}
          noChat={false}
        />
        {otherPlayers.map(
          ({ name, chatId }) =>
            responses[chatId] ? (
              <ChatWindow
                key={chatId}
                name={name}
                messages={responses[chatId].message}
                sendMessage={message => this.sendMessage(chatId, message)}
                noChat={noChat}
              />
            ) : (
              <ChatWindowPlaceholder key={chatId} />
            )
        )}
      </div>
    );
  }
}
