import React from 'react'
import ReactDOM from 'react-dom'
import $ from 'jquery'

var CardLists = React.createClass({
  render: function() {
    return (
      <div>{this.props.chosen_board}</div>
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
