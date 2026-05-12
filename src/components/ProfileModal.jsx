import { useState, useEffect } from 'react';
import { X, Store, User, Phone, MapPin, Users, Calendar, Shield } from 'lucide-react';
import api from '../services/api';

export default function ProfileModal({ onClose, customerCount }) {
  const [owner, setOwner] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get('/auth/me');
      if (res.data && res.data.data) {
        setOwner(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden">
        {/* Header */}
        <div className="relative bg-gradient-to-br from-blue-600 to-indigo-700 px-6 pt-6 pb-14">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <h2 className="text-white text-lg font-semibold">My Profile</h2>
          <p className="text-blue-200 text-sm mt-0.5">Owner Details</p>
        </div>

        {/* Avatar overlapping header */}
        <div className="flex justify-center -mt-10 relative z-10">
          <div className="w-20 h-20 rounded-full bg-white shadow-lg flex items-center justify-center border-4 border-white">
            <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              <span className="text-white text-2xl font-bold">
                {loading ? '...' : (owner?.name?.charAt(0)?.toUpperCase() || 'O')}
              </span>
            </div>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading profile...</div>
        ) : owner ? (
          <div className="px-6 pt-4 pb-6">
            {/* Name & Shop */}
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">{owner.name}</h3>
              <p className="text-sm text-gray-500 flex items-center justify-center gap-1 mt-1">
                <Store className="w-3.5 h-3.5" />
                {owner.shopName}
              </p>
            </div>

            {/* Stats card */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 mb-5 border border-blue-100">
              <div className="flex items-center justify-center gap-3">
                <div className="bg-white rounded-lg p-3 shadow-sm">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-700">{customerCount}</div>
                  <div className="text-xs text-blue-500 font-medium">Total Customers</div>
                </div>
              </div>
            </div>

            {/* Details list */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="p-2 bg-white rounded-lg shadow-sm">
                  <Phone className="w-4 h-4 text-gray-500" />
                </div>
                <div>
                  <div className="text-xs text-gray-400 font-medium">Phone</div>
                  <div className="text-sm font-semibold text-gray-800">{owner.phone}</div>
                </div>
              </div>

              {owner.location && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="p-2 bg-white rounded-lg shadow-sm">
                    <MapPin className="w-4 h-4 text-gray-500" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-400 font-medium">Location</div>
                    <div className="text-sm font-semibold text-gray-800">{owner.location}</div>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="p-2 bg-white rounded-lg shadow-sm">
                  <Shield className="w-4 h-4 text-gray-500" />
                </div>
                <div>
                  <div className="text-xs text-gray-400 font-medium">Role</div>
                  <div className="text-sm font-semibold text-gray-800 capitalize">{owner.role || 'Owner'}</div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="p-2 bg-white rounded-lg shadow-sm">
                  <Calendar className="w-4 h-4 text-gray-500" />
                </div>
                <div>
                  <div className="text-xs text-gray-400 font-medium">Member Since</div>
                  <div className="text-sm font-semibold text-gray-800">{formatDate(owner.createdAt)}</div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center text-red-500">Failed to load profile.</div>
        )}

        {/* Footer */}
        <div className="px-6 pb-6">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors text-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
