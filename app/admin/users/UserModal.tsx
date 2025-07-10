"use client";

import { useState, useEffect } from "react";

export interface UserFormData {
  id?: string;
  name: string;
  email?: string;  // Made optional with ?
  dateJoined: string;
  daysLeft: number;
  membershipType: "Free" | "Premium" | "Team";
  affiliateLink: string;
  status: "Active" | "Pending" | "Suspended";
  telegramId?: string;
  sendActivationEmail?: boolean; // Control whether to send activation email
}

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserFormData | null;
  onSave: (userData: UserFormData) => void;
}

// Simplified UserModal component for better reliability
export default function UserModal({ isOpen, onClose, currentUser, onSave }: UserModalProps) {
  const [formData, setFormData] = useState<UserFormData>({
    name: "",
    email: "",
    dateJoined: new Date().toISOString().split("T")[0],
    daysLeft: 0,
    membershipType: "Free",
    affiliateLink: "",
    status: "Active",
    telegramId: "",
    sendActivationEmail: false // Default to not sending emails
  });

  const [errors, setErrors] = useState<{[key: string]: string}>({});

  // Reset form when modal opens/closes or current user changes
  useEffect(() => {
    if (currentUser) {
      setFormData({
        ...currentUser,
        // Ensure date is in the correct format for the date input
        dateJoined: currentUser.dateJoined.split("T")[0]
      });
    } else {
      setFormData({
        name: "",
        email: "",
        dateJoined: new Date().toISOString().split("T")[0],
        daysLeft: 0,
        membershipType: "Free",
        affiliateLink: "",
        status: "Active",
        telegramId: ""
      });
    }
    setErrors({});
  }, [currentUser, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    let parsedValue: string | number = value;
    if (name === "daysLeft") {
      parsedValue = parseInt(value) || 0;
    }
    
    setFormData(prev => ({ ...prev, [name]: parsedValue }));
    
    // Clear error when field is modified
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: {[key: string]: string} = {};
    
    if (!formData.name.trim()) newErrors.name = "Name is required";
    
    // Email is optional but must be valid if provided
    const email = formData.email || '';
    if (email.trim() && !/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Email is invalid";
    }
    
    if (!formData.dateJoined) newErrors.dateJoined = "Date joined is required";
    
    if (formData.membershipType === "Premium" && formData.daysLeft <= 0) {
      newErrors.daysLeft = "Premium users must have days left > 0";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const generatePlaceholderEmail = (username: string) => {
    const randomString = Math.random().toString(36).substring(2, 8);
    return `${username.toLowerCase().replace(/\s+/g, '.')}.${randomString}@placeholder.opcpoint`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Generate a placeholder email if none is provided
      const email = formData.email?.trim() || generatePlaceholderEmail(formData.name);
      
      const dataToSave = {
        ...formData,
        email: email
      };
      
      onSave(dataToSave);
    }
  };

  console.log('UserModal render - isOpen:', isOpen);
  
  if (!isOpen) {
    console.log('UserModal not showing because isOpen is false');
    return null;
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-medium">
            {currentUser ? "Edit User" : "Add New User"}
          </h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
            aria-label="Close modal"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name Field */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Full Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`mt-1 block w-full border ${errors.name ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
            />
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
          </div>
          
          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Optional"
              className={`mt-1 block w-full border ${errors.email ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
            />
            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Date Joined Field */}
            <div>
              <label htmlFor="dateJoined" className="block text-sm font-medium text-gray-700">
                Date Joined
              </label>
              <input
                type="date"
                id="dateJoined"
                name="dateJoined"
                value={formData.dateJoined}
                onChange={handleChange}
                className={`mt-1 block w-full border ${errors.dateJoined ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
              />
              {errors.dateJoined && <p className="mt-1 text-sm text-red-600">{errors.dateJoined}</p>}
            </div>
            
            {/* Membership Type Field */}
            <div>
              <label htmlFor="membershipType" className="block text-sm font-medium text-gray-700">
                Membership Type
              </label>
              <select
                id="membershipType"
                name="membershipType"
                value={formData.membershipType}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="Free">Free</option>
                <option value="Team">Team</option>
                <option value="Premium">Premium</option>
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Days Left Field */}
            <div>
              <label htmlFor="daysLeft" className="block text-sm font-medium text-gray-700">
                Days Left in Subscription
              </label>
              <input
                type="number"
                id="daysLeft"
                name="daysLeft"
                value={formData.daysLeft}
                onChange={handleChange}
                disabled={formData.membershipType === "Free" || formData.membershipType === "Team"}
                className={`mt-1 block w-full border ${errors.daysLeft ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${formData.membershipType === "Free" || formData.membershipType === "Team" ? 'bg-gray-100' : ''}`}
              />
              {errors.daysLeft && <p className="mt-1 text-sm text-red-600">{errors.daysLeft}</p>}
              {(formData.membershipType === "Free" || formData.membershipType === "Team") && 
                <p className="mt-1 text-xs text-gray-500">Not applicable for {formData.membershipType} users</p>
              }
            </div>
            
            {/* Status Field */}
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                Status
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="Active">Active</option>
                <option value="Pending">Pending</option>
                <option value="Suspended">Suspended</option>
              </select>
            </div>
          </div>
          
          {/* Telegram ID Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Telegram ID
            </label>
            <input
              type="text"
              name="telegramId"
              value={formData.telegramId || ''}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="User's Telegram ID"
            />
          </div>
          
          {/* Send Activation Email Checkbox - Only show when creating a new user */}
          {!currentUser && (
            <div className="flex items-center">
              <input
                type="checkbox"
                id="sendActivationEmail"
                name="sendActivationEmail"
                checked={!!formData.sendActivationEmail}
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    sendActivationEmail: e.target.checked
                  });
                }}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="sendActivationEmail" className="ml-2 block text-sm text-gray-700">
                Send activation email to user
              </label>
            </div>
          )}
          
          {/* Affiliate Link Field */}
          <div>
            <label htmlFor="affiliateLink" className="block text-sm font-medium text-gray-700">
              Affiliate Link (Optional)
            </label>
            <input
              type="text"
              id="affiliateLink"
              name="affiliateLink"
              value={formData.affiliateLink}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="partner_code or leave blank"
            />
          </div>
          
          <div className="mt-6 flex justify-end space-x-3">
            <button 
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              {currentUser ? "Update User" : "Add User"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
