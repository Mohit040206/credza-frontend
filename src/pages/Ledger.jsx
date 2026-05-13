import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';
import AddEntryModal from '../components/AddEntryModal';
import EntryDetailsModal from '../components/EntryDetailsModal';
import ConfirmModal from '../components/ConfirmModal';
import { ArrowLeft, Download, MessageCircle, TrendingUp, TrendingDown, Clock } from 'lucide-react';

const getTodayStr = () => new Date().toISOString().split('T')[0];
const getOneMonthAgoStr = () => {
  const d = new Date();
  d.setMonth(d.getMonth() - 1);
  return d.toISOString().split('T')[0];
};

export default function Ledger() {
  const { customerId } = useParams();
  const navigate = useNavigate();
  const [ledger, setLedger] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [entryToDelete, setEntryToDelete] = useState(null);
  const [startDate, setStartDate] = useState(getOneMonthAgoStr());
  const [endDate, setEndDate] = useState(getTodayStr());

  useEffect(() => {
    fetchLedger();
  }, [customerId, startDate, endDate]);

  const fetchLedger = async () => {
    try {
      let url = `/ledger/${customerId}`;
      if (startDate && endDate) {
        url += `?startDate=${startDate}&endDate=${endDate}`;
      }
      const res = await api.get(url);
      setLedger(res.data.data || res.data);
    } catch (err) {
      console.error('Failed to fetch ledger:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddEntry = async (entryData) => {
    try {
      await api.post('/ledger/add', {
        customerId,
        ...entryData
      });
      fetchLedger();
      setIsModalOpen(false);
      toast.success('Entry added successfully');
    } catch (err) {
      console.error('Failed to add entry', err);
      toast.error('Failed to add entry. Please try again.');
    }
  };

  const handleDeleteEntry = (entryId) => {
    setEntryToDelete(entryId);
  };

  const confirmDelete = async () => {
    if (!entryToDelete) return;
    
    try {
      await api.delete(`/ledger/${entryToDelete}`);
      fetchLedger();
      setSelectedEntry(null);
      setEntryToDelete(null);
      toast.success('Entry deleted successfully');
    } catch (err) {
      console.error('Failed to delete entry:', err);
      toast.error('Failed to delete entry. Please try again.');
    }
  };

  const handleDownloadPDF = async () => {

    if (!ledger?.entries || ledger.entries.length === 0) {
      toast.error('No transactions found in the selected date range.');
      return;
    }

    try {
      let url = `/ledger/pdf/${customerId}`;
      if (startDate && endDate) {
        url += `?startDate=${startDate}&endDate=${endDate}`;
      }
      const res = await api.get(url, { responseType: 'blob' });
      const blobUrl = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = blobUrl;
      link.setAttribute('download', `ledger-${customerId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (err) {
      console.error('Failed to download PDF:', err);
      toast.error('Failed to download PDF.');
    }
  };

  const handleWhatsAppShare = async () => {
    if (!ledger?.entries || ledger.entries.length === 0) {
      toast.error('No transactions found in the selected date range.');
      return;
    }

    try {
      let url = `/ledger/whatsapp/${customerId}`;
      if (startDate && endDate) {
        url += `?startDate=${startDate}&endDate=${endDate}`;
      }
      const res = await api.get(url);
      if (res.data.success && res.data.link) {
        window.open(res.data.link, '_blank');
      }
    } catch (err) {
      console.error('Failed to share via WhatsApp:', err);
      toast.error('Failed to generate WhatsApp link.');
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount || 0);
  };

  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-500">Loading ledger...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate('/')}
              className="p-2 -ml-2 text-gray-500 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-bold text-gray-900">Ledger</h1>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={handleDownloadPDF}
              className="p-2 text-gray-500 hover:text-gray-900 transition-colors bg-gray-100 rounded-lg hover:bg-gray-200"
              title="Download PDF"
            >
              <Download className="w-5 h-5" />
            </button>
            <button 
              onClick={handleWhatsAppShare}
              className="p-2 text-green-600 hover:text-green-700 transition-colors bg-green-50 rounded-lg hover:bg-green-100"
              title="Share on WhatsApp"
            >
              <MessageCircle className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 mt-6">
        <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-200 mb-6 sm:mb-8 text-center">
          <p className="text-gray-500 text-xs sm:text-sm font-medium uppercase tracking-wider mb-1">Final Balance</p>
          <div className={`text-2xl sm:text-4xl font-bold ${ledger?.finalBalance > 0 ? 'text-red-600' : ledger?.finalBalance < 0 ? 'text-green-600' : 'text-gray-900'}`}>
            {formatCurrency(Math.abs(ledger?.finalBalance || 0))}
            {ledger?.finalBalance > 0 && <span className="text-xs sm:text-sm font-medium ml-1 sm:ml-2 text-red-500 block mt-1">To Receive</span>}
            {ledger?.finalBalance < 0 && <span className="text-xs sm:text-sm font-medium ml-1 sm:ml-2 text-green-500 block mt-1">To Pay</span>}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-3">
          <h2 className="text-lg font-bold text-gray-800">Transactions</h2>
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <input 
              type="date" 
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="flex-1 sm:flex-none min-w-0 px-2 sm:px-3 py-1.5 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-600 transition-colors"
            />
            <span className="text-gray-400 text-sm">to</span>
            <input 
              type="date" 
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="flex-1 sm:flex-none min-w-0 px-2 sm:px-3 py-1.5 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-600 transition-colors"
            />
            {(startDate || endDate) && (
              <button 
                onClick={() => { setStartDate(''); setEndDate(''); }}
                className="text-xs text-gray-500 hover:text-red-500 underline ml-1"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        <div className="space-y-3">
          {ledger?.entries?.length === 0 || !ledger?.entries ? (
            <div className="text-center py-10 text-gray-500 bg-white rounded-xl border border-gray-100">
              No transactions found.
            </div>
          ) : (
            ledger?.entries?.slice().reverse().map((entry, index) => (
              <div 
                key={entry._id || index} 
                onClick={() => setSelectedEntry(entry)}
                className="bg-white p-3 sm:p-4 rounded-xl shadow-sm border border-gray-100 flex items-start justify-between gap-2 cursor-pointer hover:bg-blue-50/50 hover:border-blue-200 transition-all"
              >
                <div className="flex gap-2 sm:gap-3 min-w-0 flex-1">
                  <div className={`mt-1 p-1.5 sm:p-2 rounded-full shrink-0 ${entry.type === 'credit' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                    {entry.type === 'credit' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold text-gray-900 capitalize text-sm sm:text-base">
                      {entry.type === 'credit' ? 'Given (Credit)' : 'Received (Debit)'}
                    </div>
                    <div className="text-gray-500 flex items-center text-xs mt-1">
                      <Clock className="w-3 h-3 mr-1 shrink-0" />
                      <span className="truncate">{formatDate(entry.createdAt || new Date())}</span>
                    </div>
                    {entry.note && (
                      <div className="text-gray-600 text-xs sm:text-sm mt-2 line-clamp-2">{entry.note}</div>
                    )}
                    {entry.products && entry.products.length > 0 && (
                      <div className="mt-2 text-xs sm:text-sm text-gray-500 truncate">
                        Products: {entry.products.map(p => {
                          const unitLabel = { piece: 'pc', kg: 'kg', gram: 'g', liter: 'L' }[p.unit || 'piece'] || 'pc';
                          return `${p.name} (${p.qty} ${unitLabel})`;
                        }).join(', ')}
                      </div>
                    )}
                  </div>
                </div>
                <div className={`font-bold text-sm sm:text-lg shrink-0 whitespace-nowrap ${entry.type === 'credit' ? 'text-red-600' : 'text-green-600'}`}>
                  {entry.type === 'credit' ? '+' : '-'}{formatCurrency(entry.totalAmount)}
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      <div className="fixed bottom-6 left-0 right-0 flex justify-center px-4 pointer-events-none">
        <div className="max-w-3xl w-full flex justify-end pointer-events-auto">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-full shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
          >
            <TrendingUp className="w-5 h-5" />
            Add Entry
          </button>
        </div>
      </div>

      {isModalOpen && (
        <AddEntryModal 
          onClose={() => setIsModalOpen(false)}
          onSave={handleAddEntry}
        />
      )}

      <EntryDetailsModal 
        entry={selectedEntry} 
        onClose={() => setSelectedEntry(null)} 
        onDelete={handleDeleteEntry}
      />

      {entryToDelete && (
        <ConfirmModal 
          title="Delete Entry"
          message="Are you sure you want to delete this entry? This action cannot be undone."
          onConfirm={confirmDelete}
          onCancel={() => setEntryToDelete(null)}
          confirmText="Delete"
          type="danger"
        />
      )}
    </div>
  );
}
