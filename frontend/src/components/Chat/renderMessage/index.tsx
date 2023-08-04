import React, { useEffect, useState } from "react";
import axios from "axios";
import './index.css';

interface MessageRendererProps {
  message: string;
}

const MessageRenderer: React.FC<MessageRendererProps> = ({ message }) => {
  const [videoInfo, setVideoInfo] = useState<any | null>(null);

  // Função auxiliar para verificar se o link é do YouTube
  const isYouTubeURL = (url: string) => {
    return url.match(/(https?:\/\/)?(www\.)?youtube\.com\/watch\?v=.+/) != null;
  };

  // Função auxiliar para extrair o ID do vídeo do link do YouTube
  const getYouTubeVideoID = (url: string) => {
    const match = url.match(/(https?:\/\/)?(www\.)?youtube\.com\/watch\?v=([^&]+)/);
    return match ? match[3] : null;
  };

  // Função auxiliar para verificar se a mensagem contém uma URL de imagem
  const isImageURL = (url: string) => {
    return url.match(/\.(jpeg|jpg|gif|png|webp)$/) != null;
  };

  // Função auxiliar para verificar se a mensagem contém um link
  const isLink = (text: string) => {
    return text.match(/(http|https):\/\/[^\s]+/) != null;
  };

  useEffect(() => {
    const messageParts = message.split(" ");
    const videoPart = messageParts.find((part) => isYouTubeURL(part));

    if (videoPart) {
      const videoId = getYouTubeVideoID(videoPart);
      if (videoId) {
        const apiKey = "AIzaSyDVt8v-MLo8Rvx4QgC-FWXuXudyRA-3Qe0"; // Substitua pela sua própria chave de API do YouTube Data V3
        axios
          .get(`https://www.googleapis.com/youtube/v3/videos?id=${videoId}&key=${apiKey}&part=snippet`)
          .then((response) => {
            const videoData = response.data.items[0].snippet;
            setVideoInfo({
              title: videoData.title,
              author: videoData.channelTitle,
            });
          })
          .catch((error) => {
            console.error("Erro ao buscar informações do vídeo do YouTube:", error);
          });
      }
    }
  }, [message]);

  return (
    <>
      {message.split(" ").map((part, index) => {
        if (isYouTubeURL(part)) {
          const videoId = getYouTubeVideoID(part);
          return (
            <div className="youtube-frame" key={index}>
              <iframe
                width="560"
                height="315"
                src={`https://www.youtube.com/embed/${videoId}`}
                title="YouTube Video"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
              {videoInfo && (
                <div className="info">
                  <p>{videoInfo.title}</p>
                  <p>By: {videoInfo.author}</p>
                </div>
              )}
            </div>
          );
        } else if (isImageURL(part)) {
          return <img key={index} src={part} alt="Imagem" style={{ maxWidth: "100px", maxHeight: "100px" }} />;
        } else if (isLink(part)) {
          return (
            <a key={index} href={part} target="_blank" rel="noopener noreferrer">
              {part}
            </a>
          );
        } else {
          return <span key={index}>{part}</span>;
        }
      })}
    </>
  );
};

export default MessageRenderer;