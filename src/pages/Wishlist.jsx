import React from 'react';
import Nav from '../components/Nav';

export default function Wishlist() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Nav />
      <div className="container mx-auto px-4 py-5">
        <h1 className="text-2xl font-bold mb-6">My Wishlist</h1>
        {/* Wishlist content will go here */}
      </div>
    </div>
  );
}
