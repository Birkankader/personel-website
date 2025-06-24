import React from 'react';
import { User, Target, Award } from 'lucide-react';

const AboutSection: React.FC = () => {
  return (
    <section id="about" className="py-20 bg-white dark:bg-gray-800">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              About Me
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-600 to-purple-600 mx-auto rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-8 rounded-2xl">
                <div className="flex items-center mb-4">
                  <User className="w-6 h-6 text-blue-600 dark:text-blue-400 mr-3" />
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Who I Am</h3>
                </div>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  I'm a passionate Software Engineer with 4+ years of experience at HAVELSAN, 
                  specializing in high-performance desktop and web mapping applications. 
                  My expertise spans from pure Java/OpenGL pipelines to modern React + Cesium frontends.
                </p>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-8 rounded-2xl">
                <div className="flex items-center mb-4">
                  <Target className="w-6 h-6 text-purple-600 dark:text-purple-400 mr-3" />
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">What I Do</h3>
                </div>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  I develop advanced geospatial visualization solutions, implement complex pathfinding algorithms 
                  (A*, elevation-based slope analysis), and optimize rendering performance. 
                  I've successfully led Java 8→11 migration projects and improved tactical graphic rendering by 50%.
                </p>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 p-8 rounded-2xl">
                <div className="flex items-center mb-4">
                  <Award className="w-6 h-6 text-green-600 dark:text-green-400 mr-3" />
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">My Goal</h3>
                </div>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  Currently seeking to leverage my deep geospatial visualization skills in a senior GIS 
                  or defense-tech role where I can continue developing innovative mapping solutions 
                  and advance the field of geospatial technologies.
                </p>
              </div>
            </div>

            <div className="space-y-8">
              <div className="bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-900/20 p-8 rounded-2xl">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Key Achievements</h3>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-4 flex-shrink-0"></div>
                    <p className="text-gray-700 dark:text-gray-300">Led successful Java 8 to Java 11 migration project</p>
                  </div>
                  <div className="flex items-start">
                    <div className="w-2 h-2 bg-purple-600 rounded-full mt-2 mr-4 flex-shrink-0"></div>
                    <p className="text-gray-700 dark:text-gray-300">Boosted tactical graphic rendering performance by 50%</p>
                  </div>
                  <div className="flex items-start">
                    <div className="w-2 h-2 bg-green-600 rounded-full mt-2 mr-4 flex-shrink-0"></div>
                    <p className="text-gray-700 dark:text-gray-300">Implemented advanced A* pathfinding algorithms</p>
                  </div>
                  <div className="flex items-start">
                    <div className="w-2 h-2 bg-red-600 rounded-full mt-2 mr-4 flex-shrink-0"></div>
                    <p className="text-gray-700 dark:text-gray-300">Integrated JavaFX components into legacy Swing UI</p>
                  </div>
                  <div className="flex items-start">
                    <div className="w-2 h-2 bg-yellow-600 rounded-full mt-2 mr-4 flex-shrink-0"></div>
                    <p className="text-gray-700 dark:text-gray-300">Reduced map analysis load time by 20%</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 p-8 rounded-2xl">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Interests</h3>
                <div className="flex flex-wrap gap-3">
                  <span className="px-4 py-2 bg-white dark:bg-gray-700 rounded-full text-sm font-medium text-gray-700 dark:text-gray-300 shadow-sm">
                    Art Book Collecting
                  </span>
                  <span className="px-4 py-2 bg-white dark:bg-gray-700 rounded-full text-sm font-medium text-gray-700 dark:text-gray-300 shadow-sm">
                    Specialty Coffee
                  </span>
                  <span className="px-4 py-2 bg-white dark:bg-gray-700 rounded-full text-sm font-medium text-gray-700 dark:text-gray-300 shadow-sm">
                    Geospatial Tech
                  </span>
                  <span className="px-4 py-2 bg-white dark:bg-gray-700 rounded-full text-sm font-medium text-gray-700 dark:text-gray-300 shadow-sm">
                    Data Visualization
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;