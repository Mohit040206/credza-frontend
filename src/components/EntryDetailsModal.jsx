import { X, TrendingUp, TrendingDown, Clock, Trash2 } from 'lucide-react';

const getUnitLabel = (unit) => {
  const labels = { piece: 'pc', kg: 'kg', gram: 'g', liter: 'L' };
  return labels[unit] || 'pc';
};

export default function EntryDetailsModal({ entry, onClose, onDelete }) {
  if (!entry) return null;

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount || 0);
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-4 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-full ${entry.type === 'credit' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
              {entry.type === 'credit' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            </div>
            <h2 className="text-lg font-semibold text-gray-900 capitalize">
              {entry.type === 'credit' ? 'Credit Details' : 'Debit Details'}
            </h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto p-5 space-y-6">
          <div className="text-center">
            <div className="text-sm text-gray-500 mb-1">Amount</div>
            <div className={`text-3xl sm:text-4xl font-bold ${entry.type === 'credit' ? 'text-red-600' : 'text-green-600'}`}>
              {entry.type === 'credit' ? '+' : '-'}{formatCurrency(entry.totalAmount)}
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-3 sm:p-4 space-y-3 border border-gray-100">
            <div className="flex justify-between items-center text-sm gap-2">
              <span className="text-gray-500 shrink-0">Date</span>
              <span className="font-medium text-gray-900 flex items-center gap-1 text-xs sm:text-sm text-right">
                <Clock className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                {formatDate(entry.createdAt)}
              </span>
            </div>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 text-sm">
              <span className="text-gray-500 shrink-0">Transaction ID</span>
              <span className="font-medium text-gray-900 text-xs break-all">{entry._id}</span>
            </div>
          </div>

          {entry.note && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Note</h3>
              <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-600 whitespace-pre-wrap border border-gray-100">
                {entry.note}
              </div>
            </div>
          )}

          {entry.products && entry.products.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Products</h3>
              <div className="bg-white border border-gray-200 rounded-lg overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-2 sm:px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                      <th className="px-2 sm:px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase whitespace-nowrap">Price</th>
                      <th className="px-2 sm:px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Qty</th>
                      <th className="px-2 sm:px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {entry.products.map((p, idx) => {
                      const unit = p.unit || 'piece';
                      const unitLabel = getUnitLabel(unit);
                      return (
                        <tr key={idx}>
                          <td className="px-2 sm:px-4 py-2 text-xs sm:text-sm text-gray-900">{p.name}</td>
                          <td className="px-2 sm:px-4 py-2 text-xs sm:text-sm text-gray-600 text-right whitespace-nowrap">₹{p.price}/{unitLabel}</td>
                          <td className="px-2 sm:px-4 py-2 text-xs sm:text-sm text-gray-600 text-right whitespace-nowrap">{p.qty} {unitLabel}</td>
                          <td className="px-2 sm:px-4 py-2 text-xs sm:text-sm text-gray-900 font-medium text-right whitespace-nowrap">₹{(p.qty * p.price).toFixed(2)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot className="bg-gray-50">
                    <tr>
                      <td colSpan="3" className="px-2 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-gray-700 text-right">Total</td>
                      <td className="px-2 sm:px-4 py-2 text-xs sm:text-sm font-bold text-gray-900 text-right whitespace-nowrap">
                        {formatCurrency(entry.products.reduce((sum, p) => sum + (p.qty * p.price), 0))}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-gray-100 shrink-0 bg-gray-50 flex gap-3">
           <button 
             onClick={onClose} 
             className="flex-1 bg-white border border-gray-300 text-gray-700 hover:bg-gray-100 font-medium py-2 rounded-lg transition-colors"
           >
            Close
           </button>
           <button 
             onClick={() => onDelete(entry._id)} 
             className="flex-1 bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 font-medium py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
           >
            <Trash2 className="w-4 h-4" />
            Delete
           </button>
        </div>
      </div>
    </div>
  );
}
