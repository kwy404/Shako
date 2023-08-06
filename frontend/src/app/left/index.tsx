import { useState, useEffect, ReactNode } from "react";
import 'onsenui/css/onsenui.css';
import 'onsenui/css/onsen-css-components.css';
import './index.css';
import { Link } from "react-router-dom";

const typePage = "header";

declare global {
    interface Window {
        MyNamespace: any;
    }
}

interface LeftProps {
    user: any;
}

function Left({ user, children }: React.PropsWithChildren<LeftProps>) {
    return (
        <div className="Left">
            <div className="cardT">
                {children}
            </div>
        </div>
    );
}

export default Left;
