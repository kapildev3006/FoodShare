'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
// import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FiUser, FiPhone, FiMapPin, FiHome, FiArrowLeft, FiCheck, FiAlertTriangle } from 'react-icons/fi';
import { useAuth } from '../../../context/AuthContext';
import { db } from '../../../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import Navbar from '../../../components/Navbar';

// Indian states list
const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry'
];

const ProfileEditPage = () => {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    displayName: '',
    mobileNumber: '',
    state: '',
    city: '',
    address: ''
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    
    const fetchUserProfile = async () => {
      if (!user?.uid) return;
      
      try {
        setLoading(true);
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setFormData({
            displayName: userData.displayName || user.displayName || '',
            mobileNumber: userData.mobileNumber || '',
            state: userData.state || '',
            city: userData.city || '',
            address: userData.address || ''
          });
        } else {
          // If user exists in auth but not in Firestore
          setFormData({
            displayName: user.displayName || '',
            mobileNumber: '',
            state: '',
            city: '',
            address: ''
          });
        }
      } catch (err) {
        console.error('Error fetching user profile:', err);
        setError('Failed to load profile. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserProfile();
  }, [isAuthenticated, user, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    
    try {
      // Validations
      if (!formData.displayName || !formData.mobileNumber || !formData.state || !formData.city) {
        throw new Error('Please fill in all required fields');
      }
      
      // Validate mobile number (10 digits)
      if (!/^\d{10}$/.test(formData.mobileNumber)) {
        throw new Error('Please enter a valid 10-digit mobile number');
      }
      
      if (!user?.uid) {
        throw new Error('User not authenticated');
      }
      
      // Update user profile in Firestore
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, {
        displayName: formData.displayName,
        mobileNumber: formData.mobileNumber,
        state: formData.state,
        city: formData.city,
        address: formData.address,
        profileComplete: true,
        updatedAt: new Date()
      });
      
      setSuccess(true);
      setTimeout(() => {
        router.push('/profile');
      }, 1500);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 py-12 px-4">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-6">
            <Link 
              href="/profile" 
              className="inline-flex items-center text-sm text-gray-600 hover:text-green-600"
            >
              <FiArrowLeft className="mr-2" /> Back to Profile
            </Link>
          </div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-lg shadow-md p-8"
          >
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Profile</h1>
            
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
                <div className="flex">
                  <FiAlertTriangle className="h-5 w-5 text-red-500 mr-2" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            )}
            
            {success && (
              <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6">
                <div className="flex">
                  <FiCheck className="h-5 w-5 text-green-500 mr-2" />
                  <p className="text-sm text-green-700">Profile updated successfully!</p>
                </div>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name*
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiUser className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="displayName"
                    name="displayName"
                    type="text"
                    value={formData.displayName}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                    placeholder="Your full name"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="mobileNumber" className="block text-sm font-medium text-gray-700 mb-1">
                  Mobile Number*
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiPhone className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="mobileNumber"
                    name="mobileNumber"
                    type="tel"
                    value={formData.mobileNumber}
                    onChange={handleChange}
                    required
                    pattern="[0-9]{10}"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                    placeholder="10-digit mobile number"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">This will be shown to other users for contact.</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                    State*
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiMapPin className="h-5 w-5 text-gray-400" />
                    </div>
                    <select
                      id="state"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      required
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                    >
                      <option value="">Select your state</option>
                      {INDIAN_STATES.map((state) => (
                        <option key={state} value={state}>
                          {state}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                    City*
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiHome className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="city"
                      name="city"
                      type="text"
                      value={formData.city}
                      onChange={handleChange}
                      required
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                      placeholder="Your city"
                    />
                  </div>
                </div>
              </div>
              
              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                  Address (Optional)
                </label>
                <textarea
                  id="address"
                  name="address"
                  rows={3}
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                  placeholder="Your full address (will not be shared publicly)"
                />
                <p className="mt-1 text-xs text-gray-500">
                  This is for your reference only and will not be publicly displayed.
                </p>
              </div>
              
              <div className="flex justify-end space-x-4 pt-4">
                <Link
                  href="/profile"
                  className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={saving}
                  className={`px-6 py-3 rounded-lg text-white font-medium transition-colors ${
                    saving ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
                  }`}
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default ProfileEditPage;
