import { useState, useEffect } from 'react'
import MyAlertDialog from "../../components/Alert";

import {
  Link
} from "react-router-dom"

const typePage = 'login'

const ws = new WebSocket('ws://localhost:9000/ws/login')

function getRandomChoicePhoto() {
  const choices = ['geek', 'anime', 'photo', 'cinema', 'error', 'space'];
  const randomIndex = Math.floor(Math.random() * choices.length);
  return choices[randomIndex];
}

const randPhoto = getRandomChoicePhoto();

function Login(props: any) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(false);
    const [message, setMessage] = useState('');
    const [dialog, setDialog] = useState(true);

    useEffect(() => {
        ws.onmessage = (evt: any) => {
        // listen to data sent from the websocket server
          const message = JSON.parse(evt.data)
          if(message.type === typePage){
            if(!message?.noMessageError){
              setError(!message.sucess)
              setDialog(true)
              setMessage(message.message)
            }
            if(message.user?.id){
              window.localStorage.setItem('token', message.user.token)
              props.setLogged(message.user)
            } 
          } else if(message.type == 'validateToken'){
            //Validate token and logged if sucess
            const data = {type: 'validationToken', data: {token: window.localStorage.getItem('token')?window.localStorage.getItem('token'): 'undefined'}};
            ws.send(stringy(data))
          }
        }
    }, []);
  
    const stringy = (json: object) => {
      return JSON.stringify(json)
    }
  
    return (
      <>
        <img className='background--image' src={`https://source.unsplash.com/random/1920%C3%971080/?${randPhoto}`}/>
        { error && <MyAlertDialog open={dialog} message={message} error="I made a mistake" setDialog={setDialog}/> }
        <div className="App">
          <div className="login-container">
            <div className={`login-box ${(error ? 'error': '')}`}>
              <form
              onSubmit={(e: any) => {
                e.preventDefault();
                const data = {type: 'userLogin', data: {email, password}};
                ws.send(stringy(data))
              }}
              >
                <div className="login-box-content">
                  <h1 className="title">Welcome back!</h1>
                  <h4 className="subtitle">We're so excited to see you again!</h4>
                  <label htmlFor="email">E-mail</label>
                  <input 
                  onKeyUp={(e) => setEmail((e.target as any).value)}
                  type="text" id="email" autoComplete="off"/>
                  <label htmlFor="password">Password</label>
                  <input 
                  onKeyUp={(e) => setPassword((e.target as any).value)}
                  type="password" id="password"/>
                  <span className='error'>{ error && message }</span>
                  { props.registerSucess && <h4 className="error subtitle" style={{
                    color: "#74da7285",
                    fontSize: '14px',
                    left: '25px',
                    position: 'relative',
                    userSelect: 'none'
                  }}>Registration done successfully, login above using the same credentials.</h4>}
                  <p><a className="register" href="#">Forgot your password?</a></p>
                  <button>Login</button>
                  <p>Need an account? <Link 
                    to={'/register'}
                    className="register">Register</Link></p>
                </div>
              </form>
            </div>
        </div>
        </div>
      </>
    )
}

export default Login