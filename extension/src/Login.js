import React from "react";
import {Button} from "antd";
import {ethers} from "ethers";
import {useNavigate} from "react-router-dom";
import {useState} from "react";
import {
    AlipayCircleOutlined,
    LockOutlined,
    MobileOutlined,
    TaobaoCircleOutlined,
    UserOutlined,
    WeiboCircleOutlined,
} from '@ant-design/icons';
import {
    LoginForm,
    ProConfigProvider,
    ProFormCaptcha,
    ProFormCheckbox,
    ProFormText,
} from '@ant-design/pro-components';
import {connectToSmartWallet} from './services/wallet-service';
import {connectToSmartWallet as connectToSmartWalletAbstract} from './abstract';
import useAbstract from './useAbstract';
import { ThirdwebSDK } from "@thirdweb-dev/react";
import {Mumbai} from "@thirdweb-dev/chains";

function Login({setWallet, setSeedPhrase}) {
    const [newSeedPhrase, setNewSeedPhrase] = useState(null);
    const [username, setUsername] = useState(null);
    const [password, setPassword] = useState(null);
    const [processing, setProcessing] = useState(false);
    const { connectToSmartWallet, executeERC20 } = useAbstract();
    const navigate = useNavigate();
    async function generateWallet() {
        setProcessing(true);
        const testMnemonic = connectToSmartWallet('viktor', 'someLongPassword123');
        try {
            const walletAddress = await connectToSmartWalletAbstract(username, password);
            console.log('walletAdress', walletAddress);
            setWallet(walletAddress);
            setNewSeedPhrase('added');
            setSeedPhrase('added');

            navigate("/mywallet");
        } catch (error)
        {
            alert(error)
        } finally {
            setProcessing(false);
        }
    }


    return (
        <>

            <>
                <ProFormText
                    onChange={e => setUsername(e.target.value)}
                    name="username"
                    fieldProps={{
                        size: 'large',
                        prefix: <UserOutlined className={'prefixIcon'} />,
                    }}
                    placeholder={'username'}
                    rules={[
                        {
                            required: true,
                            message: 'user name is required!',
                        },
                    ]}
                />
                <ProFormText.Password
                    onChange={e => setPassword(e.target.value)}
                    name="password"
                    fieldProps={{
                        size: 'large',
                        prefix: <LockOutlined className={'prefixIcon'} />,
                    }}
                    placeholder={'password'}
                    rules={[
                        {
                            required: true,
                            message: 'password is required！',
                        },
                    ]}
                />
            </>
            <Button
                style={{width: "100%"}}
                className="ant-btn ant-btn-primary ant-btn-lg"
                onClick={() => generateWallet()}
                type="primary">
                {processing ? "Loading..." : "Login"}
            </Button>
            <Button
                style={{marginTop: "25px"}}
                type="text"
                onClick={() => navigate("/")}>
                ⬅ Home
            </Button>
        </>
    )
}

export default Login;