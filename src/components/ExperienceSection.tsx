import React from 'react';
import { Briefcase, Calendar, MapPin } from 'lucide-react';

interface Experience {
  title: string;
  company: string;
  location: string;
  period: string;
  descriptions: string[];
  current?: boolean;
}

const experiences: Experience[] = [
  {
    title: 'Software Engineer',
    company: 'HAVELSAN',
    location: 'Ankara, Turkey',
    period: 'Dec 2020 – Present',
    current: true,
    descriptions: [
      'Develop high-performance desktop applications using pure Java and OpenGL for geospatial visualization',
      'Led successful migration from Java 8 to Java 11, ensuring compatibility and performance optimization',
      'Integrated JavaFX components into legacy Swing UI, enabling modern interface capabilities',
      'Implemented advanced navigation and route-planning with A* algorithms and elevation-based slope analysis',
      'Achieved 50% performance improvement in tactical-graphic rendering through optimization techniques',
      'Enhanced elevation-based analytical modules for faster computation and better user experience',
    ],
  },
  {
    title: 'Candidate Engineer',
    company: 'HAVELSAN',
    location: 'Ankara, Turkey',
    period: 'Dec 2019 – Dec 2020',
    descriptions: [
      'Developed new map components using React JS with CesiumJS for 3D geospatial visualization',
      'Improved map-analysis capabilities and updated related reporting interfaces',
      'Optimized performance resulting in 20% reduction in map-analysis load time',
      'Collaborated with senior engineers on complex geospatial algorithms and data processing',
    ],
  },
  {
    title: 'Software Engineering Intern',
    company: 'HAVELSAN',
    location: 'Ankara, Turkey',
    period: 'June 2019 – Sep 2019',
    descriptions: [
      'Created NATO symbology graphics in SVG format and resolved rendering issues in Java pipeline',
      'Enhanced in-house Java SVG parser by adding support for complex "path" elements',
      'Contributed to tactical graphic description language development (classified project)',
      'Gained hands-on experience with military-grade software development standards',
    ],
  },
];

const ExperienceSection: React.FC = () => {
  return (
    <section id="experience" className="py-20 bg-white dark:bg-gray-800">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Professional Experience
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-600 to-purple-600 mx-auto rounded-full"></div>
          </div>

          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-600 to-purple-600"></div>

            <div className="space-y-12">
              {experiences.map((exp, index) => (
                <div key={index} className="relative flex items-start">
                  {/* Timeline dot */}
                  <div className={`absolute left-6 w-5 h-5 rounded-full border-4 border-white dark:border-gray-800 z-10 ${
                    exp.current 
                      ? 'bg-gradient-to-r from-green-500 to-blue-500 animate-pulse' 
                      : 'bg-gradient-to-r from-blue-600 to-purple-600'
                  }`}></div>

                  {/* Content */}
                  <div className="ml-16 flex-1">
                    <div className="bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-900/20 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-700">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                        <div>
                          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                            {exp.title}
                          </h3>
                          <div className="flex items-center text-blue-600 dark:text-blue-400 font-semibold mb-2">
                            <Briefcase className="w-4 h-4 mr-2" />
                            {exp.company}
                          </div>
                          <div className="flex items-center text-gray-600 dark:text-gray-400 text-sm">
                            <MapPin className="w-4 h-4 mr-2" />
                            {exp.location}
                          </div>
                        </div>
                        <div className="mt-4 md:mt-0">
                          <div className="flex items-center px-4 py-2 bg-white dark:bg-gray-700 rounded-full shadow-sm">
                            <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              {exp.period}
                            </span>
                            {exp.current && (
                              <span className="ml-2 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs font-medium">
                                Current
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        {exp.descriptions.map((desc, i) => (
                          <div key={i} className="flex items-start">
                            <div className="w-2 h-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mt-2 mr-4 flex-shrink-0"></div>
                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                              {desc}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ExperienceSection;