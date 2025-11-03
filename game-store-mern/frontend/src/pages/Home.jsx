import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { gameService } from '../services/gameStoreService';
import { Star, ShoppingCart, Gamepad2, Users, Award, Zap } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../contexts/AuthContext';
import { pickGameImage } from '../utils/image';

function Home() {
  const [featuredGames, setFeaturedGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated, user, isLoading: authLoading } = useAuth();

  useEffect(() => {
    const fetchFeaturedGames = async () => {
      try {
        const response = await gameService.getGames({ limit: 8, sort: 'rating' });
        setFeaturedGames(response.data.games);
      } catch (error) {
        console.error('Error fetching featured games:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedGames();
  }, []);

  const features = [
    {
      icon: <Gamepad2 className="h-8 w-8 text-primary-600" />,
      title: "Huge Game Library",
      description: "Discover thousands of games across all genres and platforms"
    },
    {
      icon: <Zap className="h-8 w-8 text-primary-600" />,
      title: "Instant Download",
      description: "Get your games instantly after purchase with secure downloads"
    },
    {
      icon: <Users className="h-8 w-8 text-primary-600" />,
      title: "Community Reviews",
      description: "Read honest reviews from fellow gamers before you buy"
    },
    {
      icon: <Award className="h-8 w-8 text-primary-600" />,
      title: "Best Prices",
      description: "Competitive pricing with frequent sales and discounts"
    }
  ];

  const GameCard = ({ game }) => {
    const primaryImage = pickGameImage(game) || '/placeholder-game.svg';

    return (
      <div className="card overflow-hidden hover:shadow-lg transition-shadow">
        <div className="relative">
          <img
            src={primaryImage}
            alt={game.title}
            className="w-full h-48 object-cover"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '/placeholder-game.svg';
            }}
          />
          <div className="absolute top-2 right-2 bg-primary-600 text-white px-2 py-1 rounded text-sm font-medium">
            ₹{game.price}
          </div>
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-lg mb-2 line-clamp-1">{game.title}</h3>
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">{game.description}</p>
          
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-1">
              <Star className="h-4 w-4 text-yellow-400 fill-current" />
              <span className="text-sm text-gray-600">
                {game.rating.avg > 0 ? game.rating.avg.toFixed(1) : 'No rating'}
              </span>
              <span className="text-sm text-gray-400">
                ({game.rating.count} reviews)
              </span>
            </div>
            <div className="flex flex-wrap gap-1">
              {game.platform.slice(0, 2).map((platform) => (
                <span
                  key={platform}
                  className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
                >
                  {platform}
                </span>
              ))}
            </div>
          </div>
          
          <Link
            to={`/games/${game.slug}`}
            className="btn btn-primary w-full flex items-center justify-center space-x-2"
          >
            <ShoppingCart className="h-4 w-4" />
            <span>View Details</span>
          </Link>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 via-primary-700 to-primary-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Your Ultimate Gaming Destination
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-primary-100 max-w-3xl mx-auto">
              Discover, purchase, and enjoy the latest games from indie developers to major studios. 
              Join millions of gamers worldwide.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/games" className="btn bg-white text-primary-600 hover:bg-gray-50 px-8 py-3 text-lg">
                Browse Games
              </Link>
              {(authLoading || !isAuthenticated) && (
                <Link
                  to="/register"
                  className="btn btn-outline border-white text-white hover:bg-white hover:text-primary-600 px-8 py-3 text-lg"
                >
                  Sign Up Free
                </Link>
              )}
              {!authLoading && isAuthenticated && user?.role === 'ADMIN' && (
                <Link
                  to="/admin"
                  className="btn btn-outline border-white text-white hover:bg-white hover:text-primary-600 px-8 py-3 text-lg"
                >
                  Go to Admin Dashboard
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose GameStore?</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We're committed to providing the best gaming experience with unmatched service and selection.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center">
                <div className="flex justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Games Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Featured Games</h2>
              <p className="text-gray-600">Discover the most popular and highest-rated games</p>
            </div>
            <Link to="/games" className="btn btn-outline">
              View All Games
            </Link>
          </div>

          {loading ? (
            <>
              <div className="py-12">
                <LoadingSpinner message="Loading featured games..." />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(8)].map((_, index) => (
                  <div key={index} className="card overflow-hidden animate-pulse">
                    <div className="bg-gray-300 h-48 w-full"></div>
                    <div className="p-4 space-y-3">
                      <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-300 rounded"></div>
                      <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                      <div className="h-8 bg-gray-300 rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : featuredGames.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredGames.map((game) => (
                <GameCard key={game._id} game={game} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Gamepad2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No games available at the moment.</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      {(authLoading || !isAuthenticated) && (
        <section className="bg-primary-600 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Start Gaming?</h2>
            <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
              Join thousands of gamers who trust GameStore for their gaming needs. 
              Create your account today and start building your game library.
            </p>
            <Link
              to="/register"
              className="btn bg-white text-primary-600 hover:bg-gray-50 px-8 py-3 text-lg"
            >
              Get Started Now
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}

export default Home;
