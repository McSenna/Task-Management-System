import React from "react";
import { Link } from "react-router-dom";
import { ChevronRight, Check, Clock } from "lucide-react";

const Home = () => {
  return (
    <section className="bg-gray-50 min-h-screen flex items-center">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="flex flex-col md:flex-row items-center gap-12">
          <div className="md:w-1/2">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight text-gray-900">
              Glamour Task <span className="text-purple-600">Management</span>
            </h1>
            <p className="text-gray-600 mb-8 text-lg max-w-lg">
              Streamline your workflow with intuitive drag-and-drop Kanban boards, 
              dynamic calendar views, and powerful collaboration tools.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/get-started">
                <button className="inline-flex items-center justify-center bg-purple-600 hover:bg-purple-700 text-white font-medium px-6 py-3 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-purple-600 focus:ring-offset-2">
                  Get Started <ChevronRight className="ml-2 h-5 w-5" />
                </button>
              </Link>
            </div>
          </div>
          
          <div className="md:w-1/2 w-full">
            <div className="relative w-full max-w-md mx-auto md:mr-0 aspect-video bg-white rounded-xl shadow-lg overflow-hidden p-4 border border-gray-100">
              <div className="flex justify-between items-center mb-6">
                <div className="flex space-x-2">
                  <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center">
                    <Check className="h-4 w-4 text-white" />
                  </div>
                  <div className="w-8 h-8 rounded-full bg-pink-400 flex items-center justify-center">
                    <Clock className="h-4 w-4 text-white" />
                  </div>
                </div>
                
                <div className="flex space-x-1">
                  <div className="w-2 h-2 rounded-full bg-gray-200"></div>
                  <div className="w-2 h-2 rounded-full bg-gray-200"></div>
                  <div className="w-2 h-2 rounded-full bg-gray-200"></div>
                </div>
              </div>
              
              <div className="flex space-x-2 h-32">
                <div className="flex-1 bg-gray-50 rounded-md p-2">
                  <div className="text-xs font-medium text-gray-500 mb-2">To Do</div>
                  <div className="bg-white rounded-md p-2 shadow-sm border border-gray-100 mb-2">
                    <div className="h-2 w-2/3 bg-gray-200 rounded mb-1"></div>
                    <div className="h-2 w-1/2 bg-gray-200 rounded"></div>
                  </div>
                  
                  <div className="bg-white rounded-md p-2 shadow-sm border border-gray-100">
                    <div className="h-2 w-3/4 bg-gray-200 rounded mb-1"></div>
                    <div className="h-2 w-1/2 bg-gray-200 rounded"></div>
                  </div>
                </div>
                
                <div className="flex-1 bg-gray-50 rounded-md p-2">
                  <div className="text-xs font-medium text-gray-500 mb-2">In Progress</div>
                  <div className="bg-white rounded-md p-2 shadow-sm border border-purple-100 mb-2">
                    <div className="h-2 w-2/3 bg-purple-200 rounded mb-1"></div>
                    <div className="h-2 w-1/2 bg-purple-100 rounded"></div>
                  </div>
                </div>
                
                <div className="flex-1 bg-gray-50 rounded-md p-2">
                  <div className="text-xs font-medium text-gray-500 mb-2">Completed</div>
                  <div className="bg-white rounded-md p-2 shadow-sm border border-green-100 mb-2">
                    <div className="h-2 w-2/3 bg-green-200 rounded mb-1"></div>
                    <div className="h-2 w-1/2 bg-green-100 rounded"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Home;