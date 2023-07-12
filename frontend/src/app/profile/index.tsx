import { useState, useEffect } from "react";
import './index.css';
import { Link } from "react-router-dom";

const typePage = "profile";

declare global {
    interface Window {
        MyNamespace: any;
    }
}

import { Socket } from "socket.io-client";
import { DefaultEventsMap } from 'socket.io/dist/typed-events';

interface User {
    id: string;
    username: string;
    token: string;
    email: string;
    discrimination: string;
    avatar: string;
    bg: string;
    admin: string;
    is_activated: string;
    created_at: string;
}

interface Props {
    socket: Socket<DefaultEventsMap, DefaultEventsMap>,
    user: User,
    emited: (data: any, type: string, socket: Socket<DefaultEventsMap, DefaultEventsMap>) => void,
    params: any
}

function convertDate(dateString: string) {
    const parts = dateString.split('/');
    const month = parseInt(parts[1], 10);
    const year = parseInt(parts[2], 10);
    
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June', 
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    const monthString = months[month - 1];
    
    return `${monthString} ${year}`;
}

function Profile({ user, emited, params, socket}: any) {
    const [profile, setProfile] = useState<User>({
        id: '',
        username: '',
        token: '',
        email: '',
        discrimination: '',
        avatar: '',
        bg: '',
        admin: '',
        is_activated: '1',
        created_at: '01/01/1999'
    });
    
    const [found, setFound] = useState(false);

    useEffect(() => {
        let timeFor = setInterval(() => {
            if(socket){
                getProfileE();
                clearInterval(timeFor);
            }
        }, 1000)
    }, [params, socket, emited])

    const getProfileE = () => {
        if(params.username && params.discrimination){
            emited({username: params.username, discrimination: params.discrimination}, 'getProfile', socket)
        }
        socket.on('profile', (receive: any) => {
            setFound(receive.success);
            if(receive.user){
                setProfile(receive.user)
            }
        })
    }

    return (
        <div className="Profile">
            <div className="background">
                <div className="transparent"></div>
                <img className="cover" src="https://images.hdqwalls.com/wallpapers/reddit-cartoon-4k-io.jpg"/>
                <img className="avatar" src="https://www.redditstatic.com/avatars/avatar_default_12_545452.png"/>
            </div>
            <div className="info">
                <h3>{profile.username ? profile.username : params.username}#{profile.discrimination ? profile.discrimination : params.discrimination}</h3>
                
                { profile.username && <h3 className="gray date-info">
                    <svg viewBox="0 0 24 24" aria-hidden="true" className="date gray"><g><path d="M7 4V3h2v1h6V3h2v1h1.5C19.89 4 21 5.12 21 6.5v12c0 1.38-1.11 2.5-2.5 2.5h-13C4.12 21 3 19.88 3 18.5v-12C3 5.12 4.12 4 5.5 4H7zm0 2H5.5c-.27 0-.5.22-.5.5v12c0 .28.23.5.5.5h13c.28 0 .5-.22.5-.5v-12c0-.28-.22-.5-.5-.5H17v1h-2V6H9v1H7V6zm0 6h2v-2H7v2zm0 4h2v-2H7v2zm4-4h2v-2h-2v2zm0 4h2v-2h-2v2zm4-4h2v-2h-2v2z"></path></g></svg>
                Joined {convertDate(profile.created_at)}</h3>}

                { !found && <h1 className="notfoundprofile">This account doesn’t exist
                <h2>Try searching for another.</h2>
                </h1> }
            </div>
        </div>
    );
}

export default Profile;
