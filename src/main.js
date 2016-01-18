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

function commonPut(given: React, url: string, data: string) {
  $.ajax({
    url: url,
    dataType: 'json',
    contentType: 'application/json',
    type: 'PUT',
    data: data,
    success: function(data) {
      given.setState(data['result']);
    }.bind(given),
    error: function(xhr, status, err) {
      console.error(url, status, err.toString());
    }.bind(given)
  });
}

var Card: React = React.createClass({
  getInitialState: function() {
    return ({
      id: this.props.id,
      title: this.props.title,
      content: this.props.content
    });
  },
  handleDragStart: function(e) {
    e.dataTransfer.setData('card', true);
    e.dataTransfer.setData('card_key', this.props.id);
    e.target.style.opacity = .5;
    // 드래그 시작할 때 마우스 포인터의 위치가 카드의 중심으로부터
    // 얼마나 이탈했는지를 저장
    var offsetTop: number = $(e.target).offset().top - $(window).scrollTop();
    var centerLine: number = e.target.clientHeight / 2 + offsetTop;
    e.dataTransfer.setData('offset', e.clientY - centerLine);
  },
  handleDrop: function(e) {
    var key = e.dataTransfer.getData('card_key');
    if (!e.dataTransfer.getData('card')) {
      return;
    }
    if (key == this.props.id) {
      return;
    }
    // 카드 드랍 존의 윗쪽 절반에 떨어지면 위에 넣기,
    // 아랫쪽 절반에 떨어지면 아래에 넣기
    var offsetTop = $(e.target).offset().top - $(window).scrollTop();
    var priority =
      (e.target.clientHeight / 2 + offsetTop < e.clientY -
        e.dataTransfer.getData('offset')) ?
      this.props.priority + 1 : this.props.priority;
    var url: string = '/card/swap';
    $.ajax({
      url: url,
      dataType: 'json',
      contentType: 'application/json',
      type: 'POST',
      data: JSON.stringify({
        list_id: this.props.list_id,
        source: key,
        target: priority
      }),
      success: function(data) {
        this.props.board_update();
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(url, status, err.toString());
      }.bind(this)
    });

  },
  handleTitleClick: function(e) {
    var newTitle: string = prompt('카드 제목', this.state.title);
    if (newTitle !== null && newTitle !== '') {
      commonPut(this, `/card/${this.props.id}`, `{"title": "${newTitle}"}`);
    }
  },
  handleContentClick: function(e) {
    var newCon: string = prompt('카드 내용', this.state.content);
    if (newCon !== null && newCon !== '') {
      commonPut(this, `/card/${this.props.id}`, `{"content": "${newCon}"}`);
    }
  },
  render: function() {
    var given = this;
    var myClassName: string = this.state.content ?
      'CardContent' : 'EmptyCardContent';
    return (
      <div
        className='CardDropZone'
        onDragOver={e => e.preventDefault()}
        onDragEnter={e => e.preventDefault()}
        onDrop={this.handleDrop}
      >
        <div
          onDragStart={this.handleDragStart}
          draggable='true'
          className='Card'
        >
          <h3 onClick={this.handleTitleClick}>{this.state.title}</h3>
          <p onClick={this.handleContentClick} className={myClassName}>
            {this.state.content || '(내용 없음)'}
          </p>
        </div>
      </div>
    );
  }
});

var Cards: React = React.createClass({
  render: function() {
    if (this.props.data.length === 0) {
      return <div />;
    }
    var list_id = this.props.list_id;
    var board_update = this.props.board_update;
    var cards = this.props.data.map(function(card) {
      return (
        <Card
          key={card.id}
          id={card.id}
          title={card.title}
          content={card.content}
          priority={card.priority}
          list_id={list_id}
          board_update={board_update}
        />
      );
    });
    return <div>{cards}</div>;
  }
});

