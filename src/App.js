import React, {Component} from 'react';
import './App.css';

import {API, graphqlOperation} from 'aws-amplify';
import * as queries from "./graphql/queries";
import * as mutations from "./graphql/mutations";


class Todo extends Component {
  async handleDelete() {
    const input = {id: this.props.item.id};
    const data = await API.graphql(graphqlOperation(mutations.deleteTodo, {input}));
    this.props.deleteTodo(data.data.deleteTodo);
  }

  async handleUpdate() {
    const input = {
      id: this.props.item.id,
      completed: !this.props.item.completed,
      title: this.props.item.title,
    };
    const data = await API.graphql(graphqlOperation(mutations.updateTodo, {input}));
    this.props.updateTodo(data.data.updateTodo);
  }

  render() {
    return (
      <div>
        <button onClick={() => this.handleUpdate()}>
          {this.props.item.completed ? '已完成' : '未完成'}
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
  constructor(props) {
    super(props);
    this.state = {
      title: '',
    };
  }

  handleChange(name, ev) {
    this.setState({[name]: ev.target.value});
  }

  async submit() {
    const input = {
      title: this.state.title,
      completed: false,
    };
    const data = await API.graphql(graphqlOperation(mutations.createTodo, {input}));
    this.props.createTodo(data.data.createTodo);

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
      todos: data.data.listTodos.items
    })
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
              item={todo}
              deleteTodo={(todo) => this.deleteTodo(todo)}
              updateTodo={(todo) => this.updateTodo(todo)}/>)}
        </div>
      </div>
    );

    return (
      <div className="App">
        <AddTodo createTodo={(newTodo) => this.createTodo(newTodo)}/>

        <ListView todos={this.state.todos ? this.state.todos : []}/>

      </div>
    );
  }
}

export default App;
