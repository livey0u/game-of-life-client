import React, { Component } from 'react';
import WebSocket from 'reconnecting-websocket';
import randomcolor from 'randomcolor';
import config from './config';
import logo from './logo.svg';
import './App.css';

class App extends Component {

  constructor() {
    super();

    this.patterns = [];

    this.init();
  }

  init() {
    this.setInitialState({});
    this.initPatterns();
    this.connect();
  }

  connect() {
    this.gameOfLifeClient = new WebSocket(config.server.url);
    this.gameOfLifeClient.addEventListener('message', (event) => {
      this.updateState(JSON.parse(event.data));
    });
  }

  setInitialState(data) {
    this.state = {
      layout: data.layout || [],
      color: data.color || '',
      username: data.username || ''
    };
    this.state.cellWidth = (100 / this.state.layout.length);
  }

  updateState(message) {
    let layout = [];
    let color;
    let state = this.state || {};
    if(message.event === 'EVOLUTION_EVENT') {
      state.lastEvolvedAt = message.data.evolvedAt;
      this.updateEvolvedCells(message.data.cells || []);
    }
    else if(message.event === 'NEW_CLIENT_RESPONSE') {
      state.username = message.data.username;
      state.layout = message.data.layout;
      state.color = message.data.color;
      state.cellWidth = (100 / message.data.layout.length);
    }
    else if(message.event === 'CELLS_UPDATED_EVENT') {
      this.updateEvolvedCells(message.data.cells);
    }
    else if(message.event === 'UPDATE_CELLS_RESPONSE' && message.error) {
      state.evolvedAlready = true;
      setTimeout(function() {
        let state = this.state;
        state.evolvedAlready = false;
        this.setState(state);
      }.bind(this), 800);
    }
    else if(message.event === 'SERVER_RESTARTED') {
      state.layout = message.data.layout;
      state.cellWidth = (100 / message.data.layout.length);
    }
    this.state = state;
    this.setState(this.state);
  }

  updateEvolvedCells(cells) {

    let cellsLen = cells.length;
    let layout = this.state.layout;

    for(let i = 0; i < cellsLen; i++) {
      let cell = cells[i];
      layout[cell.y][cell.x] = cell;
    }
    this.setState(this.state);
  }

  tryUpdateCell(_cell) {
    let cell = {x: _cell.x, y: _cell.y};
    cell.color = this.state.color;
    cell.state = 1;
    this.doTryUpdateCells([cell]);
  }

  doTryUpdateCells(cells) {
    this.gameOfLifeClient.send(JSON.stringify({event: 'UPDATE_CELLS', data: {cells: cells, lastEvolvedAt: this.state.lastEvolvedAt}}));
  }

  initPatterns() {

    this.patterns.push({
      name: 'Tub',
      layoutSize: 6,
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/31/Game_of_life_flower.svg/164px-Game_of_life_flower.svg.png'
    });

    this.patterns.push({
      name: 'Toad',
      layoutSize: 6,
      image: 'https://upload.wikimedia.org/wikipedia/commons/1/12/Game_of_life_toad.gif'
    });

    this.patterns.push({
      name: 'Beacon',
      layoutSize: 6,
      image: 'https://upload.wikimedia.org/wikipedia/commons/1/1c/Game_of_life_beacon.gif'
    });

    this.patterns.push({
      name: 'Pentadecathlon',
      layoutSize: 20,
      image: 'https://upload.wikimedia.org/wikipedia/commons/f/fb/I-Column.gif'
    });

  }

  getTubCells() {

    let cells = [{
      x: 2,
      y: 1
    }, {
      x: 1,
      y: 2
    }, {
      x: 3,
      y: 2
    }, {
      x: 2,
      y: 3
    }];
    return cells;

  }

  getToadCells() {

    let cells = [{
      x: 2,
      y: 2
    }, {
      x: 3,
      y: 2
    }, {
      x: 4,
      y: 2
    }, {
      x: 1,
      y: 3
    }, {
      x: 2,
      y: 3
    }, {
      x: 3,
      y: 3
    }];

    return cells;
  }

  getBeaconCells() {
    let cells = [{
      x: 1,
      y: 1
    }, {
      x: 2,
      y: 1
    }, {
      x: 1,
      y: 2
    }, {
      x: 4,
      y: 3
    }, {
      x: 3,
      y: 4
    }, {
      x: 4,
      y: 4
    }];
    return cells;
  }

