"use client";

import { useState, useEffect, useMemo } from "react";
import UserModal, { UserFormData } from "./UserModal";
import toast from "@/utils/toast";
import AdminProtected from "@/components/AdminProtected";

// Define types for our user data
export interface User {
  id: string;
  full_name: string | null;
  email: string | null;
  role: string | null;
  membership_type: string | null;
  days_left: number | null;
  affiliate_code: string | null;
  status: string | null;
  created_at: string;
  updated_at: string | null;
  telegram_id: string | null;
  auth_id?: string;
};

// Helper function to display days left
const getDaysLeftDisplay = (daysLeft: number | null, membershipType: string | null) => {
  if (membershipType === 'Free' || daysLeft === null) return 'N/A';
  if (daysLeft < 0) return 'Expired';
  return `${daysLeft} day(s)`;
};

function AllUsersPage() {
  // State for users and UI
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserFormData | null>(null);

  // Search and filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [membershipFilter, setMembershipFilter] = useState<string>("all");
  const [sort, setSort] = useState<string>("created_at-desc"); // newest first

  // Debounce search term
  const [debouncedSearch, setDebouncedSearch] = useState("");
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch users from API
  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/admin/users');
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch users');
      }
      const data = await response.json();
      console.log('API response data:', data);
      
      if (data.users && Array.isArray(data.users)) {
        // Data comes back in the format we need now
        setUsers(data.users);
        console.log(`Got ${data.users.length} users from API`);
      } else {
        throw new Error('Invalid data format received from server');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setError(error instanceof Error ? error.message : 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Memoized filtering and sorting
  const filteredUsers = useMemo(() => {
    return users
      .filter(user => {
        const lowercasedSearch = debouncedSearch.toLowerCase();
        const matchesSearch =
          user.full_name?.toLowerCase().includes(lowercasedSearch) ||
          user.email?.toLowerCase().includes(lowercasedSearch) ||
          user.affiliate_code?.toLowerCase().includes(lowercasedSearch);
        const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
        const matchesMembership = membershipFilter === 'all' || user.membership_type === membershipFilter;
        return matchesSearch && matchesStatus && matchesMembership;
      })
      .sort((a, b) => {
        const [sortField, sortDirection] = sort.split('-') as [keyof User, 'asc' | 'desc'];
        const aVal = a[sortField];
        const bVal = b[sortField];

        if (aVal === null || aVal === undefined) return 1;
        if (bVal === null || bVal === undefined) return -1;

        if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
  }, [users, debouncedSearch, statusFilter, membershipFilter, sort]);

  // Handlers
  const handleSort = (field: keyof User) => {
    const [currentField, currentDirection] = sort.split('-');
    if (field === currentField) {
      setSort(`${field}-${currentDirection === 'asc' ? 'desc' : 'asc'}`);
    } else {
      setSort(`${field}-desc`);
    }
  };

  const openAddUserModal = () => {
    setCurrentUser(null);
    setIsModalOpen(true);
  };

  const handleEdit = (user: User) => {
    setCurrentUser({
      id: user.id,
      name: user.full_name || '',
      email: user.email || '',
      dateJoined: user.created_at,
      daysLeft: user.days_left ?? 0,
      membershipType: (user.membership_type as 'Premium' | 'Free' | 'Team') || 'Free',
      affiliateLink: user.affiliate_code || '',
      telegramId: user.telegram_id || '',
      status: (user.status as 'Active' | 'Pending' | 'Suspended') || 'Pending',
      role: (user.role as 'MEMBER' | 'ADMIN') || 'MEMBER',
    });
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const handleSaveUser = async (userData: UserFormData) => {
    const toastId = toast.loading(userData.id ? 'Updating user...' : 'Creating user...');
    try {
      const url = userData.id ? `/api/admin/users` : `/api/admin/createUser`;
      const method = userData.id ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Failed to save user');
      }

      await fetchUsers();
      
      toast.success(`User ${userData.id ? 'updated' : 'created'} successfully!`, { id: toastId });
      closeModal();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An unknown error occurred';
      toast.error(message, { id: toastId });
      console.error('Failed to save user:', err);
    }
  };

  const deleteUser = async (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      const toastId = toast.loading('Deleting user...');
      try {
        const response = await fetch(`/api/admin/users?id=${userId}`, { method: 'DELETE' });
        if (!response.ok) {
          const { error } = await response.json();
          throw new Error(error || 'Failed to delete user');
        }
        setUsers(users.filter(user => user.id !== userId));
        toast.success('User deleted successfully', { id: toastId });
      } catch (err: unknown) {
        const message = err instanceof Error ? `Failed to delete user: ${err.message}` : 'An unknown error occurred';
        toast.error(message, { id: toastId });
        console.error('Error deleting user:', err);
      }
    }
  };

  const handleResendInvite = async (email: string | null) => {
    if (!email) {
      toast.error('User has no email address.');
      return;
    }
    const toastId = toast.loading('Resending invitation...');
    try {
      const response = await fetch('/api/admin/resend-invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (!response.ok) {
        const { error } = await response.json();
        throw new Error(error || 'Failed to resend invitation');
      }
      toast.success('Invitation resent successfully!', { id: toastId });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'An unknown error occurred';
      toast.error(message, { id: toastId });
      console.error('Error resending invitation:', error);
    }
  };

  const exportToCSV = () => {
    const headers = ["Name", "Email", "Date Joined", "Membership Type", "Days Left", "Affiliate Link", "Status"];
    const userData = filteredUsers.map(user => [
      `"${user.full_name || ''}"`,
      `"${user.email || ''}"`,
      `"${new Date(user.created_at).toLocaleDateString()}"`,
      `"${user.membership_type || ''}"`,
      `"${getDaysLeftDisplay(user.days_left, user.membership_type)}"`,
      `"${user.affiliate_code || ''}"`,
      `"${user.status || ''}"`
    ]);
    const csvContent = [headers.join(","), ...userData.map(row => row.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", `users_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Render
  return (
    <div className="p-4 md:p-6 lg:p-8">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4 md:mb-0">All Users ({filteredUsers.length})</h1>
        <div className="flex space-x-2">
          <button onClick={exportToCSV} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300">Export CSV</button>
          <button onClick={openAddUserModal} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">Add User</button>
        </div>
      </header>

      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <input
          type="text"
          placeholder="Search by name, email, or affiliate..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-grow p-2 border border-gray-300 rounded-md"
        />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="p-2 border border-gray-300 rounded-md">
          <option value="all">All Statuses</option>
          <option value="Active">Active</option>
          <option value="Pending">Pending</option>
          <option value="Suspended">Suspended</option>
        </select>
        <select value={membershipFilter} onChange={(e) => setMembershipFilter(e.target.value)} className="p-2 border border-gray-300 rounded-md">
          <option value="all">All Memberships</option>
          <option value="Premium">Premium</option>
          <option value="Free">Free</option>
        </select>
      </div>

      {loading && <p>Loading users...</p>}
      {error && <p className="text-red-500">Error: {error}</p>}
      
      {!loading && !error && (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('full_name')}>Name</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('membership_type')}>Membership</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('status')}>Status</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('created_at')}>Date Joined</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {user.full_name || <span className="italic text-gray-400">No name</span>}
                    </div>
                    <div className="text-sm text-gray-500">{user.email || <span className="italic text-gray-400">No email</span>}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{user.membership_type || 'Free'}</div>
                    <div className="text-sm text-gray-500">{getDaysLeftDisplay(user.days_left, user.membership_type)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      user.status === 'Active' ? 'bg-green-100 text-green-800' :
                      user.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                      user.status === 'Suspended' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {user.status || 'Unknown'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'Unknown'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button onClick={() => handleEdit(user)} className="text-blue-600 hover:text-blue-900 mr-4">Edit</button>
                    <button onClick={() => handleResendInvite(user.email)} className="text-indigo-600 hover:text-indigo-900 mr-4">Resend Invite</button>
                    <button onClick={() => deleteUser(user.id)} className="text-red-600 hover:text-red-900">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <UserModal
        isOpen={isModalOpen}
        onClose={closeModal}
        currentUser={currentUser}
        onSave={handleSaveUser}
      />
    </div>
  );
}

export default function ProtectedAdminUsersPage() {
  return (
    <AdminProtected>
      <AllUsersPage />
    </AdminProtected>
  );
}
