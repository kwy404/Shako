import React, { useState, useEffect } from 'react';
import { Socket } from 'socket.io-client';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import './index.css';

interface Gif {
  id: string;
  url: string;
}

interface Props {
  socket: Socket<DefaultEventsMap, DefaultEventsMap> | null;
  emited: (data: any, type: string, socket: Socket<DefaultEventsMap, DefaultEventsMap>) => void;
  selectUserId: string;
  setGifOpen: (data: any) => void;
}

const GifSelector = ({ socket, emited, selectUserId, setGifOpen }: Props) => {
  const [gifs, setGifs] = useState<Gif[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [presetUrls, setPresetUrls] = useState<string[]>([]);
  const [searchResults, setSearchResults] = useState<Gif[]>([]);
  const [cachedGifs, setCachedGifs] = useState<{ [query: string]: Gif[] }>({});

  const API_KEY = 'R5ThJWeA3Hs6FhqupCRNpIOr9zG6L3ue';
  const API_URL = `https://api.giphy.com/v1/gifs/search?api_key=${API_KEY}`;

  // Helper function to store data in localStorage
  const storeInLocalStorage = (key: string, data: any) => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error('Error storing data in localStorage:', error);
    }
  };

  // Helper function to retrieve data from localStorage
  const getFromLocalStorage = (key: string) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('Error retrieving data from localStorage:', error);
      return null;
    }
  };

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
    // Fetch preset URLs from localStorage if available
    const cachedPresetUrlsFromStorage = getFromLocalStorage('cachedPresetUrls');
    if (cachedPresetUrlsFromStorage) {
      setPresetUrls(cachedPresetUrlsFromStorage as string[]);
    } else {
      fetchPresetUrls();
    }

    // Fetch preset GIFs from localStorage if available
    const cachedGifsFromStorage = getFromLocalStorage('cachedGifs');
    if (cachedGifsFromStorage) {
      setCachedGifs(cachedGifsFromStorage as { [query: string]: Gif[] });
    } else {
      fetchPresetGifs();
    }
  }, []);

  const fetchPresetUrls = async () => {
    try {
      const presetUrlsFromCache: { [preset: string]: string } = {};
      await Promise.all(
        presetGifs.map(async (preset) => {
          const response = await fetch(`${API_URL}&q=${preset}&limit=1`);
          const data = await response.json();
          const gif = data.data[0];
          const url = gif ? gif.images.fixed_height.url : '';
          presetUrlsFromCache[preset] = url;
        })
      );

      setPresetUrls(presetGifs.map((preset) => presetUrlsFromCache[preset]));

      // Store preset URLs in localStorage
      storeInLocalStorage('cachedPresetUrls', presetUrlsFromCache);
    } catch (error) {
      console.error('Error fetching preset GIF URLs:', error);
    }
  };

  const fetchPresetGifs = async () => {
    try {
      const gifsFromCache: { [query: string]: Gif[] } = {};
      await Promise.all(
        presetGifs.map(async (preset) => {
          const response = await fetch(`${API_URL}&q=${preset}&limit=1`); // Limit to 1 GIF only
          const data = await response.json();
          const gif = data.data[0];
          const url = gif ? gif.images.fixed_height.url : '';
          gifsFromCache[preset] = [{ id: gif.id, url }]; // Store as an array with a single GIF
        })
      );

      setCachedGifs(gifsFromCache);

      // Store preset GIFs in localStorage
      storeInLocalStorage('cachedGifs', gifsFromCache);
    } catch (error) {
      console.error('Error fetching preset GIFs:', error);
    }
  };

  const fetchGifsSearch = async (query: string) => {
    try {
      const response = await fetch(`${API_URL}&q=${query}&limit=10`);
      const data = await response.json();
      const gifs = data.data.map((gif: any) => ({
        id: gif.id,
        url: gif.images.fixed_height.url,
      }));
      setSearchResults(gifs);
    } catch (error) {
      console.error('Error fetching GIFs:', error);
    }
  };

  const generateToken = (length: number) => {
    const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890';
    let token = '';
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      token += characters[randomIndex];
    }
    return token;
  };

  const handleGifClick = (url: string) => {
    if (!socket) {
      return;
    }
    emited(
      {
        usernameId: selectUserId,
        type: 'chatMessage',
        token: window.localStorage.getItem('token') || '',
        message: `${url.split('.gif?')[0]}.gif`,
        id: generateToken(20),
      },
      'chatContainer',
      socket
    );
    setGifOpen(false);
  };

  return (
    <div className="gif-selector">
      <input
        type="text"
        placeholder="Pesquisar GIFs..."
        value={searchQuery}
        onChange={(e) => {
          setSearchQuery(e.target.value);
          fetchGifsSearch(e.target.value);
        }}
      />
      {searchQuery.trim().length === 0 && getFromLocalStorage('cachedPresetUrls') && (
        <div className="preset-options gifs">
          {presetGifs.map((preset, index) => (
            <div className="gift" key={preset}>
              <div
                onClick={() => {
                  setSearchQuery(preset);
                  fetchGifsSearch(preset);
                }}
                className="overlaygif"
              >
                <span>{preset}</span>
              </div>
              <img src={getFromLocalStorage('cachedPresetUrls')[preset]} alt={preset} onClick={() => handleGifClick(presetUrls[index])} />
            </div>
          ))}
        </div>
      )}
      <div className="gifs">
        {searchQuery.trim().length > 0
          ? searchResults.map((gif) => (
              <img key={gif.id} src={gif.url} alt="GIF" onClick={() => handleGifClick(gif.url)} />
            ))
          : gifs.map((gif) => (
              <img key={gif.id} src={gif.url} alt="GIF" onClick={() => handleGifClick(gif.url)} />
            ))}
      </div>
    </div>
  );
};

export default GifSelector;
