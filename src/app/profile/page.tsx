'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FiUser, FiPhone, FiMapPin, FiHome, FiEdit, FiList, FiHeart, FiLogOut, FiMessageSquare } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../firebase';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import Navbar from '../../components/Navbar';

interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL: string | null;
  mobileNumber: string;
  city: string;
  state: string;
  address?: string;
  createdAt: Date;
  updatedAt?: Date;
  profileComplete: boolean;
}

const ProfilePage = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Stats
  const [stats, setStats] = useState({
    totalListings: 0,
    activeListings: 0,
    savedListings: 0,
    unreadMessages: 0
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
          setUserProfile({
            uid: user.uid,
            displayName: userData.displayName || user.displayName || '',
            email: user.email || '',
            photoURL: user.photoURL,
            mobileNumber: userData.mobileNumber || '',
            city: userData.city || '',
            state: userData.state || '',
            address: userData.address || '',
            createdAt: userData.createdAt?.toDate() || new Date(),
            updatedAt: userData.updatedAt?.toDate() || new Date(),
            profileComplete: userData.profileComplete || false
          });
        } else {
          // If user exists in auth but not in Firestore
          setUserProfile({
            uid: user.uid,
            displayName: user.displayName || '',
            email: user.email || '',
            photoURL: user.photoURL,
            mobileNumber: '',
            city: '',
            state: '',
            createdAt: new Date(),
            profileComplete: false
          });
        }
      } catch (err) {
        console.error('Error fetching user profile:', err);
        setError('Failed to load profile. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    // Fetch user statistics
    const fetchUserStats = async () => {
      if (!user?.uid) return;
      
      try {
        // Fetch real data from Firestore
        // Get user's listings
        const listingsQuery = query(
          collection(db, 'foodListings'),
          where('userId', '==', user.uid)
        );
        const listingsSnapshot = await getDocs(listingsQuery);
        const totalListings = listingsSnapshot.size;
        
        // Get active listings
        const activeListingsQuery = query(
          collection(db, 'foodListings'),
          where('userId', '==', user.uid),
          where('isAvailable', '==', true)
        );
        const activeListingsSnapshot = await getDocs(activeListingsQuery);
        const activeListings = activeListingsSnapshot.size;
        
        // Get saved items
        const savedQuery = query(
          collection(db, 'wishlist'),
          where('userId', '==', user.uid)
        );
        const savedSnapshot = await getDocs(savedQuery);
        const savedListings = savedSnapshot.size;
        
        // Get unread messages
        const messagesQuery = query(
          collection(db, 'conversations'),
          where('participants', 'array-contains', user.uid),
          where('hasUnread', '==', true)
        );
        const messagesSnapshot = await getDocs(messagesQuery);
        const unreadMessages = messagesSnapshot.size;
        
        setStats({
          totalListings,
          activeListings,
          savedListings,
          unreadMessages
        });
      } catch (err) {
        console.error('Error fetching user stats:', err);
      }
    };
    
    fetchUserProfile();
    fetchUserStats();
  }, [isAuthenticated, user, router]);

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Error logging out:', error);
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

  if (!userProfile) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 py-12 px-4">
          <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
            <div className="text-center text-red-600">
              {error || 'Profile not found. Please try logging in again.'}
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {/* Profile Header */}
            <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-8 sm:px-8">
              <div className="flex flex-col sm:flex-row items-center">
                <div className="relative w-24 h-24 sm:w-32 sm:h-32 mb-4 sm:mb-0 sm:mr-6">
                  {userProfile.photoURL ? (
                    <Image
                      src={userProfile.photoURL}
                      alt="Profile"
                      fill
                      className="rounded-full object-cover border-4 border-white"
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-green-500 flex items-center justify-center border-4 border-white">
                      <FiUser className="text-white text-5xl" />
                    </div>
                  )}
                </div>
                <div className="text-center sm:text-left">
                  <h1 className="text-2xl sm:text-3xl font-bold text-white">
                    {userProfile.displayName || 'User'}
                  </h1>
                  <p className="text-green-100 mt-1">{userProfile.email}</p>
                  <div className="mt-4">
                    <Link 
                      href="/profile/edit" 
                      className="bg-white text-green-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-50 transition-colors inline-flex items-center"
                    >
                      <FiEdit className="mr-2" /> Edit Profile
                    </Link>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Profile Stats */}
            <div className="border-b border-gray-200">
              <div className="grid grid-cols-3 divide-x divide-gray-200">
                <div className="px-6 py-4 text-center">
                  <div className="text-2xl font-bold text-gray-800">{stats.totalListings}</div>
                  <div className="text-sm text-gray-500">Total Listings</div>
                </div>
                <div className="px-6 py-4 text-center">
                  <div className="text-2xl font-bold text-gray-800">{stats.activeListings}</div>
                  <div className="text-sm text-gray-500">Active Listings</div>
                </div>
                <div className="px-6 py-4 text-center">
                  <div className="text-2xl font-bold text-gray-800">{stats.savedListings}</div>
                  <div className="text-sm text-gray-500">Saved Items</div>
                </div>
              </div>
            </div>
            
            {/* Profile Info */}
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Personal Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-start">
                  <FiUser className="text-green-500 mt-1 mr-3" />
                  <div>
                    <div className="text-sm text-gray-500">Full Name</div>
                    <div className="font-medium">{userProfile.displayName || 'Not provided'}</div>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <FiPhone className="text-green-500 mt-1 mr-3" />
                  <div>
                    <div className="text-sm text-gray-500">Mobile Number</div>
                    <div className="font-medium">{userProfile.mobileNumber || 'Not provided'}</div>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <FiMapPin className="text-green-500 mt-1 mr-3" />
                  <div>
                    <div className="text-sm text-gray-500">State</div>
                    <div className="font-medium">{userProfile.state || 'Not provided'}</div>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <FiHome className="text-green-500 mt-1 mr-3" />
                  <div>
                    <div className="text-sm text-gray-500">City</div>
                    <div className="font-medium">{userProfile.city || 'Not provided'}</div>
                  </div>
                </div>
                
                {userProfile.address && (
                  <div className="flex items-start col-span-2">
                    <FiMapPin className="text-green-500 mt-1 mr-3" />
                    <div>
                      <div className="text-sm text-gray-500">Address</div>
                      <div className="font-medium">{userProfile.address}</div>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Account Actions</h2>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  <Link href="/my-listings" className="flex flex-col items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <FiList className="text-green-600 text-2xl mb-2" />
                    <span className="text-sm font-medium">My Listings</span>
                  </Link>
                  
                  <Link href="/messages" className="flex flex-col items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors relative">
                    <FiMessageSquare className="text-green-600 text-2xl mb-2" />
                    <span className="text-sm font-medium">Messages</span>
                    {stats.unreadMessages > 0 && (
                      <motion.span 
                        className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                      >
                        {stats.unreadMessages}
                      </motion.span>
                    )}
                  </Link>
                  
                  <Link href="/saved" className="flex flex-col items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <FiHeart className="text-green-600 text-2xl mb-2" />
                    <span className="text-sm font-medium">Saved Items</span>
                  </Link>
                  
                  <Link href="/profile/edit" className="flex flex-col items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <FiEdit className="text-green-600 text-2xl mb-2" />
                    <span className="text-sm font-medium">Edit Profile</span>
                  </Link>
                  
                  <button 
                    onClick={handleLogout}
                    className="flex flex-col items-center p-4 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                  >
                    <FiLogOut className="text-red-600 text-2xl mb-2" />
                    <span className="text-sm font-medium text-red-600">Logout</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProfilePage;
