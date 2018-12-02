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

class AddTodo extends Component {
  state = {
    title: '',
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
    const data = await API.graphql(graphqlOperation(queries.listTodos))
    this.setState({
      todos: data.data.listTodos.items,
    })
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
  componentWillUnmount(){
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

  render() {
    const ListView = ({todos}) => (
      <div>
        <h3>All Todos</h3>
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

        <ListView todos={this.state.todos ? this.state.todos : []}/>

      </div>
    );
  }
}

export default App;
