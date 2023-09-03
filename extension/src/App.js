import './App.css';
import {useEffect, useState} from 'react';
import {Select} from 'antd';
import {Routes, Route} from 'react-router-dom';
import Home from './Home';
import Login from "./Login";
import Wallet from "./Wallet";
import {Card} from "antd";
import {Col, Row} from 'antd';
import {Divider} from 'antd';

function App() {
    const [wallet, setWallet] = useState(null);
    const [seedPhrase, setSeedPhrase] = useState(null);
    const [selectedChain, setSelectedChain] = useState('0x13881');

    return (
        <Card className="App">
            <header>
                <Row style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center"
                }}>
                    <Col span={16}><h1>Abstract Wallet</h1></Col>
                    <Col span={8}><img
                        src="wallet.png"
                        width={50}
                        height={50}/></Col>
                </Row>
                <Row>
                    <Col span={28} style={{display: "flex", width: "100%"}}>
                        <Select
                            onChange={(val) => setSelectedChain(val)}
                            value={selectedChain}
                            style={{
                                display: "flex",
                                width: "100%",
                            }}
                            options={[
                                {
                                    label: "Ethereum",
                                    value: "0x1",
                                },
                                {
                                    label: "Mumbai",
                                    value: "0x13881",
                                },
                            ]}
                            className="dropdown"
                        ></Select>
                    </Col>
                </Row>
                <Divider/>
            </header>
            {wallet ?
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
                    <Route path="/login" element={<Login className="loginButton" setSeedPhrase={setSeedPhrase}
                                                         setWallet={setWallet}/>}/>
                </Routes>
            }
        </Card>
    );
}

export default App;