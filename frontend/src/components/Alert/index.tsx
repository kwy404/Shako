import React from 'react';
import 'onsenui/css/onsenui.css';
import 'onsenui/css/onsen-css-components.css';

interface MyAlertDialogProps {
  open: boolean;
  message: string;
  error: string;
  setDialog: (value: boolean) => void;
}

const MyAlertDialog: React.FC<MyAlertDialogProps> = ({setDialog, open, error, message}) => {

  const handleCancel = () => {
    setDialog(false);
  };

  const handleOpenDialog = () => {
    setDialog(true);
  };

  return (
    <>
      <div className={`ons-alert-dialog ${!open ? 'ons-alert--close-e': 'ons-alert--open-e'}`} data-device-back-button-handler-id="1">
      <div className="alert-dialog-mask"></div>
      <div className={`alert-dialog  ${!open ? 'ons-alert--close': 'ons-alert--open'}`}>
        <div className="alert-dialog-container">
          <div className="alert-dialog-title">I made a mistake</div>
          <div className="alert-dialog-content">E-mail or password is not valid</div>
          <div className="alert-dialog-footer">
            <button 
            onClick={() => handleCancel()}
            className="alert-dialog-button button ons-button">
              Ok
            </button>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default MyAlertDialog;
