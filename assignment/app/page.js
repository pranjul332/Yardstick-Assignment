"use client";
import React from "react";
import {
  CreditCard,
  TrendingUp,
  PieChart,
  Shield,
  Smartphone,
  Bell,
  Target,
  Calculator,
  ArrowRight,
  Star,
  Check,
} from "lucide-react";
import Link from "next/link";

export default function FinanceAppHomePage() {
  const features = [
    {
      icon: <CreditCard className="w-8 h-8 text-blue-500" />,
      title: "Expense Tracking",
      description:
        "Track all your expenses across multiple categories with smart categorization and real-time updates.",
    },

    {
      icon: <PieChart className="w-8 h-8 text-purple-500" />,
      title: "Budget Planning",
      description:
        "Create and manage budgets with visual charts and spending alerts to stay on track.",
    },
    {
      icon: <Target className="w-8 h-8 text-orange-500" />,
      title: "Financial Goals",
      description:
        "Set savings goals, track progress, and get personalized recommendations to achieve them.",
    },
    {
      icon: <Calculator className="w-8 h-8 text-indigo-500" />,
      title: "Financial Calculator",
      description:
        "Calculate loans, mortgages, and investment returns with our comprehensive financial tools.",
    },
  ];

  const benefits = [
    "Bank-level security with 256-bit encryption",
    "Real-time synchronization across all devices",
    "Advanced analytics and insights",
    "Multi-currency support",
    "Offline access to your data",
    "24/7 customer support",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <div className="flex justify-center items-center mb-8">
              <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-4 rounded-2xl">
                <CreditCard className="w-12 h-12 text-white" />
              </div>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
              FinanceHub
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Take control of your financial future with our comprehensive suite
              of tools designed to help you track, plan, and grow your wealth.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/pages/Overview"
                className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-blue-600 hover:to-purple-600 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Get Started Free
                <ArrowRight className="w-5 h-5 ml-2 inline" />
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="py-20 bg-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Everything You Need to
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                {" "}
                Manage Your Money
              </span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Discover powerful features designed to simplify your financial
              life and help you make smarter money decisions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group bg-slate-800/80 backdrop-blur-sm p-8 rounded-2xl border border-slate-700/50 hover:border-blue-500/50 transition-all duration-300 hover:transform hover:scale-105"
              >
                <div className="mb-6 group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-white mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-300 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-r from-blue-900/20 to-purple-900/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="p-8">
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">
                500K+
              </div>
              <div className="text-gray-300 text-lg">Active Users</div>
            </div>
            <div className="p-8">
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">
                $2.5B+
              </div>
              <div className="text-gray-300 text-lg">Money Managed</div>
            </div>
            <div className="p-8">
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">
                4.9★
              </div>
              <div className="text-gray-300 text-lg">App Store Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Transform Your Financial Life?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of users who have already taken control of their
            finances. Start your journey today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/pages/Overview"
              className="bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-100 transform hover:scale-105 transition-all duration-200 shadow-lg"
            >
              Start Free Trial
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-4 mb-4 md:mb-0">
              <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-2 rounded-lg">
                <CreditCard className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-white">FinanceHub</span>
            </div>
            <div className="flex space-x-6">
              <Link
                href="#"
                className="text-gray-400 hover:text-white transition-colors"
              >
                Privacy
              </Link>
              <Link
                href="#"
                className="text-gray-400 hover:text-white transition-colors"
              >
                Terms
              </Link>
              <Link
                href="#"
                className="text-gray-400 hover:text-white transition-colors"
              >
                Support
              </Link>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-slate-800 text-center text-gray-400">
            <p>&copy; 2025 FinanceHub. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
