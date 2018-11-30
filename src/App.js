import React, { Component } from 'react';
import './App.css';

import { API, graphqlOperation } from 'aws-amplify';
import * as queries from "./graphql/queries";
import * as mutations from "./graphql/mutations";
import * as subscriptions from "./graphql/subscriptions";

class App extends Component {
  state = {
    todo: '',
    todos: [],
  };
  async componentDidMount() {
    const data = await API.graphql(graphqlOperation(queries.listTodos))
    this.setState({
      todos: data.data.listTodos.items
    })
  }
  addTodo = async() => {
    if (this.state.todo === '' ) return;
    const todo = {
      title: this.state.todo,
      completed: false,
    };
    const data = await API.graphql(graphqlOperation(mutations.createTodo, {input:todo}));
    console.log(data);
    this.setState({ todo: '' })
  };
  render() {
    return (
      <div className="App">
        <input
          onChange={e => this.setState({ todo: e.target.value })}
          value={this.state.todo}
          placeholder='Todo name'
        />
        <button onClick={this.addTodo}>Add Todo</button>
        {
          this.state.todos.map((todo) => (
            <p key={todo.id}>
              {todo.title}
            </p>
          ))
        }
      </div>
    );
  }
}

export default App;