  getPentadecathlonCells() {

    let cells = [];
    let xAxisMiddle = Math.ceil(this.state.layout.length / 2);
    let startY = Math.ceil(this.state.layout.length / 2) - 5;

    cells.push({
      x: xAxisMiddle,
      y: startY++
    });

    cells.push({
      x: xAxisMiddle,
      y: startY++
    });

     cells.push({
      x: xAxisMiddle - 1,
      y: startY
    });

     cells.push({
      x: xAxisMiddle + 1,
      y: startY++
    });

    cells.push({
      x: xAxisMiddle,
      y: startY++
    });

    cells.push({
      x: xAxisMiddle,
      y: startY++
    });

    cells.push({
      x: xAxisMiddle,
      y: startY++
    });

    cells.push({
      x: xAxisMiddle,
      y: startY++
    });

    cells.push({
      x: xAxisMiddle - 1,
      y: startY
    });

    cells.push({
      x: xAxisMiddle + 1,
      y: startY++
    });

    cells.push({
      x: xAxisMiddle,
      y: startY++
    });

    cells.push({
      x: xAxisMiddle,
      y: startY++
    });

    return cells;

  }

  setPattern(pattern, event) {

    event.preventDefault();

    let cells = this['get' + pattern.name + 'Cells']();

    for(let cell of cells) {
      cell.state = 1;
      cell.color = this.state.color;
    }

    this.doTryUpdateCells(cells);

    return false;

  }

  renderStatus() {
    if(!this.state.evolvedAlready) {
      return;
    }
    return (
      <span className="evolved-already">Evolved already</span>
    );
  }

  updateUsername(event) {
    this.state.username = event.target.value;
    this.setState(this.state);
  }

  updateColor() {
    let color = randomcolor({
       luminosity: 'bright',
       format: 'hsl',
       seed: this.state.username
    });
    this.state.color = color;
    this.setState(this.state);
  }

  renderRow(row, key) {
    let cells = [];
    let cellLen = row.length;
    let style = {
      height: this.state.cellWidth + '%'
    };
    for(let i = 0; i < cellLen; i++) {
      cells.push(this.renderCell(row[i], i));
    }
    return (
      <div className="row" key={key} style={style}>
        {cells}
      </div>
    );
  }

  renderPatterns() {

    let layoutSize = this.state.layout.length;
    let patterns = this.patterns.filter((pattern) => {
      return pattern.layoutSize <= layoutSize;
    });
    let rows = [];
    let patternsLen = patterns.length;
    let style = {width: (patternsLen * 120) + 'px'};

    for(let i = 0; i < patternsLen; i++) {
      rows.push(this.renderPattern(patterns[i], i));
    }

    return (
      <ul className="patterns-list" style={style}>
        {rows}
      </ul>
    );

  }

  renderPattern(pattern, key) {

    return (
      <li className="pattern-item" key={key}>
        <a className="pattern-link" href="#" onClick={this.setPattern.bind(this, pattern)}>
          <span className="pattern-name">{pattern.name}</span>
          <img className="pattern-image" src={pattern.image} />
        </a>
      </li>
    );

  }

  render() {
    var rows = [];
    var layout = this.state.layout;
    var layoutLen = layout.length;

    for(var i = 0; i < layoutLen; i++) {
      rows.push(this.renderRow(layout[i], i));
    }

    var colorStyle = {
      backgroundColor: this.state.color
    };

    return (
      <div className="App">
        <div className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h2>Game Of Life</h2>
        </div>
        <div className="patterns">
          {this.renderPatterns()}
        </div>
        <div className="user-bar">
          <span className="color-indicator" style={colorStyle}></span>
          <input type="text" className="user-name" onChange={this.updateUsername.bind(this)} value={this.state.username} placeholder="Enter your name & click Change Color." />
          <input type="button" value="Change Color" className="change-color-button" onClick={this.updateColor.bind(this)} />
          {this.renderStatus()}
        </div>
        <div className="game-board">
          {rows}
        </div>
      </div>
    );
  }

  renderCell(cell, key) {
    let style = {
      backgroundColor: cell.color,
      width: this.state.cellWidth + '%'
    };
    return (
      <div className="cell" style={style} key={key} onClick={this.tryUpdateCell.bind(this, cell)}></div>
    );
  }
}

export default App;
