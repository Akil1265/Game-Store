import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { authService, orderService, uploadService } from '../services/gameStoreService';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  User,
  Mail,
  Shield,
  Calendar,
  RefreshCw,
  ShoppingBag,
  ArrowRight
} from 'lucide-react';
import { resolveImageUrl } from '../utils/image';

function Profile() {
  const { user, isLoading: authLoading, updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    avatarUrl: '',
    age: '',
    upiId: ''
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [avatarError, setAvatarError] = useState(false);

  useEffect(() => {
    loadProfile();
    loadRecentOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!status.message) {
      return undefined;
    }

    const timeout = setTimeout(() => {
      setStatus({ type: '', message: '' });
    }, 4000);

    return () => clearTimeout(timeout);
  }, [status]);

  const loadProfile = async () => {
    try {
      setProfileLoading(true);
      const response = await authService.getProfile();
      const data = response.data;

      setProfile(data);
      setFormData({
        name: data?.name || '',
        avatarUrl: data?.avatarUrl || '',
        age: data?.age ?? '',
        upiId: data?.upiId ?? ''
      });

      if (data) {
        updateUser(data);
      }
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to load profile';
      setStatus({ type: 'error', message });
    } finally {
      setProfileLoading(false);
    }
  };

  const loadRecentOrders = async () => {
    try {
      setOrdersLoading(true);
      const response = await orderService.getMyOrders({ limit: 5 });
      const ordersData = response.data.orders || response.data || [];
      const normalized = Array.isArray(ordersData) ? ordersData : [];

      // Ensure newest first
      normalized.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setOrders(normalized.slice(0, 5));
    } catch (error) {
      console.error('Failed to load orders summary:', error);
    } finally {
      setOrdersLoading(false);
    }
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleReset = () => {
    if (!profile) {
      return;
    }

    setFormData({
      name: profile.name || '',
      avatarUrl: profile.avatarUrl || '',
      age: profile.age ?? '',
      upiId: profile.upiId || ''
    });
    setSelectedFile(null);
    setStatus({ type: '', message: '' });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus({ type: '', message: '' });

    const trimmedName = formData.name.trim();
    const trimmedAvatar = String(formData.avatarUrl || '').trim();
    const payload = {
      name: trimmedName,
      avatarUrl: trimmedAvatar,
      age: formData.age,
      upiId: formData.upiId
    };

    if (!trimmedName) {
      setStatus({ type: 'error', message: 'Name is required.' });
      return;
    }

    setIsSaving(true);

    try {
      const response = await authService.updateProfile(payload);

      const updated = response.data?.user || null;
      if (updated) {
        setProfile(updated);
        setFormData({
          name: updated.name || '',
          avatarUrl: updated.avatarUrl || '',
          age: updated.age ?? '',
          upiId: updated.upiId || ''
        });
        updateUser(updated);
      }

      setStatus({
        type: 'success',
        message: response.data?.message || 'Profile updated successfully.'
      });
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to update profile';
      setStatus({ type: 'error', message });
    } finally {
      setIsSaving(false);
    }
  };

  const onRefresh = async () => {
    await Promise.all([loadProfile(), loadRecentOrders()]);
  };

  const avatarPreview = useMemo(() => {
    if (formData.avatarUrl && String(formData.avatarUrl).trim()) {
      return resolveImageUrl(String(formData.avatarUrl).trim());
    }
    if (profile?.avatarUrl) {
      return resolveImageUrl(profile.avatarUrl);
    }
    return null;
  }, [formData.avatarUrl, profile?.avatarUrl]);

  useEffect(() => {
    setAvatarError(false);
  }, [avatarPreview]);

  const memberSince = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : null;

  const orderStats = useMemo(() => {
    if (!orders.length) {
      return {
        totalOrders: 0,
        totalSpent: 0,
        lastOrder: null
      };
    }

    const totalOrders = orders.length;
    const totalSpent = orders.reduce((sum, order) => sum + (order.total || 0), 0);
    const lastOrder = orders[0];

    return {
      totalOrders,
      totalSpent,
      lastOrder
    };
  }, [orders]);

  const initials = useMemo(() => {
    const sourceName = formData.name || profile?.name || user?.name || '';
    if (!sourceName) {
      return '?';
    }
    return sourceName
      .split(' ')
      .filter(Boolean)
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  }, [formData.name, profile?.name, user?.name]);

  if (profileLoading || authLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <LoadingSpinner message="Loading your profile..." />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="card p-6 border-l-4 border-red-400 bg-red-50">
          <p className="text-red-700">Unable to load your profile right now.</p>
          <button type="button" className="btn btn-primary mt-4" onClick={onRefresh}>
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
          <p className="text-gray-600 mt-1">Manage your personal information and view your recent activity.</p>
        </div>
        <button
          type="button"
          className="btn btn-secondary flex items-center space-x-2"
          onClick={onRefresh}
          disabled={profileLoading || ordersLoading}
        >
          <RefreshCw className="h-4 w-4" />
          <span>Refresh</span>
        </button>
      </div>

      {status.message && (
        <div
          className={`card p-4 mb-6 border-l-4 ${
            status.type === 'error'
              ? 'border-red-400 bg-red-50 text-red-700'
              : 'border-green-400 bg-green-50 text-green-700'
          }`}
        >
          {status.message}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <aside className="space-y-6">
          <div className="card p-6 text-center">
            <div className="flex flex-col items-center space-y-4">
              {avatarPreview && !avatarError ? (
                <img
                  src={avatarPreview}
                  alt={profile.name}
                  className="h-24 w-24 rounded-full object-cover border-4 border-white shadow"
                  onError={() => setAvatarError(true)}
                />
              ) : (
                <div className="h-24 w-24 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-3xl font-semibold">
                  {initials}
                </div>
              )}
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{profile.name}</h2>
                <p className="text-sm text-gray-500 flex items-center justify-center space-x-1">
                  <Mail className="h-4 w-4" />
                  <span>{profile.email}</span>
                </p>
              </div>
              <div className="flex flex-col space-y-2 w-full text-left">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Shield className="h-4 w-4" />
                  <span>{profile.role === 'ADMIN' ? 'Administrator' : 'Member'}</span>
                </div>
                {memberSince && (
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>Joined {memberSince}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="card p-6 space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Order Summary</h3>
            {ordersLoading ? (
              <div className="py-6">
                <LoadingSpinner message="Loading your orders..." />
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Total orders</span>
                  <span className="text-base font-semibold text-gray-900">{orderStats.totalOrders}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Total spent</span>
                  <span className="text-base font-semibold text-gray-900">
                    ₹{orderStats.totalSpent.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Last order</span>
                  <span className="text-base font-semibold text-gray-900">
                    {orderStats.lastOrder
                      ? new Date(orderStats.lastOrder.createdAt).toLocaleDateString('en-IN', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })
                      : '—'}
                  </span>
                </div>
              </div>
            )}
            <Link to="/orders" className="btn btn-secondary w-full flex items-center justify-center space-x-2">
              <ShoppingBag className="h-4 w-4" />
              <span>View all orders</span>
            </Link>
          </div>
        </aside>

        <main className="lg:col-span-2 space-y-6">
          <form className="card p-6 space-y-6" onSubmit={handleSubmit}>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Account Details</h2>
              <p className="text-sm text-gray-500 mt-1">
                Update your personal information. Email address is used for sign-in and cannot be changed here.
              </p>
            </div>

            <div className="space-y-5">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Display name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  className="input mt-1"
                  placeholder="Enter your name"
                  value={formData.name}
                  onChange={handleInputChange}
                  maxLength={50}
                  required
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  className="input mt-1 bg-gray-100 cursor-not-allowed"
                  value={profile.email}
                  disabled
                  readOnly
                />
              </div>

              <div>
                <label htmlFor="avatarFile" className="block text-sm font-medium text-gray-700">
                  Avatar image
                </label>
                <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-3 sm:space-y-0 mt-1">
                  <div className="flex items-center space-x-3">
                    <input
                      id="avatarFile"
                      name="avatarFile"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files && e.target.files[0];
                        if (!file) return;
                        setSelectedFile(file);
                        setUploadingAvatar(true);
                        try {
                          const resp = await uploadService.uploadAvatar(file);
                          const imageUrl = resp.data?.imageUrl || resp.data?.imageUrl || resp.data?.imageUrl;
                          if (imageUrl) {
                            setFormData((prev) => ({ ...prev, avatarUrl: imageUrl }));
                            setStatus({ type: 'success', message: 'Avatar uploaded' });
                          } else {
                            setStatus({ type: 'error', message: 'Upload succeeded but no image URL returned' });
                          }
                        } catch (err) {
                          console.error('Avatar upload failed', err);
                          setStatus({ type: 'error', message: err.response?.data?.error || 'Avatar upload failed' });
                        } finally {
                          setUploadingAvatar(false);
                        }
                      }}
                    />
                    <label htmlFor="avatarFile" className="btn btn-outline cursor-pointer">
                      Choose file
                    </label>

                    <div className="text-sm text-gray-500">
                      {selectedFile ? selectedFile.name : 'No file chosen'}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      className="btn btn-outline"
                      onClick={() => {
                        setFormData((prev) => ({ ...prev, avatarUrl: '' }));
                        setSelectedFile(null);
                      }}
                    >
                      Remove
                    </button>
                    <div>
                      <button
                        type="button"
                        className="btn btn-primary"
                        disabled={uploadingAvatar}
                        onClick={async () => {
                          // If a file is already selected, upload again
                          if (!selectedFile) return setStatus({ type: 'error', message: 'No file selected' });
                          setUploadingAvatar(true);
                          try {
                            const resp = await uploadService.uploadAvatar(selectedFile);
                            const imageUrl = resp.data?.imageUrl || resp.data?.imageUrl || resp.data?.imageUrl;
                            if (imageUrl) {
                              setFormData((prev) => ({ ...prev, avatarUrl: imageUrl }));
                              setStatus({ type: 'success', message: 'Avatar uploaded' });
                            } else {
                              setStatus({ type: 'error', message: 'Upload succeeded but no image URL returned' });
                            }
                          } catch (err) {
                            console.error('Avatar upload failed', err);
                            setStatus({ type: 'error', message: err.response?.data?.error || 'Avatar upload failed' });
                          } finally {
                            setUploadingAvatar(false);
                          }
                        }}
                      >
                        {uploadingAvatar ? 'Uploading...' : 'Upload'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="age" className="block text-sm font-medium text-gray-700">
                    Age
                  </label>
                  <input
                    id="age"
                    name="age"
                    type="number"
                    min="0"
                    max="120"
                    className="input mt-1"
                    placeholder="Enter your age"
                    value={formData.age}
                    onChange={handleInputChange}
                  />
                </div>

                <div>
                  <label htmlFor="upiId" className="block text-sm font-medium text-gray-700">
                    UPI ID
                  </label>
                  <input
                    id="upiId"
                    name="upiId"
                    type="text"
                    className="input mt-1"
                    placeholder="name@bank"
                    value={formData.upiId}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleReset}
                disabled={isSaving}
              >
                Reset
              </button>
              <button type="submit" className="btn btn-primary" disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save changes'}
              </button>
            </div>
          </form>

          <div className="card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Recent Orders</h2>
                <p className="text-sm text-gray-500 mt-1">
                  A snapshot of your latest purchases. Head to the orders page to see everything.
                </p>
              </div>
              <Link to="/orders" className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center space-x-1">
                <span>Manage orders</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {ordersLoading ? (
              <div className="py-10">
                <LoadingSpinner message="Loading recent orders..." />
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-gray-500">You have not placed any orders yet.</p>
                <Link to="/games" className="btn btn-primary mt-4">
                  Browse games
                </Link>
              </div>
            ) : (
              <ul className="space-y-4">
                {orders.map((order) => (
                  <li key={order._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          Order #{order._id.slice(-8).toUpperCase()}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(order.createdAt).toLocaleDateString('en-IN', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-gray-900">
                          ₹{(order.total || 0).toLocaleString('en-IN')}
                        </p>
                        <p className="text-xs text-gray-500">{order.items?.length || 0} item(s)</p>
                      </div>
                    </div>
                    <Link
                      to={`/orders/${order._id}`}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium inline-flex items-center space-x-1 mt-3"
                    >
                      <span>View details</span>
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default Profile;
