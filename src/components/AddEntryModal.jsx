import { useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';

const UNIT_OPTIONS = [
  { value: 'piece', label: 'Piece' },
  { value: 'kg', label: 'Kg' },
  { value: 'gram', label: 'Gram' },
  { value: 'liter', label: 'Liter' },
];

const getUnitLabel = (unit) => {
  const labels = { piece: 'pc', kg: 'kg', gram: 'g', liter: 'L' };
  return labels[unit] || 'pc';
};

export default function AddEntryModal({ onClose, onSave }) {
  const [type, setType] = useState('credit');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [products, setProducts] = useState([{ name: '', price: '', qty: 1, unit: 'piece' }]);
  const [loading, setLoading] = useState(false);

  const handleAddProduct = () => {
    setProducts([...products, { name: '', price: '', qty: 1, unit: 'piece' }]);
  };

  const handleRemoveProduct = (index) => {
    setProducts(products.filter((_, i) => i !== index));
  };

  const handleProductChange = (index, field, value) => {
    const newProducts = [...products];
    newProducts[index][field] = value;
    setProducts(newProducts);
  };

  const calculateTotal = () => {
    if (type === 'debit') return parseFloat(amount) || 0;
    return products.reduce((total, p) => total + (parseFloat(p.price) || 0) * (parseFloat(p.qty) || 1), 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const entryData = {
      type,
      note,
      amount: calculateTotal()
    };

    if (type === 'credit') {
      entryData.products = products.filter(p => p.name.trim() !== '');
    }

    await onSave(entryData);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-4 border-b border-gray-100 shrink-0">
          <h2 className="text-lg font-semibold text-gray-900">Add Entry</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-4 shrink-0">
          <div className="flex rounded-lg bg-gray-100 p-1">
            <button
              onClick={() => setType('credit')}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${type === 'credit' ? 'bg-white shadow-sm text-red-600' : 'text-gray-600 hover:text-gray-900'}`}
            >
              Credit (Given)
            </button>
            <button
              onClick={() => setType('debit')}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${type === 'debit' ? 'bg-white shadow-sm text-green-600' : 'text-gray-600 hover:text-gray-900'}`}
            >
              Debit (Received)
            </button>
          </div>
        </div>

        <div className="overflow-y-auto p-4 pt-0 flex-1">
          <form id="entry-form" onSubmit={handleSubmit} className="space-y-4">
            
            {type === 'debit' ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors text-lg"
                  placeholder="₹0.00"
                />
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-gray-700">Products</label>
                </div>
                
                {products.map((product, index) => (
                  <div key={index} className="bg-gray-50 p-3 rounded-lg border border-gray-200 flex gap-2 items-start relative">
                    <div className="flex-1 space-y-2">
                      <input
                        type="text"
                        value={product.name}
                        onChange={(e) => handleProductChange(index, 'name', e.target.value)}
                        required
                        placeholder="Item name"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      />
                      <div className="flex gap-2">
                        <div className="flex-1">
                          <input
                            type="number"
                            value={product.price}
                            onChange={(e) => handleProductChange(index, 'price', e.target.value)}
                            required
                            min="0"
                            step="0.01"
                            placeholder={`Price per ${getUnitLabel(product.unit)}`}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                          />
                        </div>
                        <input
                          type="number"
                          value={product.qty}
                          onChange={(e) => handleProductChange(index, 'qty', e.target.value)}
                          required
                          min="0.01"
                          step="any"
                          placeholder="Qty"
                          className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        />
                        <select
                          value={product.unit}
                          onChange={(e) => handleProductChange(index, 'unit', e.target.value)}
                          className="w-24 px-2 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                        >
                          {UNIT_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      </div>
                      {/* Show line total */}
                      <div className="text-right text-xs text-gray-500">
                        = ₹{((parseFloat(product.price) || 0) * (parseFloat(product.qty) || 0)).toFixed(2)}
                      </div>
                    </div>
                    {products.length > 1 && (
                      <button 
                        type="button" 
                        onClick={() => handleRemoveProduct(index)}
                        className="p-1.5 mt-1 text-gray-400 hover:text-red-500 rounded-md hover:bg-gray-200 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
                
                <button
                  type="button"
                  onClick={handleAddProduct}
                  className="w-full py-2 border border-dashed border-gray-300 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 flex items-center justify-center gap-1 transition-colors"
                >
                  <Plus className="w-4 h-4" /> Add Another Item
                </button>
                
                <div className="flex justify-between items-center py-2 px-1 text-sm font-medium text-gray-800">
                  <span>Total Amount:</span>
                  <span className="text-lg">₹{calculateTotal().toFixed(2)}</span>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Note (Optional)</label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows="2"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                placeholder="Any additional details..."
              ></textarea>
            </div>
          </form>
        </div>

        <div className="p-4 border-t border-gray-100 shrink-0 flex gap-3 bg-white">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="entry-form"
            disabled={loading || calculateTotal() <= 0}
            className={`flex-1 px-4 py-2.5 text-white rounded-lg font-medium transition-colors disabled:opacity-70 ${type === 'credit' ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
          >
            {loading ? 'Saving...' : 'Save Entry'}
          </button>
        </div>
      </div>
    </div>
  );
}
