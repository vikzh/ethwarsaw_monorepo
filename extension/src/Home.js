import React from "react";
import {Button, Space} from "antd";
import { useNavigate } from "react-router-dom";
import Login from "./Login";

function Home() {
    const navigate = useNavigate();

    return (
        <>
            <Space direction="vertical" style={{ width: '100%' }}>
            <div className="content">
                <Button
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