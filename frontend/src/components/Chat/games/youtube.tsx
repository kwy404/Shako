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
      <div>
        <iframe
          ref={iframeRef}
          title="YouTube"
          srcDoc={htmlString}
          width="100%"
          height="500px"
          frameBorder="0"
          allowFullScreen
        />
      </div>
      <button onClick={() => sendMessageToIframe('Olá, iframe!')}>Enviar mensagem para o iframe</button>
    </div>
  );
};

export default YoutubeHTMLViewer;
