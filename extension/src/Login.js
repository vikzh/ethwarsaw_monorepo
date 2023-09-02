import React from "react";
import {Button} from "antd";

function Login() {

    return (
        <>
            <div className="content">
                Login page
            </div>

            <Button
                onClick={() => navigate("/")}>
                Home
            </Button>
        </>
    )
}

export default Login;