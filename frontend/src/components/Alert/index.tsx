import React, { useState } from 'react';
import { AlertDialog, Button } from 'react-onsenui';

const MyAlertDialog: React.FC = (props:any) => {
  const handleCancel = () => {
    props?.setDialog(false);
  };

  const handleOpenDialog = () => {
    props?.setDialog(true);
  };

  return (
    <>
      <AlertDialog isOpen={props?.open} onCancel={handleCancel} cancelable>
        <div className="alert-dialog-title">{props?.error}</div>
        <div className="alert-dialog-content">{props?.message}</div>
        <div className="alert-dialog-footer">
          <Button onClick={handleCancel} className="alert-dialog-button">
            Ok
          </Button>
        </div>
      </AlertDialog>
    </>
  );
};

export default MyAlertDialog;
