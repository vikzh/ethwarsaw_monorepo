import React from "react";
import {Button} from "antd";
import { useNavigate } from "react-router-dom";
import Login from "./Login";

function Wallet() {
    const navigate = useNavigate();

    return (
        <>
            <div className="content">
                My Wallet
            </div>
        </>
    )
}

export default Wallet;