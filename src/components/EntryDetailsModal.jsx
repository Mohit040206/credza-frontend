import { X, TrendingUp, TrendingDown, Clock } from 'lucide-react';

const getUnitLabel = (unit) => {
  const labels = { piece: 'pc', kg: 'kg', gram: 'g', liter: 'L' };
  return labels[unit] || 'pc';
};

export default function EntryDetailsModal({ entry, onClose }) {
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
            <div className={`text-4xl font-bold ${entry.type === 'credit' ? 'text-red-600' : 'text-green-600'}`}>
              {entry.type === 'credit' ? '+' : '-'}{formatCurrency(entry.totalAmount)}
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 space-y-3 border border-gray-100">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500">Date</span>
              <span className="font-medium text-gray-900 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-gray-400" />
                {formatDate(entry.createdAt)}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500">Transaction ID</span>
              <span className="font-medium text-gray-900 text-xs">{entry._id}</span>
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
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Unit Price</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Qty</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {entry.products.map((p, idx) => {
                      const unit = p.unit || 'piece';
                      const unitLabel = getUnitLabel(unit);
                      return (
                        <tr key={idx}>
                          <td className="px-4 py-2 text-sm text-gray-900">{p.name}</td>
                          <td className="px-4 py-2 text-sm text-gray-600 text-right">₹{p.price}/{unitLabel}</td>
                          <td className="px-4 py-2 text-sm text-gray-600 text-right">{p.qty} {unitLabel}</td>
                          <td className="px-4 py-2 text-sm text-gray-900 font-medium text-right">₹{(p.qty * p.price).toFixed(2)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot className="bg-gray-50">
                    <tr>
                      <td colSpan="3" className="px-4 py-2 text-sm font-semibold text-gray-700 text-right">Total</td>
                      <td className="px-4 py-2 text-sm font-bold text-gray-900 text-right">
                        {formatCurrency(entry.products.reduce((sum, p) => sum + (p.qty * p.price), 0))}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-gray-100 shrink-0 bg-gray-50 text-center">
           <button onClick={onClose} className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-100 font-medium py-2 px-6 rounded-lg transition-colors w-full">
            Close
           </button>
        </div>
      </div>
    </div>
  );
}
