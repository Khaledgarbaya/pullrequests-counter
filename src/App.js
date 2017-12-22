import React, { Component } from 'react';
import './App.css';
import Form from './Form'
class App extends Component {
  getLights () {
    const lights = []
    for(let i=0;i<40;i++){
      lights.push(<li key={i}></li>)    
    }
    return lights
  }
  render() {
    return (
      <div className="App">
        <header className="App-header">
        </header>
        <ul className="lightrope">
          {this.getLights()}
        </ul>
         <Form />
      </div>
    );
  }
}

export default App;
