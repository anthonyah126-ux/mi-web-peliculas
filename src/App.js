import React, { useState, useEffect } from 'react';
import './App.css';

const API_KEY = 'a490506bebca0bfddb539ef8d7b4b31c';
const BASE_URL = 'https://api.themoviedb.org/3';

function App() {
  const [movies, setMovies] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [page, setPage] = useState(1);
  const [currentFilter, setCurrentFilter] = useState({ type: 'trending', value: null });
  const [title, setTitle] = useState('Tendencias Actuales');
  const [query, setQuery] = useState('');
  const [language, setLanguage] = useState('es-ES');

  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem('pelis_favs');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('pelis_favs', JSON.stringify(favorites));
  }, [favorites]);

  const toggleFavorite = (e, movie) => {
    e.stopPropagation();
    if (favorites.find(f => f.id === movie.id)) {
      setFavorites(favorites.filter(f => f.id !== movie.id));
    } else {
      setFavorites([...favorites, movie]);
    }
  };

  useEffect(() => {
    if (query.length > 2) {
      fetch(`${BASE_URL}/search/multi?api_key=${API_KEY}&query=${query}&language=${language}&page=${page}`)
        .then(res => res.json()).then(data => setMovies(data.results || []));
    } else {
      fetchContent(currentFilter.type, currentFilter.value, page);
    }
  }, [page, currentFilter, query, language]);

  const fetchContent = (type, value, pageNum) => {
    if (type === 'favs') { 
      setMovies(favorites); 
      return; 
    }

    let url = `${BASE_URL}/trending/all/day?api_key=${API_KEY}&language=${language}&page=${pageNum}`;
    
    if (type === 'movie') url = `${BASE_URL}/movie/popular?api_key=${API_KEY}&language=${language}&page=${pageNum}`;
    if (type === 'tv') url = `${BASE_URL}/tv/popular?api_key=${API_KEY}&language=${language}&page=${pageNum}`;
    if (type === 'anime') url = `${BASE_URL}/discover/tv?api_key=${API_KEY}&with_genres=16&with_original_language=ja&language=${language}&page=${pageNum}`;
    
    if (type === 'year') {
      url = `${BASE_URL}/discover/movie?api_key=${API_KEY}&primary_release_year=${value}&language=${language}&page=${pageNum}`;
    }

    if (type === 'anime_year') {
        url = `${BASE_URL}/discover/tv?api_key=${API_KEY}&with_genres=16&with_original_language=ja&first_air_date_year=${value}&language=${language}&page=${pageNum}`;
    }

    if (type === 'genre') url = `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=${value}&language=${language}&page=${pageNum}`;

    fetch(url).then(res => res.json()).then(data => setMovies(data.results || []));
  };

  const handleFilter = (type, value, label) => {
    setQuery('');
    setPage(1);
    setSelectedMovie(null);
    window.scrollTo(0,0);

    if (type === 'year' && (currentFilter.type === 'anime' || currentFilter.type === 'anime_year')) {
        setCurrentFilter({ type: 'anime_year', value: value });
        setTitle(`Animes del ${value}`);
    } else {
        setCurrentFilter({ type, value });
        setTitle(label);
    }
  };

  return (
    <div className="app-container">
      <nav className="main-header">
        <div className="nav-content">
          <div className="logo" onClick={() => handleFilter('trending', null, 'Tendencias')}>Movie<span>-next</span></div>
          
          <div className="search-wrapper">
            <input 
              type="text" 
              placeholder="¿Qué quieres ver hoy?" 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          <div className="language-selector" style={{marginRight: '15px'}}>
            <select 
              value={language} 
              onChange={(e) => { setLanguage(e.target.value); setPage(1); }}
              style={{background: '#1a1f29', color: 'white', border: '1px solid #32b2dd', padding: '5px', borderRadius: '5px', cursor: 'pointer'}}
            >
              <option value="es-ES">Español 🇪🇸</option>
              <option value="en-US">English 🇺🇸</option>
            </select>
          </div>

          <div className="nav-menu">
            <span onClick={() => handleFilter('movie', null, 'Películas')}>Películas</span>
            <span onClick={() => handleFilter('tv', null, 'Series')}>Series</span>
            <span onClick={() => handleFilter('anime', null, 'Animes')}>Animes</span>
          </div>
        </div>
      </nav>

      {!selectedMovie ? (
        <div className="layout-body">
          <aside className="sidebar">
            <div className="sidebar-card">
              <h3 className="section-title">⭐ Favoritos</h3>
              <button className="fav-menu-btn" onClick={() => handleFilter('favs', null, 'Mis Favoritos')} style={{width: '100%', padding: '10px', marginBottom: '20px', cursor: 'pointer', background: '#ff4757', color: 'white', border: 'none', borderRadius: '5px', fontWeight: 'bold'}}>
                Ver mis {favorites.length} guardadas
              </button>

              <h3 className="section-title">📅 Estrenos</h3>
              <div className="year-grid">
                {[2026, 2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015].map(y => (
                  <button key={y} onClick={() => handleFilter('year', y, `Cine ${y}`)}>{y}</button>
                ))}
              </div>

              <h3 className="section-title" style={{marginTop:'25px'}}>🎬 Categorías</h3>
              <div className="genre-list">
                <button onClick={() => handleFilter('genre', '28', 'Acción')}>Acción</button>
                <button onClick={() => handleFilter('genre', '27', 'Terror')}>Terror</button>
                <button onClick={() => handleFilter('genre', '35', 'Comedia')}>Comedia</button>
                <button onClick={() => handleFilter('genre', '878', 'Sci-Fi')}>Sci-Fi</button>
                <button onClick={() => handleFilter('genre', '53', 'Suspenso')}>Suspenso</button>
                <button onClick={() => handleFilter('genre', '16', 'Animación')}>Animación</button>
                <button onClick={() => handleFilter('genre', '14', 'Fantasía')}>Fantasía</button>
              </div>
            </div>
          </aside>

          <main className="main-content">
            <h2 className="section-title">{query ? `Buscando: ${query}` : title}</h2>
            <div className="movie-grid">
              {movies.map(m => (
                <div key={m.id} className="movie-card" onClick={() => setSelectedMovie(m)}>
                  <div className="poster-wrapper" style={{position: 'relative'}}>
                    <img src={m.poster_path ? `https://image.tmdb.org/t/p/w342${m.poster_path}` : 'https://via.placeholder.com/342x513?text=Sin+Imagen'} alt="p" />
                    <div className="badge-fullhd">Full HD</div>
                    
                    <button 
                      className="fav-btn-card" 
                      onClick={(e) => toggleFavorite(e, m)}
                      style={{
                        position: 'absolute', top: '10px', right: '10px', 
                        background: 'rgba(0,0,0,0.6)', border: 'none', 
                        borderRadius: '50%', width: '30px', height: '30px', 
                        cursor: 'pointer', zIndex: '10', color: favorites.find(f => f.id === m.id) ? 'red' : 'white'
                      }}
                    >
                      {favorites.find(f => f.id === m.id) ? '❤️' : '🤍'}
                    </button>

                    <div 
                      className="release-badge"
                      style={{
                        position: 'absolute', bottom: '10px', left: '10px',
                        background: '#007bff', color: 'white',
                        fontSize: '11px', fontWeight: 'bold',
                        padding: '3px 8px', borderRadius: '4px',
                        zIndex: '10', textTransform: 'uppercase'
                      }}
                    >
                      📅 {(m.release_date || m.first_air_date || '2026').split('-')[0]}
                    </div>

                    <div className="card-overlay"><span>VER AHORA</span></div>
                  </div>
                  <div className="card-info">
                    <p className="movie-title">{m.title || m.name}</p>
                    <span className="movie-year">{(m.release_date || m.first_air_date || '2024').split('-')[0]}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="pagination">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)}>« Anterior</button>
              <span className="tab-active">Página {page}</span>
              <button onClick={() => setPage(p => p + 1)}>Siguiente »</button>
            </div>
          </main>
        </div>
      ) : (
        <div className="detail-view">
          <div className="video-container">
            <iframe 
              src={`https://vidsrc.xyz/embed/${selectedMovie.name ? 'tv' : 'movie'}/${selectedMovie.id}`} 
              allowFullScreen 
              title="player"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            ></iframe>
          </div>
          <div className="detail-info">
            <h1>{selectedMovie.title || selectedMovie.name}</h1>
            <p>{selectedMovie.overview || (language === 'es-ES' ? "No hay descripción disponible." : "No description available.")}</p>
            <button className="back-btn" onClick={() => setSelectedMovie(null)}>
              {language === 'es-ES' ? '← Volver al inicio' : '← Back to home'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;