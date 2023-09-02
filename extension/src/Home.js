import React from "react";
import {Button} from "antd";
import { useNavigate } from "react-router-dom";
import Login from "./Login";

function Home() {
    const navigate = useNavigate();

    return (
        <>
            <div className="content">
                <Button
                    type="primary"
                    onClick={() => navigate("/login")}>
                        Login
                </Button>
            </div>
        </>
    )
}

export default Home;