import { Link, useLocation } from "react-router-dom";
import {
  Leaf,
  Heart,
  Mail,
  Phone,
  MapPin,
  Instagram,
  Twitter,
  Facebook,
  MessageCircle,
  Shield,
  Award,
  Truck,
  Clock,
  ArrowUp
} from "lucide-react";

function Footer() {
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup' || location.pathname === '/forgot-password' || location.pathname === '/reset-password';

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Simple footer for authentication pages
  if (isAuthPage) {
    return (
      <footer className="bg-white border-t border-gray-200 py-6">
        <div className="max-w-md mx-auto px-6 text-center">
          <div className="flex items-center justify-center space-x-2 mb-3">
            <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-playfair font-bold text-slate-900">HerbTrade</span>
          </div>
          <p className="text-sm text-slate-500 mb-4">
            Your trusted partner in natural wellness
          </p>
          <div className="flex items-center justify-center space-x-6 text-xs text-slate-400">
            <Link to="/privacy" className="hover:text-emerald-600 transition-colors duration-300">
              Privacy
            </Link>
            <Link to="/terms" className="hover:text-emerald-600 transition-colors duration-300">
              Terms
            </Link>
            <span>&copy; {new Date().getFullYear()} HerbTrade</span>
          </div>
        </div>
      </footer>
    );
  }

  // Full footer for other pages
  return (
    <footer className="bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-10 w-32 h-32 bg-emerald-500 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-teal-500 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-cyan-500 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '4s' }} />
      </div>

      <div className="relative z-10">
        {/* Main Footer Content */}
        <div className="max-w-6xl mx-auto px-6 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">

            {/* Brand Section */}
            <div className="lg:col-span-1">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-3 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl shadow-lg">
                  <Leaf className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-playfair font-bold">HerbTrade</h3>
                  <p className="text-emerald-300 text-sm font-medium">Natural Wellness</p>
                </div>
              </div>
              <p className="text-slate-300 leading-relaxed mb-6">
                Your trusted partner in natural wellness. Discover premium herbal products
                sourced from certified organic farms worldwide.
              </p>
              <div className="flex items-center space-x-2 text-emerald-300">
                <Heart className="w-4 h-4" />
                <span className="text-sm font-medium">Made with love for your wellness</span>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-lg font-bold mb-6 text-white">Quick Links</h4>
              <ul className="space-y-3">
                <li>
                  <Link to="/herbs" className="text-slate-300 hover:text-emerald-300 transition-colors duration-300 flex items-center space-x-2 group">
                    <span className="w-1 h-1 bg-emerald-500 rounded-full group-hover:w-2 transition-all duration-300"></span>
                    <span>Browse Herbs</span>
                  </Link>
                </li>
                <li>
                  <Link to="/hospital-discovery" className="text-slate-300 hover:text-emerald-300 transition-colors duration-300 flex items-center space-x-2 group">
                    <span className="w-1 h-1 bg-emerald-500 rounded-full group-hover:w-2 transition-all duration-300"></span>
                    <span>Find Hospitals</span>
                  </Link>
                </li>
                <li>
                  <Link to="/blog" className="text-slate-300 hover:text-emerald-300 transition-colors duration-300 flex items-center space-x-2 group">
                    <span className="w-1 h-1 bg-emerald-500 rounded-full group-hover:w-2 transition-all duration-300"></span>
                    <span>Health Blog</span>
                  </Link>
                </li>
                <li>
                  <Link to="/about" className="text-slate-300 hover:text-emerald-300 transition-colors duration-300 flex items-center space-x-2 group">
                    <span className="w-1 h-1 bg-emerald-500 rounded-full group-hover:w-2 transition-all duration-300"></span>
                    <span>About Us</span>
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h4 className="text-lg font-bold mb-6 text-white">Contact Us</h4>
              <ul className="space-y-4">
                <li className="flex items-center space-x-3 text-slate-300">
                  <div className="p-2 bg-emerald-500/20 rounded-lg">
                    <Mail className="w-4 h-4 text-emerald-400" />
                  </div>
                  <span>support@herbtrade.com</span>
                </li>
                <li className="flex items-center space-x-3 text-slate-300">
                  <div className="p-2 bg-emerald-500/20 rounded-lg">
                    <Phone className="w-4 h-4 text-emerald-400" />
                  </div>
                  <span>+1 (555) 123-4567</span>
                </li>
                <li className="flex items-center space-x-3 text-slate-300">
                  <div className="p-2 bg-emerald-500/20 rounded-lg">
                    <MapPin className="w-4 h-4 text-emerald-400" />
                  </div>
                  <span>123 Wellness St, Health City</span>
                </li>
                <li className="flex items-center space-x-3 text-slate-300">
                  <div className="p-2 bg-emerald-500/20 rounded-lg">
                    <Clock className="w-4 h-4 text-emerald-400" />
                  </div>
                  <span>24/7 Customer Support</span>
                </li>
              </ul>
            </div>

            {/* Trust Badges */}
            <div>
              <h4 className="text-lg font-bold mb-6 text-white">Why Choose Us</h4>
              <div className="space-y-4">
                <div className="flex items-center space-x-3 text-slate-300">
                  <div className="p-2 bg-emerald-500/20 rounded-lg">
                    <Shield className="w-4 h-4 text-emerald-400" />
                  </div>
                  <span className="text-sm">100% Secure</span>
                </div>
                <div className="flex items-center space-x-3 text-slate-300">
                  <div className="p-2 bg-emerald-500/20 rounded-lg">
                    <Award className="w-4 h-4 text-emerald-400" />
                  </div>
                  <span className="text-sm">Certified Organic</span>
                </div>
                <div className="flex items-center space-x-3 text-slate-300">
                  <div className="p-2 bg-emerald-500/20 rounded-lg">
                    <Truck className="w-4 h-4 text-emerald-400" />
                  </div>
                  <span className="text-sm">Free Shipping</span>
                </div>
              </div>

              {/* Social Links */}
              <div className="mt-8">
                <h5 className="text-sm font-semibold mb-4 text-white">Follow Us</h5>
                <div className="flex space-x-3">
                  <a href="#" className="p-3 bg-emerald-500/20 hover:bg-emerald-500/30 rounded-xl transition-all duration-300 group">
                    <Instagram className="w-5 h-5 text-emerald-400 group-hover:text-emerald-300" />
                  </a>
                  <a href="#" className="p-3 bg-emerald-500/20 hover:bg-emerald-500/30 rounded-xl transition-all duration-300 group">
                    <Twitter className="w-5 h-5 text-emerald-400 group-hover:text-emerald-300" />
                  </a>
                  <a href="#" className="p-3 bg-emerald-500/20 hover:bg-emerald-500/30 rounded-xl transition-all duration-300 group">
                    <Facebook className="w-5 h-5 text-emerald-400 group-hover:text-emerald-300" />
                  </a>
                  <a href="#" className="p-3 bg-emerald-500/20 hover:bg-emerald-500/30 rounded-xl transition-all duration-300 group">
                    <MessageCircle className="w-5 h-5 text-emerald-400 group-hover:text-emerald-300" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-700/50">
          <div className="max-w-6xl mx-auto px-6 py-6">
            <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
              <div className="flex items-center space-x-2 text-slate-400">
                <Leaf className="w-4 h-4 text-emerald-400" />
                <span className="text-sm">
                  &copy; {new Date().getFullYear()} HerbTrade. All rights reserved.
                </span>
              </div>

              <div className="flex items-center space-x-6 text-sm text-slate-400">
                <Link to="/privacy" className="hover:text-emerald-300 transition-colors duration-300">
                  Privacy Policy
                </Link>
                <Link to="/terms" className="hover:text-emerald-300 transition-colors duration-300">
                  Terms of Service
                </Link>
                <Link to="/cookies" className="hover:text-emerald-300 transition-colors duration-300">
                  Cookie Policy
                </Link>
              </div>

              {/* Scroll to Top Button */}
              <button
                onClick={scrollToTop}
                className="p-2 bg-emerald-500/20 hover:bg-emerald-500/30 rounded-xl transition-all duration-300 group"
                aria-label="Scroll to top"
              >
                <ArrowUp className="w-4 h-4 text-emerald-400 group-hover:text-emerald-300 group-hover:-translate-y-1 transition-all duration-300" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer; 