import React from "react";
import {Button, Space} from "antd";
import {useNavigate} from "react-router-dom";

function Home() {
    const navigate = useNavigate();

    return (
        <>
            <Space direction="vertical" style={{width: '100%'}}>
                <div className="content">
                    <Button
                        style={{width: "100%"}}
                        className="ant-btn ant-btn-primary ant-btn-lg"
                        type="primary"
                        onClick={() => navigate("/login")}>
                        Login
                    </Button>
                </div>
            </Space>
        </>
    )
}

export default Home;