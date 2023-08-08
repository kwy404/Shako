import React, { useRef } from 'react';

interface Props {
  htmlString: string;
}

const YoutubeHTMLViewer: React.FC<Props> = ({ htmlString }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const sendMessageToIframe = (message: any) => {
    if (iframeRef.current) {
      iframeRef.current.contentWindow?.postMessage(message, '*');
    }
  };

  const handleIframeMessage = (event: MessageEvent) => {
    // Aqui você pode tratar as mensagens recebidas do iframe, se necessário.
    console.log('Mensagem recebida do iframe:', event.data);
  };

  // Adiciona um listener para receber mensagens do iframe.
  React.useEffect(() => {
    window.addEventListener('message', handleIframeMessage);

    // Remove o listener quando o componente é desmontado.
    return () => {
      window.removeEventListener('message', handleIframeMessage);
    };
  }, []);

  return (
    <div>
      <div className='yt--game--party'>
        
      </div>
    </div>
  );
};

export default YoutubeHTMLViewer;
