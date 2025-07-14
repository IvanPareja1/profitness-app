'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function Settings() {
  const [notifications, setNotifications] = useState({
    pushNotifications: true,
    emailReminders: false,
    weeklyReports: true,
    mealReminders: true
  });

  const [preferences, setPreferences] = useState({
    units: 'metric', // metric or imperial
    language: 'es',
    theme: 'light',
    startWeek: 'monday'
  });

  const [privacy, setPrivacy] = useState({
    profileVisibility: 'private',
    dataSharing: false,
    analytics: true
  });

  const handleNotificationToggle = (key: string) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key as keyof typeof prev]
    }));
  };

  const handlePreferenceChange = (key: string, value: string) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handlePrivacyToggle = (key: string) => {
    setPrivacy(prev => ({
      ...prev,
      [key]: !prev[key as keyof typeof prev]
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="fixed top-0 w-full bg-white/90 backdrop-blur-sm border-b border-gray-200 z-50">
        <div className="flex items-center justify-between px-4 py-3">
          <Link href="/profile" className="w-8 h-8 flex items-center justify-center">
            <i className="ri-arrow-left-line text-gray-600 text-xl"></i>
          </Link>
          <h1 className="text-lg font-semibold">Settings</h1>
          <div className="w-8 h-8"></div>
        </div>
      </header>

      <main className="pt-16 pb-20 px-4">
        {/* Notifications Section */}
        <div className="bg-white rounded-2xl p-6 shadow-lg mb-6 mt-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Notifications</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-800">Push Notifications</p>
                <p className="text-sm text-gray-500">Receive alerts on your device</p>
              </div>
              <button
                onClick={() => handleNotificationToggle('pushNotifications')}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  notifications.pushNotifications ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <div
                  className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                    notifications.pushNotifications ? 'translate-x-6' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-800">Email Reminders</p>
                <p className="text-sm text-gray-500">Get reminders via email</p>
              </div>
              <button
                onClick={() => handleNotificationToggle('emailReminders')}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  notifications.emailReminders ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <div
                  className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                    notifications.emailReminders ? 'translate-x-6' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-800">Weekly Reports</p>
                <p className="text-sm text-gray-500">Summary of your progress</p>
              </div>
              <button
                onClick={() => handleNotificationToggle('weeklyReports')}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  notifications.weeklyReports ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <div
                  className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                    notifications.weeklyReports ? 'translate-x-6' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-800">Meal Reminders</p>
                <p className="text-sm text-gray-500">Reminders to log meals</p>
              </div>
              <button
                onClick={() => handleNotificationToggle('mealReminders')}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  notifications.mealReminders ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <div
                  className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                    notifications.mealReminders ? 'translate-x-6' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Preferences Section */}
        <div className="bg-white rounded-2xl p-6 shadow-lg mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Preferences</h3>
          
          <div className="space-y-6">
            <div>
              <p className="font-medium text-gray-800 mb-3">Units</p>
              <div className="flex space-x-2">
                <button
                  onClick={() => handlePreferenceChange('units', 'metric')}
                  className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all !rounded-button ${
                    preferences.units === 'metric'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  Metric (kg, cm)
                </button>
                <button
                  onClick={() => handlePreferenceChange('units', 'imperial')}
                  className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all !rounded-button ${
                    preferences.units === 'imperial'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  Imperial (lbs, ft)
                </button>
              </div>
            </div>

            <div>
              <p className="font-medium text-gray-800 mb-3">Language</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handlePreferenceChange('language', 'es')}
                  className={`py-2 px-4 rounded-lg text-sm font-medium transition-all !rounded-button ${
                    preferences.language === 'es'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  Español
                </button>
                <button
                  onClick={() => handlePreferenceChange('language', 'en')}
                  className={`py-2 px-4 rounded-lg text-sm font-medium transition-all !rounded-button ${
                    preferences.language === 'en'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  English
                </button>
              </div>
            </div>

            <div>
              <p className="font-medium text-gray-800 mb-3">Theme</p>
              <div className="flex space-x-2">
                <button
                  onClick={() => handlePreferenceChange('theme', 'light')}
                  className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all !rounded-button ${
                    preferences.theme === 'light'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  Light
                </button>
                <button
                  onClick={() => handlePreferenceChange('theme', 'dark')}
                  className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all !rounded-button ${
                    preferences.theme === 'dark'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  Dark
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Privacy Section */}
        <div className="bg-white rounded-2xl p-6 shadow-lg mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Privacy & Data</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-800">Data Analytics</p>
                <p className="text-sm text-gray-500">Help improve the app</p>
              </div>
              <button
                onClick={() => handlePrivacyToggle('analytics')}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  privacy.analytics ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <div
                  className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                    privacy.analytics ? 'translate-x-6' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-800">Data Sharing</p>
                <p className="text-sm text-gray-500">Share data with partners</p>
              </div>
              <button
                onClick={() => handlePrivacyToggle('dataSharing')}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  privacy.dataSharing ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <div
                  className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                    privacy.dataSharing ? 'translate-x-6' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Account Actions */}
        <div className="bg-white rounded-2xl shadow-lg mb-6 overflow-hidden">
          <button className="w-full flex items-center justify-between p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <i className="ri-download-line text-blue-600 text-sm"></i>
              </div>
              <span className="text-gray-700">Export Data</span>
            </div>
            <i className="ri-arrow-right-s-line text-gray-400 text-lg"></i>
          </button>
          
          <button className="w-full flex items-center justify-between p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                <i className="ri-refresh-line text-orange-600 text-sm"></i>
              </div>
              <span className="text-gray-700">Reset All Data</span>
            </div>
            <i className="ri-arrow-right-s-line text-gray-400 text-lg"></i>
          </button>
          
          <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <i className="ri-delete-bin-line text-red-600 text-sm"></i>
              </div>
              <span className="text-red-600">Delete Account</span>
            </div>
            <i className="ri-arrow-right-s-line text-gray-400 text-lg"></i>
          </button>
        </div>

        {/* App Info */}
        <div className="text-center">
          <p className="text-sm text-gray-500">Profitness v1.0.0</p>
          <p className="text-xs text-gray-400 mt-1">Build 2024.01.21</p>
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 w-full bg-white border-t border-gray-200">
        <div className="grid grid-cols-5 py-2">
          <Link href="/" className="flex flex-col items-center justify-center py-2 px-1">
            <div className="w-6 h-6 flex items-center justify-center mb-1">
              <i className="ri-home-line text-gray-400 text-lg"></i>
            </div>
            <span className="text-xs text-gray-400">Inicio</span>
          </Link>
          <Link href="/nutrition" className="flex flex-col items-center justify-center py-2 px-1">
            <div className="w-6 h-6 flex items-center justify-center mb-1">
              <i className="ri-pie-chart-line text-gray-400 text-lg"></i>
            </div>
            <span className="text-xs text-gray-400">Nutrición</span>
          </Link>
          <Link href="/add-food" className="flex flex-col items-center justify-center py-2 px-1">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-1">
              <i className="ri-add-line text-white text-lg"></i>
            </div>
            <span className="text-xs text-gray-400">Agregar</span>
          </Link>
          <Link href="/progress" className="flex flex-col items-center justify-center py-2 px-1">
            <div className="w-6 h-6 flex items-center justify-center mb-1">
              <i className="ri-line-chart-line text-gray-400 text-lg"></i>
            </div>
            <span className="text-xs text-gray-400">Progreso</span>
          </Link>
          <Link href="/profile" className="flex flex-col items-center justify-center py-2 px-1">
            <div className="w-6 h-6 flex items-center justify-center mb-1">
              <i className="ri-user-line text-blue-600 text-lg"></i>
            </div>
            <span className="text-xs text-blue-600 font-medium">Perfil</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}