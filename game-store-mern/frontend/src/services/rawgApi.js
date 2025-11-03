import axios from "axios";

const key = "18d8dc115d954615a6fe8522598e8a97";

const axiosCreate = axios.create({
  baseURL: 'https://api.rawg.io/api'
});

// Get list of all games with pagination
const getAllGames = (page = 1, pageSize = 20) => 
  axiosCreate.get(`/games?key=${key}&page=${page}&page_size=${pageSize}`);

// Get game details by ID
const getGameById = (id) => 
  axiosCreate.get(`/games/${id}?key=${key}`);

// Get games by genre
const getGamesByGenre = (genreId, page = 1) => 
  axiosCreate.get(`/games?key=${key}&genres=${genreId}&page=${page}`);

// Get list of genres
const getGenreList = () => 
  axiosCreate.get(`/genres?key=${key}`);

// Search games
const searchGames = (query, page = 1) => 
  axiosCreate.get(`/games?key=${key}&search=${query}&page=${page}`);

// Get games by platform
const getGamesByPlatform = (platformId, page = 1) => 
  axiosCreate.get(`/games?key=${key}&platforms=${platformId}&page=${page}`);

// Get list of platforms
const getPlatformList = () => 
  axiosCreate.get(`/platforms?key=${key}`);

export default {
  getAllGames,
  getGameById,
  getGamesByGenre,
  getGenreList,
  searchGames,
  getGamesByPlatform,
  getPlatformList
};
