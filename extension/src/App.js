import logo from './logo.svg';
import './App.css';
import {useState} from 'react';
import {Select} from 'antd';
import { Routes, Route } from 'react-router-dom';
import Home from './Home';
import Login from "./Login";
import { MemoryRouter } from "react-router-dom";

function App() {
  const [selectedChain, setSelectedChain] = useState('0x1');

  return (
    <div className="App">
      <header>
          Abstract Wallet
          <Select
              onChange={(val) => setSelectedChain(val)}
              value={selectedChain}
              options={[
                  {
                      label: "Ethereum",
                      value: "0x1",
                  },
                  {
                      label: "Celo",
                      value: "0xa4ec",
                  },
              ]}
              className="dropdown"
          ></Select>
      </header>
        <Routes>
            <Route path="/" element={<Home/>}/>
            <Route path="/login" element={<Login/>}/>
        </Routes>
    </div>
  );
}

export default App;
