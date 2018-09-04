import React, { Component } from 'react';

import IdInput from './IdInput';
import ChatGrid from './ChatGrid';

import { getChat, postChat } from './api';

import './App.css';

export default class App extends Component {
  state = {
    playerId: null,
    chatId: null,
    otherPlayers: null,
  };

  onIdSuccess = ({ info }) => {
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

    this.setState({ playerId, chatId, otherPlayers });
  };

  render() {
    const { playerId, chatId, otherPlayers } = this.state;

    return (
      <div className="App">
        {playerId == null && <IdInput onSuccess={this.onIdSuccess} />}
        {playerId != null && (
          <ChatGrid
            otherPlayers={otherPlayers}
            fetchChat={otherChatId => getChat(playerId, chatId, otherChatId)}
            sendMessage={(otherChatId, message) =>
              postChat(playerId, chatId, otherChatId, message)
            }
          />
        )}
      </div>
    );
  }
}
