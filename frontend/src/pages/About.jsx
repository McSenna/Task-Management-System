import React, { useState, useEffect, useRef } from 'react';
import { Users, Award, Globe, Heart, Briefcase, Clock, Target,
   ChevronRight, ChevronDown, Star, Coffee, MapPin, Code } from 'lucide-react';
import '../../src/App.css';

const About = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeSection, setActiveSection] = useState(null);
  const [hoveredMember, setHoveredMember] = useState(null);
  const headerRef = useRef(null);
  const [scrollY, setScrollY] = useState(0);
  const [expandedFact, setExpandedFact] = useState(null);

  const themeColors = {
    primary: 'from-blue-500 to-indigo-600',
    secondary: 'from-indigo-400 to-purple-500',
    accent: 'from-teal-400 to-blue-500',
    highlight: 'from-amber-400 to-orange-500'
  };

  useEffect(() => {
    const loadTimer = setTimeout(() => setIsLoaded(true), 100);
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    
    window.addEventListener('scroll', handleScroll);
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
          entry.target.classList.add('animate-in');
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -100px 0px' });

    document.querySelectorAll('.animate-section').forEach(section => {
      observer.observe(section);
    });

    return () => {
      clearTimeout(loadTimer);
      window.removeEventListener('scroll', handleScroll);
      observer.disconnect();
    };
  }, []);

  const teamMembers = [
    {
      name: "Justin Valladolid",
      role: "Lead Developer",
      image: "/Tin1.jpg",
      bio: "A Computer Arts Technological College student who is passionate about web development.",
      isLead: true,
      color: themeColors.primary,
      specialty: "Frontend Development",
      icon: <Code className="h-4 w-4" />
    },
    {
      name: "Lorence Bania",
      role: "Technical Architect",
      image: "/bania.jpg",
      bio: "Lorence brings deep technical expertise and oversees all product development and technology.",
      color: themeColors.secondary,
      specialty: "System Architecture",
      icon: <Code className="h-4 w-4" />
    },
    {
      name: "Dave Mias",
      role: "Quality Assurance",
      image: "/dave.jpg",
      bio: "Dave ensures our products meet the highest standards of quality and user experience.",
      color: themeColors.accent,
      specialty: "Quality Testing",
      icon: <Target className="h-4 w-4" />
    },
    {
      name: "Quennie Sofia Bolante",
      role: "UI/UX Designer",
      image: "/queeny.jpg",
      bio: "She led the design of our user interface, ensuring it was intuitive and user-friendly.",
      color: themeColors.highlight,
      specialty: "User Experience",
      icon: <Heart className="h-4 w-4" />
    },
    {
      name: "Maverick John Madrona",
      role: "Marketing Strategist",
      image: "/mavs.jpg",
      bio: "Maverick drives our brand strategy and leads all marketing and communication efforts.",
      color: themeColors.secondary,
      specialty: "Brand Strategy",
      icon: <Globe className="h-4 w-4" />
    }
  ];

  const values = [
    {
      title: "Excellence",
      description: "We strive for excellence in everything we do, from product development to customer service.",
      icon: <Award className="h-6 w-6 text-blue-600" />,
      color: "bg-blue-100",
      hoverColor: "group-hover:bg-blue-200",
      textColor: "text-blue-600"
    },
    {
      title: "Innovation",
      description: "We continuously innovate to create solutions that address real-world challenges.",
      icon: <Globe className="h-6 w-6 text-indigo-600" />,
      color: "bg-indigo-100",
      hoverColor: "group-hover:bg-indigo-200",
      textColor: "text-indigo-600"
    },
    {
      title: "Customer Focus",
      description: "Our customers are at the center of every decision we make.",
      icon: <Heart className="h-6 w-6 text-rose-600" />,
      color: "bg-rose-100",
      hoverColor: "group-hover:bg-rose-200",
      textColor: "text-rose-600"
    },
    {
      title: "Collaboration",
      description: "We believe great ideas emerge when diverse teams work together toward common goals.",
      icon: <Users className="h-6 w-6 text-teal-600" />,
      color: "bg-teal-100",
      hoverColor: "group-hover:bg-teal-200",
      textColor: "text-teal-600"
    }
  ];
  
  const facts = [
    { 
      value: "March 18, 2025", 
      label: "Founded", 
      icon: <Clock className="h-5 w-5" />,
      color: "bg-blue-500",
      detail: "Started during prefinal exams as a solution to manage tasks effectively"
    },
    { 
      value: "5", 
      label: "Team Members", 
      icon: <Users className="h-5 w-5" />,
      color: "bg-indigo-500",
      detail: "A diverse team of talented students with complementary skills"
    },
    { 
      value: "Coming Soon", 
      label: "Happy Users", 
      icon: <Heart className="h-5 w-5" />,
      color: "bg-rose-500",
      detail: "We're preparing to launch and can't wait to help users manage their tasks"
    },
    { 
      value: "Philippines", 
      label: "Country", 
      icon: <MapPin className="h-5 w-5" />,
      color: "bg-teal-500",
      detail: "Proudly developed in the Philippines with global aspirations"
    }
  ];

  const getAnimationDelay = (index) => {
    return { animationDelay: `${index * 150}ms` };
  };

  return (
    <div className={`bg-gradient-to-b from-gray-50 to-white min-h-screen transition-all duration-1000 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
      <div 
        className="relative overflow-hidden bg-gradient-to-br from-blue-300 to-indigo-500 text-white"
        style={{ 
          height: '300px',
          clipPath: 'polygon(0 0, 100% 0, 100% 85%, 0 100%)'
        }}
      >
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: 'url("/api/placeholder/1200/400")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            transform: `translateY(${scrollY * 0.2}px)`
          }}
        ></div>
        <div className="relative h-full flex items-center justify-center">
          <div 
            ref={headerRef}
            className="text-center transform transition-all duration-700"
            style={{ transform: `translateY(${scrollY * -0.15}px)` }}
          >
            <h1 className="text-5xl font-extrabold tracking-tight mb-2 drop-shadow-lg">
              About Us
            </h1>
            <div className="w-24 h-1 bg-white mx-auto mb-4 rounded-full"></div>
            <p className="text-lg text-blue-100 max-w-lg mx-auto px-4">
              Meet the team behind the Task Management System
            </p>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t from-white to-transparent"></div>
      </div>

      <div className=" min-w-screen mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl -mt-10 relative z-10">
        <div className="mb-10 flex justify-center sticky">
          <div className="s bg-white rounded-full shadow-lg px-2 py-1 flex space-x-1 overflow-x-auto max-w-full">
            {["story", "mission-vision", "values", "team", "facts"].map((section) => (
              <a 
                key={section}
                href={`#${section}`}
                className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-all duration-300 ${activeSection === section ? 'bg-blue-100 text-blue-800' : 'text-gray-600 hover:text-blue-600'}`}
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById(section).scrollIntoView({ behavior: 'smooth' });
                }}
              >
                {section.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
              </a>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl overflow-hidden shadow-lg">
          <div className="p-8">
            <div id="story" className="mb-20 animate-section transition-all duration-700 transform">
              <div className="flex flex-col items-center mb-8">
                <div className="h-14 w-14 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center mb-4 shadow-md animate-pulse">
                  <Clock className="h-7 w-7 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 relative">
                  Our Story
                  <div className="h-1 w-24 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full mx-auto mt-2"></div>
                </h2>
              </div>
              
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-10 rounded-xl shadow-md transition-all duration-500 hover:shadow-xl border-l-4 border-blue-500 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-200 to-indigo-200 rounded-bl-full opacity-20 -mr-10 -mt-10 group-hover:scale-110 transition-transform duration-700"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-blue-200 to-indigo-200 rounded-tr-full opacity-20 -ml-10 -mb-10 group-hover:scale-110 transition-transform duration-700"></div>
                
                <div className="relative z-10">
                  <p className="text-gray-700 mb-6 text-lg leading-relaxed text-justify">
                    Our Task Management System was created out of need on <span className="font-semibold text-blue-700">March 18, 2025</span>, amid the commotion of prefinal exams. What began as a straightforward way to maintain organization
                    under duress swiftly developed into an effective time, task, and priority management tool.
                    This technique was created to help you stay focused, reduce stress, and complete tasks especially when they are most important.
                  </p>
                  <p className="text-gray-700 text-lg">
                    Today, we remain committed to our original mission of building intuitive, powerful, and 
                    reliable solutions that help our users achieve their goals.
                  </p>
                  
                  <div className="mt-6 flex items-center justify-end">
                    <div className="flex items-center space-x-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className="h-4 w-4 text-amber-400 fill-amber-400" />
                      ))}
                    </div>
                    <span className="ml-2 text-gray-600 text-sm">Created by Justin, </span>
                  </div>
                </div>
              </div>
            </div>

            <div id="mission-vision" className="mb-20 animate-section transition-all duration-700 transform">
              <div className="flex flex-col md:flex-row gap-8">
                <div className="md:w-1/2 relative group perspective">
                  <div className="absolute -left-3 top-4 h-12 w-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center z-10 transition-all duration-300 group-hover:scale-110 shadow-md">
                    <Target className="h-6 w-6 text-white" />
                  </div>
                  <div className="bg-gradient-to-br from-white to-blue-50 p-8 pt-12 pl-12 rounded-xl shadow-md h-full border-t-4 border-blue-500 transition-all duration-500 group-hover:shadow-xl transform-gpu group-hover:-rotate-y-3 group-hover:translate-y-1">
                    <h3 className="text-2xl font-bold text-blue-800 mb-4 flex items-center">
                      Our Mission
                      <ChevronRight className="h-5 w-5 ml-2 opacity-70 group-hover:translate-x-1 transition-transform" />
                    </h3>
                    <p className="text-gray-700 text-lg leading-relaxed">
                      To empower businesses and individuals with innovative technology solutions that 
                      simplify complex processes and drive meaningful results. We believe in creating 
                      tools that enhance productivity and reduce stress in daily work.
                    </p>
                    
                    <div className="mt-6 bg-blue-100 bg-opacity-50 rounded-lg p-4 border-l-2 border-blue-400">
                      <p className="text-blue-800 italic">
                        "Simplifying task management one feature at a time."
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="md:w-1/2 relative group perspective">
                  <div className="absolute -left-3 top-4 h-12 w-12 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-full flex items-center justify-center z-10 transition-all duration-300 group-hover:scale-110 shadow-md">
                    <Briefcase className="h-6 w-6 text-white" />
                  </div>
                  <div className="bg-gradient-to-br from-white to-indigo-50 p-8 pt-12 pl-12 rounded-xl shadow-md h-full border-t-4 border-indigo-500 transition-all duration-500 group-hover:shadow-xl transform-gpu group-hover:-rotate-y-3 group-hover:translate-y-1">
                    <h3 className="text-2xl font-bold text-indigo-800 mb-4 flex items-center">
                      Our Vision
                      <ChevronRight className="h-5 w-5 ml-2 opacity-70 group-hover:translate-x-1 transition-transform" />
                    </h3>
                    <p className="text-gray-700 text-lg leading-relaxed">
                      To become the global leader in our industry by consistently delivering exceptional 
                      value and building lasting relationships with our customers. We aspire to create 
                      a world where task management is intuitive, enjoyable, and effective.
                    </p>
                    
                    <div className="mt-6 bg-indigo-100 bg-opacity-50 rounded-lg p-4 border-l-2 border-indigo-400">
                      <p className="text-indigo-800 italic">
                        "Creating the future of personal productivity."
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div id="values" className="mb-20 animate-section transition-all duration-700 transform">
              <div className="flex flex-col items-center mb-8">
                <div className="h-14 w-14 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center mb-4 shadow-md">
                  <Star className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-3xl font-bold text-gray-900 relative">
                  Our Values
                  <div className="h-1 w-24 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full mx-auto mt-2"></div>
                </h3>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                {values.map((value, index) => (
                  <div 
                    key={index} 
                    className="flex items-start p-6 bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-500 ease-in-out transform hover:-translate-y-1 group border-l-4 border-transparent hover:border-blue-500"
                    style={getAnimationDelay(index)}
                  >
                    <div className={`mr-4 p-3 ${value.color} rounded-xl ${value.hoverColor} transition-all duration-300 group-hover:rotate-6 group-hover:scale-110`}>
                      {value.icon}
                    </div>
                    <div>
                      <h4 className={`text-xl font-bold mb-2 transition-colors duration-300 ${value.textColor}`}>
                        {value.title}
                      </h4>
                      <p className="text-gray-600 group-hover:text-gray-800 transition-colors duration-300 leading-relaxed">
                        {value.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div id="team" className="mb-20 animate-section transition-all duration-700 transform">
              <div className="flex flex-col items-center mb-8">
                <div className="h-14 w-14 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center mb-4 shadow-md">
                  <Users className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-3xl font-bold text-gray-900 relative">
                  Our Leadership Team
                  <div className="h-1 w-24 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full mx-auto mt-2"></div>
                </h3>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                {teamMembers.map((member, index) => (
                  <div 
                    key={index} 
                    className="group relative perspective"
                    onMouseEnter={() => setHoveredMember(index)}
                    onMouseLeave={() => setHoveredMember(null)}
                    style={getAnimationDelay(index)}
                  >
                    <div className={`bg-white rounded-xl shadow-md overflow-hidden h-96 transition-all duration-500 transform ${hoveredMember === index ? 'rotate-y-180' : ''}`}>
                      <div className={`absolute inset-0 backface-hidden transition-all duration-500 ${hoveredMember === index ? 'opacity-0' : 'opacity-100'}`}>
                        <div className={`h-1/3 bg-gradient-to-r ${member.color} flex items-center justify-center`}>
                          <div className="relative mt-8 mb-2">
                            <div className="w-24 h-24 rounded-full bg-white p-1 shadow-lg flex items-center justify-center">
                              <img 
                                src={member.image} 
                                alt={member.name} 
                                className="w-full h-full rounded-full object-cover" 
                              />
                            </div>
                            {member.isLead && (
                              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-white text-blue-600 px-3 py-1 rounded-full text-xs font-bold shadow-md">
                                TEAM LEAD
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="px-4 pt-10 pb-6 text-center">
                          <h4 className="text-xl font-bold text-gray-900 mb-1">{member.name}</h4>
                          <p className="text-blue-600 text-md mb-4">{member.role}</p>
                          
                          <div className="flex items-center justify-center bg-blue-50 rounded-lg py-2 px-3 text-sm text-blue-700">
                            {member.icon}
                            <span className="ml-2">{member.specialty}</span>
                          </div>
                          
                          <p className="mt-4 text-gray-600 text-sm line-clamp-3">
                            {member.bio}
                          </p>
                          
                        </div>
                      </div>

                      <div className={`absolute inset-0  rotate-y-180 bg-gradient-to-br from-gray-50 to-white p-6 rounded-xl transition-all duration-500 ${hoveredMember === index ? 'opacity-100' : 'opacity-0'}`}>
                        <h4 className="text-xl font-bold text-gray-900 mb-1">{member.name}</h4>
                        <p className="text-blue-600 text-md mb-4">{member.role}</p>
                        
                        <div className=" text-justify text-gray-700 text-base mb-6 overflow-auto max-h-48 pr-2 custom-scrollbar">
                          {member.bio}
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center text-sm">
                            <div className={`h-8 w-8 rounded-full bg-gradient-to-r ${member.color} flex items-center justify-center mr-2`}>
                              {member.icon}
                            </div>
                            <span className="text-gray-700">{member.specialty}</span>
                          </div>
                          
                          <div className="flex items-center text-sm">
                            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center mr-2">
                              <Coffee className="h-4 w-4 text-blue-600" />
                            </div>
                            <span className="text-gray-700">Team Member</span>
                          </div>
                        </div>
                        
                        <div className="absolute bottom-4 right-4 text-blue-500 text-sm font-medium flex items-center justify-center cursor-pointer group-hover:underline">
                          <span>Back</span>
                          <ChevronDown className="h-4 w-4 ml-1" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div id="facts" className="mb-12 animate-section transition-all duration-700 transform">
              <div className="flex flex-col items-center mb-8">
                <div className="h-14 w-14 bg-gradient-to-br from-teal-400 to-green-500 rounded-full flex items-center justify-center mb-4 shadow-md">
                  <Award className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-3xl font-bold text-gray-900 relative">
                  Company Facts
                  <div className="h-1 w-24 bg-gradient-to-r from-teal-400 to-green-500 rounded-full mx-auto mt-2"></div>
                </h3>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {facts.map((fact, index) => (
                  <div 
                    key={index} 
                    className={`bg-white rounded-xl shadow-md transition-all duration-500 ease-in-out transform hover:-translate-y-1 hover:shadow-lg cursor-pointer ${expandedFact === index ? 'row-span-2 col-span-2' : ''}`}
                    onClick={() => setExpandedFact(expandedFact === index ? null : index)}
                    style={getAnimationDelay(index)}
                  >
                    <div className="p-6">
                      <div className={`h-12 w-12 rounded-full ${fact.color} flex items-center justify-center mb-4 text-white`}>
                        {fact.icon}
                      </div>
                      
                      <div className="text-3xl font-bold text-gray-800 mb-2">{fact.value}</div>
                      <div className="text-lg text-gray-600">{fact.label}</div>
                      
                      <div className={`mt-4 transition-all duration-500 overflow-hidden ${expandedFact === index ? 'max-h-32 opacity-100' : 'max-h-0 opacity-0'}`}>
                        <p className="text-gray-700 text-sm mt-2 border-t pt-2">
                          {fact.detail}
                        </p>
                      </div>
                      
                      <div className="flex justify-end mt-2">
                        <ChevronDown className={`h-5 w-5 text-gray-400 transition-transform duration-300 ${expandedFact === index ? 'rotate-180' : ''}`} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;