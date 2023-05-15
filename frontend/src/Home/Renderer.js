import React, { useEffect, useState } from "react";
import Countdown, { zeroPad, calcTimeDelta, formatTimeDelta } from 'react-countdown';


const Renderer = ({ days, hours, minutes, seconds, completed }) => {
    return (
        <>
            <div className="lock-timer">
                <div className="time-item">
                    <div className="time-area">
                        <div className="time-content t-white fs-28">{zeroPad(days)}</div>
                    </div>
                    <div className="time-title t-white fs-16">Days</div>
                </div>
                <div className="time-spacer"></div>
                <div className="time-item">
                    <div className="time-area">
                        <div className="time-content t-white fs-28">{zeroPad(hours)}</div>
                    </div>
                    <div className="time-title t-white fs-16">Hours</div>
                </div>
                <div className="time-spacer">
                    <img src='/assets/images/time-divider.png'></img>
                </div>
                <div className="time-item">
                    <div className="time-area">
                        <div className="time-content t-white fs-28">{zeroPad(minutes)}</div>
                    </div>
                    <div className="time-title t-white fs-16">Minutes</div>
                </div>
                <div className="time-spacer">
                    <img src='/assets/images/time-divider.png'></img>
                </div>
                <div className="time-item">
                    <div className="time-area">
                        <div className="time-content t-white fs-28">{zeroPad(seconds)}</div>
                    </div>
                    <div className="time-title t-white fs-16">Seconds</div>
                </div>                 
            </div>
        </>
    );
}

export default Renderer;