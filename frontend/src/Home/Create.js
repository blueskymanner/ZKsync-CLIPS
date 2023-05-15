// ** react imports
import React, { useEffect, useState, useRef } from "react";
import { Link } from 'react-router-dom';
import { ToastContainer, toast } from 'material-react-toastify';
import Countdown, { zeroPad, calcTimeDelta, formatTimeDelta } from 'react-countdown';
import { getAccount, readContract, writeContract, fetchBalance } from '@wagmi/core'
import useMediaQuery from "@mui/material/useMediaQuery";
import { ethers } from "ethers";
import Renderer from "./Renderer.js";
import ZKclipsABI from "../abi/ZKclips.json";
import '../Style/style.css';


function Create() {
  const isMobile = useMediaQuery("(max-width: 820px)");
  const contractAddr = '0x7adc2e50cb83355D11B4B23df881bF6f0dFd9d3e';
  const { address, isConnected } = getAccount();

  const [balanceof, setBalanceof] = useState(0);
  const [clipowner, setClipowner] = useState('');
  const [prizepool, setPrizepool] = useState(0);
  const [clipcost, setClipcost] = useState(0);
  const [lastclipupdate, setLastclipupdate] = useState(0);

  const [startDate, setStartDate] = useState(Date.now());
  const handleCountdown = useRef(null);
  const handleCountStart = () => handleCountdown.current.start();

  useEffect(() => {
    handleCountStart();
  });

  const walletConnectNotify = () => toast.error(`Please connect wallet`);

  const mintClipsNotify1 = () => toast.error(`You can only mint once every 24 hours`);
  const mintClipsNotify2 = () => toast.error(`COST: INSUFFICIENT_VALUE`);
  const mintClipsNotify3 = () => toast.success(`Minted ZKclips successfully`);

  const halfMintAmtNotify1 = () => toast.error(`You can only claim CLIPS once every 12 hours since second mint`);
  const halfMintAmtNotify2 = () => toast.error(`You can't mint zero tokens`);
  const halfMintAmtNotify3 = () => toast.success(`Minted half ZKclips successfully`);

  const competeSpaceNotify1 = () => toast.error(`You are current clip owner`);
  const competeSpaceNotify2 = () => toast.error(`Insufficient CLIPS to compete for advertisement space`);
  const competeSpaceNotify3 = () => toast.success(`Competed Ad space successfully`);

  const claimPrizeNotify1 = () => toast.error(`Prize pool can be claimed if 8 hours have passed without any competition`);
  const claimPrizeNotify2 = () => toast.error(`Only the current clipOwner can claim the prize pool`);
  const claimPrizeNotify3 = () => toast.error(`You can't claim zero prize pool`);
  const claimPrizeNotify4 = () => toast.success(`Claimed prize pool successfully`);


  const balanceOf = async () => {
    const balanceof = await readContract({
      address: contractAddr,
      abi: ZKclipsABI,
      functionName: 'balanceOf',
      args: [address],
    })
    console.log("balanceof =>", Number(balanceof));
    setBalanceof(Number(balanceof) / 1e18);
  }

  const clipOwner = async () => {
    const clipowner = await readContract({
      address: contractAddr,
      abi: ZKclipsABI,
      functionName: 'clipOwner',
    })
    console.log("clipowner =>", clipowner);
    setClipowner(clipowner);
  }

  const prizePool = async () => {
    const prizepool = await readContract({
      address: contractAddr,
      abi: ZKclipsABI,
      functionName: 'prizePool',
    })
    console.log("prizepool =>", Number(prizepool));
    setPrizepool(Number(prizepool) / 1e18);
  }

  const clipCost = async () => {
    const clipcost = await readContract({
      address: contractAddr,
      abi: ZKclipsABI,
      functionName: 'clipCost',
    })
    console.log("clipcost =>", Number(clipcost));
    setClipcost(Number(clipcost) / 1e18);
  }

  const lastClipUpdate = async () => {
    const lastclipupdate = await readContract({
      address: contractAddr,
      abi: ZKclipsABI,
      functionName: 'lastClipUpdate',
    })
    console.log("lastclipupdate =>", Number(lastclipupdate));
    setLastclipupdate(Number(lastclipupdate));
  }


  const mintClips = async () => {
    if (!isConnected) {
      walletConnectNotify();
    } else {
      const currentTime = await readContract({
        address: contractAddr,
        abi: ZKclipsABI,
        functionName: 'getCurrentTime',
      })
      console.log("currentTime => ", Number(currentTime));

      const lastMintTime = await readContract({
        address: contractAddr,
        abi: ZKclipsABI,
        functionName: 'lastMintTime',
        args: [address]
      })
      console.log("lastMintTime => ", Number(lastMintTime));

      const ethBalance = await fetchBalance({
        address: address,
      })
      console.log("ethBalance => ", Number(ethBalance.value))

      const mintcost = await readContract({
        address: contractAddr,
        abi: ZKclipsABI,
        functionName: 'mintCost',
      })
      console.log("mintcost => ", Number(mintcost));

      try {
        if (Number(currentTime) < Number(lastMintTime) + 86400) {
          mintClipsNotify1();
        } else if (Number(ethBalance.value) < Number(mintcost)) {
          mintClipsNotify2();
        } else {
          await writeContract({
            address: contractAddr,
            abi: ZKclipsABI,
            functionName: 'mintClips',
            args: [
              {
                value: ethers.utils.parseEther((parseInt(mintcost) / 1e18).toString()),
              }
            ]
          }).then(async (res) => {
            const result = await res.wait();
            if (result.status === 1) {
              balanceOf();
              prizePool();
              mintClipsNotify3();
            }
          })
        }
      } catch (err) {
        console.log(err)
      }
    }
  }

  const claimHalfMint = async () => {
    if (!isConnected) {
      walletConnectNotify();
    } else {
      const currentTime = await readContract({
        address: contractAddr,
        abi: ZKclipsABI,
        functionName: 'getCurrentTime',
      })
      console.log("currentTime => ", Number(currentTime));

      const lastMintTime = await readContract({
        address: contractAddr,
        abi: ZKclipsABI,
        functionName: 'lastMintTime',
        args: [address]
      })
      console.log("lastMintTime => ", Number(lastMintTime));

      const lastHalfMintAmount = await readContract({
        address: contractAddr,
        abi: ZKclipsABI,
        functionName: 'lastHalfMintAmount',
        args: [address]
      })
      console.log("lastHalfMintAmount => ", Number(lastHalfMintAmount));

      try {
        if (Number(currentTime) < Number(lastMintTime) + 43200) {
          halfMintAmtNotify1();
        } else if (Number(lastHalfMintAmount) <= 0) {
          halfMintAmtNotify2();
        } else {
          await writeContract({
            address: contractAddr,
            abi: ZKclipsABI,
            functionName: 'claimHalfMint',
          }).then(async (res) => {
            const result = await res.wait();
            if (result.status === 1) {
              balanceOf();
              prizePool();
              halfMintAmtNotify3();
            }
          })
        }
      } catch (err) {
        console.log(err)
      }
    }
  }

  const competeSpace = async () => {
    if (!isConnected) {
      walletConnectNotify();
    } else {
      try {
        if (clipowner == address) {
          competeSpaceNotify1();
        } else if (balanceof < clipcost) {
          competeSpaceNotify2();
        } else {
          await writeContract({
            address: contractAddr,
            abi: ZKclipsABI,
            functionName: 'competeSpace',
          }).then(async (res) => {
            const result = await res.wait();
            if (result.status === 1) {
              balanceOf();
              clipOwner();
              clipCost();
              const lastclipupdateTime = await readContract({
                address: contractAddr,
                abi: ZKclipsABI,
                functionName: 'lastClipUpdate',
              })
              setStartDate(Number(lastclipupdateTime) * 1000 + 28800000);
              competeSpaceNotify3();
            }
          })
        }
      } catch (err) {
        console.log(err)
      }
    }
  }

  const claimPrizePool = async () => {
    if (!isConnected) {
      walletConnectNotify();
    } else {
      const currentTime = await readContract({
        address: contractAddr,
        abi: ZKclipsABI,
        functionName: 'getCurrentTime',
      })
      console.log("currentTime => ", Number(currentTime));

      try {
        if (Number(currentTime) < lastclipupdate + 28800) {
          claimPrizeNotify1();
        } else if (clipowner != address) {
          claimPrizeNotify2();
        } else if (prizepool <= 0) {
          claimPrizeNotify3();
        } else {
          await writeContract({
            address: contractAddr,
            abi: ZKclipsABI,
            functionName: 'claimPrizePool',
          }).then(async (res) => {
            const result = await res.wait();
            if (result.status === 1) {
              balanceOf();
              prizePool();
              clipCost();
              claimPrizeNotify4();
            }
          })
        }
      } catch (err) {
        console.log(err)
      }
    }
  }


  useEffect(() => {
    if (isConnected) {
      balanceOf();
    }
    clipOwner();
    prizePool();
    clipCost();
    lastClipUpdate();
  }, []);

  useEffect(() => {
    (async () => {
      const lastclipupdateTime = await readContract({
        address: contractAddr,
        abi: ZKclipsABI,
        functionName: 'lastClipUpdate',
      })
      setStartDate(Number(lastclipupdateTime) * 1000 + 28800000);
    })()
  }, []);


  return (
    <div className="home marginAuto pt-40 pb-40">
      <div className="countDown-section marginAuto mb-70 p-40">
        <p className="alignCenter t-family t-white fs-24">PRIZEPOOL: {prizepool} $ZKclips</p>
        <p className="alignCenter t-family t-white fs-24">Current Clip Cost: {clipcost} $ZKclips</p>
        <p className="alignCenter t-family t-white fs-24">ZKclips OWNER 👇: {clipowner && clipowner.slice(0, 4)}...{clipowner && clipowner.slice(-4)}</p>
        <h2 className="alignCenter t-family t-white fs-55">...........</h2>
        <p className="alignCenter t-family t-white fs-24">OWNER CAN CLAIM PRIZEPOOL</p>
        <div>
          <Countdown date={startDate} renderer={Renderer} ref={handleCountdown} autoStart={false} />
        </div>
      </div>

      <div className="balance">
        <p className="alignCenter t-family t-white fs-24">Balance</p>
        <p className="alignCenter t-family t-white fs-24">{balanceof} $ZKclips</p>
      </div>

      {!isMobile ?
        <div className="buttons-section mt-40 w-full">
          <button className="common-button cursorPointer t-white t-family fs-18" onClick={mintClips}>Mint ZKclips</button>
          <button className="common-button cursorPointer t-white t-family fs-18" onClick={claimHalfMint}>Claim Half Mint</button>
          <button className="common-button cursorPointer t-white t-family fs-18" onClick={competeSpace}>Compete Space</button>
          <button className="common-button cursorPointer t-white t-family fs-18" onClick={claimPrizePool}>Claim Prize Pool</button>
        </div>
        :
        <div>
          <div className="mobile-buttons-section mb-20">
            <button className="common-button cursorPointer t-white t-family fs-18" onClick={mintClips}>Mint ZKclips</button>
            <button className="common-button cursorPointer t-white t-family fs-18" onClick={claimHalfMint}>Claim Half Mint</button>
          </div>
          <div className="mobile-buttons-section">
            <button className="common-button cursorPointer t-white t-family fs-18" onClick={competeSpace}>Compete Space</button>
            <button className="common-button cursorPointer t-white t-family fs-18" onClick={claimPrizePool}>Claim Prize Pool</button>
          </div>
        </div>
      }
    </div >
  );
}

export default Create;