import React, {useEffect, useState} from "react";
import {
    Tooltip,
    List,
    Spin,
    Tabs,
    Input,
    Button,
    Statistic,
} from "antd";
import {useNavigate} from "react-router-dom";
import {ethers} from "ethers";
import {ETHERS_PROVIDER} from "./services/wallet-service";
import {LogoutOutlined} from "@ant-design/icons";
import useAbstract from './useAbstract';

function WalletView({
                        wallet,
                        setWallet,
                        seedPhrase,
                        setSeedPhrase,
                        selectedChain,
                    }) {

    const navigate = useNavigate();
    const [nfts, setNfts] = useState(null);
    const [balance, setBalance] = useState(0);
    const [fetching, setFetching] = useState(true);
    const [amountToSend, setAmountToSend] = useState(null);
    const [sendToAddress, setSendToAddress] = useState(null);
    const [processing, setProcessing] = useState(false);
    const [hash, setHash] = useState(null);
    const [activeTab, setActiveTab] = useState("3");
    const [sending, setSending] = useState(false);
    const [favoriteTokens, setFavoriteTokens] = useState([
        {
            name: 'Dai Stablecoin',
            symbol: 'DAI',
            decimals: 18,
            address: '0xC1E1C0Ab645Bd3C3156b20953784992013FDa98d',
            balance: 0
        },
        {
            name: 'USD Coin',
            symbol: 'USDC',
            decimals: 18,
            address: '0xF493Af87835D243058103006e829c72f3d34b891',
            balance: 0
        }
    ]);
    const [activeCoin, setActiveCoin] = useState(favoriteTokens[0])
    const {getBalance, transfer} = useAbstract();

    const items = [
        {
            key: "3",
            label: `Tokens`,
            children: (
                <>
                    {favoriteTokens ? (
                        <>
                            <List
                                bordered
                                itemLayout="horizontal"
                                dataSource={favoriteTokens}
                                renderItem={(item, index) => (
                                    <List.Item
                                        actions={[<a key="list-loadmore-edit" onClick={() => {
                                            setActiveCoin(favoriteTokens[index]);
                                            setActiveTab("1")
                                        }}>Send</a>]}
                                        style={{textAlign: "left"}}>
                                        <List.Item.Meta
                                            title={item.symbol}
                                            description={item.name}
                                        />
                                        <div>
                                            {item.balance}
                                        </div>
                                    </List.Item>
                                )}
                            />
                        </>
                    ) : (
                        <>
                            <span>You don't have any tokens yet</span>
                        </>
                    )}
                </>
            ),
        },
        {
            key: "2",
            label: `NFTs`,
            children: (
                <>
                    {nfts ? (
                        <>
                            {nfts.map((e, i) => {
                                return (
                                    <>
                                        {e && (
                                            <img
                                                key={i}
                                                className="nftImage"
                                                alt="nftImage"
                                                src={e}
                                            />
                                        )}
                                    </>
                                );
                            })}
                        </>
                    ) : (
                        <>
                            <span>You seem to not have any NFTs yet</span>
                        </>
                    )}
                </>
            ),
        },
        {
            key: "1",
            label: `Transfer`,
            children: (
                <>
                    <h3>{activeCoin.name} Balance</h3>
                    <h1>
                        {activeCoin.balance} {activeCoin.symbol}
                    </h1>
                    <div className="sendRow">
                        <p style={{width: "90px", textAlign: "left"}}> To:</p>
                        <Input
                            value={sendToAddress}
                            onChange={(e) => setSendToAddress(e.target.value)}
                            placeholder="0x..."
                        />
                    </div>
                    <div className="sendRow">
                        <p style={{width: "90px", textAlign: "left"}}> Amount:</p>
                        <Input
                            value={amountToSend}
                            onChange={(e) => setAmountToSend(e.target.value)}
                            placeholder="Native tokens you wish to send..."
                        />
                    </div>
                    <Button
                        style={{width: "100%", marginTop: "20px", marginBottom: "20px"}}
                        type="primary"
                        onClick={async () => {
                            setSending(true);
                            const tx = await transfer(activeCoin.address, sendToAddress, ethers.utils.parseEther(amountToSend));
                            setSending(false);
                        }}
                    >
                        {sending ? "Sending..." : "Send Tokens"}
                    </Button>
                    {processing && (
                        <>
                            <Spin/>
                            {hash && (
                                <Tooltip title={hash}>
                                    <p>Hover For Tx Hash</p>
                                </Tooltip>
                            )}
                        </>
                    )}
                </>
            ),
        },
    ];

    async function sendTransaction(to, amount) {

        const chain = '0xaef3';


        const privateKey = ethers.Wallet.fromMnemonic(seedPhrase).privateKey;

        const wallet = new ethers.Wallet(privateKey, ETHERS_PROVIDER);

        const tx = {
            to: to,
            value: ethers.utils.parseEther(amount.toString()),
        };

        setProcessing(true);
        try {
            const transaction = await wallet.sendTransaction(tx);

            setHash(transaction.hash);
            const receipt = await transaction.wait();
            setHash(null);
            setProcessing(false);
            setAmountToSend(null);
            setSendToAddress(null);

            if (receipt.status === 1) {
                // getAccountTokens();
            } else {
                console.log("failed");
            }


        } catch (err) {
            console.log('transaction error', err);
            setHash(null);
            setProcessing(false);
            setAmountToSend(null);
            setSendToAddress(null);
        }
    }

    function logout() {
        setSeedPhrase(null);
        setWallet(null);
        setNfts(null);
        navigate("/");
    }

    useEffect(() => {
        if (!wallet || !selectedChain) return;
        setNfts(null);
    }, []);

    useEffect(() => {
        if (!wallet) return;
        setNfts(null);
    }, [selectedChain]);

    useEffect(() => {
        if (!sending) {
            const myCallback = async () => {
                    // const newListOfTokens = [];
                    // for (const token of favoriteTokens) {
                    //
                    //     const newBalance = await getBalance(token.address);
                    //     const copy = {...token};
                    //     copy.balance = newBalance.displayValue;
                    //
                    //     newListOfTokens.push(copy);
                    // }

                    // setFavoriteTokens(newListOfTokens);
                activeCoin.balance = (await getBalance(activeCoin.address)).displayValue;
                setActiveCoin({...activeCoin});
                };
                myCallback();
                setFetching(false);
        }
        }
        , [sending]);

    useEffect(() => {
                const myCallback = async () => {
                    const newListOfTokens = [];
                    for (const token of favoriteTokens) {

                        const newBalance = await getBalance(token.address);
                        const copy = {...token};
                        copy.balance = newBalance.displayValue;

                        newListOfTokens.push(copy);
                    }

                    setFavoriteTokens(newListOfTokens);
                };
                myCallback();
                setFetching(false);
        }
        , [activeCoin]);



    return (
        <>
            <div className="content ">
                <div style={{display: "flex", alignItems: "end", justifyContent: "end"}}>
                    <Statistic title="Wallet" value={wallet.slice(0, 20) + '...'}/>
                    <Button style={{marginBottom: "3px"}} className="logoutButton" type="text" onClick={logout}>
                        <LogoutOutlined/>
                    </Button>
                </div>
                {fetching ? (
                    <Spin/>
                ) : (
                    <Tabs defaultActiveKey="1" onTabClick={(key) => setActiveTab(key)} activeKey={activeTab}
                          items={items} className="walletView"/>
                )}
            </div>
        </>
    );
}

export default WalletView;