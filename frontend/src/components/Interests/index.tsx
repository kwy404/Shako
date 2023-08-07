import React, { useEffect, useState } from 'react';
import './index.css';

import { Socket } from "socket.io-client";
import { DefaultEventsMap } from 'socket.io/dist/typed-events';

interface InterestsModalProps {
  isOpen: boolean;
  socket: Socket<DefaultEventsMap, DefaultEventsMap> | null,
  emited: (data: any, type: string, socket: Socket<DefaultEventsMap, DefaultEventsMap>) => void,
}

declare global {
  interface Window {
      MyNamespace: any;
  }
}

interface Interest {
    name: string;
    popularity: number;
}  

const interestsList = [
    { name: 'Tecnologia', popularity: 100 },
    { name: 'Anime', popularity: 90 },
    { name: 'Notícias', popularity: 80 },
    { name: 'Arte', popularity: 70 },
    { name: 'Música', popularity: 95 },
    { name: 'Filmes', popularity: 85 },
    { name: 'Esportes', popularity: 75 },
    { name: 'Moda', popularity: 60 },
    { name: 'Fotografia', popularity: 50 },
    { name: 'Culinária', popularity: 65 },
    { name: 'Viagens', popularity: 70 },
    { name: 'Carros', popularity: 45 },
    { name: 'Política', popularity: 40 },
    { name: 'Literatura', popularity: 55 },
    { name: 'História', popularity: 50 },
    { name: 'Ciência', popularity: 75 },
    { name: 'Natureza', popularity: 60 },
    { name: 'Animais', popularity: 70 },
    { name: 'Dança', popularity: 40 },
    { name: 'Fitness', popularity: 80 },
    { name: 'Saúde', popularity: 85 },
    { name: 'Yoga', popularity: 65 },
    { name: 'Medicina', popularity: 70 },
    { name: 'Marketing', popularity: 50 },
    { name: 'Negócios', popularity: 60 },
    { name: 'Finanças', popularity: 55 },
    { name: 'Design', popularity: 70 },
    { name: 'Gastronomia', popularity: 80 },
    { name: 'Tatuagens', popularity: 40 },
    { name: 'Psicologia', popularity: 50 },
    { name: 'Religião', popularity: 45 },
    { name: 'Espiritualidade', popularity: 60 },
    { name: 'Astrologia', popularity: 40 },
    { name: 'Viagens Espaciais', popularity: 75 },
    { name: 'Jogos de Vídeo', popularity: 90 },
    { name: 'Cinema', popularity: 85 },
    { name: 'Séries de TV', popularity: 75 },
    { name: 'História em Quadrinhos', popularity: 50 },
    { name: 'Livros', popularity: 60 },
    { name: 'Esportes Radicais', popularity: 55 },
    { name: 'Arquitetura', popularity: 65 },
    { name: 'Educação', popularity: 70 },
    { name: 'Idiomas', popularity: 75 },
    { name: 'Voluntariado', popularity: 40 },
    { name: 'Meio Ambiente', popularity: 60 },
    { name: 'Artesanato', popularity: 50 },
    { name: 'Bem-Estar', popularity: 80 },
    { name: 'Maquiagem', popularity: 55 },
    { name: 'Decoração', popularity: 65 },
];

const InterestsModal: React.FC<InterestsModalProps> = ({ isOpen, emited, socket }) => {
  const [selectedInterests, setSelectedInterests] = useState<Interest[]>([]);

  const toggleInterest = (interest: Interest) => {
    if (selectedInterests.some(item => item.name === interest.name)) {
      setSelectedInterests(selectedInterests.filter(item => item.name !== interest.name));
    } else {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  useEffect(() => {
    const handleSave = (data: any) => {
      console.log('%c[SaveInteresse] Saved Success', 'color: purple;');
      // You might want to check the data received from the server here
      // ...

      // Emit suggestedUsers event
      if (socket) {
        emited({ token: window.localStorage.getItem('token') ?? '' }, 'suggestedUsers', socket);
      }

      setTimeout(() => {
        const interesseModal = document.querySelector('.interesse-modal') as HTMLElement | null;
        if (interesseModal) {
          interesseModal.style.display = 'none';
        }
      }, 500);
    };

    if (socket) {
      socket.on('saveInteresse', handleSave);
      return () => {
        socket.off('saveInteresse', handleSave);
      };
    }
  }, [socket, emited]);

  const save = () => {
    if (!socket) {
      return;
    }
    const interesseModalT = document.querySelector('.interesse-modal') as HTMLElement | null;
    if (interesseModalT) {
      interesseModalT.style.display = 'none';
    }    
    emited({ selectedInterests }, 'saveInteresses', socket);
  };

  return isOpen ? (
    <div className="modal-overlay interesse-modal">
      <div className="interests-modal">
        <h2>Selecione seus interesses</h2>
        <ul>
          {interestsList.map(interest => (
            <li
              key={interest.name}
              className={selectedInterests.some(item => item.name === interest.name) ? 'selected' : ''}
              onClick={() => toggleInterest(interest)}
            >
              {interest.name}
            </li>
          ))}
        </ul>
        <div className="fixed">
          <button className="close-button" onClick={() => save()}>
            Save
          </button>
        </div>
      </div>
    </div>
  ) : null;
};

export default InterestsModal;