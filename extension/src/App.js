import logo from './logo.svg';
import './App.css';
import {useState} from 'react';
import {Select} from 'antd';
import {Routes, Route} from 'react-router-dom';
import Home from './Home';
import Login from "./Login";
import {MemoryRouter} from "react-router-dom";
import Wallet from "./Wallet";
import {Card} from "antd";

function App() {
    const [wallet, setWallet] = useState(null);
    const [seedPhrase, setSeedPhrase] = useState(null);
    const [selectedChain, setSelectedChain] = useState('0xa4ec');

    return (
        <Card title="My Wallet Name" className="App">
            <header>
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
                            value: "0xaef3",
                        },
                    ]}
                    className="dropdown"
                ></Select>
            </header>
            {wallet && seedPhrase ?
                <Routes>
                    <Route path="/mywallet" element={<Wallet
                    wallet={wallet}
                    setWallet={setWallet}
                    seedPhrase={seedPhrase}
                    setSeedPhrase={setSeedPhrase}
                    selectedChain={selectedChain}/>}/>
                </Routes>

            :
            <Routes>
                <Route path="/" element={<Home/>}/>
                <Route path="/login" element={<Login setSeedPhrase={setSeedPhrase} setWallet={setWallet}/>}/>
            </Routes>
            }
        </Card>
    );
}

export default App;
