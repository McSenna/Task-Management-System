import React, { useState } from 'react';
import { 
  Layers, 
  Calendar, 
  Users, 
  PieChart, 
  Sliders, 
  Clock, 
  Move,
  CheckCircle,
  BellRing,
  Paperclip,
  FileText,
  Search,
  Link,
  LineChart,
  Network,
  ChevronRight,
  ArrowRight,
  Zap,
  Star,
  Globe,
  Shield
} from 'lucide-react';

const Features = () => {
  const [activeTab, setActiveTab] = useState('all');
  
  const primaryFeatures = [
    {
      title: "Drag & Drop Kanban Board",
      description: "Intuitively move tasks between different stages with our smooth drag and drop interface. Visualize your workflow and optimize productivity.",
      icon: <Move className="h-6 w-6 text-indigo-600" />,
      color: "bg-indigo-100",
      category: "workflow"
    },
    {
      title: "Customizable Workflows",
      description: "Create and customize your perfect workflow. Add, remove, or rename columns to match your team's unique process.",
      icon: <Sliders className="h-6 w-6 text-purple-600" />,
      color: "bg-purple-100",
      category: "customization"
    },
    {
      title: "Team Collaboration",
      description: "Assign tasks to team members, share boards, and collaborate in real-time with comments and attachments.",
      icon: <Users className="h-6 w-6 text-blue-600" />,
      color: "bg-blue-100",
      category: "collaboration"
    },
    {
      title: "Time Tracking",
      description: "Monitor time spent on tasks with built-in tracking tools. Generate reports to analyze productivity and improve estimations.",
      icon: <Clock className="h-6 w-6 text-teal-600" />,
      color: "bg-teal-100",
      category: "analytics"
    },
    {
      title: "Advanced Analytics",
      description: "Gain insights into your team's performance with detailed charts and reports. Track progress and identify bottlenecks.",
      icon: <PieChart className="h-6 w-6 text-rose-600" />,
      color: "bg-rose-100",
      category: "analytics"
    },
    {
      title: "Global Accessibility",
      description: "Access your boards from anywhere, on any device. Our responsive design ensures a seamless experience across desktop and mobile.",
      icon: <Globe className="h-6 w-6 text-emerald-600" />,
      color: "bg-emerald-100",
      category: "accessibility"
    }
  ];

  const secondaryFeatures = [
    {
      title: "Task Dependencies",
      description: "Set up dependencies between tasks to ensure work happens in the right order.",
      icon: <Link className="h-5 w-5 text-gray-600" />,
      color: "border-l-4 border-indigo-500",
      category: "workflow"
    },
    {
      title: "Priority Levels",
      description: "Assign priorities to tasks and sort by importance to focus on what matters most.",
      icon: <CheckCircle className="h-5 w-5 text-gray-600" />,
      color: "border-l-4 border-purple-500",
      category: "workflow"
    },
    {
      title: "Deadline Reminders",
      description: "Never miss a deadline with customizable notifications and reminders.",
      icon: <BellRing className="h-5 w-5 text-gray-600" />,
      color: "border-l-4 border-blue-500",
      category: "reminders"
    },
    {
      title: "File Attachments",
      description: "Attach relevant files directly to tasks for easy access and reference.",
      icon: <Paperclip className="h-5 w-5 text-gray-600" />,
      color: "border-l-4 border-green-500",
      category: "collaboration"
    },
    {
      title: "Task Templates",
      description: "Save time by creating templates for recurring tasks and processes.",
      icon: <FileText className="h-5 w-5 text-gray-600" />,
      color: "border-l-4 border-yellow-500",
      category: "customization"
    },
    {
      title: "Search & Filters",
      description: "Quickly find tasks with powerful search and filtering capabilities.",
      icon: <Search className="h-5 w-5 text-gray-600" />,
      color: "border-l-4 border-red-500",
      category: "accessibility"
    },
    {
      title: "Data Security",
      description: "Rest easy knowing your data is protected with enterprise-grade security features.",
      icon: <Shield className="h-5 w-5 text-gray-600" />,
      color: "border-l-4 border-slate-500",
      category: "security"
    },
    {
      title: "Quick Actions",
      description: "Perform common actions with keyboard shortcuts and context menus for greater efficiency.",
      icon: <Zap className="h-5 w-5 text-gray-600" />,
      color: "border-l-4 border-amber-500",
      category: "accessibility"
    }
  ];

  const categories = [
    { id: 'all', name: 'All Features' },
    { id: 'workflow', name: 'Workflow' },
    { id: 'collaboration', name: 'Collaboration' },
    { id: 'customization', name: 'Customization' },
    { id: 'analytics', name: 'Analytics' },
    { id: 'accessibility', name: 'Accessibility' }
  ];

  const filteredPrimaryFeatures = activeTab === 'all' 
    ? primaryFeatures 
    : primaryFeatures.filter(feature => feature.category === activeTab);

  const filteredSecondaryFeatures = activeTab === 'all' 
    ? secondaryFeatures 
    : secondaryFeatures.filter(feature => feature.category === activeTab);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <span className="bg-indigo-100 text-indigo-800 text-xs font-medium px-4 py-1.5 rounded-full mb-4 inline-block">
            Powerful Features
          </span>
          <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-500 tracking-tight mb-6">
            Task Management Reimagined
          </h1>
          <p className="max-w-2xl mx-auto text-xl text-gray-600">
            Everything you need to manage your projects from start to finish, all in one place.
          </p>
        </div>

        {/* Demo Showcase */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-24 transform hover:scale-[1.01] transition-all duration-300">
          <div className="bg-gradient-to-r from-indigo-600 to-blue-500 p-8 text-white">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-3xl font-bold mb-4">Drag & Drop Kanban Board</h2>
                <p className="text-indigo-100 text-lg max-w-2xl">
                  Visualize your workflow and move tasks effortlessly between different stages with our intuitive drag and drop interface.
                </p>
              </div>
              <div className="mt-6 md:mt-0">
                <button className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-6 py-3 rounded-lg font-medium flex items-center transition-all duration-300 transform hover:translate-x-1">
                  See it in action <ArrowRight className="ml-2 h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
          <div className="p-8">
            <div className="flex flex-col lg:flex-row gap-6 overflow-x-auto pb-4">
              {[
                {name: 'To Do', color: 'bg-blue-100 text-blue-800', count: 5},
                {name: 'In Progress', color: 'bg-amber-100 text-amber-800', count: 3},
                {name: 'Complete', color: 'bg-green-100 text-green-800', count: 8}
              ].map((column, columnIndex) => (
                <div key={columnIndex} className="flex-1 min-w-72 bg-gray-50 rounded-xl border border-gray-200
                  shadow-sm hover:shadow-md transition-all duration-300 ease-in-out transform hover:-translate-y-1">
                  <div className={`p-4 font-medium ${column.color} rounded-t-xl flex justify-between items-center`}>
                    <span>{column.name}</span>
                    <span className="bg-white bg-opacity-30 px-2 py-1 rounded-full text-sm">{column.count}</span>
                  </div>
                  <div className="p-3 space-y-3">
                    {[...Array(Math.min(3, column.count))].map((_, i) => (
                      <div key={i} className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer">
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-medium text-gray-800">
                            {columnIndex === 0 ? 'Design homepage' : 
                             columnIndex === 1 ? 'Create API endpoints' : 
                             columnIndex === 2 ? 'User testing' :
                             'Update documentation'}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            i % 3 === 0 ? 'bg-red-100 text-red-800' : 
                            i % 3 === 1 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {i % 3 === 0 ? 'High' : i % 3 === 1 ? 'Medium' : 'Low'}
                          </span>
                        </div>
                        <div className="text-sm text-gray-500 mb-3">
                          {columnIndex === 0 ? 'Create wireframes for the landing page' : 
                           columnIndex === 1 ? 'Implement user authentication' : 
                           columnIndex === 2 ? 'Conduct usability testing with 5 users' :
                           'Update API documentation with new endpoints'}
                        </div>
                        <div className="flex justify-between items-center">
                          <div className="flex -space-x-2">
                            {[...Array(2)].map((_, j) => (
                              <div key={j} className={`w-6 h-6 rounded-full border-2 border-white ${
                                j % 3 === 0 ? 'bg-indigo-400' : 
                                j % 3 === 1 ? 'bg-green-400' : 
                                'bg-purple-400'
                              }`}></div>
                            ))}
                          </div>
                          <span className="text-xs text-gray-500">May {i + 5}, 2025</span>
                        </div>
                      </div>
                    ))}
                    {column.count > 3 && (
                      <div className="text-center py-2 text-sm text-gray-500">
                        +{column.count - 3} more tasks
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Feature Filter Tabs */}
        <div className="mb-12 flex justify-center">
          <div className="inline-flex flex-wrap justify-center gap-2 bg-gray-100 rounded-lg p-1">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveTab(category.id)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  activeTab === category.id
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-gray-600 hover:text-indigo-600'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Core Features */}
        <div className="mb-24">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">Core Features</h2>
          <p className="text-gray-600 text-center max-w-3xl mx-auto mb-16">
            Our comprehensive suite of tools gives you everything you need to streamline your workflow, 
            boost productivity, and deliver projects on time.
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPrimaryFeatures.map((feature, index) => (
              <div key={index} className="bg-white p-8 rounded-2xl shadow-md border border-gray-100
              hover:shadow-xl transition-all duration-500 ease-in-out transform hover:-translate-y-2 group">
                <div className={`mb-6 p-4 ${feature.color} rounded-2xl inline-flex group-hover:scale-110 transition-all duration-300`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed mb-4">{feature.description}</p>
                <a href="#" className="text-indigo-600 font-medium inline-flex items-center group-hover:translate-x-1 transition-transform duration-300">
                  Learn more <ChevronRight className="ml-1 h-4 w-4" />
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* Additional Features */}
        <div className="mb-24">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">Additional Features</h2>
          <p className="text-gray-600 text-center max-w-3xl mx-auto mb-16">
            Powerful additional capabilities that enhance your task management experience
            and help your team work more efficiently.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredSecondaryFeatures.map((feature, index) => (
              <div key={index} className={`bg-white p-6 rounded-xl shadow-sm ${feature.color} pl-8
               hover:shadow-md transition-all duration-300 ease-in-out transform hover:-translate-y-1`}>
                <div className="flex items-center mb-3">
                  {feature.icon}
                  <h3 className="text-lg font-semibold text-gray-900 ml-2">{feature.title}</h3>
                </div>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Benefits Section */}
        <div className="bg-gradient-to-r from-indigo-600 via-violet-600 to-blue-500 rounded-2xl shadow-xl overflow-hidden mb-24 text-white">
          <div className="p-10">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-12">
              <h2 className="text-3xl font-bold md:w-1/2">Why Choose Our Kanban Solution?</h2>
              <p className="text-indigo-100 md:w-1/2 mt-4 md:mt-0">
                Our task management platform helps teams of all sizes streamline their workflow and deliver 
                projects on time. See how our features can transform your team's productivity.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-12">
              <div className="text-center group">
                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-6 group-hover:shadow-lg transform group-hover:scale-110 transition-all duration-300">
                  <LineChart className="h-12 w-12 text-indigo-600" />
                </div>
                <h3 className="text-xl font-bold mb-3">Increased Productivity</h3>
                <p className="text-indigo-100">Visualize bottlenecks and optimize your workflow to improve team efficiency by up to 40%.</p>
              </div>
              <div className="text-center group">
                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-6 group-hover:shadow-lg transform group-hover:scale-110 transition-all duration-300">
                  <Calendar className="h-12 w-12 text-indigo-600" />
                </div>
                <h3 className="text-xl font-bold mb-3">Better Planning</h3>
                <p className="text-indigo-100">Get a clear overview of your project timeline and resource allocation for more accurate estimates.</p>
              </div>
              <div className="text-center group">
                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-6 group-hover:shadow-lg transform group-hover:scale-110 transition-all duration-300">
                  <Network className="h-12 w-12 text-indigo-600" />
                </div>
                <h3 className="text-xl font-bold mb-3">Transparent Workflow</h3>
                <p className="text-indigo-100">Keep everyone on the same page with visual task management and real-time updates.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Features;