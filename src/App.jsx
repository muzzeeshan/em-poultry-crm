import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { 
  Home, Users, Store, ShoppingCart, DollarSign, 
  FileText, Package, Plus, Search, Filter, Eye, 
  Edit, TrendingUp, AlertCircle, X
} from 'lucide-react';

// Initialize Supabase
const supabaseUrl = 'https://ttezkkkaqikkcltukezm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR0ZXpra2thcWlra2NsdHVrZXptIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ3MDc0MTksImV4cCI6MjA4MDI4MzQxOX0.5VSLf5uP6Rm35lakDEpCFfL8aO08WSmAiFXuwCPvcNw';

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();
    
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
    });

    return () => authListener?.subscription?.unsubscribe();
  }, []);

  const checkUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    } catch (error) {
      console.error('Auth error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage onLogin={checkUser} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} />
      <div className="ml-64">
        <Header user={user} />
        <main className="p-6">
          {currentPage === 'dashboard' && <Dashboard />}
          {currentPage === 'vendors' && <VendorsPage />}
          {currentPage === 'customers' && <CustomersPage />}
          {currentPage === 'purchases' && <PurchasesPage />}
          {currentPage === 'sales' && <SalesPage />}
          {currentPage === 'inventory' && <InventoryPage />}
          {currentPage === 'reports' && <ReportsPage />}
        </main>
      </div>
    </div>
  );
}

const AuthPage = ({ onLogin }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleAuth = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    if (!email || !password) {
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    if (isSignUp && !businessName) {
      setError('Please enter your business name');
      setLoading(false);
      return;
    }

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { business_name: businessName }
          }
        });
        
        if (error) throw error;
        
        if (data?.user) {
          setSuccess('Account created successfully! You can now sign in.');
          setIsSignUp(false);
          setEmail('');
          setPassword('');
          setBusinessName('');
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        onLogin();
      }
    } catch (error) {
      setError(error.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">EM Poultry CRM</h1>
          <p className="text-gray-600 mt-2">Complete ERP for Poultry Trading</p>
        </div>

        <div className="space-y-4">
          {isSignUp && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Business Name *</label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
              {success}
            </div>
          )}

          <button
            onClick={handleAuth}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? 'Processing...' : isSignUp ? 'Sign Up' : 'Sign In'}
          </button>
        </div>

        <button
          onClick={() => {
            setIsSignUp(!isSignUp);
            setError('');
            setSuccess('');
          }}
          className="w-full text-center text-sm text-blue-600 hover:text-blue-700 mt-4"
        >
          {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
        </button>
      </div>
    </div>
  );
};

const Sidebar = ({ currentPage, setCurrentPage }) => {
  const menuItems = [
    { id: 'dashboard', icon: Home, label: 'Dashboard' },
    { id: 'vendors', icon: Store, label: 'Vendors' },
    { id: 'customers', icon: Users, label: 'Customers' },
    { id: 'purchases', icon: ShoppingCart, label: 'Purchases' },
    { id: 'sales', icon: DollarSign, label: 'Sales' },
    { id: 'inventory', icon: Package, label: 'Inventory' },
    { id: 'reports', icon: FileText, label: 'Reports' },
  ];

  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-gray-900 text-white">
      <div className="p-6">
        <h1 className="text-2xl font-bold">EM CRM</h1>
      </div>
      <nav className="mt-6">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setCurrentPage(item.id)}
            className={`w-full flex items-center px-6 py-3 text-left transition ${
              currentPage === item.id ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800'
            }`}
          >
            <item.icon className="w-5 h-5 mr-3" />
            {item.label}
          </button>
        ))}
      </nav>
    </div>
  );
};

const Header = ({ user }) => {
  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Welcome back!</h2>
          <p className="text-sm text-gray-600">{user?.email}</p>
        </div>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
        >
          Logout
        </button>
      </div>
    </header>
  );
};

