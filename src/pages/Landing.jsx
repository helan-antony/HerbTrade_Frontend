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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30">
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-emerald-900 via-teal-800 to-cyan-900 pt-20">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-70"
          style={{ backgroundImage: 'url(/assets/bg.png)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/60 via-teal-800/40 to-cyan-900/50" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/20" />
        
        <div className="absolute top-20 left-10 w-80 h-80 bg-gradient-to-r from-emerald-400/30 to-teal-400/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-l from-cyan-400/25 to-blue-400/15 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/3 w-72 h-72 bg-gradient-to-br from-pink-400/20 to-purple-400/15 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }} />
        <div className="absolute top-1/4 right-1/3 w-60 h-60 bg-gradient-to-tl from-yellow-400/20 to-orange-400/15 rounded-full blur-3xl animate-float" style={{ animationDelay: '6s' }} />

        <div className="absolute top-32 right-20 animate-bounce-slow">
          <div className="relative">
            <div className="absolute inset-0 bg-emerald-400/30 rounded-full blur-lg animate-pulse"></div>
            <Sparkles className="w-8 h-8 text-emerald-300 relative z-10 drop-shadow-lg" />
          </div>
        </div>
        <div className="absolute bottom-32 left-20 animate-pulse-slow">
          <div className="relative">
            <div className="absolute inset-0 bg-teal-400/30 rounded-full blur-lg animate-pulse"></div>
            <Leaf className="w-10 h-10 text-teal-300 relative z-10 drop-shadow-lg" />
          </div>
        </div>
        <div className="absolute top-1/3 right-1/4 animate-float" style={{ animationDelay: '1s' }}>
          <div className="relative">
            <div className="absolute inset-0 bg-pink-400/30 rounded-full blur-lg animate-pulse"></div>
            <Heart className="w-7 h-7 text-pink-300 relative z-10 drop-shadow-lg" />
          </div>
        </div>
        <div className="absolute top-1/4 left-1/4 animate-bounce-slow" style={{ animationDelay: '3s' }}>
          <div className="relative">
            <div className="absolute inset-0 bg-cyan-400/30 rounded-full blur-lg animate-pulse"></div>
            <Award className="w-6 h-6 text-cyan-300 relative z-10 drop-shadow-lg" />
          </div>
        </div>
        <div className="absolute bottom-1/4 right-1/3 animate-float" style={{ animationDelay: '5s' }}>
          <div className="relative">
            <div className="absolute inset-0 bg-purple-400/30 rounded-full blur-lg animate-pulse"></div>
            <Globe className="w-7 h-7 text-purple-300 relative z-10 drop-shadow-lg" />
          </div>
        </div>

        <div className="absolute top-1/4 left-1/6 w-1 h-1 bg-emerald-300 rounded-full animate-particle opacity-70" style={{ animationDelay: '0s' }}></div>
        <div className="absolute top-1/3 right-1/5 w-1.5 h-1.5 bg-teal-300 rounded-full animate-particle opacity-60" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-1/3 left-1/3 w-1 h-1 bg-cyan-300 rounded-full animate-particle opacity-80" style={{ animationDelay: '4s' }}></div>
        <div className="absolute top-2/3 right-1/6 w-1.5 h-1.5 bg-pink-300 rounded-full animate-particle opacity-50" style={{ animationDelay: '6s' }}></div>
        <div className="absolute bottom-1/5 left-1/5 w-1 h-1 bg-purple-300 rounded-full animate-particle opacity-70" style={{ animationDelay: '8s' }}></div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-6xl mx-auto text-center">
            <div className="animate-fade-in">
              <div className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 backdrop-blur-md text-white rounded-full text-sm font-bold mb-8 border border-emerald-300/40 shadow-2xl hover:shadow-emerald-500/25 transition-all duration-300 hover:scale-105">
                <div className="relative">
                  <div className="absolute inset-0 bg-emerald-400/50 rounded-full blur-sm animate-pulse"></div>
                  <Sparkles className="w-5 h-5 mr-3 relative z-10 text-emerald-200" />
                </div>
                <span className="bg-gradient-to-r from-white to-emerald-100 bg-clip-text text-transparent font-extrabold">
                  Premium Natural Wellness
                </span>
              </div>

              <h1 className="text-5xl md:text-6xl lg:text-8xl font-playfair font-bold mb-8 leading-tight">
                <span className="block animate-slide-up text-white drop-shadow-2xl relative">
                  <span className="relative z-10">Natural Healing</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/20 to-teal-400/20 blur-2xl animate-pulse"></div>
                </span>
                <span className="block animate-slide-up drop-shadow-lg relative" style={{ animationDelay: '0.2s' }}>
                  <span className="bg-gradient-to-r from-emerald-300 via-teal-300 to-cyan-300 bg-clip-text text-transparent font-extrabold relative z-10">
                    Made Simple
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/30 to-cyan-400/30 blur-xl animate-pulse" style={{ animationDelay: '1s' }}></div>
                </span>
              </h1>

              <p className="text-xl md:text-2xl text-white/90 mb-12 max-w-4xl mx-auto leading-relaxed animate-fade-in font-medium drop-shadow-lg" style={{ animationDelay: '0.4s' }}>
                Discover premium herbal products sourced from trusted farms worldwide.
                <br />
                <span className="text-emerald-200 font-semibold">Your wellness journey starts with nature's finest ingredients, backed by science.</span>
              </p>

              <div className="flex flex-col sm:flex-row gap-8 justify-center items-center mb-16 animate-fade-in" style={{ animationDelay: '0.6s' }}>
                <Link
                  to={user ? "/herbs" : "/signup"}
                  className="group relative overflow-hidden bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white text-lg font-bold px-14 py-7 rounded-2xl flex items-center space-x-4 hover:scale-110 transition-all duration-500 shadow-2xl hover:shadow-emerald-500/50"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <span className="relative z-10">Explore Products</span>
                  <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform duration-300 relative z-10" />
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-teal-700 opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-2xl"></div>
                </Link>
                <Link
                  to="/hospital-discovery"
                  className="group relative overflow-hidden bg-white/10 backdrop-blur-md hover:bg-white/20 text-white font-bold px-12 py-6 rounded-2xl border-2 border-white/30 hover:border-white/50 transition-all duration-500 flex items-center space-x-4 hover:scale-110 shadow-xl hover:shadow-white/25"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/10 to-blue-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <Globe className="w-6 h-6 group-hover:rotate-12 transition-transform duration-300 relative z-10" />
                  <span className="relative z-10">Find Hospitals</span>
                </Link>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center space-y-6 sm:space-y-0 sm:space-x-12 text-white animate-fade-in" style={{ animationDelay: '0.8s' }}>
                <div className="group flex items-center space-x-3 bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full border border-white/20 hover:bg-white/20 hover:border-white/40 transition-all duration-300 hover:scale-105">
                  <div className="relative">
                    <div className="absolute inset-0 bg-emerald-400/30 rounded-full blur-sm animate-pulse"></div>
                    <Shield className="w-6 h-6 text-emerald-300 relative z-10" />
                  </div>
                  <span className="text-sm font-bold">100% Authentic</span>
                </div>
                <div className="group flex items-center space-x-3 bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full border border-white/20 hover:bg-white/20 hover:border-white/40 transition-all duration-300 hover:scale-105">
                  <div className="relative">
                    <div className="absolute inset-0 bg-blue-400/30 rounded-full blur-sm animate-pulse"></div>
                    <Truck className="w-6 h-6 text-blue-300 relative z-10" />
                  </div>
                  <span className="text-sm font-bold">Free Shipping</span>
                </div>
                <div className="group flex items-center space-x-3 bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full border border-white/20 hover:bg-white/20 hover:border-white/40 transition-all duration-300 hover:scale-105">
                  <div className="relative">
                    <div className="absolute inset-0 bg-yellow-400/30 rounded-full blur-sm animate-pulse"></div>
                    <Award className="w-6 h-6 text-yellow-300 relative z-10" />
                  </div>
                  <span className="text-sm font-bold">Lab Tested</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 lg:py-40 bg-gradient-to-br from-slate-50 via-white to-emerald-50 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-40 h-40 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full blur-3xl animate-pulse-slow" />
          <div className="absolute bottom-20 right-20 w-48 h-48 bg-gradient-to-l from-cyan-500 to-blue-500 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }} />
          <div className="absolute top-1/2 left-1/2 w-36 h-36 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '4s' }} />
        </div>
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-50"
          style={{ backgroundImage: 'url(/assets/bg.png)' }}
        />
        
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-emerald-400 rounded-full animate-float opacity-60"></div>
        <div className="absolute top-3/4 right-1/4 w-3 h-3 bg-teal-400 rounded-full animate-bounce-slow opacity-50" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 right-1/3 w-2 h-2 bg-cyan-400 rounded-full animate-pulse-slow opacity-70" style={{ animationDelay: '3s' }}></div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-24">
            <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700 rounded-full text-sm font-bold mb-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-emerald-200">
              <div className="relative">
                <div className="absolute inset-0 bg-emerald-400/30 rounded-full blur-sm animate-pulse"></div>
                <Zap className="w-5 h-5 mr-3 relative z-10" />
              </div>
              Why Choose Us
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-7xl font-playfair font-bold text-slate-900 mb-8 leading-tight">
              <span className="block">Experience the</span>
              <span className="block bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent relative">
                HerbTrade Difference
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/20 to-cyan-400/20 blur-2xl animate-pulse"></div>
              </span>
            </h2>
            <p className="text-xl md:text-2xl text-slate-600 max-w-4xl mx-auto leading-relaxed font-medium">
              We're committed to delivering the highest quality herbal products with exceptional service,
              <br />
              <span className="text-emerald-600 font-semibold">backed by science and trusted by thousands worldwide.</span>
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group relative animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-xl hover:shadow-2xl border border-white/60 transition-all duration-700 hover:-translate-y-4 hover:scale-110 overflow-hidden p-10 text-center h-full relative group-hover:bg-white/95">
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-15 transition-opacity duration-700 rounded-3xl`} />
                  
                  <div className={`absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-gradient-to-br ${feature.gradient} blur-xl -z-10`} style={{ padding: '2px' }}></div>

                  <div className="relative z-10">
                    <div className="mb-8 flex justify-center">
                      <div className={`relative p-5 bg-gradient-to-br ${feature.gradient} rounded-3xl shadow-xl group-hover:shadow-2xl group-hover:scale-125 transition-all duration-500 animate-glow-pulse`}>
                        <div className="absolute inset-0 bg-white/20 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        {React.cloneElement(feature.icon, { className: "w-10 h-10 text-white relative z-10" })}
                      </div>
                    </div>
                    <h3 className="text-2xl font-playfair font-bold text-slate-900 mb-6 group-hover:text-emerald-600 transition-colors duration-300 animate-text-glow">
                      {feature.title}
                    </h3>
                    <p className="text-slate-600 leading-relaxed group-hover:text-slate-700 transition-colors duration-300 text-lg font-medium">
                      {feature.description}
                    </p>
                  </div>

                  <div className="absolute -top-3 -right-3 w-24 h-24 bg-gradient-to-br from-emerald-300/30 to-teal-300/20 rounded-full opacity-30 group-hover:opacity-60 transition-opacity duration-500 animate-pulse-slow" />
                  <div className="absolute -bottom-3 -left-3 w-20 h-20 bg-gradient-to-tl from-cyan-300/20 to-blue-300/15 rounded-full opacity-20 group-hover:opacity-50 transition-opacity duration-500 animate-float" />
                  
                  <div className="absolute top-4 right-4 w-2 h-2 bg-emerald-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-bounce-slow"></div>
                  <div className="absolute bottom-4 left-4 w-1.5 h-1.5 bg-teal-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-pulse-slow" style={{ animationDelay: '0.5s' }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 lg:py-32 bg-gradient-to-br from-emerald-50 to-teal-50 relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40"
          style={{ backgroundImage: 'url(/assets/bg.png)' }}
        />
        <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-200/30 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-teal-200/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
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
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg hover:shadow-2xl border border-white/50 transition-all duration-500 p-8">
                <img
                  src="/assets/p2.png"
                  alt="Premium herbs"
                  className="w-full h-80 object-cover rounded-2xl mb-6 shadow-lg"
                />
                <div className="text-center">
                  <div className="flex justify-center mb-4 space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400 fill-current hover:scale-110 transition-transform duration-200" />
                    ))}
                  </div>
                  <p className="text-slate-700 font-medium italic text-lg">
                    "The quality exceeded my expectations. Highly recommended!"
                  </p>
                  <p className="text-slate-500 text-sm mt-2 font-medium">- Verified Customer</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 lg:py-32 bg-gradient-to-br from-slate-50 to-emerald-50/30 relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40"
          style={{ backgroundImage: 'url(/assets/bg.png)' }}
        />
        <div className="absolute top-10 right-10 w-64 h-64 bg-emerald-200/20 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-10 left-10 w-80 h-80 bg-teal-200/15 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '3s' }} />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
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
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg hover:shadow-2xl border border-white/50 transition-all duration-500 hover:-translate-y-2 hover:scale-105 overflow-hidden p-8 h-full relative">
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
                        <div className="font-playfair font-bold text-slate-900 group-hover:text-emerald-600 transition-colors duration-300">{testimonial.name}</div>
                        <div className="text-slate-500 text-sm font-medium">{testimonial.role}</div>
                      </div>
                    </div>
                  </div>

                  <div className="absolute top-4 right-4 text-6xl text-emerald-200 font-serif opacity-50 group-hover:opacity-70 transition-opacity duration-300">"</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 lg:py-32 bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-25"
          style={{ backgroundImage: 'url(/assets/bg.png)' }}
        />
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-20 right-20 w-80 h-80 bg-emerald-300/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-teal-300/15 rounded-full blur-3xl animate-pulse-slow" />
        </div>

        <div className="absolute top-32 left-32 animate-bounce-slow">
          <Sparkles className="w-8 h-8 text-white/30" />
        </div>
        <div className="absolute bottom-32 right-32 animate-float" style={{ animationDelay: '1s' }}>
          <Heart className="w-6 h-6 text-white/40" />
        </div>
        <div className="absolute top-1/3 right-1/4 animate-pulse-slow">
          <Gift className="w-7 h-7 text-white/35" />
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="max-w-4xl mx-auto">
            <div className="inline-flex items-center px-6 py-3 bg-white/20 backdrop-blur-sm text-white rounded-full text-sm font-semibold mb-8">
              <TrendingUp className="w-4 h-4 mr-2" />
              Join the Wellness Revolution
            </div>

            <h2 className="text-4xl md:text-5xl lg:text-6xl font-playfair font-bold text-white mb-8 leading-tight">
              Ready to Transform
              <span className="block text-emerald-100">Your Wellness Journey?</span>
            </h2>

            <p className="text-xl md:text-2xl text-emerald-100/90 mb-12 max-w-3xl mx-auto leading-relaxed">
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

