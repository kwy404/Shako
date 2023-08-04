import React, { useState, useEffect } from 'react';
import './index.css';

interface Gif {
  id: string;
  url: string;
}

const GifSelector: React.FC = () => {
  const [gifs, setGifs] = useState<Gif[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>(''); // State to store search query
  const [presetUrls, setPresetUrls] = useState<string[]>([]); // State to store preset GIF URLs
  // Coloque a sua chave de API do Giphy aqui
  const API_KEY = 'R5ThJWeA3Hs6FhqupCRNpIOr9zG6L3ue';
  const API_URL = `https://api.giphy.com/v1/gifs/search?api_key=${API_KEY}`;

  // Preset GIF options
  const presetGifs = [
    'felicidade',
    'aww',
    'demais',
    'toca aqui',
    'moon',
    'amor',
    'chorando',
    'sim',
    'não',
    'animado',
    'tchau',
    'desculpa',
    'naruto',
    'meme',
    'anime',
    'feliz',
    'triste',
    'surpreso',
    'alegre',
    'sério',
    'assustado',
    'bravo',
    'envergonhado',
    'boa noite',
  ];

  useEffect(() => {
    // Fetch the first GIF for each preset and store the URLs in state
    const fetchPresetUrls = async () => {
      const urls = await Promise.all(
        presetGifs.map(async (preset) => {
          const response = await fetch(`${API_URL}&q=${preset}&limit=10`);
          const data = await response.json();
          const gif = data.data[0];
          return gif ? gif.images.fixed_height.url : '';
        })
      );
      setPresetUrls(urls);
    };

    fetchPresetUrls();
  }, []);

  // Function to fetch GIFs from Giphy
  const fetchGifs = async (query: string) => {
    try {
      const response = await fetch(`${API_URL}&q=${query}&limit=1`); // Limit to one GIF
      const data = await response.json();
      const gifs = data.data.map((gif: any) => ({
        id: gif.id,
        url: gif.images.fixed_height.url,
      }));
      setGifs(gifs);
      setSearchQuery(query); // Set the search query when preset is clicked
    } catch (error) {
      console.error('Error fetching GIFs:', error);
    }
  };

  // Function to handle GIF click and set as search query
  const handleGifClick = (url: string) => {
    //Emited message
  };

  return (
    <div 
    className="gif-selector">
      <input
        type="text"
        placeholder="Pesquisar GIFs..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      {searchQuery.trim().length === 0 && (
        <div className="preset-options gifs">
          {presetGifs.map((preset, index) => (
            <div className="gift">
                <div
                onClick={() => fetchGifs(preset)}
                className="overlaygif">
                    <span>{preset}</span>
                </div>
                <img
                key={preset}
                src={presetUrls[index]}
                alt={preset}
                />
            </div>
          ))}
        </div>
      )}
      <div className="gifs">
        {gifs.map((gif) => (
          <img
            key={gif.id}
            src={gif.url}
            alt="GIF"
            onClick={() => handleGifClick(gif.url)}
          />
        ))}
      </div>
    </div>
  );
};

export default GifSelector;
