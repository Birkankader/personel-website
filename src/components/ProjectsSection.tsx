import React from 'react';
import { ExternalLink, Github, Chrome, Filter, Twitter } from 'lucide-react';

const ProjectsSection: React.FC = () => {
  return (
    <section id="projects" className="py-20 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Featured Projects
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-600 to-purple-600 mx-auto rounded-full"></div>
            <p className="text-gray-600 dark:text-gray-400 mt-6 max-w-2xl mx-auto">
              Here are some of my notable projects, including my latest Chrome extension and professional work.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Chrome Extension - Featured Project */}
            <div className="lg:col-span-2 bg-gradient-to-br from-red-50 via-white to-orange-50 dark:from-red-900/10 dark:via-gray-800 dark:to-orange-900/10 rounded-2xl shadow-xl overflow-hidden border border-red-100 dark:border-red-800/30">
              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                      <img 
                        src="/images/logo.svg" 
                        alt="Block The Unwanted Logo" 
                        className="w-12 h-12"
                      />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Block The Unwanted</h3>
                      <p className="text-red-600 dark:text-red-400 font-medium">Chrome Extension</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Chrome className="w-6 h-6 text-blue-600" />
                    <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-sm font-medium">
                      Published
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
                      A powerful Chrome extension that filters Twitter content based on keywords. 
                      Clean up your Twitter feed by blocking unwanted content automatically, 
                      making your social media experience more focused and enjoyable.
                    </p>

                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Key Features:</h4>
                        <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                          <li className="flex items-center">
                            <Filter className="w-4 h-4 mr-2 text-red-500" />
                            Keyword-based content filtering
                          </li>
                          <li className="flex items-center">
                            <Twitter className="w-4 h-4 mr-2 text-blue-500" />
                            Real-time Twitter feed cleaning
                          </li>
                          <li className="flex items-center">
                            <Chrome className="w-4 h-4 mr-2 text-green-500" />
                            Easy-to-use Chrome extension
                          </li>
                        </ul>
                      </div>

                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Technologies:</h4>
                        <div className="flex flex-wrap gap-2">
                          <span className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded-full text-sm">
                            JavaScript
                          </span>
                          <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-sm">
                            Chrome APIs
                          </span>
                          <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-full text-sm">
                            Content Scripts
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col justify-center">
                    <div className="bg-white dark:bg-gray-700 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-600">
                      <div className="text-center mb-4">
                        <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                          <img 
                            src="/images/logo.svg" 
                            alt="Block The Unwanted Logo" 
                            className="w-16 h-16"
                          />
                        </div>
                        <h5 className="font-bold text-gray-900 dark:text-white">Available Now</h5>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">Chrome Web Store</p>
                      </div>
                      
                      <div className="space-y-3">
                        <a 
                          href="#" 
                          className="w-full flex items-center justify-center px-4 py-3 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-lg hover:from-red-700 hover:to-orange-700 transition-all duration-300 font-medium"
                        >
                          <Chrome className="w-5 h-5 mr-2" />
                          Install Extension
                        </a>
                        <a 
                          href="https://github.com/birkankader" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="w-full flex items-center justify-center px-4 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:border-gray-400 dark:hover:border-gray-500 transition-all duration-300 font-medium"
                        >
                          <Github className="w-5 h-5 mr-2" />
                          View Source
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Professional Projects */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
              <div className="p-8">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center mr-4">
                    <span className="text-white font-bold text-lg">GIS</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Geospatial Mapping Platform</h3>
                    <p className="text-blue-600 dark:text-blue-400">HAVELSAN</p>
                  </div>
                </div>
                
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  High-performance desktop mapping application with advanced pathfinding algorithms 
                  and real-time tactical graphics rendering.
                </p>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 rounded-full text-sm">Java</span>
                  <span className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-full text-sm">OpenGL</span>
                  <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-sm">Swing</span>
                </div>
                
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  <p>• 50% performance improvement in rendering</p>
                  <p>• A* pathfinding implementation</p>
                  <p>• Java 8→11 migration leadership</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
              <div className="p-8">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mr-4">
                    <span className="text-white font-bold text-lg">WEB</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Web Mapping Interface</h3>
                    <p className="text-purple-600 dark:text-purple-400">HAVELSAN</p>
                  </div>
                </div>
                
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Modern web-based mapping solution built with React and CesiumJS for 
                  interactive 3D geospatial visualization and analysis.
                </p>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="px-3 py-1 bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400 rounded-full text-sm">React</span>
                  <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-sm">CesiumJS</span>
                  <span className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded-full text-sm">JavaScript</span>
                </div>
                
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  <p>• 20% reduction in analysis load time</p>
                  <p>• Interactive 3D mapping components</p>
                  <p>• Real-time data visualization</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProjectsSection;