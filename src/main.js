// @flow

import React from 'react'
import ReactDOM from 'react-dom'
import $ from 'jquery'

function commonGet(given: React, url: string) {
  given.setState({data: []});
  $.ajax({
    url: url,
    dataType: 'json',
    cache: false,
    success: function(data) {
      given.setState({data: data['result']});
    }.bind(given),
    error: function(xhr, status, err) {
      console.error(url, status, err.toString());
    }.bind(given)
  });
}

function commonPost(given: React, url: string, data: string) {
  $.ajax({
    url: url,
    dataType: 'json',
    contentType: 'application/json',
    type: 'POST',
    data: data,
    success: function(data) {
      given.setState({data: data['result']});
    }.bind(given),
    error: function(xhr, status, err) {
      console.error(url, status, err.toString());
    }.bind(given)
  });
}

var Cards: React = React.createClass({
  getInitialState: function() {
    return {data: []};
  },
  componentDidMount: function() {
    commonGet(this, '/list/' + this.props.list_id);
  },
  componentWillReceiveProps: function(nextProps) {
    commonGet(this, '/list/' + nextProps.list_id);
  },
  render: function() {
    if (this.state.data.length === 0) {
      return <div />;
    }
    var handleDragStart = function(e) {
      e.dataTransfer.setData('type', 'Card');
      // e.dataTransfer.setData('key', given.props.id);
      e.target.style.opacity = .5;
      var offsetLeft = $(e.target).offset().left - $(window).scrollLeft();
      // 드래그 시작할 때 마우스 포인터의 위치가 카드의 중심으로부터
      // 얼마나 이탈했는지를 저장
      e.dataTransfer.setData('offset',
        e.clientX - (e.target.clientWidth / 2 + offsetLeft));
    };
    var cards = this.state.data.map(function(card) {
      return (
        <div
          onDragStart={handleDragStart}
          draggable='true'
          className='Card'
          key={card.id}
        >
          <h3>{card.title}</h3>
          <p className={card.content ? 'CardContent' : 'EmptyCardContent'}>
            {card.content ? card.content : '(내용 없음)'}
          </p>
        </div>
      );
    });
    return <div>{cards}</div>;
  }
});

var CardList: React = React.createClass({
  render: function() {
    var given = this;
    var addCard = function(e) {
      var newTitle = prompt('새 카드 제목');
      if (newTitle !== null) {
        commonPost(given, '/list/' + given.props.id,
          `{"title": "${newTitle}"}`);
      }
    };
    var handleDragStart = function(e) {
      e.dataTransfer.setData('key', given.props.id);
      e.target.style.opacity = .5;
      var offsetLeft = $(e.target).offset().left - $(window).scrollLeft();
      // 드래그 시작할 때 마우스 포인터의 위치가 카드리스트의 중심으로부터
      // 얼마나 이탈했는지를 저장
      e.dataTransfer.setData('offset',
        e.clientX - (e.target.clientWidth / 2 + offsetLeft));
    };
    var handleDragEnd = function(e) {
      e.target.style.opacity = 1;
    };
    var handleDrop = function(e) {
      var key = e.dataTransfer.getData('key');
      if (e.dataTransfer.getData('type') === 'Card') {
        return;
      }
      if (key == given.props.id) {
        return;
      }
      var offsetLeft = $(e.target).offset().left - $(window).scrollLeft();
      // 카드리스트 드랍 존의 왼쪽 절반에 떨어지면 앞에 넣기,
      // 오른쪽 절반에 떨어지면 뒤에 넣기
      var priority =
        (e.target.clientWidth / 2 + offsetLeft < e.clientX -
          e.dataTransfer.getData('offset')) ?
        given.props.priority + 1 : given.props.priority;
      var url = `/board/${given.props.board}/swap/${key}/${priority}`;
      $.ajax({
        url: url,
        dataType: 'json',
        contentType: 'application/json',
        type: 'POST',
        success: function(data) {
          given.props.list_swap(data['result']);
        }.bind(given),
        error: function(xhr, status, err) {
          console.error(url, status, err.toString());
        }.bind(given)
      });
    };
    return (
      <div
        className='CardListDropZone'
        onDragOver={e => e.preventDefault()}
        onDragEnter={e => e.preventDefault()}
        onDrop={handleDrop}
        key='{this.props.id}'
      >
        <div
          className='CardListReal'
          draggable='true'
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <h2>
            {this.props.name}
          </h2>
          <Cards list_id={this.props.id} />
          <div className='AddCard' onClick={addCard}>카드 추가</div>
        </div>
      </div>
    );
  }
});

