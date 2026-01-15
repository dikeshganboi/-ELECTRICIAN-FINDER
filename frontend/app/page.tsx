import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Zap, Shield, Clock, Star, MapPin, Phone, Search, Lightbulb, Wrench, AlertCircle, Home, Hammer, LogOut } from "lucide-react";
import { AuthNavbar } from "@/components/features/AuthNavbar";

export default function HomePage() {
  const services = [
    { icon: Lightbulb, label: "Wiring & Rewiring", color: "bg-yellow-100 text-yellow-600" },
    { icon: AlertCircle, label: "Emergency Repair", color: "bg-red-100 text-red-600" },
    { icon: Wrench, label: "Installation", color: "bg-blue-100 text-blue-600" },
    { icon: Hammer, label: "Maintenance", color: "bg-green-100 text-green-600" },
    { icon: Home, label: "Panel Upgrades", color: "bg-purple-100 text-purple-600" },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition">
            <Zap className="h-7 w-7 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">ElectricianFinder</span>
          </Link>
          <AuthNavbar />
        </div>
      </header>

      {/* Hero Section - UrbanClap Style */}
      <section className="bg-gradient-to-br from-blue-50 via-white to-purple-50 py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4 leading-tight">
              Home repair made <span className="text-blue-600">easy</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Book experienced electricians in just 30 seconds. Expert service at your doorstep.
            </p>
          </div>

          {/* Search Bar - UrbanClap Style */}
          <div className="max-w-3xl mx-auto mb-12">
            <div className="bg-white rounded-3xl shadow-lg p-2 flex items-center gap-2">
              <div className="flex-1 flex items-center gap-3 px-4">
                <MapPin className="h-5 w-5 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Enter your location" 
                  className="flex-1 bg-transparent border-none outline-none text-gray-900 placeholder-gray-400"
                />
              </div>
              <div className="h-10 w-px bg-gray-200"></div>
              <div className="flex-1 flex items-center gap-3 px-4">
                <Search className="h-5 w-5 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="What do you need?" 
                  className="flex-1 bg-transparent border-none outline-none text-gray-900 placeholder-gray-400"
                />
              </div>
              <Link href="/search">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-6 m-1">
                  Search
                </Button>
              </Link>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4 md:gap-8 text-center max-w-2xl mx-auto mb-8">
            <div>
              <p className="text-2xl md:text-3xl font-bold text-gray-900">50K+</p>
              <p className="text-sm text-gray-600">Verified Experts</p>
            </div>
            <div>
              <p className="text-2xl md:text-3xl font-bold text-gray-900">100K+</p>
              <p className="text-sm text-gray-600">Happy Customers</p>
            </div>
            <div>
              <p className="text-2xl md:text-3xl font-bold text-gray-900">4.9★</p>
              <p className="text-sm text-gray-600">Average Rating</p>
            </div>
          </div>
        </div>
      </section>

      {/* Services/Categories Section - UrbanClap Grid Style */}
      <section id="services" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-2">Popular Services</h2>
            <p className="text-gray-600 text-lg">Choose from our wide range of electrical services</p>
          </div>
          
          {/* Services Grid */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            {services.map((service, idx) => {
              const Icon = service.icon;
              return (
                <Link key={idx} href="/search">
                  <div className="bg-white border-2 border-gray-100 rounded-2xl p-6 text-center hover:border-blue-300 hover:shadow-lg transition-all cursor-pointer group">
                    <div className={`w-14 h-14 ${service.color} rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition`}>
                      <Icon className="h-7 w-7" />
                    </div>
                    <p className="text-sm font-semibold text-gray-900">{service.label}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Why Choose Us - UrbanClap Style */}
      <section className="bg-gray-50 py-20">
        <div className="container mx-auto px-4">
          <div className="mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-2">Why Choose ElectricianFinder</h2>
            <p className="text-gray-600 text-lg">The most trusted platform for electrical services</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white p-8 rounded-2xl border border-gray-100">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Verified & Trusted</h3>
              <p className="text-gray-600 text-sm">All professionals are background-checked with valid licenses and certifications</p>
            </div>
            
            <div className="bg-white p-8 rounded-2xl border border-gray-100">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                <Clock className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Super Fast</h3>
              <p className="text-gray-600 text-sm">Get a technician at your door in as little as 30 minutes</p>
            </div>
            
            <div className="bg-white p-8 rounded-2xl border border-gray-100">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
                <Star className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Best Prices</h3>
              <p className="text-gray-600 text-sm">No hidden charges. Transparent pricing with quality guaranteed</p>
            </div>
          </div>
        </div>
      </section>


      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-2">How It Works</h2>
            <p className="text-gray-600 text-lg">Book in 3 easy steps</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connecting line for desktop */}
            <div className="hidden md:block absolute top-20 left-1/4 right-1/4 h-1 bg-gradient-to-r from-blue-300 to-blue-600"></div>
            
            <div className="relative">
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mb-4 relative z-10">
                  1
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Tell Us What You Need</h3>
                  <p className="text-gray-600">Select your service and enter your location</p>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mb-4 relative z-10">
                  2
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Choose Your Pro</h3>
                  <p className="text-gray-600">View profiles and select your preferred technician</p>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mb-4 relative z-10">
                  3
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Relax & Enjoy</h3>
                  <p className="text-gray-600">Professional arrives and solves your problem</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-3">Ready to get it done?</h2>
          <p className="text-lg mb-8 opacity-90">Book a verified electrician today and get the job done right</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/search">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 w-full sm:w-auto text-base font-semibold px-8 py-6">
                Book Now
              </Button>
            </Link>
            <Link href="/register">
              <Button size="lg" className="border-2 border-white bg-transparent text-white hover:bg-white hover:text-blue-600 w-full sm:w-auto text-base font-semibold px-8 py-6">
                Become a Pro
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Zap className="h-6 w-6 text-blue-500" />
                <span className="text-white text-xl font-bold">ElectricianFinder</span>
              </div>
              <p className="text-sm text-gray-400">The most trusted platform for professional electrical services</p>
              <div className="flex gap-3 mt-4">
                <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center text-sm hover:bg-blue-600 cursor-pointer">f</div>
                <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center text-sm hover:bg-blue-600 cursor-pointer">𝕏</div>
                <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center text-sm hover:bg-blue-600 cursor-pointer">in</div>
              </div>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-4">For Customers</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="#" className="hover:text-white transition">How it works</Link></li>
                <li><Link href="#" className="hover:text-white transition">Search Services</Link></li>
                <li><Link href="#" className="hover:text-white transition">Pricing</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-4">For Professionals</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="#" className="hover:text-white transition">Register</Link></li>
                <li><Link href="#" className="hover:text-white transition">Partner Info</Link></li>
                <li><Link href="#" className="hover:text-white transition">Guidelines</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="#" className="hover:text-white transition">About</Link></li>
                <li><Link href="#" className="hover:text-white transition">Contact</Link></li>
                <li><Link href="#" className="hover:text-white transition">Blog</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8">
            <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-400 mb-4">
              <ul className="flex gap-4 flex-wrap">
                <li><Link href="#" className="hover:text-white">Privacy Policy</Link></li>
                <li><Link href="#" className="hover:text-white">Terms of Service</Link></li>
                <li><Link href="#" className="hover:text-white">Safety</Link></li>
              </ul>
            </div>
            <p className="text-sm text-gray-500">© 2025 ElectricianFinder. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
