import React, { Component } from 'react';

import IdInput from './IdInput';
import ChatGrid from './ChatGrid';

import { getChat, postChat, getGame, postGlobalChat } from './api';

import './App.css';

const POLL_INTERVAL = 60 * 1000;

export default class App extends Component {
  state = {
    playerId: null,
    chatId: null,
    otherPlayers: null,
    noChat: false,
    groupChat: '',
  };

  _isMounted = false;

  componentDidMount() {
    this._isMounted = true;
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  onIdSuccess = ({ info }) => {
    this.storeGameInfo(info);

    window.setTimeout(this.pollGameInfo, POLL_INTERVAL);
  };

  pollGameInfo = () => {
    getGame(this.state.playerId).then(info => {
      if (!this._isMounted) {
        return;
      }
      this.storeGameInfo(info);
      window.setTimeout(this.pollGameInfo, POLL_INTERVAL);
    });
  };

  storeGameInfo(info) {
    const playerId = info._playerId;
    const teamIdx = info.teams.findIndex(t => t.id !== 0);
    const team = info.teams[teamIdx];
    const player = team.players[0];

    if (player.id !== playerId) {
      console.error('ID mismatch', { playerId, player, info });
    }

    const chatId = player.chatId;
    const otherPlayers = info.teams
      .filter(t => t !== team)
      .map(t => ({ name: t.players[0].title, chatId: t.players[0].chatId }));
    const noChat = (info.status & 256) > 0;
    const groupChat = info.message;

    this.setState({ playerId, chatId, otherPlayers, noChat, groupChat });
  }

  render() {
    const { playerId, chatId, otherPlayers, noChat, groupChat } = this.state;

    return (
      <div className="App">
        {playerId == null && <IdInput onSuccess={this.onIdSuccess} />}
        {playerId != null && (
          <ChatGrid
            noChat={noChat}
            otherPlayers={otherPlayers}
            fetchChat={otherChatId => getChat(playerId, chatId, otherChatId)}
            sendMessage={
              noChat
                ? () => Promise.reject()
                : (otherChatId, message) =>
                  postChat(playerId, chatId, otherChatId, message)
            }
            groupChat={groupChat}
            sendGroupChat={message =>
              postGlobalChat(playerId, message).then(resp =>
                this.setState({ groupChat: resp })
              )
            }
          />
        )}
      </div>
    );
  }
}
