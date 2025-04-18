import React, { useEffect, useState } from "react";
import axios from "axios";
import './index.css';

interface MessageRendererProps {
  message: string;
}

const MessageRenderer: React.FC<MessageRendererProps> = ({ message }) => {
  const [videoInfo, setVideoInfo] = useState<any | null>(null);

  const isYouTubeURL = (url: string) =>
    /(https?:\/\/)?(www\.)?youtube\.com\/watch\?v=.+/.test(url);

  const getYouTubeVideoID = (url: string) => {
    const match = url.match(/v=([^&]+)/);
    return match ? match[1] : null;
  };

  const isImageURL = (url: string) =>
    /\.(jpeg|jpg|gif|png|webp)$/i.test(url);

  const isTikTokURL = (url: string) =>
    /(https?:\/\/)?(www\.)?tiktok\.com\/.+/.test(url);

  const isLink = (text: string) =>
    /(http|https):\/\/[^\s]+/.test(text);

  const formatEmojis = (text: string) => {
    return text
      .replace(/:heart:/g, "❤️")
      .replace(/:fire:/g, "🔥")
      .replace(/:smile:/g, "😊")
      .replace(/:sad:/g, "😢");
  };

  useEffect(() => {
    const messageParts = message.split(" ");
    const videoPart = messageParts.find((part) => isYouTubeURL(part));
    
    if (videoPart) {
      const videoId = getYouTubeVideoID(videoPart);
      if (videoId) {
        const apiKey = "AIzaSyDVt8v-MLo8Rvx4QgC-FWXuXudyRA-3Qe0"; // Substitua pela sua chave
        axios
          .get(`https://www.googleapis.com/youtube/v3/videos?id=${videoId}&key=${apiKey}&part=snippet`)
          .then((response) => {
            const videoData = response.data.items[0]?.snippet;
            if (videoData) {
              setVideoInfo({
                title: videoData.title,
                author: videoData.channelTitle,
              });
            }
          })
          .catch((error) => {
            console.error("Erro ao buscar informações do vídeo do YouTube:", error);
          });
      }
    }
  }, [message]);

  return (
    <div className="message-renderer">
      {message.split(" ").map((part, index) => {
        if (isYouTubeURL(part)) {
          const videoId = getYouTubeVideoID(part);
          return (
            <div className="youtube-frame" key={index}>
              <iframe
                width="360"
                height="215"
                src={`https://www.youtube.com/embed/${videoId}`}
                title="YouTube Video"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
              {videoInfo && (
                <div className="video-info">
                  <strong>{videoInfo.title}</strong>
                  <p>👤 {videoInfo.author}</p>
                </div>
              )}
            </div>
          );
        } else if (isTikTokURL(part)) {
          return (
            <div key={index} className="tiktok-frame">
              <iframe
                src={part}
                width="325"
                height="550"
                allow="autoplay; encrypted-media"
                allowFullScreen
              ></iframe>
            </div>
          );
        } else if (isImageURL(part)) {
          return (
            <img
              key={index}
              src={part}
              alt="Imagem"
              className="chat-image"
            />
          );
        } else if (isLink(part)) {
          return (
            <a key={index} href={part} target="_blank" rel="noopener noreferrer" className="chat-link">
              {part}
            </a>
          );
        } else {
          return <span key={index}>{formatEmojis(part)} </span>;
        }
      })}
    </div>
  );
};

export default MessageRenderer;