var CardList: React = React.createClass({
  getInitialState: function() {
    return {data: []};
  },
  componentDidMount: function() {
    commonGet(this, '/list/' + this.props.id);
  },
  handleDrop: function(e) {
    var key = e.dataTransfer.getData('key');
    if (e.dataTransfer.getData('card')) {
      return;
    }
    if (!e.dataTransfer.getData('card_list')) {
      return;
    }
    if (key == this.props.id) {
      return;
    }
    var offsetLeft = $(e.target).offset().left - $(window).scrollLeft();
    // 카드리스트 드랍 존의 왼쪽 절반에 떨어지면 앞에 넣기,
    // 오른쪽 절반에 떨어지면 뒤에 넣기
    var priority =
      (e.target.clientWidth / 2 + offsetLeft < e.clientX -
        e.dataTransfer.getData('offset')) ?
      this.props.priority + 1 : this.props.priority;
    var url = `/board/${this.props.board}/swap/${key}/${priority}`;
    $.ajax({
      url: url,
      dataType: 'json',
      contentType: 'application/json',
      type: 'POST',
      success: function(data) {
        this.props.list_swap(data['result']);
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(url, status, err.toString());
      }.bind(this)
    });
  },
  handleCardDrop: function(e) {
    if (!e.dataTransfer.getData('card')) {
      return;
    }
    if (!e.dataTransfer.getData('card_key')) {
      return;
    }
    var url: string = '/card/swap';
    $.ajax({
      url: url,
      dataType: 'json',
      contentType: 'application/json',
      type: 'POST',
      data: JSON.stringify({
        list_id: this.props.id,
        source: e.dataTransfer.getData('card_key'),
        target: 0
      }),
      success: function(data) {
        this.props.board_update();
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(url, status, err.toString());
      }.bind(this)
    });
  },

  handleDelete: function() {
    var url: string = '/list/' + this.props.id;
    $.ajax({
      url: url,
      dataType: 'json',
      type: 'DELETE',
      success: function(data) {
        this.props.board_update();
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(url, status, err.toString());
      }.bind(this)
    });
  },

  render: function() {
    var given = this;
    var addCard = function(e) {

      var newTitle: string = prompt('새 카드 제목');
      if (newTitle !== null && newTitle !== '') {
        commonPost(given, '/list/' + given.props.id,
          `{"title": "${newTitle}"}`);
      }
    };
    var handleDragStart = function(e) {
      e.dataTransfer.setData('card_list', true);
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
    return (
      <div
        className='CardListDropZone'
        onDragOver={e => e.preventDefault()}
        onDragEnter={e => e.preventDefault()}
        onDrop={this.handleDrop}
      >
        <div
          className='CardListReal'
          draggable='true'
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div onClick={this.handleDelete} className='CardListDelete'>✗</div>
          <h2
            onDragOver={e => e.preventDefault()}
            onDragEnter={e => e.preventDefault()}
            onDrop={this.handleCardDrop}
          >
            {this.props.name}
          </h2>
          <Cards
            list_id={this.props.id}
            board_update={this.props.board_update}
            data={this.state.data}
          />
          <div
            className='AddCard'
            onClick={addCard}
            onDragOver={e => e.preventDefault()}
            onDragEnter={e => e.preventDefault()}
            onDrop={this.handleCardDrop}
          >새 카드</div>
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
  handleWholeUpdate: function() {
    commonGet(this, '/board/' + this.props.chosen_board);
  },
  render: function() {
    if (this.props.chosen_board === 0) {
      return <div id='MainArea' className='welcome' />
    }
    var given = this;
    var handleListSwap = function(card_lists) {
      given.setState({data: card_lists});
    }
    var board_update = this.handleWholeUpdate;
    var card_lists = this.state.data.map(function(card_list) {
      return <CardList
        id={card_list.id}
        key={card_list.id}
        priority={card_list.priority}
        name={card_list.name}
        board={given.props.chosen_board}
        board_update={board_update}
        list_swap={handleListSwap}
      />
    });
    var addCardList = function(e) {
      var newName: string = prompt('새 리스트 이름');
      if (newName !== null && newName !== '') {
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
        <div id='CardListArea'>
          {card_lists}
          <div
            className='CardListDropZone'
            onDrop={handleDropOnAdd}
            onDragOver={e => e.preventDefault()}
            onDragEnter={e => e.preventDefault()}
          >
            <div className='CardListReal'>
              <div className='AddList' onClick={addCardList}>새 리스트</div>
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
        <div className='AddBoard' onClick={addBoard}>새 보드</div>
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
