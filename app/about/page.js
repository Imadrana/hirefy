"use client"
//this is about page for a freelancing marketplace website and about team. 
import React from 'react';
import { Users, Target, Award, Globe, Heart, Zap } from 'lucide-react';
import Link from 'next/link';

const About = () => {
  const stats = [
    { number: '500K+', label: 'Active Users', icon: <Users className="w-8 h-8" /> },
    { number: '100K+', label: 'Projects Completed', icon: <Target className="w-8 h-8" /> },
    { number: '50+', label: 'Countries', icon: <Globe className="w-8 h-8" /> },
    { number: '4.9', label: 'Average Rating', icon: <Award className="w-8 h-8" /> }
  ];

  const team = [
    {
      name: 'Sarah Chen',
      role: 'CEO & Founder',
      image: '/api/placeholder/300/300',
      description: 'Former tech executive with 15+ years experience building marketplaces.'
    },
    {
      name: 'Marcus Johnson',
      role: 'CTO',
      image: '/api/placeholder/300/300',
      description: 'Engineering leader who scaled platforms to millions of users.'
    },
    {
      name: 'Emily Rodriguez',
      role: 'Head of Product',
      image: '/api/placeholder/300/300',
      description: 'Product strategist focused on creating seamless user experiences.'
    }
  ];

  const values = [
    {
      icon: <Heart className="w-12 h-12 text-red-500" />,
      title: 'People First',
      description: 'We put our community of freelancers and clients at the center of everything we do.'
    },
    {
      icon: <Zap className="w-12 h-12 text-yellow-500" />,
      title: 'Innovation',
      description: 'We continuously evolve our platform with cutting-edge technology and features.'
    },
    {
      icon: <Award className="w-12 h-12 text-blue-500" />,
      title: 'Excellence',
      description: 'We maintain the highest standards in quality, security, and customer service.'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center">
              <div className="w-8 h-8 bg-red-500 rounded-full mr-2"></div>
              <span className="text-xl font-bold">HireFy</span>
            </Link>
            <nav className="hidden md:flex space-x-6">
              <Link href="/find-talent" className="text-gray-600 hover:text-red-500">Find Talent</Link>
              <Link href="/find-work" className="text-gray-600 hover:text-red-500">Find Work</Link>
              <Link href="/about" className="text-red-500 font-medium">About</Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-red-500 to-pink-500 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">About HireFy</h1>
          <p className="text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed">
            We're building the world's most trusted marketplace where talented professionals 
            and innovative companies come together to create amazing work.
          </p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="flex justify-center mb-4 text-red-500">
                  {stat.icon}
                </div>
                <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">{stat.number}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900">Our Story</h2>
              <div className="space-y-4 text-gray-600 text-lg leading-relaxed">
                <p>
                  Founded in 2019, HireFy started with a simple mission: to democratize access to 
                  global talent and create opportunities for professionals worldwide.
                </p>
                <p>
                  What began as a small team of entrepreneurs has grown into a thriving marketplace 
                  connecting hundreds of thousands of freelancers with businesses across 50+ countries.
                </p>
                <p>
                  Today, we're proud to be the platform where world-class work gets done, 
                  relationships are built, and careers are transformed.
                </p>
              </div>
            </div>
            <div className="relative">
              <img 
                src="/api/placeholder/600/400" 
                alt="HireFy team working" 
                className="rounded-lg shadow-lg w-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">Our Values</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              These core principles guide everything we do and shape the HireFy experience.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <div key={index} className="text-center p-8 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-center mb-6">
                  {value.icon}
                </div>
                <h3 className="text-xl font-semibold mb-4 text-gray-900">{value.title}</h3>
                <p className="text-gray-600 leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">Meet Our Team</h2>
            <p className="text-xl text-gray-600">
              The passionate people building the future of work.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <div key={index} className="text-center">
                <img 
                  src={member.image} 
                  alt={member.name}
                  className="w-48 h-48 rounded-full mx-auto mb-6 object-cover shadow-lg"
                />
                <h3 className="text-xl font-semibold mb-2 text-gray-900">{member.name}</h3>
                <p className="text-red-500 font-medium mb-4">{member.role}</p>
                <p className="text-gray-600 leading-relaxed">{member.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-red-500 text-white">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-8">Our Mission</h2>
          <p className="text-xl md:text-2xl max-w-4xl mx-auto leading-relaxed mb-12">
            To create economic opportunities so people have better lives. We believe that when 
            talent meets opportunity, incredible things happen.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/find-work" className="bg-white text-red-500 hover:bg-gray-100 px-8 py-3 rounded-lg font-semibold transition-colors">
              Start Your Journey
            </Link>
            <Link href="/find-talent" className="border-2 border-white hover:bg-white hover:text-red-500 px-8 py-3 rounded-lg font-semibold transition-colors">
              Hire Talent
            </Link>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4 text-gray-900">Get in Touch</h2>
          <p className="text-lg text-gray-600 mb-8">
            Have questions about HireFy? We'd love to hear from you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="mailto:hello@hirefy.com" 
              className="bg-red-500 text-white hover:bg-red-600 px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              Contact Us
            </a>
            <a 
              href="/help" 
              className="border border-gray-300 text-gray-700 hover:border-gray-400 px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              Visit Help Center
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;