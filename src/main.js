// @flow

import React from 'react'
import ReactDOM from 'react-dom'
import $ from 'jquery'

var CardList = React.createClass({
  render: function() {
    return (
      <div key='{this.props.key}'>{this.props.name}</div>
    );
  }
});

var CardLists = React.createClass({
  getInitialState: function() {
    return {data: []};
  },
  componentDidMount: function() {
    this.componentWillReceiveProps(this.props);
  },
  componentWillReceiveProps: function(nextProps) {
    $.ajax({
      url: '/board/' + nextProps.chosen_board,
      dataType: 'json',
      cache: false,
      success: function(data) {
        this.setState({data: data['result']});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error('/board/' + nextProps.chosen_board, status, err.toString());
      }.bind(this)
    });
  },
  render: function() {
    var card_lists = this.state.data.map(function(card_list) {
      return <CardList key={card_list.id} name={card_list.name} />
    });
    return (
      <div key={this.props.chosen_board}><p>{this.props.chosen_board}</p>{card_lists}</div>
    );
  }
});

var BoardList = React.createClass({
  getInitialState: function() {
    return {data: []};
  },
  componentDidMount: function() {
    $.ajax({
      url: this.props.url,
      dataType: 'json',
      cache: false,
      success: function(data) {
        this.setState({data: data['result']});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },
  render: function() {
    var handleBoardClick = this.props.handleBoardClick;
    var boardNodes = this.state.data.map(function(board) {
      var boardOnClick = function(e) {
        handleBoardClick(board.id);
      };
      return (
        <li onClick={boardOnClick} key={board.id}>{board.name}</li>
      );
    });
    return (
      <ul id='BoardList'>
        {boardNodes}
      </ul>
    );
  }
});

var Qanvan = React.createClass({
  getInitialState: function() { return {chosen_board: 1}; },
  handleBoardClick: function(board_id) {
    this.setState({chosen_board: board_id});
  },
  render: function() {
    return (
      <div className="Qanvan">
        <BoardList url='/board' handleBoardClick={this.handleBoardClick} />
        <CardLists chosen_board={this.state.chosen_board} />
      </div>
    );
  }
});

ReactDOM.render(
  <Qanvan />,
  document.getElementById('content')
);
