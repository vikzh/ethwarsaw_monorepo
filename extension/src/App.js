import logo from './logo.svg';
import './App.css';
import {useEffect, useState} from 'react';
import {Select, Space} from 'antd';
import {Routes, Route} from 'react-router-dom';
import Home from './Home';
import Login from "./Login";
import {MemoryRouter} from "react-router-dom";
import Wallet from "./Wallet";
import {Card} from "antd";
import {WalletOutlined} from "@ant-design/icons";
import { Col, Row, Statistic } from 'antd';
import { Divider } from 'antd';
import {connectToSmartWallet} from "./services/wallet-service";


function App() {
    const [wallet, setWallet] = useState(null);
    const [seedPhrase, setSeedPhrase] = useState(null);
    const [selectedChain, setSelectedChain] = useState('0xaef3');
    useEffect(() => {
        connectToSmartWallet('makapaka2', 'makapaka')
    }, []);
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
                                    label: "Celo",
                                    value: "0xaef3",
                                },
                            ]}
                            className="dropdown"
                        ></Select>
                    </Col>
                </Row>
                <Divider />
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
                    <Route path="/login" element={<Login className="loginButton" setSeedPhrase={setSeedPhrase} setWallet={setWallet}/>}/>
                </Routes>
            }
        </Card>
    );
}

export default App;