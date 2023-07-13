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

const typePage = "card";

declare global {
    interface Window {
        MyNamespace: any;
    }
}

function Card({ user }: any) {
    return (
        <div className="cardT">

        </div>
    );
}

export default Card;
