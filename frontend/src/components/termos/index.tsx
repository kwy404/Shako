import "./termos.css";
import React from 'react';

interface TermosDeUsoProps {
    setTermos: (value: boolean) => void;
  }

const TermosDeUso: React.FC<TermosDeUsoProps> = ({ setTermos }) => {
  return (
    <div className="container-alt">
        <div className="form-container">
            <div className="simple_form">
            <ol className="progress-tracker">
                <li className="active">
                <div className="circle"></div>
                <div className="label">Accept rules</div>
                </li>
                <li className="separator"></li>
                <li className="">
                <div className="circle"></div>
                <div className="label">Your details</div>
                </li>
            </ol>
            <h1 className="title">Some ground rules.</h1>
            <p className="lead">These are set and enforced by the Shako moderators.</p>

            <ol className="rules-list">
                <li>
                <div className="rules-list__text">Sexually explicit or violent media must be marked as sensitive when posting</div>
                </li>
                <li>
                <div className="rules-list__text">No racism, sexism, homophobia, transphobia, xenophobia, or casteism</div>
                </li>
                <li>
                <div className="rules-list__text">No incitement of violence or promotion of violent ideologies</div>
                </li>
                <li>
                <div className="rules-list__text">No harassment, dogpiling or doxxing of other users</div>
                </li>
                <li>
                <div className="rules-list__text">Do not share intentionally false or misleading information</div>
                </li>
            </ol>

            <div className="stacked-actions">
                <a className="button"
                onClick={() => setTermos(true)}
                >Accept</a>
                <br/>
                <a className="button button-tertiary" href="/">Back</a>
            </div>
            </div>
        </div>
    </div>
  );
};

export default TermosDeUso;
