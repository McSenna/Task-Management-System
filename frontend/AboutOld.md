import React from 'react';
import { Users, Award, Globe, Heart, MessageSquare, Briefcase, Clock, Target } from 'lucide-react';

const About = () => {
  const teamMembers = [
    {
      name: "Justin Valladolid",
      role: "Student",
      image: "/Tin1.jpg",
      bio: "A Computer Arts Technological College student who is passionate about web development",
      isLead: true
    },
    {
      name: "Lorence Bania",
      role: "Student",
      image: "/bania.jpg",
      bio: "Lorence brings deep technical expertise and oversees all product development and technology initiatives."
    },
    {
      name: "Dave Mias",
      role: "Student",
      image: "/dave.jpg",
      bio: "Dave ensures our products meet the highest standards of quality and user experience."
    },
    {
      name: "Quennie Sofia Bolante",
      role: "Student",
      image: "/queeny.jpg",
      bio: "She led the design of our user interface, ensuring it was intuitive and user-friendly. His work significantly improved the overall user experience and visual appeal of the product."
    },
    {
      name: "Maverick John Madrona",
      role: "Student",
      image: "/mavs.jpg",
      bio: "Maverick drives our brand strategy and leads all marketing and communication efforts."
    }
  ];

  const values = [
    {
      title: "Excellence",
      description: "We strive for excellence in everything we do, from product development to customer service.",
      icon: <Award className="h-6 w-6 text-blue-600" />
    },
    {
      title: "Innovation",
      description: "We continuously innovate to create solutions that address real-world challenges.",
      icon: <Globe className="h-6 w-6 text-blue-600" />
    },
    {
      title: "Customer Focus",
      description: "Our customers are at the center of every decision we make.",
      icon: <Heart className="h-6 w-6 text-blue-600" />
    },
    {
      title: "Collaboration",
      description: "We believe great ideas emerge when diverse teams work together toward common goals.",
      icon: <Users className="h-6 w-6 text-blue-600" />
    }
  ];

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="min-w-screen mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-4">
            About Us
          </h1>
        </div>

        <div className="bg-gray-50 rounded-xl overflow-hidden">
          <div className="p-8">
            <div className="mb-16 shadow-md bg-white rounded-lg p-8">
              <div className="flex items-center justify-center mb-6">
                <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                  <Clock className="h-6 w-6 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Our Story</h2>
              </div>
              <div className="bg-blue-50 p-10 rounded-lg border-l-4 border-blue-500 shadow-md">
                <p className="text-gray-700 mb-4 text-justify">
                  Our Task Management System was created out of need on March 18, 2025, amid the commotion of prefinal exams. What began as a straightforward way to maintain organization
                  under duress swiftly developed into an effective time, task, and priority management tool.
                  This technique was created to help you stay focused, reduce stress, and complete tasks especially when they are most important.
                </p>
                <p className="text-gray-700">
                  Today, we remain committed to our original mission of building intuitive, powerful, and 
                  reliable solutions that help our users achieve their goals.
                </p>
              </div>
            </div>

            <div className="mb-16">
              <div className="flex flex-col md:flex-row gap-8">
                <div className="md:w-1/2 relative">
                  <div className="absolute -left-3 top-4 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Target className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-8 pt-10 pl-10 rounded-lg shadow-md h-full border-t-4 border-blue-500">
                    <h3 className="text-2xl font-semibold text-blue-800 mb-4">Our Mission</h3>
                    <p className="text-gray-700 text-justify">
                      To empower businesses and individuals with innovative technology solutions that 
                      simplify complex processes and drive meaningful results. We believe in creating 
                      tools that enhance productivity and reduce stress in daily work.
                    </p>
                  </div>
                </div>
                
                <div className="md:w-1/2 relative">
                  <div className="absolute -left-3 top-4 h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center">
                    <Briefcase className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-8 pt-10 pl-10 rounded-lg shadow-md h-full border-t-4 border-indigo-500">
                    <h3 className="text-2xl font-semibold text-indigo-800 mb-4">Our Vision</h3>
                    <p className="text-gray-700 text-justify">
                      To become the global leader in our industry by consistently delivering exceptional 
                      value and building lasting relationships with our customers. We aspire to create 
                      a world where task management is intuitive, enjoyable, and effective.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-12">
              <h3 className="text-center text-2xl font-semibold text-gray-900 mb-6 hover:text-blue-600 transition-colors duration-300">Our Values</h3>
              <div className="grid md:grid-cols-2 gap-6">
                {values.map((value, index) => (
                  <div 
                    key={index} 
                    className="flex items-start p-4 border border-gray-100 rounded-lg shadow-sm hover:shadow-md hover:border-blue-200 hover:bg-blue-50 transition-all duration-300 ease-in-out transform hover:-translate-y-1 group"
                  >
                    <div className="mr-4 p-2 bg-blue-100 rounded-md group-hover:bg-blue-200 transition-colors duration-300">
                      {value.icon}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1 group-hover:text-blue-700 transition-colors duration-300">
                        {value.title}
                      </h4>
                      <p className= "text-gray-600 group-hover:text-gray-800 transition-colors duration-300">
                        {value.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-12">
              <h3 className="text-2xl font-semibold text-gray-900 mb-6 text-center">Our Leadership Team</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {teamMembers.map((member, index) => (
                  <div 
                    key={index} 
                    className="flex flex-col items-center bg-gray-100 rounded-lg p-4 hover:bg-gray-200 transition duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-md h-80"
                  >
                    <div className="mb-4 flex-shrink-0">
                      <div className="relative">
                        <div className={`w-24 h-24 rounded-full ${member.isLead ? 'bg-gradient-to-r from-blue-400 to-indigo-500' : 'bg-gradient-to-r from-blue-300 to-indigo-400'} p-1 shadow-lg flex items-center justify-center`}>
                          <img 
                            src={member.image} 
                            alt={member.name} 
                            className="w-full h-full rounded-full object-cover border-2 border-white" 
                          />
                        </div>
                        {member.isLead && (
                          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-3 py-px rounded-full text-xs font-medium">
                            Lead
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-center w-full overflow-hidden mt-2">
                      <h4 className="text-xl font-semibold text-gray-900 hover:text-blue-600 transition duration-300 mb-1">{member.name}</h4>
                      <p className="text-blue-600 text-base mb-3 hover:text-blue-800 transition duration-300">{member.role}</p>
                      <p className="text-gray-700 text-sm text-justify hover:text-gray-900 transition duration-300 line-clamp-4 px-2">{member.bio}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-12 bg-gray-50 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-6 text-center">Company Facts</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div className="p-4 border border-gray-200 rounded-lg shadow-sm hover:shadow-md hover:border-blue-200 hover:bg-blue-50 transition-all duration-300 ease-in-out transform hover:-translate-y-1">
                  <div className="text-3xl font-bold text-blue-600 mb-1">March 18 2025</div>
                  <div className="text-sm text-gray-600">Founded</div>
                </div>
                <div className="p-4 border border-gray-200 rounded-lg shadow-sm hover:shadow-md hover:border-blue-200 hover:bg-blue-50 transition-all duration-300 ease-in-out transform hover:-translate-y-1"> 
                  <div className="text-3xl font-bold text-blue-600 mb-1">5</div>
                  <div className="text-sm text-gray-600">Team Members</div>
                </div>
                <div className="p-4 border border-gray-200 rounded-lg shadow-sm hover:shadow-md hover:border-blue-200 hover:bg-blue-50 transition-all duration-300 ease-in-out transform hover:-translate-y-1">
                  <div className="text-3xl font-bold text-blue-600 mb-1">Wala pa</div>
                  <div className="text-sm text-gray-600">Happy Customers</div>
                </div>
                <div className="p-4 border border-gray-200 rounded-lg shadow-sm hover:shadow-md hover:border-blue-200 hover:bg-blue-50 transition-all duration-300 ease-in-out transform hover:-translate-y-1">
                  <div className="text-3xl font-bold text-blue-600 mb-1">Philippines</div>
                  <div className="text-sm text-gray-600">Country</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;