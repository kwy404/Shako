import { useState, useEffect } from "react";
// Webpack CSS import
import 'onsenui/css/onsenui.css';
import 'onsenui/css/onsen-css-components.css';
import './index.css';
import expand_icon from "../../resources/images/expandgrey.png"
import bell_icon from "../../resources/images/bell.png"
import chat_icon from "../../resources/images/chat.png"
import search_icon from "../../resources/images/search.svg";

import { Link } from "react-router-dom";

const typePage = "header";

declare global {
    interface Window {
        MyNamespace: any;
    }
}

function Left({ user }: any) {
    return (
        <div className="Left">
            <div className="cardT">

            </div>
        </div>
    );
}

export default Left;
