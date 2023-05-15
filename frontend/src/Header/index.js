
import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from 'react-router-dom';
import { useAccount } from "wagmi";

function Header({ ConnectButton }) {
    const { address, isConnected } = useAccount();

    return (
        <div className="navbar marginAuto pt-20 pb-20">
            <div className="logo-banner">
                <Link to="/" className="logo ml-7">
                    <div className="logo-section">
                        <img className="logo-img" src="/assets/images/logo.svg" alt="logo" width="40" height="40" />
                    </div>
                </Link>
            </div>
            <div id="navbarBanner">
                <ConnectButton />
            </div>
        </div>
    );
}

export default Header;