import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

import { API, graphqlOperation } from 'aws-amplify';


const query = `
    query listTodos {
        listTodos {
            items {
                id
                title
                completed
            }
        }
    }
`;

class App extends Component {
  state = { todos: [] }
  async componentDidMount() {
    const data = await API.graphql(graphqlOperation(query))
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
