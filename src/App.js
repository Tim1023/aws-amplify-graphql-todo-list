import React, { Component } from 'react';
import './App.css';

import { API, graphqlOperation } from 'aws-amplify';
import {listTodos} from "./graphql/queries";

class App extends Component {
  state = { todos: [] }
  async componentDidMount() {
    const data = await API.graphql(graphqlOperation(listTodos))
    this.setState({
      todos: data.data.listTodos.items
    })
  }
  render() {
    return (
      <div className="App">
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
