const axios = require('axios');

class RawgService {
  constructor() {
    this.baseURL = 'https://api.rawg.io/api';
    this.apiKey = process.env.RAWG_API_KEY;
  }

  /**
   * Fetch games from RAWG API
   * @param {Object} options - Search options
   * @param {number} options.page - Page number (default: 1)
   * @param {number} options.pageSize - Number of results per page (default: 20, max: 40)
   * @param {string} options.search - Search query
   * @param {string} options.ordering - Order results (e.g., '-rating', '-released', 'name')
   * @returns {Promise<Object>} RAWG API response
   */
  async fetchGames(options = {}) {
    try {
      const params = {
        key: this.apiKey,
        page: options.page || 1,
        page_size: options.pageSize || 20,
        ...options
      };

      const response = await axios.get(`${this.baseURL}/games`, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching games from RAWG:', error.message);
      throw new Error(`Failed to fetch games from RAWG API: ${error.message}`);
    }
  }

  /**
   * Fetch single game details from RAWG API
   * @param {number} gameId - RAWG game ID
   * @returns {Promise<Object>} Game details
   */
  async fetchGameDetails(gameId) {
    try {
      const response = await axios.get(`${this.baseURL}/games/${gameId}`, {
        params: { key: this.apiKey }
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching game details from RAWG (ID: ${gameId}):`, error.message);
      throw new Error(`Failed to fetch game details: ${error.message}`);
    }
  }

  /**
   * Map RAWG game data to our Game model schema
   * @param {Object} rawgGame - Game data from RAWG API
   * @returns {Object} Mapped game data for our schema
   */
  mapToGameSchema(rawgGame) {
    // Extract platforms
    const platforms = rawgGame.platforms 
      ? rawgGame.platforms.map(p => p.platform.name).slice(0, 3) 
      : ['PC'];

    // Extract genres (map to our enum)
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
      'Horror': 'Horror',
      'Platformer': 'Platformer',
      'MMO': 'MMO',
      'VR': 'VR',
      'Indie': 'Indie'
    };

    const genres = rawgGame.genres 
      ? rawgGame.genres.map(g => genreMapping[g.name] || 'Action').slice(0, 3)
      : ['Action'];

    // Extract images
    const images = [
      rawgGame.background_image,
      rawgGame.background_image_additional
    ].filter(Boolean);

    // Calculate price based on rating (for demo purposes)
    const basePrice = rawgGame.metacritic 
      ? Math.round(rawgGame.metacritic * 0.6) 
      : Math.floor(Math.random() * 40) + 20;

    return {
      title: rawgGame.name,
      description: rawgGame.description_raw || `${rawgGame.name} is an exciting game with stunning graphics and engaging gameplay.`,
      price: basePrice,
      currency: 'USD',
      images: images.length > 0 ? images : ['https://via.placeholder.com/800x600?text=' + encodeURIComponent(rawgGame.name)],
      platform: platforms,
      genre: genres,
      publisher: rawgGame.publishers && rawgGame.publishers.length > 0 
        ? rawgGame.publishers[0].name 
        : 'Unknown Publisher',
      releaseDate: rawgGame.released ? new Date(rawgGame.released) : new Date(),
      stock: Math.floor(Math.random() * 50) + 10,
      rating: {
        average: rawgGame.rating || 0,
        count: rawgGame.ratings_count || 0
      },
      rawgId: rawgGame.id // Store RAWG ID to avoid duplicates
    };
  }

  /**
   * Fetch detailed game information (includes description)
   * @param {number} gameId - RAWG game ID
   * @returns {Promise<Object>} Mapped game data
   */
  async fetchAndMapGame(gameId) {
    const gameDetails = await this.fetchGameDetails(gameId);
    return this.mapToGameSchema(gameDetails);
  }
}

module.exports = new RawgService();
