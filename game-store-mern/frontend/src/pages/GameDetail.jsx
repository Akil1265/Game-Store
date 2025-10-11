import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { gameService } from '../services/gameStoreService';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';

function GameDetail() {
  const { slug } = useParams();
  const { addItem, getItemQty } = useCart();
  const { isAuthenticated } = useAuth();
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    fetchGameDetail();
  }, [slug]);

  const fetchGameDetail = async () => {
    try {
      const gameResponse = await gameService.getGameBySlug(slug);
      const gameData = gameResponse.data;
      setGame(gameData);
      // Fetch reviews using game id
      if (gameData && gameData._id) {
        const reviewsResponse = await gameService.getGameReviews(gameData._id);
        setReviews(reviewsResponse.data.reviews || []);
      } else {
        setReviews([]);
      }
    } catch (error) {
      console.error('Error fetching game details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (game) {
      addItem(game, 1);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div className="bg-gray-300 h-96 rounded-lg"></div>
            <div className="space-y-4">
              <div className="h-8 bg-gray-300 rounded w-3/4"></div>
              <div className="h-4 bg-gray-300 rounded w-1/2"></div>
              <div className="h-6 bg-gray-300 rounded w-1/4"></div>
              <div className="h-20 bg-gray-300 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Game Not Found</h1>
          <p className="text-gray-600">The game you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Image Gallery */}
        <div>
          <div className="mb-4">
            <img
              src={game.images?.[selectedImage] || '/placeholder-game.jpg'}
              alt={game.title}
              className="w-full h-96 object-cover rounded-lg"
            />
          </div>
          {game.images && game.images.length > 1 && (
            <div className="flex space-x-2">
              {game.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`w-16 h-16 rounded border-2 ${
                    selectedImage === index ? 'border-primary-600' : 'border-gray-300'
                  }`}
                >
                  <img
                    src={image}
                    alt={`${game.title} ${index + 1}`}
                    className="w-full h-full object-cover rounded"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Game Info */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{game.title}</h1>
          
          <div className="flex items-center space-x-4 mb-4">
            <div className="text-2xl font-bold text-primary-600">₹{game.price}</div>
            <div className="flex items-center space-x-1">
              <span className="text-yellow-400">★</span>
              <span>{game.rating.avg > 0 ? game.rating.avg.toFixed(1) : 'No rating'}</span>
              <span className="text-gray-500">({game.rating.count} reviews)</span>
            </div>
          </div>

          <div className="space-y-4 mb-6">
            <div>
              <span className="font-medium text-gray-700">Platforms: </span>
              <span className="text-gray-600">{game.platform.join(', ')}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Genres: </span>
              <span className="text-gray-600">{game.genre.join(', ')}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Publisher: </span>
              <span className="text-gray-600">{game.publisher}</span>
            </div>
            {game.releaseDate && (
              <div>
                <span className="font-medium text-gray-700">Release Date: </span>
                <span className="text-gray-600">
                  {new Date(game.releaseDate).toLocaleDateString()}
                </span>
              </div>
            )}
            <div>
              <span className="font-medium text-gray-700">Stock: </span>
              <span className={`${game.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {game.stock > 0 ? `${game.stock} available` : 'Out of stock'}
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <button
              onClick={handleAddToCart}
              disabled={game.stock === 0}
              className="btn btn-primary w-full"
            >
              {game.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
            </button>
            
            {getItemQty(game._id) > 0 && (
              <p className="text-green-600 text-sm">
                ✓ {getItemQty(game._id)} item(s) in cart
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">About This Game</h2>
        <p className="text-gray-700 leading-relaxed">{game.description}</p>
      </div>

      {/* Reviews */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Reviews</h2>
        {reviews.length > 0 ? (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review._id} className="card p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">{review.user?.name}</span>
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <span
                          key={i}
                          className={`text-sm ${
                            i < review.rating ? 'text-yellow-400' : 'text-gray-300'
                          }`}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                  </div>
                  <span className="text-sm text-gray-500">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-gray-700">{review.comment}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600">No reviews yet. Be the first to review this game!</p>
        )}
      </div>
    </div>
  );
}

export default GameDetail;