import React from 'react'
import ReactDOM from 'react-dom'
import $ from 'jquery'

var Boards = React.createClass({
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
    var boardList = this.state.data.map(function(board) {
      return (
        <li key={board.id}>{board.id}: {board.name}</li>
      );
    });
    return (
      <ul className="Boards">
        {boardList}
      </ul>
    );
  }
})

ReactDOM.render(
  <Boards url='/board' />,
  document.getElementById('content')
);