const Dashboard = () => {
  const [stats, setStats] = useState({
    todaySales: 0,
    todayPurchases: 0,
    currentStock: 0,
    outstanding: 0
  });

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    const today = new Date().toISOString().split('T')[0];
    
    try {
      const { data: sales } = await supabase
        .from('sales_orders')
        .select('grand_total')
        .gte('created_at', today);
      
      const { data: purchases } = await supabase
        .from('purchase_orders')
        .select('total_amount')
        .gte('created_at', today);

      setStats({
        todaySales: sales?.reduce((sum, s) => sum + (s.grand_total || 0), 0) || 0,
        todayPurchases: purchases?.reduce((sum, p) => sum + (p.total_amount || 0), 0) || 0,
        currentStock: 0,
        outstanding: 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const statCards = [
    { label: "Today's Sales", value: `₹${stats.todaySales.toFixed(2)}`, icon: TrendingUp },
    { label: "Today's Purchases", value: `₹${stats.todayPurchases.toFixed(2)}`, icon: ShoppingCart },
    { label: "Current Stock", value: `${stats.currentStock} kg`, icon: Package },
    { label: "Outstanding", value: `₹${stats.outstanding.toFixed(2)}`, icon: AlertCircle },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-900">Dashboard</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
              </div>
              <div className="p-3 rounded-full bg-blue-100">
                <stat.icon className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-semibold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {['New Purchase', 'New Sale', 'Add Vendor', 'Add Customer'].map((action) => (
            <button key={action} className="flex flex-col items-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition">
              <Plus className="w-8 h-8 text-blue-600 mb-2" />
              <span className="text-sm font-medium">{action}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

const VendorsPage = () => {
  const [vendors, setVendors] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from('vendors')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (data) setVendors(data);
    } catch (error) {
      console.error('Error:', error);
    }
    setLoading(false);
  };

  const filteredVendors = vendors.filter(v => 
    v.vendor_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.phone?.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-gray-900">Vendors</h2>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Vendor
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center space-x-4 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search vendors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vendor Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredVendors.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                      No vendors found. Add your first vendor!
                    </td>
                  </tr>
                ) : (
                  filteredVendors.map((vendor) => (
                    <tr key={vendor.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{vendor.vendor_name}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{vendor.contact_person}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{vendor.phone}</td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                          Active
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button className="p-1 text-blue-600 hover:bg-blue-50 rounded">
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && <VendorModal onClose={() => setShowModal(false)} onSave={fetchVendors} />}
    </div>
  );
};

const VendorModal = ({ onClose, onSave }) => {
  const [formData, setFormData] = useState({
    vendor_code: `VEN-${Date.now()}`,
    vendor_name: '',
    contact_person: '',
    phone: '',
    email: '',
    street_address: '',
    city: '',
    state: '',
    gst_number: ''
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!formData.vendor_name || !formData.phone) {
      alert('Please fill required fields');
      return;
    }

    setSaving(true);
    
    try {
      const { error } = await supabase.from('vendors').insert([formData]);
      
      if (error) {
        alert('Error: ' + error.message);
      } else {
        onSave();
        onClose();
      }
    } catch (error) {
      alert('Error: ' + error.message);
    }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b flex items-center justify-between">
          <h3 className="text-xl font-semibold">Add New Vendor</h3>
          <button onClick={onClose}>
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Vendor Name *</label>
              <input
                type="text"
                value={formData.vendor_name}
                onChange={(e) => setFormData({...formData, vendor_name: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Contact Person *</label>
              <input
                type="text"
                value={formData.contact_person}
                onChange={(e) => setFormData({...formData, contact_person: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Phone *</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button onClick={onClose} className="px-4 py-2 border rounded-lg hover:bg-gray-50">
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Vendor'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Placeholder components for other pages
const CustomersPage = () => <div className="text-2xl font-bold">Customers Page - Coming Soon</div>;
const PurchasesPage = () => <div className="text-2xl font-bold">Purchases Page - Coming Soon</div>;
const SalesPage = () => <div className="text-2xl font-bold">Sales Page - Coming Soon</div>;
const InventoryPage = () => <div className="text-2xl font-bold">Inventory Page - Coming Soon</div>;
const ReportsPage = () => <div className="text-2xl font-bold">Reports Page - Coming Soon</div>;

export default App;
