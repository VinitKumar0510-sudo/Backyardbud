import React from 'react';
import { Link } from 'react-router-dom';

const HomePage = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section with Gradient */}
      <div className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-8">
            <img 
              src="/backyard-buds-logo.svg" 
              alt="Backyard Buds Logo" 
              className="w-20 h-20 mx-auto mb-6 filter brightness-0 invert"
            />
            <h1 className="text-5xl font-bold mb-4">
              Backyard Buds
            </h1>
            <p className="text-xl mb-8 max-w-3xl mx-auto opacity-90">
              Your friendly guide to determining whether your shed or patio proposal qualifies as Exempt Development 
              under the NSW State Environmental Planning Policy (Exempt & Complying Development Codes) 2008
            </p>
            <Link
              to="/assessment"
              className="inline-block bg-white text-blue-600 font-semibold text-lg px-8 py-4 rounded-xl hover:bg-gray-50 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              Start Your Assessment
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white bg-opacity-80 backdrop-blur-sm p-8 rounded-2xl shadow-lg transition-all duration-300 hover:shadow-xl border border-white border-opacity-20">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center mb-6 mx-auto">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3 text-center">Quick Assessment</h3>
            <p className="text-gray-600 text-center">
              Get instant feedback on whether your proposal meets SEPP Part 2 exempt development criteria.
            </p>
          </div>

          <div className="bg-white bg-opacity-80 backdrop-blur-sm p-8 rounded-2xl shadow-lg transition-all duration-300 hover:shadow-xl border border-white border-opacity-20">
            <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-green-200 rounded-2xl flex items-center justify-center mb-6 mx-auto">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3 text-center">SEPP References</h3>
            <p className="text-gray-600 text-center">
              Receive detailed explanations with references to specific SEPP Part 2 clauses.
            </p>
          </div>

          <div className="bg-white bg-opacity-80 backdrop-blur-sm p-8 rounded-2xl shadow-lg transition-all duration-300 hover:shadow-xl border border-white border-opacity-20">
            <div className="w-16 h-16 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-2xl flex items-center justify-center mb-6 mx-auto">
              <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3 text-center">Albury Focused</h3>
            <p className="text-gray-600 text-center">
              Specifically designed for Albury properties with local planning context.
            </p>
          </div>
        </div>

        {/* How It Works */}
        <div className="bg-white bg-opacity-80 backdrop-blur-sm p-10 rounded-2xl shadow-lg mb-16 border border-white border-opacity-20">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-700 text-white rounded-full flex items-center justify-center mx-auto mb-6 font-bold text-xl shadow-lg">
                1
              </div>
              <h3 className="font-bold text-gray-900 mb-3">Property Details</h3>
              <p className="text-gray-600">Enter your property type, lot size, and zoning information</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-700 text-white rounded-full flex items-center justify-center mx-auto mb-6 font-bold text-xl shadow-lg">
                2
              </div>
              <h3 className="font-bold text-gray-900 mb-3">Proposal Details</h3>
              <p className="text-gray-600">Specify structure type, dimensions, and placement</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-700 text-white rounded-full flex items-center justify-center mx-auto mb-6 font-bold text-xl shadow-lg">
                3
              </div>
              <h3 className="font-bold text-gray-900 mb-3">Assessment</h3>
              <p className="text-gray-600">Our rules engine applies SEPP Part 2 criteria</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-700 text-white rounded-full flex items-center justify-center mx-auto mb-6 font-bold text-xl shadow-lg">
                4
              </div>
              <h3 className="font-bold text-gray-900 mb-3">Results</h3>
              <p className="text-gray-600">Get clear recommendation with detailed reasoning</p>
            </div>
          </div>
        </div>

        {/* Supported Structures */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Supported Structure Types</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {['Shed', 'Patio', 'Pergola', 'Carport'].map((structure, index) => (
              <div key={structure} className="bg-white bg-opacity-80 backdrop-blur-sm p-6 rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl transform hover:scale-105 border border-white border-opacity-20">
                <h3 className="font-bold text-gray-900 text-lg">{structure}</h3>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
