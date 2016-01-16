import React from 'react'
import ReactDOM from 'react-dom'
import $ from 'jquery'

var Boards = React.createClass({
  render: function() {
    var boardList = this.props.data.map(function(board) {
      return (
        <li>{board.id}: {board.name}</li>
      );
    });
    return (
      <ul className="Boards">
        {boardList}
      </ul>
    );
  }
})

var data = [
  {id: 1, name: "work"},
  {id: 2, name: "battle"}
];

ReactDOM.render(
  <Boards data={data} />,
  document.getElementById('content')
);
