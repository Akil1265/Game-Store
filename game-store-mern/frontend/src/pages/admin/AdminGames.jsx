import { useEffect, useMemo, useState } from 'react';
import { gameService, uploadService } from '../../services/gameStoreService';
import LoadingSpinner from '../../components/LoadingSpinner';
import { pickGameImage, resolveImageUrl } from '../../utils/image';

const GENRES = ['Action', 'Adventure', 'RPG', 'Strategy', 'Sports', 'Racing', 'Simulation', 'Puzzle', 'Fighting', 'Horror', 'Indie', 'MMO', 'Battle Royale', 'FPS', 'Platformer', 'Runner', 'VR'];
const PLATFORMS = ['PC', 'PS5', 'Xbox', 'Nintendo Switch', 'Mobile', 'VR'];

function AdminGames() {
  const [games, setGames] = useState([]);
  const [pagination, setPagination] = useState({ current: 1, pages: 1, total: 0, limit: 12 });
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);
  const [message, setMessage] = useState(null);

  // Form state
  const emptyForm = useMemo(() => ({
    _id: null,
    title: '',
    slug: '',
    description: '',
    price: '',
    currency: 'INR',
    coverImage: '',
    images: [],
    screenshots: [],
    platform: [],
    genre: [],
    publisher: '',
    releaseDate: '',
    stock: 0,
  }), []);
  const [form, setForm] = useState(emptyForm);
  const [isEditing, setIsEditing] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchGames();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, sort, query]);

  const fetchGames = async () => {
    setLoading(true);
    try {
      const res = await gameService.getGames({ page, limit: 12, q: query || undefined, sort });
      setGames(res.data.games || []);
      setPagination(res.data.pagination || { current: 1, pages: 1, total: 0, limit: 12 });
    } catch (e) {
      console.error(e);
      setMessage({ type: 'error', text: 'Failed to load games' });
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setForm(emptyForm);
    setIsEditing(false);
    setFormOpen(true);
  };

  const openEdit = (game) => {
    setForm({
      _id: game._id,
      title: game.title || '',
      slug: game.slug || '',
      description: game.description || '',
      price: game.price ?? '',
      currency: game.currency || 'INR',
      coverImage: game.coverImage || '',
      images: Array.isArray(game.images) ? game.images : [],
      screenshots: Array.isArray(game.screenshots) ? game.screenshots : [],
      platform: Array.isArray(game.platform) ? game.platform : [],
      genre: Array.isArray(game.genre) ? game.genre : [],
      publisher: game.publisher || '',
      releaseDate: game.releaseDate ? new Date(game.releaseDate).toISOString().slice(0, 10) : '',
      stock: game.stock ?? 0,
    });
    setIsEditing(true);
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setForm(emptyForm);
    setIsEditing(false);
    setUploading(false);
    setMessage(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleMultiSelect = (name, value) => {
    setForm((prev) => {
      const exists = prev[name].includes(value);
      return {
        ...prev,
        [name]: exists ? prev[name].filter((v) => v !== value) : [...prev[name], value],
      };
    });
  };

  const handleUploadCover = async (file) => {
    if (!file) return;
    try {
      setUploading(true);
      const res = await uploadService.uploadSingle(file);
      setForm((prev) => ({ ...prev, coverImage: res.data.imageUrl }));
    } catch (e) {
      setMessage({ type: 'error', text: 'Cover upload failed' });
    } finally {
      setUploading(false);
    }
  };

  const handleUploadImages = async (files) => {
    if (!files || files.length === 0) return;
    try {
      setUploading(true);
      const res = await uploadService.uploadMultiple(Array.from(files));
      setForm((prev) => ({ ...prev, images: [...prev.images, ...res.data.imageUrls] }));
    } catch (e) {
      setMessage({ type: 'error', text: 'Images upload failed' });
    } finally {
      setUploading(false);
    }
  };

  const removeFromArray = (name, index) => {
    setForm((prev) => ({
      ...prev,
      [name]: prev[name].filter((_, i) => i !== index),
    }));
  };

  const validate = () => {
    if (!form.title?.trim()) return 'Title is required';
    if (form.price === '' || Number(form.price) < 0) return 'Price must be a non-negative number';
    if (!Array.isArray(form.platform) || form.platform.length === 0) return 'Select at least one platform';
    if (!Array.isArray(form.genre) || form.genre.length === 0) return 'Select at least one genre';
    return null;
  };

  const saveGame = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) {
      setMessage({ type: 'error', text: err });
      return;
    }
    const payload = {
      title: form.title.trim(),
      slug: form.slug?.trim() || undefined,
      description: form.description?.trim() || '',
      price: Number(form.price),
      currency: form.currency || 'INR',
      coverImage: form.coverImage || undefined,
      images: form.images,
      screenshots: form.screenshots,
      platform: form.platform,
      genre: form.genre,
      publisher: form.publisher?.trim() || undefined,
      releaseDate: form.releaseDate ? new Date(form.releaseDate) : undefined,
      stock: Number(form.stock) || 0,
    };

    try {
      setMessage(null);
      if (isEditing && form._id) {
        const res = await gameService.updateGame(form._id, payload);
        setMessage({ type: 'success', text: 'Game updated' });
        // Replace in list
        setGames((prev) => prev.map((g) => (g._id === form._id ? res.data.game : g)));
      } else {
        const res = await gameService.createGame(payload);
        setMessage({ type: 'success', text: 'Game created' });
        // Prepend new game
        setGames((prev) => [res.data.game, ...prev]);
      }
      closeForm();
    } catch (e) {
      const msg = e?.response?.data?.error || 'Save failed';
      setMessage({ type: 'error', text: msg });
    }
  };

  const deleteGame = async (game) => {
    const yes = window.confirm(`Delete "${game.title}"? This cannot be undone.`);
    if (!yes) return;
    try {
      await gameService.deleteGame(game._id);
      setGames((prev) => prev.filter((g) => g._id !== game._id));
      setMessage({ type: 'success', text: 'Game deleted' });
    } catch (e) {
      const msg = e?.response?.data?.error || 'Delete failed';
      setMessage({ type: 'error', text: msg });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manage Games</h1>
          <p className="text-gray-600">Create, edit, and remove games from your store</p>
        </div>
        <button onClick={openCreate} className="btn btn-primary">+ New Game</button>
      </div>

      <div className="card p-4 mb-6 flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
        <div className="flex gap-2 items-center">
          <input
            className="input"
            placeholder="Search title/description"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setPage(1); }}
          />
          <select className="input" value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="rating">Rating</option>
          </select>
        </div>
        <div className="text-sm text-gray-600">Total: {pagination.total}</div>
      </div>

      {message && (
        <div className={`mb-4 p-3 rounded ${message.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
          {message.text}
        </div>
      )}

      {/* List */}
      <div className="card overflow-x-auto">
        {loading ? (
          <div className="py-12">
            <LoadingSpinner message="Loading games..." />
          </div>
        ) : games.length === 0 ? (
          <div className="p-6 text-gray-500">No games found.</div>
        ) : (
          <table className="min-w-full">
            <thead>
              <tr className="text-left text-sm text-gray-600 border-b">
                <th className="py-3 px-4">Title</th>
                <th className="py-3 px-4">Price</th>
                <th className="py-3 px-4">Stock</th>
                <th className="py-3 px-4">Platforms</th>
                <th className="py-3 px-4">Genres</th>
                <th className="py-3 px-4">Rating</th>
                <th className="py-3 px-4 w-48">Actions</th>
              </tr>
            </thead>
            <tbody>
              {games.map((g) => (
                <tr key={g._id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <img src={pickGameImage(g) || '/placeholder-game.svg'} alt="" className="w-10 h-10 object-cover rounded" onError={(e)=>{e.currentTarget.src='/placeholder-game.svg';}} />
                      <div>
                        <div className="font-medium">{g.title}</div>
                        <div className="text-xs text-gray-500">/{g.slug}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">₹{g.price}</td>
                  <td className="py-3 px-4">{g.stock ?? 0}</td>
                  <td className="py-3 px-4 text-sm text-gray-600">{Array.isArray(g.platform) ? g.platform.join(', ') : ''}</td>
                  <td className="py-3 px-4 text-sm text-gray-600">{Array.isArray(g.genre) ? g.genre.join(', ') : ''}</td>
                  <td className="py-3 px-4">{g.rating?.avg ?? 0} ({g.rating?.count ?? 0})</td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      <button className="btn btn-outline" onClick={() => openEdit(g)}>Edit</button>
                      <button className="btn btn-outline" onClick={() => window.open(`/games/${g.slug}`, '_blank')}>View</button>
                      <button className="btn btn-outline bg-red-50 text-red-600 hover:bg-red-100 border-red-200" onClick={() => deleteGame(g)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-6">
          <button className="btn btn-outline" disabled={page<=1} onClick={()=>setPage((p)=>Math.max(1,p-1))}>Prev</button>
          <span className="text-sm text-gray-600">Page {pagination.current} / {pagination.pages}</span>
          <button className="btn btn-outline" disabled={page>=pagination.pages} onClick={()=>setPage((p)=>Math.min(pagination.pages,p+1))}>Next</button>
        </div>
      )}

      {/* Drawer/Modal for form */}
      {formOpen && (
        <div className="fixed inset-0 bg-black/30 z-40 flex items-start md:items-center justify-center p-4" onClick={closeForm}>
          <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl overflow-hidden" onClick={(e)=>e.stopPropagation()}>
            <div className="px-6 py-4 border-b flex items-center justify-between">
              <h2 className="text-xl font-semibold">{isEditing ? 'Edit Game' : 'Create Game'}</h2>
              <button onClick={closeForm} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>
            <form onSubmit={saveGame} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
              {/* Title and Slug */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">Title</label>
                  <input name="title" value={form.title} onChange={handleChange} className="input" placeholder="Game title" required />
                </div>
                <div>
                  <label className="label">Slug (optional)</label>
                  <input name="slug" value={form.slug} onChange={handleChange} className="input" placeholder="auto-generated if blank" />
                </div>
              </div>

              {/* Price and Stock */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="label">Price (₹)</label>
                  <input type="number" name="price" value={form.price} onChange={handleChange} className="input" min={0} required />
                </div>
                <div>
                  <label className="label">Currency</label>
                  <select name="currency" value={form.currency} onChange={handleChange} className="input">
                    <option value="INR">INR</option>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                  </select>
                </div>
                <div>
                  <label className="label">Stock</label>
                  <input type="number" name="stock" value={form.stock} onChange={handleChange} className="input" min={0} />
                </div>
              </div>

              {/* Publisher and Release Date */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">Publisher</label>
                  <input name="publisher" value={form.publisher} onChange={handleChange} className="input" />
                </div>
                <div>
                  <label className="label">Release Date</label>
                  <input type="date" name="releaseDate" value={form.releaseDate} onChange={handleChange} className="input" />
                </div>
              </div>

              {/* Platforms */}
              <div>
                <label className="label">Platforms</label>
                <div className="flex flex-wrap gap-2">
                  {PLATFORMS.map((p) => (
                    <button type="button" key={p} onClick={() => handleMultiSelect('platform', p)} className={`px-3 py-1 rounded border ${form.platform.includes(p) ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-gray-700 border-gray-300'}`}>
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* Genres */}
              <div>
                <label className="label">Genres</label>
                <div className="flex flex-wrap gap-2">
                  {GENRES.map((g) => (
                    <button type="button" key={g} onClick={() => handleMultiSelect('genre', g)} className={`px-3 py-1 rounded border ${form.genre.includes(g) ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-gray-700 border-gray-300'}`}>
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="label">Description</label>
                <textarea name="description" value={form.description} onChange={handleChange} className="input min-h-28" placeholder="Game description" />
              </div>

              {/* Cover & Images */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">Cover Image URL</label>
                  <input name="coverImage" value={form.coverImage} onChange={handleChange} className="input" placeholder="https://... or /uploads/..." />
                  <div className="mt-2 flex items-center gap-2">
                    <input type="file" accept="image/*" onChange={(e)=>handleUploadCover(e.target.files?.[0])} disabled={uploading} />
                    {form.coverImage && (<img src={resolveImageUrl(form.coverImage)} alt="cover" className="w-12 h-12 object-cover rounded" onError={(e)=>{e.currentTarget.src='/placeholder-game.svg';}} />)}
                  </div>
                </div>
                <div>
                  <label className="label">Gallery Images</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {form.images.map((img, idx) => (
                      <div key={idx} className="relative">
                        <img src={resolveImageUrl(img)} alt="img" className="w-12 h-12 object-cover rounded" onError={(e)=>{e.currentTarget.src='/placeholder-game.svg';}} />
                        <button type="button" className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-5 h-5 text-xs" onClick={()=>removeFromArray('images', idx)}>×</button>
                      </div>
                    ))}
                  </div>
                  <input type="file" accept="image/*" multiple onChange={(e)=>handleUploadImages(e.target.files)} disabled={uploading} />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" className="btn btn-outline" onClick={closeForm}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={uploading}>{isEditing ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminGames;