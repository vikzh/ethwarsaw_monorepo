import logo from './logo.svg';
import './App.css';
import {useEffect, useState} from 'react';
import {Select} from 'antd';
import {Routes, Route} from 'react-router-dom';
import Home from './Home';
import Login from "./Login";
import {MemoryRouter} from "react-router-dom";
import Wallet from "./Wallet";
import {getAccounts} from "./services/wallet-service";
function App() {
    const [wallet, setWallet] = useState(null);
    const [seedPhrase, setSeedPhrase] = useState(null);
    const [selectedChain, setSelectedChain] = useState('0x1');
    useEffect(() => {
        getAccounts().then((accounts) => {
            console.log('zwrotka', accounts);
        });
    }, []);
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
            {wallet && seedPhrase ?
                <Routes>
                    <Route path="/mywallet" element={<Wallet/>}/>
                </Routes>

            :
            <Routes>
                <Route path="/" element={<Home/>}/>
                <Route path="/login" element={<Login setSeedPhrase={setSeedPhrase} setWallet={setWallet}/>}/>
            </Routes>
            }
        </div>
    );
}

export default App;
