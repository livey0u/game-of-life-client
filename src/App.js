import React, { Component } from 'react';
import WebSocket from 'reconnecting-websocket';
import config from './config';
import logo from './logo.svg';
import './App.css';

class App extends Component {

  constructor() {
    super();
    this.init();
  }

  init() {
    this.setInitialState({});
    this.connect();
  }

  connect() {
    let protocol = process.env.NODE_ENV === 'production' ? 'wss' : 'ws';
    this.gameOfLifeClient = new WebSocket(`${protocol}://${config.server.host}:${config.server.port}`);
    this.gameOfLifeClient.addEventListener('message', (event) => {
      this.updateState(JSON.parse(event.data));
    });
  }

  setInitialState(data) {
    this.state = {
      layout: data.layout || [],
      color: data.color || ''
    };
  }

  updateState(message) {
    let layout = [];
    let color;
    let state = this.state || {};
    if(message.event === 'EVOLUTION_EVENT') {
      state.layout = message.data.layout;
      state.lastEvolvedAt = message.data.evolvedAt
      console.log(JSON.stringify(state.layout, null, 2), 'EVOLUTION_EVENT');
    }
    else if(message.event === 'NEW_CLIENT_RESPONSE') {
      state.layout = message.data.layout;
      state.color = message.data.color;
    }
    else if(message.event === 'CELL_UPDATED_EVENT') {
      state.layout = message.data.layout;
    }
    else if(message.event === 'UPDATE_CELL_RESPONSE') {
      console.log(message);
    }
    this.state = state;
    this.setState(this.state);
  }

  updateCell(_cell) {
    var cell = {x: _cell.x, y: _cell.y};
    cell.color = this.state.color;
    cell.state = 1;
    this.gameOfLifeClient.send(JSON.stringify({event: 'UPDATE_CELL', data: {cell: cell, lastEvolvedAt: this.state.lastEvolvedAt}}));
  }

  renderRow(row, key) {
    var cells = [];
    var cellLen = row.length;
    for(var i = 0; i < cellLen; i++) {
      cells.push(this.renderCell(row[i], i));
    }
    return (
      <div className="row" key={key}>
        {cells}
      </div>
    );
  }

  render() {
    var rows = [];
    var layout = this.state.layout;
    var layoutLen = layout.length;

    for(var i = 0; i < layoutLen; i++) {
      rows.push(this.renderRow(layout[i], i));
    }

    return (
      <div className="App">
        <div className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h2>Game Of Life</h2>
        </div>
        <div className="game-board">
          {rows}
        </div>
      </div>
    );
  }

  renderCell(cell, key) {
    let style = {
      backgroundColor: cell.color
    };
    return (
      <div className="cell" style={style} key={key} onClick={this.updateCell.bind(this, cell)}></div>
    );
  }
}

export default App;
