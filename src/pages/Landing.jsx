import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Leaf,
  Shield,
  Truck,
  Users,
  Star,
  ArrowRight,
  Play,
  CheckCircle,
  Heart,
  Award,
  Sparkles,
  Globe,
  Clock,
  TrendingUp,
  Zap,
  Target,
  Gift,
  MessageCircle
} from 'lucide-react';

function Landing() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const features = [
    {
      icon: <Leaf className="w-8 h-8 text-emerald-500" />,
      title: "Premium Quality",
      description: "Carefully sourced from certified organic farms worldwide",
      gradient: "from-emerald-500 to-green-600"
    },
    {
      icon: <Shield className="w-8 h-8 text-blue-500" />,
      title: "100% Authentic",
      description: "Every product verified for purity and authenticity",
      gradient: "from-blue-500 to-indigo-600"
    },
    {
      icon: <Truck className="w-8 h-8 text-purple-500" />,
      title: "Fast Delivery",
      description: "Quick shipping with real-time tracking",
      gradient: "from-purple-500 to-pink-600"
    },
    {
      icon: <Users className="w-8 h-8 text-orange-500" />,
      title: "Expert Support",
      description: "Professional guidance from herbal specialists",
      gradient: "from-orange-500 to-red-600"
    }
  ];

  const benefits = [
    "Certified organic herbs",
    "Lab-tested for purity",
    "Sustainable sourcing",
    "Expert consultation",
    "Money-back guarantee",
    "Free shipping over $50"
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Wellness Coach",
      content: "HerbTrade has revolutionized how I approach natural wellness. The quality is unmatched.",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=80&h=80&fit=crop&crop=face&auto=format"
    },
    {
      name: "Dr. James Wilson",
      role: "Naturopathic Doctor",
      content: "I trust HerbTrade for all my patients. Their commitment to quality is exceptional.",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=80&h=80&fit=crop&crop=face&auto=format"
    },
    {
      name: "Maria Rodriguez",
      role: "Herbalist",
      content: "The variety and potency of herbs here is incredible. My go-to source for everything.",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=face&auto=format"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-teal-50 pt-20">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: 'url(/assets/bg.png)' }}
        />
        {/* Minimal Overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/20 via-black/10 to-black/15" />
        {/* Enhanced Decorative Elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-200/20 rounded-full blur-2xl animate-float" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-teal-200/15 rounded-full blur-2xl animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-cyan-200/15 rounded-full blur-2xl animate-float" style={{ animationDelay: '4s' }} />

        {/* Floating Icons */}
        <div className="absolute top-32 right-20 animate-bounce-slow">
          <Sparkles className="w-6 h-6 text-emerald-400 opacity-60" />
        </div>
        <div className="absolute bottom-32 left-20 animate-pulse-slow">
          <Leaf className="w-8 h-8 text-teal-400 opacity-50" />
        </div>
        <div className="absolute top-1/3 right-1/4 animate-float" style={{ animationDelay: '1s' }}>
          <Heart className="w-5 h-5 text-pink-400 opacity-70" />
        </div>

        <div className="container-custom relative z-10">
          <div className="max-w-5xl mx-auto text-center">
            <div className="animate-fade-in">


              <h1 className="text-6xl md:text-7xl lg:text-8xl font-playfair font-bold mb-8 leading-tight">
                <span className="block animate-slide-up text-white drop-shadow-2xl">Natural Healing</span>
                <span className="block animate-slide-up drop-shadow-lg" style={{ animationDelay: '0.2s' }}>
                  <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent font-extrabold">
                    Made Simple
                  </span>
                </span>
              </h1>

              <p className="text-xl md:text-2xl text-white mb-12 max-w-4xl mx-auto leading-relaxed animate-fade-in font-medium drop-shadow-lg" style={{ animationDelay: '0.4s' }}>
                Discover premium herbal products sourced from trusted farms worldwide.
                <br />
                <span className="text-emerald-200 font-semibold">Your wellness journey starts with nature's finest ingredients, backed by science.</span>
              </p>

              <div className="flex justify-center items-center mb-16 animate-fade-in" style={{ animationDelay: '0.6s' }}>
                <Link
                  to={user ? "/herbs" : "/signup"}
                  className="group btn-primary text-lg px-12 py-6 flex items-center space-x-3 hover:scale-105 transition-all duration-300 shadow-xl"
                >
                  <span>Explore Products</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                </Link>
              </div>


            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Features Section */}
      <section className="section-padding bg-gradient-to-br from-white via-emerald-50/30 to-teal-50/30 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-20 w-32 h-32 bg-emerald-500 rounded-full blur-3xl animate-pulse-slow" />
          <div className="absolute bottom-20 right-20 w-40 h-40 bg-teal-500 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }} />
        </div>

        <div className="container-custom relative z-10">
          <div className="text-center mb-20">
            <div className="inline-flex items-center px-4 py-2 bg-emerald-100 text-emerald-700 rounded-full text-sm font-semibold mb-6">
              <Zap className="w-4 h-4 mr-2" />
              Why Choose Us
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-playfair font-bold text-slate-900 mb-6">
              Experience the
              <span className="block gradient-text">HerbTrade Difference</span>
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              We're committed to delivering the highest quality herbal products with exceptional service,
              backed by science and trusted by thousands worldwide.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group relative"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="card-modern p-8 text-center h-full relative overflow-hidden">
                  {/* Gradient Background on Hover */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500 rounded-3xl`} />

                  <div className="relative z-10">
                    <div className="mb-6 flex justify-center">
                      <div className={`p-4 bg-gradient-to-br ${feature.gradient} rounded-2xl shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300`}>
                        {React.cloneElement(feature.icon, { className: "w-8 h-8 text-white" })}
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-4 group-hover:text-emerald-600 transition-colors duration-300">
                      {feature.title}
                    </h3>
                    <p className="text-slate-600 leading-relaxed group-hover:text-slate-700 transition-colors duration-300">
                      {feature.description}
                    </p>
                  </div>

                  {/* Decorative Element */}
                  <div className="absolute -top-2 -right-2 w-20 h-20 bg-gradient-to-br from-emerald-200 to-teal-200 rounded-full opacity-20 group-hover:opacity-40 transition-opacity duration-300" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="section-padding bg-gradient-to-br from-emerald-50 to-teal-50">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="animate-fade-in">
              <h2 className="text-4xl md:text-5xl font-playfair font-bold text-slate-900 mb-6">
                Premium Quality You Can Trust
              </h2>
              <p className="text-xl text-slate-600 mb-8 leading-relaxed">
                Every product in our collection meets the highest standards of quality, 
                purity, and sustainability. We work directly with certified organic farms 
                to bring you nature's best.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-3 group animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                    <div className="p-2 bg-emerald-100 rounded-full group-hover:bg-emerald-200 transition-colors duration-300">
                      <CheckCircle className="w-5 h-5 text-emerald-600 group-hover:scale-110 transition-transform duration-300" />
                    </div>
                    <span className="text-slate-700 group-hover:text-slate-900 transition-colors duration-300 font-medium">{benefit}</span>
                  </div>
                ))}
              </div>

              <Link
                to={user ? "/herbs" : "/signup"}
                className="group btn-primary inline-flex items-center space-x-3 hover:scale-105 transition-all duration-300"
              >
                <span>Start Shopping</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
              </Link>
            </div>

            <div className="relative animate-scale-in">
              <div className="glass-card p-8">
                <img 
                  src="/assets/ashwagandha.png" 
                  alt="Premium herbs"
                  className="w-full h-80 object-cover rounded-xl mb-6"
                />
                <div className="text-center">
                  <div className="flex justify-center mb-4 space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400 fill-current hover:scale-110 transition-transform duration-200" />
                    ))}
                  </div>
                  <p className="text-slate-700 font-medium italic">
                    "The quality exceeded my expectations. Highly recommended!"
                  </p>
                  <p className="text-slate-500 text-sm mt-2 font-medium">- Verified Customer</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Testimonials Section */}
      <section className="section-padding bg-gradient-to-br from-slate-50 to-emerald-50/30 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute top-10 right-10 w-64 h-64 bg-emerald-200/20 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-10 left-10 w-80 h-80 bg-teal-200/15 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '3s' }} />

        <div className="container-custom relative z-10">
          <div className="text-center mb-20">
            <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700 rounded-full text-sm font-semibold mb-6">
              <MessageCircle className="w-4 h-4 mr-2" />
              Customer Stories
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-playfair font-bold text-slate-900 mb-6">
              Loved by
              <span className="block gradient-text">Thousands Worldwide</span>
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Join our community of satisfied customers who have transformed their wellness journey with our premium herbal products
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="group relative animate-scale-in"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <div className="card-modern p-8 h-full relative overflow-hidden">
                  {/* Gradient overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl" />

                  <div className="relative z-10">
                    <div className="flex items-center mb-6 space-x-1">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 text-yellow-400 fill-current hover:scale-110 transition-transform duration-200" />
                      ))}
                    </div>
                    <blockquote className="text-slate-700 mb-8 leading-relaxed text-lg italic group-hover:text-slate-800 transition-colors duration-300">
                      "{testimonial.content}"
                    </blockquote>
                    <div className="flex items-center">
                      <div className="relative">
                        <img
                          src={testimonial.avatar}
                          alt={testimonial.name}
                          className="w-14 h-14 rounded-full mr-4 object-cover ring-4 ring-white shadow-lg group-hover:ring-emerald-100 transition-all duration-300"
                        />
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center">
                          <CheckCircle className="w-3 h-3 text-white" />
                        </div>
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 group-hover:text-emerald-600 transition-colors duration-300">{testimonial.name}</div>
                        <div className="text-slate-500 text-sm font-medium">{testimonial.role}</div>
                      </div>
                    </div>
                  </div>

                  {/* Quote decoration */}
                  <div className="absolute top-4 right-4 text-6xl text-emerald-200 font-serif opacity-50 group-hover:opacity-70 transition-opacity duration-300">"</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced CTA Section */}
      <section className="section-padding bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-20 right-20 w-80 h-80 bg-emerald-300/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-teal-300/15 rounded-full blur-3xl animate-pulse-slow" />
        </div>

        {/* Floating Icons */}
        <div className="absolute top-32 left-32 animate-bounce-slow">
          <Sparkles className="w-8 h-8 text-white/30" />
        </div>
        <div className="absolute bottom-32 right-32 animate-float" style={{ animationDelay: '1s' }}>
          <Heart className="w-6 h-6 text-white/40" />
        </div>
        <div className="absolute top-1/3 right-1/4 animate-pulse-slow">
          <Gift className="w-7 h-7 text-white/35" />
        </div>

        <div className="container-custom relative z-10 text-center">
          <div className="max-w-4xl mx-auto">
            <div className="inline-flex items-center px-6 py-3 bg-white/20 backdrop-blur-sm text-white rounded-full text-sm font-semibold mb-8">
              <TrendingUp className="w-4 h-4 mr-2" />
              Join the Wellness Revolution
            </div>

            <h2 className="text-4xl md:text-5xl lg:text-6xl font-playfair font-bold text-white mb-8 leading-tight">
              Ready to Transform
              <span className="block text-emerald-100">Your Wellness Journey?</span>
            </h2>

            <p className="text-xl md:text-2xl text-emerald-100 mb-12 max-w-3xl mx-auto leading-relaxed">
              Join thousands who have discovered the power of premium herbal products.
              Start your natural healing journey today with science-backed solutions.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12">
              <Link
                to={user ? "/herbs" : "/signup"}
                className="group bg-white hover:bg-emerald-50 text-emerald-600 font-bold px-10 py-5 rounded-2xl shadow-2xl hover:shadow-3xl transform hover:-translate-y-1 hover:scale-105 transition-all duration-300 flex items-center space-x-3"
              >
                <span>Get Started Now</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
              </Link>
              <Link
                to="/hospital-discovery"
                className="group bg-transparent hover:bg-white/10 text-white font-bold px-10 py-5 rounded-2xl border-2 border-white/40 hover:border-white/60 backdrop-blur-sm transition-all duration-300 flex items-center space-x-3 hover:scale-105"
              >
                <Globe className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
                <span>Find Hospitals</span>
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-8 text-white/80">
              <div className="flex items-center space-x-2">
                <Shield className="w-5 h-5" />
                <span className="text-sm font-medium">100% Secure</span>
              </div>
              <div className="flex items-center space-x-2">
                <Truck className="w-5 h-5" />
                <span className="text-sm font-medium">Free Shipping</span>
              </div>
              <div className="flex items-center space-x-2">
                <Award className="w-5 h-5" />
                <span className="text-sm font-medium">Money Back Guarantee</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Landing;

