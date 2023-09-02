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

            <>
                <ProFormText
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
                Login
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