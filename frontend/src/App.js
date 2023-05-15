// ** react imports
import React, { useEffect, useState } from "react";
import { ToastContainer, toast } from 'material-react-toastify';

// ** npm module imports
import { Routes, Route } from "react-router-dom";
import { ethers } from 'ethers';
import merge from 'lodash.merge';

// ** components imports
import Header from './Header';
import Create from './Home/Create';

// ** wagmi imports
import { getDefaultWallets, RainbowKitProvider, ConnectButton, lightTheme, darkTheme } from '@rainbow-me/rainbowkit';
import { useAccount, configureChains, createClient, WagmiConfig, useNetwork } from 'wagmi';
import { zkSyncTestnet } from 'wagmi/chains';
import { alchemyProvider } from '@wagmi/core/providers/alchemy'
import { publicProvider } from '@wagmi/core/providers/public'

// ** css imports
import '@rainbow-me/rainbowkit/styles.css';
import 'material-react-toastify/dist/ReactToastify.css';
import "antd/dist/antd.css";
import './App.css';

const { chains, provider } = configureChains(
    [zkSyncTestnet],
    [
        alchemyProvider({ apiKey: 'Y4RO5waXb2A92F2h8YaQs_EduUoB5E50', weight: 1 }),
        publicProvider({ weight: 2 })
    ]
);

const { connectors } = getDefaultWallets({
    appName: 'My RainbowKit App',
    chains
});

const wagmiClient = createClient({
    autoConnect: true,
    connectors,
    provider
})

function App() {
    const { address } = useAccount();
    const { chain } = useNetwork();

    const [factoryContract, setFactoryContract] = useState('');
    const [referContract, setReferContract] = useState('');
    const [totalDeployments, setTotalDeployments] = useState([]);

    const sepoliaFactoryContract = "0x3a216D8c496011281cd851ED6803cbdbfF3450cB";
    const sepoliaReferContract = "0xacc74EcdF64Ec772eFFbfDe1Fb68b39163e58d6f";
    const mumbaiFactoryContract = "0x3a216D8c496011281cd851ED6803cbdbfF3450cB";
    const mumbaiReferContract = "0xacc74EcdF64Ec772eFFbfDe1Fb68b39163e58d6f";
    const fujiFactoryContract = "0x3a216D8c496011281cd851ED6803cbdbfF3450cB";
    const fujiReferContract = "0xacc74EcdF64Ec772eFFbfDe1Fb68b39163e58d6f";

    useEffect(() => {
        let contract1 = chain?.id == 11155111 ? sepoliaFactoryContract : chain?.id == 80001 ? mumbaiFactoryContract : chain?.id === 43113 && fujiFactoryContract;
        let contract2 = chain?.id == 11155111 ? sepoliaReferContract : chain?.id == 80001 ? mumbaiReferContract : chain?.id === 43113 && fujiReferContract;
        setFactoryContract(contract1);
        setReferContract(contract2);
    }, [chain?.id]);

    return (
        <WagmiConfig client={wagmiClient}>
            <RainbowKitProvider chains={chains} theme={merge(darkTheme({
                borderRadius: 'small'
            }),
                {
                    fonts: {
                        body: 'Bruno',
                    }
                }
            )}>

                <div className="total">
                    <Header ConnectButton={ConnectButton} />
                    <Routes>
                        <Route path="/" element={<Create />} />
                    </Routes>
                </div>
                <ToastContainer position="top-right" autoClose={3000} />
            </RainbowKitProvider>
        </WagmiConfig>
    );
}

export default App;