var CardLists: React = React.createClass({
  getInitialState: function() {
    return {data: []};
  },
  componentDidMount: function() {
    commonGet(this, '/board/' + this.props.chosen_board);
  },
  componentWillReceiveProps: function(nextProps) {
    commonGet(this, '/board/' + nextProps.chosen_board);
  },
  render: function() {
    if (this.props.chosen_board === 0) {
      return <div id='MainArea'>
        <h1>보드를 선택해 주세요.</h1>
      </div>
    }
    var given = this;
    var handleListSwap = function(card_lists) {
      given.setState({data: card_lists});
    }
    var card_lists = this.state.data.map(function(card_list) {
      return <CardList
        id={card_list.id}
        key={card_list.id}
        priority={card_list.priority}
        name={card_list.name}
        board={given.props.chosen_board}
        list_swap={handleListSwap}
      />
    });
    var addCardList = function(e) {
      var newName = prompt('새 리스트 이름');
      if (newName !== null) {
        commonPost(given, '/board/' + given.props.chosen_board,
          `{"name": "${newName}"}`);
      }
    };
    var handleDropOnAdd = function(e) {
      var key = e.dataTransfer.getData('key');
      if (e.dataTransfer.getData('type') === 'Card') {
        return;
      }
      var url = `/board/${given.props.chosen_board}/swap/${key}/0`;
      $.ajax({
        url: url,
        dataType: 'json',
        contentType: 'application/json',
        type: 'POST',
        success: function(data) {
          handleListSwap(data['result']);
        }.bind(given),
        error: function(xhr, status, err) {
          console.error(url, status, err.toString());
        }.bind(given)
      });
    };
    return (
      <div id='MainArea'>
        <h1>{this.props.chosen_board_name}</h1>
        <div id='CardListArea' key={this.props.chosen_board}>
          {card_lists}
          <div
            className='CardListDropZone'
            onDrop={handleDropOnAdd}
            onDragOver={e => e.preventDefault()}
            onDragEnter={e => e.preventDefault()}
          >
            <div className='CardListReal AddList' onClick={addCardList}>
              리스트 추가
            </div>
          </div>
        </div>
      </div>
    );
  }
});

var BoardList: React = React.createClass({
  getInitialState: function() {
    return {data: []};
  },
  componentDidMount: function() {
    commonGet(this, this.props.url);
  },
  render: function() {
    var handleBoardClick = this.props.handleBoardClick;
    var boardNodes = this.state.data.map(function(board) {
      var boardOnClick = function(e) {
        handleBoardClick(board.id, board.name);
      };
      return (
        <li onClick={boardOnClick} key={board.id}>
          {board.name}
        </li>
      );
    });
    var given = this;
    var addBoard = function(e) {
      var boardName = prompt("새 보드 이름");
      if (boardName !== null) {
        commonPost(given, given.props.url, `{"name": "${boardName}"}`);
      }
    }
    return (
      <div id='BoardList'>
        <ul>
          {boardNodes}
        </ul>
        <div className='AddBoard' onClick={addBoard}>보드 추가</div>
      </div>
    );
  }
});

var Qanvan: React = React.createClass({
  getInitialState: function() { return {
    chosen_board: 0,
    chosen_board_name: 'no board chosen'
  };},
  handleBoardClick: function(board_id, board_name) {
    this.setState({
      chosen_board: board_id,
      chosen_board_name: board_name
    });
  },
  render: function() {
    return (
      <div id="Qanvan">
        <BoardList url='/board' handleBoardClick={this.handleBoardClick} />
        <CardLists
          chosen_board={this.state.chosen_board}
          chosen_board_name={this.state.chosen_board_name}
        />
      </div>
    );
  }
});

ReactDOM.render(
  <Qanvan />,
  document.getElementById('content')
);
