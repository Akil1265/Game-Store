import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { gameService } from '../services/gameStoreService';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { pickGameImage, resolveImageUrl } from '../utils/image';

function GameDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { addItem, getItemQty } = useCart();
  const { isAuthenticated, user } = useAuth();
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [reviewMsg, setReviewMsg] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [displayImages, setDisplayImages] = useState([]);
  const [actionMessage, setActionMessage] = useState(null);

  useEffect(() => {
    fetchGameDetail();
  }, [slug]);

  const fetchGameDetail = async () => {
    try {
      setLoading(true);
      const gameResponse = await gameService.getGameBySlug(slug);
      const gameData = gameResponse.data;
      setGame(gameData);
      setSelectedImage(0);
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

  const isPlayerAccount = isAuthenticated && user?.role === 'USER';

  const handleAddToCart = () => {
    if (!game) return;

    if (!isAuthenticated) {
      setActionMessage({ type: 'error', text: 'Please sign in to add this game to your cart.' });
      navigate('/login', { state: { from: location } });
      return;
    }

    if (!isPlayerAccount) {
      setActionMessage({ type: 'error', text: 'Only player accounts can purchase games.' });
      return;
    }

    if ((game?.stock ?? 0) === 0) {
      setActionMessage({ type: 'error', text: 'This game is currently out of stock.' });
      return;
    }

    addItem(game, 1);
    setActionMessage({ type: 'success', text: 'Added to your cart.' });
  };

  const handleInstantBuy = () => {
    if (!game) return;

    if (!isAuthenticated) {
      setActionMessage({ type: 'error', text: 'Please sign in to purchase instantly.' });
      navigate('/login', { state: { from: location } });
      return;
    }

    if (!isPlayerAccount) {
      setActionMessage({ type: 'error', text: 'Only player accounts can purchase games.' });
      return;
    }

    if ((game?.stock ?? 0) === 0) {
      setActionMessage({ type: 'error', text: 'This game is currently out of stock.' });
      return;
    }

    addItem(game, 1);
    navigate('/checkout');
  };

  // Hooks must be called in the same order every render
  const galleryImages = useMemo(() => {
    if (!game) return [];
    const all = [
      resolveImageUrl(game.coverImage),
      ...(Array.isArray(game.screenshots) ? game.screenshots.map((url) => resolveImageUrl(url)) : []),
      ...(Array.isArray(game.images) ? game.images.map((url) => resolveImageUrl(url)) : [])
    ].filter(Boolean);
    // unique and limit to 2, no placeholders added here
    const seen = new Set();
    const unique = [];
    for (const url of all) {
      if (!seen.has(url)) {
        seen.add(url);
        unique.push(url);
      }
      if (unique.length === 2) break;
    }
    return unique;
  }, [game]);

  // Preload and keep only successfully loaded images to avoid showing placeholder as a second thumbnail
  useEffect(() => {
    if (!galleryImages.length) {
      setDisplayImages([]);
      return;
    }
    let cancelled = false;
    const loaders = galleryImages.map((url) =>
      new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(url);
        img.onerror = () => resolve(null);
        img.src = url;
      })
    );
    Promise.all(loaders).then((results) => {
      if (cancelled) return;
      const loaded = results.filter(Boolean);
      setDisplayImages(loaded);
      setSelectedImage(0);
    });
    return () => {
      cancelled = true;
    };
  }, [galleryImages]);

  useEffect(() => {
    setActionMessage(null);
  }, [slug]);

  const activeImage = displayImages[selectedImage] || displayImages[0] || pickGameImage(game) || '/placeholder-game.svg';

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <LoadingSpinner message="Loading game details..." />
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

  const platforms = Array.isArray(game?.platform) ? game.platform : [];
  const genres = Array.isArray(game?.genre) ? game.genre : [];
  const ratingAvg = typeof game?.rating?.avg === 'number' ? game.rating.avg : 0;
  const ratingCount = typeof game?.rating?.count === 'number' ? game.rating.count : 0;
  const publisher = game?.publisher || 'Unknown';
  const releaseDate = game?.releaseDate ? new Date(game.releaseDate).toLocaleDateString() : null;
  const stockText = typeof game?.stock === 'number' && game.stock > 0
    ? `${game.stock} available`
    : 'Out of stock';
  const description = game?.description || 'No description available for this game.';
  const reviewList = Array.isArray(reviews) ? reviews : [];
  const stockAvailable = (game?.stock ?? 0) > 0;
  const qtyInCart = isPlayerAccount && game?._id ? getItemQty(game._id) : 0;
  const disablePurchase = !stockAvailable;
  const purchaseMessage = !stockAvailable ? 'This game is out of stock.' : '';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Image Gallery */}
        <div>
          <div className="mb-4">
            <img
              src={activeImage}
              alt={game.title}
              className="w-full h-96 object-cover rounded-lg"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/placeholder-game.svg';
              }}
            />
          </div>
          {displayImages.length > 1 && (
            <div className="flex space-x-2 overflow-x-auto">
              {displayImages.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`w-16 h-16 rounded border-2 flex-shrink-0 ${
                    selectedImage === index ? 'border-primary-600' : 'border-gray-300'
                  }`}
                >
                  <img
                    src={image}
                    alt={`${game.title} ${index + 1}`}
                    className="w-full h-full object-cover rounded"
                    onError={(e) => {
                      // Hide a failed thumbnail instead of showing a placeholder
                      e.currentTarget.style.display = 'none';
                    }}
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
              <span>{ratingAvg > 0 ? ratingAvg.toFixed(1) : 'No rating'}</span>
              <span className="text-gray-500">({ratingCount} reviews)</span>
            </div>
          </div>

          <div className="space-y-4 mb-6">
            <div>
              <span className="font-medium text-gray-700">Platforms: </span>
              <span className="text-gray-600">{platforms.length ? platforms.join(', ') : 'Not specified'}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Genres: </span>
              <span className="text-gray-600">{genres.length ? genres.join(', ') : 'Not specified'}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Publisher: </span>
              <span className="text-gray-600">{publisher}</span>
            </div>
            {releaseDate && (
              <div>
                <span className="font-medium text-gray-700">Release Date: </span>
                <span className="text-gray-600">{releaseDate}</span>
              </div>
            )}
            <div>
              <span className="font-medium text-gray-700">Stock: </span>
              <span className={`${(game?.stock ?? 0) > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {stockText}
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <button
              onClick={handleAddToCart}
              disabled={disablePurchase}
              className="btn btn-primary w-full"
              title={purchaseMessage}
            >
              {!stockAvailable ? 'Out of Stock' : 'Add to Cart'}
            </button>

            <button
              onClick={handleInstantBuy}
              disabled={disablePurchase}
              className="btn btn-outline w-full"
              title={purchaseMessage}
            >
              Instant Buy
            </button>

            {qtyInCart > 0 && (
              <p className="text-green-600 text-sm">
                ✓ {qtyInCart} item(s) in cart
              </p>
            )}

            {actionMessage && (
              <p
                className={`text-sm ${
                  actionMessage.type === 'error' ? 'text-red-600' : 'text-green-600'
                }`}
              >
                {actionMessage.text}
              </p>
            )}

            {!stockAvailable && (
              <p className="text-sm text-red-600">This game is currently unavailable.</p>
            )}

            {!isPlayerAccount && (
              <p className="text-sm text-gray-600">
                {isAuthenticated
                  ? 'Admin accounts cannot purchase games.'
                  : 'Sign in with a player account to purchase this game.'}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">About This Game</h2>
        <p className="text-gray-700 leading-relaxed">{description}</p>
      </div>

      {/* Reviews */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Reviews</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {reviewList.length > 0 ? (
              <div className="space-y-4">
                {reviewList.map((review) => (
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

          <div className="lg:col-span-1">
            {isPlayerAccount && game?._id ? (
              <div className="card p-5 h-full flex flex-col">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Write a review</h3>
                {reviewMsg && (
                  <div className={`mb-4 p-2 rounded text-sm ${
                    reviewMsg.type==='error'?'bg-red-50 text-red-700':'bg-green-50 text-green-700'
                  }`}>{reviewMsg.text}</div>
                )}
                <div className="flex flex-col sm:flex-row sm:items-end sm:gap-3 mb-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                    <select
                      value={reviewForm.rating}
                      onChange={(e)=>setReviewForm((p)=>({...p, rating: Number(e.target.value)}))}
                      className="input"
                    >
                      {[5,4,3,2,1].map(r => <option key={r} value={r}>{r} ★</option>)}
                    </select>
                  </div>
                  <button
                    className="btn btn-primary sm:w-auto mt-4 sm:mt-0"
                    onClick={async ()=>{
                      if (!game?._id) return;
                      try {
                        setReviewMsg(null);
                        await gameService.addGameReview(game._id, { rating: reviewForm.rating, comment: reviewForm.comment?.trim() || '' });
                        setReviewMsg({ type: 'success', text: 'Thanks for your review!' });
                        setReviewForm({ rating: 5, comment: '' });
                        // refresh list and game (for updated rating)
                        const [revRes, gameRes] = await Promise.all([
                          gameService.getGameReviews(game._id),
                          gameService.getGameBySlug(slug)
                        ]);
                        setReviews(revRes.data.reviews || []);
                        setGame(gameRes.data);
                      } catch (e) {
                        const msg = e?.response?.data?.error || 'Failed to add review';
                        setReviewMsg({ type: 'error', text: msg });
                      }
                    }}
                  >
                    Post
                  </button>
                </div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Comment</label>
                <textarea
                  className="input min-h-[120px] resize-y mb-4"
                  placeholder="Share your thoughts…"
                  value={reviewForm.comment}
                  onChange={(e)=>setReviewForm((p)=>({...p, comment: e.target.value}))}
                  maxLength={500}
                />
                <div className="mt-auto hidden" />
              </div>
            ) : (
              <div className="card p-5 h-full flex items-center justify-center text-center text-sm text-gray-600">
                {isAuthenticated
                  ? 'Admin accounts can view reviews but cannot post one.'
                  : 'Sign in with your player account to write a review.'}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default GameDetail;