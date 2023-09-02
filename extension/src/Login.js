import React from "react";
import {Button} from "antd";
import {ethers} from "ethers";
import {useNavigate} from "react-router-dom";
import {useState} from "react";

function Login({setWallet, setSeedPhrase}) {
    const [newSeedPhrase, setNewSeedPhrase] = useState(null);
    const navigate = useNavigate();
    function generateWallet() {
        const mnemonic = ethers.Wallet.createRandom().mnemonic.phrase;
        setNewSeedPhrase(mnemonic);
        setSeedPhrase(mnemonic);
        setWallet(ethers.Wallet.fromMnemonic(mnemonic).address);
        navigate("/mywallet");
    }


    return (
        <>
            <div className="content">
                Login page
            </div>

            <input/>
            <Button
                onClick={() => generateWallet()}
                type="primary">
                Login
            </Button>
            <Button
                type="primary"
                onClick={() => navigate("/")}>
                Home
            </Button>
        </>
    )
}

export default Login;