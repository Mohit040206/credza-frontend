import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import CustomerModal from '../components/CustomerModal';
import { LogOut, Plus, MapPin, Phone, Users } from 'lucide-react';

export default function Dashboard() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const res = await api.get('/customer/get');
      setCustomers(res.data.data || res.data || []);
    } catch (err) {
      console.error('Failed to fetch customers:', err);
      if (err.response?.status === 401) handleLogout();
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const openAddModal = () => {
    setEditingCustomer(null);
    setIsModalOpen(true);
  };

  const openEditModal = (customer) => {
    setEditingCustomer(customer);
    setIsModalOpen(true);
  };

  const handleSaveCustomer = async (customerData) => {
    try {
      if (editingCustomer) {
        await api.put(`/customer/${editingCustomer._id || editingCustomer.id}`, customerData);
      } else {
        await api.post('/customer/add', customerData);
      }
      fetchCustomers();
      setIsModalOpen(false);
    } catch (err) {
      console.error('Failed to save customer', err);
      alert('Failed to save customer. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-600" />
            <h1 className="text-xl font-bold text-gray-900">Credza</h1>
          </div>
          <button 
            onClick={handleLogout}
            className="text-gray-500 hover:text-gray-900 flex items-center gap-2 text-sm font-medium transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 mt-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Customers</h2>
          <button 
            onClick={openAddModal}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add Customer
          </button>
        </div>

        {loading ? (
          <div className="text-center py-10 text-gray-500">Loading customers...</div>
        ) : customers.length === 0 ? (
          <div className="bg-white rounded-xl p-10 text-center border border-gray-200">
            <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-blue-500" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No customers yet</h3>
            <p className="text-gray-500 mb-4">Add your first customer to start managing their ledger.</p>
            <button 
              onClick={openAddModal}
              className="text-blue-600 font-medium hover:text-blue-700"
            >
              + Add Customer
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {customers.map((customer) => (
              <div key={customer._id || customer.id} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                <h3 className="text-lg font-semibold text-gray-900 mb-2 truncate">{customer.name}</h3>
                <div className="space-y-2 mb-5">
                  <div className="flex items-center text-gray-600 text-sm">
                    <Phone className="w-4 h-4 mr-2 text-gray-400" />
                    {customer.phone}
                  </div>
                  {customer.location && (
                    <div className="flex items-center text-gray-600 text-sm">
                      <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                      <span className="truncate">{customer.location}</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
                  <button 
                    onClick={() => navigate(`/ledger/${customer._id || customer.id}`)}
                    className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-700 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    View Ledger
                  </button>
                  <button 
                    onClick={() => openEditModal(customer)}
                    className="px-4 py-2 border border-gray-200 hover:bg-gray-50 text-gray-600 rounded-lg text-sm font-medium transition-colors"
                  >
                    Edit
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {isModalOpen && (
        <CustomerModal 
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveCustomer}
          initialData={editingCustomer}
        />
      )}
    </div>
  );
}
