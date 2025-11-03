import { useState, useEffect } from 'react';
import api from '../../services/api';
import rawgApi from '../../services/rawgApi';

export default function AdminImport() {
  const [stats, setStats] = useState(null);
  const [rawgGames, setRawgGames] = useState([]);
  const [importing, setImporting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);
  
  // Store edited prices for each game
  const [gamePrices, setGamePrices] = useState({});
  const [gameStock, setGameStock] = useState({});

  useEffect(() => {
    fetchStats();
    fetchRAWGGames(); // Auto-load games on mount
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get('/import/stats');
      setStats(response.data.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchRAWGGames = async (page = 1, search = '') => {
    try {
      setLoading(true);
      setMessage({ type: '', text: '' });
      
      const response = search 
        ? await rawgApi.searchGames(search, page)
        : await rawgApi.getAllGames(page, 20);
      
      setRawgGames(response.data.results || []);
      setCurrentPage(page);
      setMessage({ type: 'success', text: `Loaded ${response.data.results?.length || 0} games from RAWG!` });
      
      // Initialize default prices and stock for each game
      const prices = {};
      const stock = {};
      response.data.results?.forEach(game => {
        const calculatedPrice = game.metacritic 
          ? Math.round(game.metacritic * 0.6) 
          : Math.floor(Math.random() * 40) + 20;
        prices[game.id] = calculatedPrice;
        stock[game.id] = 50; // Default stock
      });
      setGamePrices(prices);
      setGameStock(stock);
      
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to load games from RAWG API. Please check your API key.' });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchRAWGGames(1, searchQuery);
  };

  const handlePriceChange = (gameId, value) => {
    setGamePrices(prev => ({
      ...prev,
      [gameId]: parseFloat(value) || 0
    }));
  };

  const handleStockChange = (gameId, value) => {
    setGameStock(prev => ({
      ...prev,
      [gameId]: parseInt(value) || 0
    }));
  };

  const handleImportSingle = async (rawgGame) => {
    try {
      setMessage({ type: '', text: '' });
      
      // Map RAWG game data to our schema with admin-entered price
      const gameData = {
        title: rawgGame.name,
        description: rawgGame.description_raw || `${rawgGame.name} is an exciting game with stunning graphics and engaging gameplay.`,
        price: gamePrices[rawgGame.id] || 500,
        currency: 'INR',
        images: [
          rawgGame.background_image,
          rawgGame.background_image_additional
        ].filter(Boolean),
        platform: rawgGame.platforms 
          ? rawgGame.platforms.map(p => p.platform.name).slice(0, 3) 
          : ['PC'],
        genre: rawgGame.genres 
          ? rawgGame.genres.map(g => {
              const genreMapping = {
                'Action': 'Action',
                'Adventure': 'Adventure',
                'RPG': 'RPG',
                'Strategy': 'Strategy',
                'Shooter': 'Shooter',
                'Puzzle': 'Puzzle',
                'Racing': 'Racing',
                'Sports': 'Sports',
                'Simulation': 'Simulation',
                'Fighting': 'Fighting',
                'Indie': 'Indie'
              };
              return genreMapping[g.name] || 'Action';
            }).slice(0, 3)
          : ['Action'],
        publisher: rawgGame.publishers && rawgGame.publishers.length > 0 
          ? rawgGame.publishers[0].name 
          : 'Unknown Publisher',
        releaseDate: rawgGame.released ? new Date(rawgGame.released) : new Date(),
        stock: gameStock[rawgGame.id] || 50,
        rating: {
          average: rawgGame.rating || 0,
          count: rawgGame.ratings_count || 0
        },
        rawgId: rawgGame.id
      };

      // Create game in database
      const response = await api.post('/games', gameData);
      
      setMessage({ type: 'success', text: `✅ ${rawgGame.name} added successfully at ₹${gamePrices[rawgGame.id]}!` });
      
      // Remove from list after import
      setRawgGames(prev => prev.filter(g => g.id !== rawgGame.id));
      
      // Refresh stats
      await fetchStats();
      
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || `Failed to import ${rawgGame.name}. It might already exist.` 
      });
    }
  };

  const handleBulkImport = async () => {
    setImporting(true);
    let imported = 0;
    let failed = 0;

    for (const game of rawgGames) {
      try {
        await handleImportSingle(game);
        imported++;
        await new Promise(resolve => setTimeout(resolve, 500)); // Delay between imports
      } catch (error) {
        failed++;
      }
    }

    setMessage({ 
      type: 'success', 
      text: `Bulk import complete! ${imported} imported, ${failed} failed.` 
    });
    setImporting(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Import Games from RAWG API</h1>

      {/* Stats Section */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Total Games</h3>
            <p className="text-3xl font-bold text-gray-900">{stats.totalGames}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Imported from RAWG</h3>
            <p className="text-3xl font-bold text-blue-600">{stats.importedFromRawg}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Manually Added</h3>
            <p className="text-3xl font-bold text-green-600">{stats.manuallyAdded}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Import %</h3>
            <p className="text-3xl font-bold text-purple-600">{stats.importPercentage}%</p>
          </div>
        </div>
      )}

      {/* Search and Controls */}
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Search games on RAWG... (e.g., GTA, Minecraft, Cyberpunk)"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleSearch}
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? 'Loading...' : 'Search'}
          </button>
          <button
            onClick={() => fetchRAWGGames(1, '')}
            disabled={loading}
            className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:bg-gray-400"
          >
            Load Popular
          </button>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 p-4 rounded-md">
          <h3 className="font-semibold text-blue-900 mb-2">📝 How to Import Games:</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Get your free API key from <a href="https://rawg.io/apidocs" target="_blank" rel="noopener noreferrer" className="underline font-semibold">rawg.io/apidocs</a></li>
            <li>• Add it to backend .env: <code className="bg-blue-100 px-1">RAWG_API_KEY=your_key_here</code></li>
            <li>• Search or load popular games</li>
            <li>• <strong>Edit the price and stock</strong> for each game</li>
            <li>• Click "Add to Store" to import individual games</li>
            <li>• Games will appear on your website immediately!</li>
          </ul>
        </div>
      </div>

      {/* Message Display */}
      {message.text && (
        <div className={`p-4 rounded-md mb-6 ${
          message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
        }`}>
          {message.text}
        </div>
      )}

      {/* Games Grid */}
      {rawgGames.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">
              Available Games ({rawgGames.length})
            </h2>
            {rawgGames.length > 0 && (
              <button
                onClick={handleBulkImport}
                disabled={importing}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400"
              >
                {importing ? 'Importing All...' : `Import All ${rawgGames.length} Games`}
              </button>
            )}
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {rawgGames.map((game) => (
              <div key={game.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                <div className="flex gap-4">
                  {game.background_image && (
                    <img 
                      src={game.background_image} 
                      alt={game.name}
                      className="w-32 h-24 object-cover rounded"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-1">{game.name}</h3>
                    <div className="flex gap-2 mb-2">
                      {game.rating && (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">
                          ⭐ {game.rating}
                        </span>
                      )}
                      {game.metacritic && (
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                          🎮 {game.metacritic}
                        </span>
                      )}
                      {game.released && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded">
                          📅 {game.released}
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2 flex-wrap mb-2">
                      {game.genres?.slice(0, 3).map(g => (
                        <span key={g.id} className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">
                          {g.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Price and Stock Input Section */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Price (₹)
                      </label>
                      <input
                        type="number"
                        value={gamePrices[game.id] || ''}
                        onChange={(e) => handlePriceChange(game.id, e.target.value)}
                        placeholder="Enter price"
                        min="0"
                        step="50"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Stock
                      </label>
                      <input
                        type="number"
                        value={gameStock[game.id] || ''}
                        onChange={(e) => handleStockChange(game.id, e.target.value)}
                        placeholder="Stock"
                        min="0"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <button
                    onClick={() => handleImportSingle(game)}
                    className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 font-medium transition"
                  >
                    💾 Add to Store (₹{gamePrices[game.id] || 0})
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="mt-6 flex justify-center gap-2">
            <button
              onClick={() => fetchRAWGGames(currentPage - 1, searchQuery)}
              disabled={currentPage === 1 || loading}
              className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 disabled:opacity-50"
            >
              ← Previous
            </button>
            <span className="px-4 py-2 bg-gray-100 rounded-md">
              Page {currentPage}
            </span>
            <button
              onClick={() => fetchRAWGGames(currentPage + 1, searchQuery)}
              disabled={loading}
              className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 disabled:opacity-50"
            >
              Next →
            </button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && rawgGames.length === 0 && (
        <div className="bg-white p-12 rounded-lg shadow text-center">
          <div className="text-6xl mb-4">🎮</div>
          <h3 className="text-xl font-semibold mb-2">No Games Loaded</h3>
          <p className="text-gray-600 mb-4">
            Click "Load Popular" to see trending games or search for specific titles
          </p>
          <button
            onClick={() => fetchRAWGGames(1, '')}
            className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Load Popular Games
          </button>
        </div>
      )}
    </div>
  );
}
