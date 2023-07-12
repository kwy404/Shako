import { useState, useEffect } from "react";
import './index.css';
import { Link } from "react-router-dom";

const typePage = "profile";

declare global {
    interface Window {
        MyNamespace: any;
    }
}

function Profile({ user }: any) {

    return (
        <div className="Profile">
            <div className="background">
                <div className="transparent"></div>
                <img className="cover" src="https://images.hdqwalls.com/wallpapers/reddit-cartoon-4k-io.jpg"/>
                <img className="avatar" src="https://www.redditstatic.com/avatars/avatar_default_12_545452.png"/>
            </div>
        </div>
    );
}

export default Profile;
