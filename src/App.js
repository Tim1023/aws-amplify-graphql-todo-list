import React, { Component } from 'react';
import './App.css';

import { API, graphqlOperation } from 'aws-amplify';
import { Connect } from "aws-amplify-react";
import * as queries from "./graphql/queries";
import * as mutations from "./graphql/mutations";
import * as subscriptions from "./graphql/subscriptions";


class AddTodo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      title: '',
    };
  }

  handleChange(name, ev) {
    this.setState({ [name]: ev.target.value });
  }

  async submit() {
    const { onCreate } = this.props;
    const input = {
      title: this.state.title,
      completed: false,
    };
    console.log(input);
    await onCreate({input});
  }

  render(){
    return (
      <div>
        <input
          name="title"
          placeholder="Add a todo"
          onChange={(ev) => { this.handleChange('title', ev)}}
        />
        <button onClick={this.submit.bind(this)}>
          Add
        </button>
      </div>
    );
  }
}


class App extends Component {
  state = {
    // todo: '',
    todos: [],
  };
  // async componentDidMount() {
  //   const data = await API.graphql(graphqlOperation(queries.listTodos))
  //   this.setState({
  //     todos: data.data.listTodos.items
  //   })
  // }
  // addTodo = async() => {
  //   if (this.state.todo === '' ) return;
  //   const todo = {
  //     title: this.state.todo,
  //     completed: false,
  //   };
  //   const data = await API.graphql(graphqlOperation(mutations.createTodo, {input:todo}));
  //   console.log(data);
  //   this.setState({ todo: '' })
  // };
  render() {
    const ListView = ({ todos }) => (
      <div>
        <h3>All Todos</h3>
        <ul>
          {todos.map(todo => <li key={todo.id}>{todo.title}</li>)}
        </ul>
      </div>
    );

    return (
      <div className="App">
        <Connect mutation={graphqlOperation(mutations.createTodo)}>
          {({mutation}) => (
            <AddTodo onCreate={mutation} />
          )}
        </Connect>
        <Connect
          query={graphqlOperation(queries.listTodos)}
          subscription={graphqlOperation(subscriptions.onCreateTodo)}
          onSubscriptionMsg={(prev, { onCreateTodo }) => {
            console.log(prev)
            return {
              listTodos: {
                items: prev.listTodos.items.concat([onCreateTodo]),
                nextToken: prev.listTodos.nextToken
              }
            };
          }}
        >
          {({ data: { listTodos }, loading, error }) => {
            if (error) return (<h3>Error</h3>);
            if (loading || !listTodos) return (<h3>Loading...</h3>);
            return <ListView todos={listTodos ? listTodos.items : []} />
          }}
        </Connect>
      </div>
    );
  }
}

export default App;
