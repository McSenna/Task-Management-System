import React from 'react';
import { 
  ChevronRight, 
  Clipboard, 
  Layers, 
  Users, 
  Zap, 
  CheckCircle, 
  Calendar, 
  FileText, 
  MessageCircle, 
  Briefcase,
  Award,
  Target,
  Clock
} from 'lucide-react';

const GetStarted = () => {
  const careerSteps = [
    {
      title: "Understand Our Company",
      description: "Research our brand, style, values, and culture. Learn about our recent projects and goals.",
      icon: <Briefcase className="text-purple-600" size={20} />,
      action: "About Our Company"
    },
    {
      title: "Build Relevant Skills",
      description: "Identify key skills needed for your desired role and enhance them through courses or workshops.",
      icon: <Award className="text-purple-600" size={20} />,
      action: "Skill Development"
    },
    {
      title: "Create a Strong Personal Brand",
      description: "Maintain a polished online presence and showcase your work, passion, and style.",
      icon: <Target className="text-purple-600" size={20} />,
      action: "Personal Branding"
    },
    {
      title: "Gain Industry Experience",
      description: "Apply for internships, assistant roles, or freelance projects to build credibility.",
      icon: <FileText className="text-purple-600" size={20} />,
      action: "Find Opportunities"
    }
  ];
  
  const applicationSteps = [
    {
      title: "Network With Industry Insiders",
      description: "Connect with employees or alumni from our company. Attend industry events to meet key people.",
      icon: <Users className="text-purple-600" size={20} />,
      action: "Networking Tips"
    },
    {
      title: "Apply With Impact",
      description: "Create a personalized cover letter, stylish resume, and portfolio that showcases your talents.",
      icon: <Clipboard className="text-purple-600" size={20} />,
      action: "Application Guide"
    },
    {
      title: "Prepare For The Interview",
      description: "Research our aesthetic and values, dress appropriately, and explain why you're the perfect fit.",
      icon: <MessageCircle className="text-purple-600" size={20} />,
      action: "Interview Prep"
    },
    {
      title: "Follow Up & Stay Persistent",
      description: "Send a thank-you email, ask for feedback if rejected, and keep growing your industry presence.",
      icon: <Zap className="text-purple-600" size={20} />,
      action: "Follow-up Templates"
    }
  ];


  const setupSteps = [
    {
      title: "Wait for assigned tasks",
      description: "Monitor your dashboard for new tasks assigned to you by team leads and managers.",
      icon: <Clock className="text-purple-600" size={20} />,
      action: "View Dashboard"
    },
    {
      title: "Customize your task flow",
      description: "Rearrange columns, create custom stages, and build a workflow that matches your team's process.",
      icon: <Layers className="text-purple-600" size={20} />,
      action: "Customize Flow"
    },
    {
      title: "Invite your team",
      description: "Collaborate seamlessly by inviting team members to join your workspace.",
      icon: <Users className="text-purple-600" size={20} />,
      action: "Invite Team"
    },
    {
      title: "Boost productivity",
      description: "Start managing tasks, tracking progress, and celebrating completed milestones.",
      icon: <Zap className="text-purple-600" size={20} />,
      action: "Get Started"
    }
  ];

  const benefits = [
    {
      title: "Visualize Your Workflow",
      description: "See your entire project at a glance with intuitive Kanban boards.",
      icon: <Layers className="h-8 w-8 text-purple-600" />,
    },
    {
      title: "Never Miss a Deadline",
      description: "Stay on track with calendar views and customizable notifications.",
      icon: <Calendar className="h-8 w-8 text-purple-600" />,
    },
    {
      title: "Improve Team Collaboration",
      description: "Work together effectively with shared boards and real-time updates.",
      icon: <Users className="h-8 w-8 text-purple-600" />,
    },
  ];


  return (
    <div className="bg-gradient-to-b from-gray-50 to-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-4">
            Get Started with <span className="text-purple-600">Glamour Task</span>
          </h1>
        </div>

        {/* Main Content Card */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-12">
          <div className="bg-gradient-to-r from-purple-600 to-indigo-700 p-8 text-white">
            <div className="flex flex-col md:flex-row items-center">
              <div className="md:w-2/3">
                <h2 className="text-3xl font-bold mb-4">Your career journey starts here</h2>
                <p className="text-purple-100 mb-6">
                  Our comprehensive guide will help you land your dream job with Glamour. Learn how to prepare, apply, and succeed in our competitive industry.
                </p>
                <button className="inline-flex items-center bg-white text-purple-700 font-medium px-6 py-3 rounded-md transition-colors hover:bg-purple-100 focus:outline-none focus:ring-2 focus:ring-purple-300 focus:ring-offset-2">
                  Start Your Journey <ChevronRight className="ml-2 h-4 w-4" />
                </button>
              </div>
              <div className="md:w-1/3 flex justify-center mt-6 md:mt-0">
                <div className="bg-purple-800 bg-opacity-50 p-4 rounded-lg">
                  <Briefcase className="h-24 w-24 text-white" />
                </div>
              </div>
            </div>
          </div>

          <div className="p-8">
            <h3 className="text-2xl font-semibold text-gray-900 mb-8 text-center">Build Your Foundation for Success</h3>
            <div className="space-y-8 md:space-y-0 md:grid md:grid-cols-2 md:gap-8">
              {careerSteps.map((step, index) => (
                <div key={index} className="flex p-6 border border-gray-100 rounded-lg shadow-sm hover:shadow-md hover:border-purple-200 transition-all duration-300 ease-in-out transform hover:-translate-y-1">
                  <div className="flex-shrink-0 mr-4">
                    <div className="flex items-center justify-center h-10 w-10 rounded-full bg-purple-100 text-purple-800 font-bold">
                      {index + 1}
                    </div>
                  </div>
                  <div className="flex-grow">
                    <div className="flex items-center mb-2">
                      <span className="mr-2">{step.icon}</span>
                      <h4 className="font-semibold text-gray-900">{step.title}</h4>
                    </div>
                    <p className="text-gray-600 mb-4">{step.description}</p>
                    <button className="text-sm font-medium text-purple-600 hover:text-purple-800 flex items-center">
                      {step.action} <ChevronRight className="ml-1 h-3 w-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
         
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-12">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-700 p-8 text-white">
            <div className="flex flex-col md:flex-row items-center">
              <div className="md:w-2/3">
                <h2 className="text-3xl font-bold mb-4">Master the Application Process</h2>
                <p className="text-purple-100 mb-6">
                  Stand out from the competition with our expert application strategies. We'll guide you through every step of the process.
                </p>
                <button className="inline-flex items-center bg-white text-purple-700 font-medium px-6 py-3 rounded-md transition-colors hover:bg-purple-100 focus:outline-none focus:ring-2 focus:ring-purple-300 focus:ring-offset-2">
                  Application Guide <ChevronRight className="ml-2 h-4 w-4" />
                </button>
              </div>
              <div className="md:w-1/3 flex justify-center mt-6 md:mt-0">
                <div className="bg-purple-800 bg-opacity-50 p-4 rounded-lg">
                  <FileText className="h-24 w-24 text-white" />
                </div>
              </div>
            </div>
          </div>
          
          <div className="p-8">
            <h3 className="text-2xl font-semibold text-gray-900 mb-8 text-center">Your Path to Landing the Perfect Role</h3>
            <div className="space-y-8 md:space-y-0 md:grid md:grid-cols-2 md:gap-8">
              {applicationSteps.map((step, index) => (
                <div key={index} className="flex p-6 border border-gray-100 rounded-lg shadow-sm hover:shadow-md hover:border-purple-200 transition-all duration-300 ease-in-out transform hover:-translate-y-1">
                  <div className="flex-shrink-0 mr-4">
                    <div className="flex items-center justify-center h-10 w-10 rounded-full bg-purple-100 text-purple-800 font-bold">
                      {index + 5}
                    </div>
                  </div>
                  <div className="flex-grow">
                    <div className="flex items-center mb-2">
                      <span className="mr-2">{step.icon}</span>
                      <h4 className="font-semibold text-gray-900">{step.title}</h4>
                    </div>
                    <p className="text-gray-600 mb-4">{step.description}</p>
                    <button className="text-sm font-medium text-purple-600 hover:text-purple-800 flex items-center">
                      {step.action} <ChevronRight className="ml-1 h-3 w-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-12">
          <div className="bg-gradient-to-r from-purple-700 to-pink-600 p-8 text-white">
            <div className="flex flex-col md:flex-row items-center">
              <div className="md:w-2/3">
                <h2 className="text-3xl font-bold mb-4">Set Up Your Task Management System</h2>
                <p className="text-purple-100 mb-6">
                  Once you've joined us, you'll get access to our powerful task management platform. Here's how to get started.
                </p>
                <button className="inline-flex items-center bg-white text-purple-700 font-medium px-6 py-3 rounded-md transition-colors hover:bg-purple-100 focus:outline-none focus:ring-2 focus:ring-purple-300 focus:ring-offset-2">
                  System Tutorial <ChevronRight className="ml-2 h-4 w-4" />
                </button>
              </div>
              <div className="md:w-1/3 flex justify-center mt-6 md:mt-0">
                <div className="bg-purple-800 bg-opacity-50 p-4 rounded-lg">
                  <CheckCircle className="h-24 w-24 text-white" />
                </div>
              </div>
            </div>
          </div>

          <div className="p-8">
            <h3 className="text-2xl font-semibold text-gray-900 mb-8 text-center">Four simple steps to transform your workflow</h3>
            <div className="space-y-8 md:space-y-0 md:grid md:grid-cols-2 md:gap-8">
              {setupSteps.map((step, index) => (
                <div key={index} className="flex p-6 border border-gray-100 rounded-lg shadow-sm hover:shadow-md hover:border-purple-200 transition-all duration-300 ease-in-out transform hover:-translate-y-1">
                  <div className="flex-shrink-0 mr-4">
                    <div className="flex items-center justify-center h-10 w-10 rounded-full bg-purple-100 text-purple-800 font-bold">
                      {index + 1}
                    </div>
                  </div>
                  <div className="flex-grow">
                    <div className="flex items-center mb-2">
                      <span className="mr-2">{step.icon}</span>
                      <h4 className="font-semibold text-gray-900">{step.title}</h4>
                    </div>
                    <p className="text-gray-600 mb-4">{step.description}</p>
                    <button className="text-sm font-medium text-purple-600 hover:text-purple-800 flex items-center">
                      {step.action} <ChevronRight className="ml-1 h-3 w-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="p-8 bg-purple-50">
            <h3 className="text-xl font-semibold text-gray-900 mb-6 text-center">Task Flow Customization Tips</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-4 rounded-lg shadow-sm border border-purple-100">
                <h4 className="font-medium text-purple-700 mb-2">Drag & Drop Columns</h4>
                <p className="text-gray-600 text-sm">Easily rearrange workflow stages by dragging columns into your preferred sequence to match your team's process.</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm border border-purple-100">
                <h4 className="font-medium text-purple-700 mb-2">Custom Status Labels</h4>
                <p className="text-gray-600 text-sm">Create industry-specific status labels like "In Revision," "Client Review," or "Final Approval" to match your unique workflow.</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm border border-purple-100">
                <h4 className="font-medium text-purple-700 mb-2">Conditional Automation</h4>
                <p className="text-gray-600 text-sm">Set up automated task movements based on specific conditions like deadline proximity or priority changes.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-12">
          <div className="p-8">
            <h3 className="text-2xl font-semibold text-gray-900 mb-8 text-center">Career Development Tools</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-purple-50 p-6 rounded-lg border-l-4 border-purple-500">
                <h4 className="text-xl font-semibold text-gray-900 mb-2">Application Tracker</h4>
                <p className="text-gray-600">Create dedicated Kanban boards to visualize your job applications at each stage - from "Interested" to "Applied" to "Interview" to "Offer."</p>
              </div>
              
              <div className="bg-purple-50 p-6 rounded-lg border-l-4 border-purple-500">
                <h4 className="text-xl font-semibold text-gray-900 mb-2">Interview Preparation</h4>
                <p className="text-gray-600">Practice common interview questions, prepare company research notes, and organize your portfolio materials all in one place.</p>
              </div>
              
              <div className="bg-purple-50 p-6 rounded-lg border-l-4 border-purple-500">
                <h4 className="text-xl font-semibold text-gray-900 mb-2">Skill Development</h4>
                <p className="text-gray-600">Track your learning progress, set goals for new skills, and document your achievements to showcase during interviews.</p>
              </div>
              
              <div className="bg-purple-50 p-6 rounded-lg border-l-4 border-purple-500">
                <h4 className="text-xl font-semibold text-gray-900 mb-2">Network Management</h4>
                <p className="text-gray-600">Keep track of industry connections, conversation notes, and follow-up tasks to build and maintain valuable professional relationships.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-12">
          <div className="p-8">
            <h3 className="text-2xl font-semibold text-gray-900 mb-8 text-center">Why you'll love Glamour Task</h3>
            <div className="grid md:grid-cols-3 gap-8">
              {benefits.map((benefit, index) => (
                <div key={index} className="text-center p-6 hover:bg-purple-50 rounded-lg transition-colors duration-300">
                  <div className="flex justify-center items-center mb-4">
                    <div className="p-3 bg-purple-100 rounded-full">
                      {benefit.icon}
                    </div>
                  </div>
                  <h4 className="text-xl font-semibold text-gray-900 mb-2">{benefit.title}</h4>
                  <p className="text-gray-600">{benefit.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

       
      </div>
    </div>
  );
};

export default GetStarted;