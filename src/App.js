import React, {Component} from 'react';
import './App.css';

import {API, graphqlOperation} from 'aws-amplify';
import * as queries from "./graphql/queries";
import * as mutations from "./graphql/mutations";
import * as subscriptions from './graphql/subscriptions';


class Todo extends Component {
  handleDelete() {
    const input = {id: this.props.item.id};
    API.graphql(graphqlOperation(mutations.deleteTodo, {input}));
  }

  handleUpdate() {
    const input = {
      id: this.props.item.id,
      completed: !this.props.item.completed,
      title: this.props.item.title,
    };
    API.graphql(graphqlOperation(mutations.updateTodo, {input}));
  }

  render() {
    return (
      <div>
        <button onClick={() => this.handleUpdate()}>
          {this.props.item.completed ? 'Done' : 'Todo'}
        </button>
        <span title={this.props.item.title}>
          {this.props.item.title}
        </span>
        <button onClick={() => this.handleDelete()}>
          Delete
        </button>
      </div>
    )
  }
}

class SearchBox extends Component{
  state = {
    keyword: '',
  };
  handleKeywordChange(ev){
    this.setState({keyword: ev.target.value});
  }
  async search(){
   this.props.search(this.state.keyword)
  }
  render() {
    return (
      <div>
        <input
          name="search"
          placeholder="Type to search"
          value={this.state.keyword}
          onKeyPress={event => {
            event.key === "Enter" && this.search();
          }}
          onChange={(ev) => {
            this.handleKeywordChange(ev)
          }}
        />
        <button onClick={() => this.search()}>
          Search
        </button>
      </div>
    )
  }
}

class AddTodo extends Component {
  state = {
    title: '',
    state: 'all',
  };

  handleChange(name, ev) {
    this.setState({[name]: ev.target.value});
  }

  async submit() {
    const input = {
      title: this.state.title,
      completed: false,
    };
    await API.graphql(graphqlOperation(mutations.createTodo, {input}));

    this.setState({
      title: '',
    })
  }

  render() {
    return (
      <div>
        <input
          name="title"
          placeholder="Add a todo"
          onKeyPress={event => {
            event.key === "Enter" && this.submit();
          }}
          onChange={(ev) => {
            this.handleChange('title', ev)
          }}
          value={this.state.title}
        />
        <button onClick={() => this.submit()}>
          Add
        </button>
      </div>
    );
  }
}



class App extends Component {
  state = {
    todos: [],
  };

  async componentDidMount() {
    this.queryAll();
    // createTodo subscriptions
    this.createTodoSubscription = API.graphql(
      graphqlOperation(subscriptions.onCreateTodo)
    ).subscribe({
      next: (todoData) => this.createTodo(todoData.value.data.onCreateTodo)
    });
    // deleteTodo subscriptions
    this.delteTodoSubscription = API.graphql(
      graphqlOperation(subscriptions.onDeleteTodo)
    ).subscribe({
      next: (todoData) => this.deleteTodo(todoData.value.data.onDeleteTodo)
    });
    // updateTodo subscriptions
    this.updateTodoSubscription = API.graphql(
      graphqlOperation(subscriptions.onUpdateTodo)
    ).subscribe({
      next: (todoData) => this.updateTodo(todoData.value.data.onUpdateTodo)
    });


  }

  componentWillUnmount() {
    this.createTodoSubscription.unsubscribe();
    this.delteTodoSubscription.unsubscribe();
    this.updateTodoSubscription.unsubscribe();
  }

  createTodo(newTodo) {
    this.setState({todos: [...this.state.todos, newTodo]});
  }

  deleteTodo(newTodo) {
    this.setState({todos: this.state.todos.filter(todo => todo.id !== newTodo.id)});
  }

  updateTodo(newTodo) {
    const todos = this.state.todos.map(todo => todo.id === newTodo.id
      ? {
        ...todo,
        completed: !todo.completed
      }
      : todo);
    this.setState({
      todos,
    })
  }

  async loadMore() {
    const completedFilter = {
      completed: {
        eq: true,
      }
    };
    const processingFilter = {
      completed: {
        eq: false,
      }
    };
    const searchFilter = {
      title: {
        contains: this.state.keyword,
      }
    };
    let filter ='';
    switch (this.state.state){
      case 'complete':
        filter = completedFilter;
        break;
      case 'processing':
        filter = processingFilter;
        break;
      case 'search':
        filter = searchFilter;
        break;
      default:
        break
    }

    const options = {
      nextToken: this.state.nextToken,
    };
    this.state.state !== 'all' && (options.filter = filter);
    const {data: {listTodos: {items = [], nextToken = ''}}} =
      await API.graphql(graphqlOperation(queries.listTodos, options));
    this.setState({
      todos: [...this.state.todos, ...items],
      nextToken,
    })
  }

  async queryCompleted() {
    const filter = {
      completed: {
        eq: true,
      }
    };
    const {data: {listTodos: {items = [], nextToken = ''}}} = await API.graphql(graphqlOperation(queries.listTodos, {filter}));
    this.setState({
      todos: items,
      nextToken,
      state: 'completed',
    })
  }

  async queryProcessing() {
    const filter = {
      completed: {
        eq: false,
      }
    };
    const {data: {listTodos: {items = [], nextToken = ''}}} = await API.graphql(graphqlOperation(queries.listTodos, {filter}));
    this.setState({
      todos: items,
      nextToken,
      state: 'processing',
    })
  }
  async queryAll() {
    const {data: {listTodos: {items = [], nextToken = ''}}} = await API.graphql(graphqlOperation(queries.listTodos));
    this.setState({
      todos: items,
      nextToken,
      state: 'all',
    })
  }
  async handleSearch(keyword){
    const filter = {
      title: {
        contains: keyword,
      }
    };
    const {data: {listTodos: {items = [], nextToken = ''}}} = await API.graphql(graphqlOperation(queries.listTodos, {filter}));
    this.setState({
      todos: items,
      nextToken,
      state: 'search',
    })
  }

  render() {
    const ListView = ({todos}) => (
      <div>
        <h3>All Todos</h3>
        <div>
          <SearchBox search={(keyword)=>this.handleSearch(keyword)}/>
          <button onClick={() => this.queryAll()}>All</button>
          <button onClick={() => this.queryCompleted()}>Completed</button>
          <button onClick={() => this.queryProcessing()}>Processing</button>
        </div>
        <div>
          {todos.map(todo =>
            <Todo
              key={todo.id}
              item={todo}/>)}
        </div>
      </div>
    );

    return (
      <div className="App">
        <AddTodo/>

        <ListView todos={this.state.todos}/>
        {
          this.state.todos.length && this.state.nextToken ?
            <button onClick={() => this.loadMore()}>Load More</button> : ''
        }
        {
          !this.state.nextToken ? <div>No more data</div> : ''
        }

      </div>
    );
  }
}

export default App;
