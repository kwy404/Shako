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
            
        </div>
    );
}

export default Profile;
