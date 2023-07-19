import React, { useState } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ModalComponent: React.FC<ModalProps> = ({ isOpen, onClose }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async () => {
    // Simule um processo assíncrono, por exemplo, uma requisição ao servidor.
    setIsLoading(true);

    // Aqui você pode executar a lógica para confirmar o modal.

    setIsLoading(false);
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      top: '0px'
    }}>
      <div className='modal'>
        
      </div>
    </div>
  );
};

export default ModalComponent;
