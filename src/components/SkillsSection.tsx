import React from 'react';
import { Code, Layers, Database, Wrench } from 'lucide-react';

interface SkillCategory {
  title: string;
  icon: JSX.Element;
  color: string;
  skills: Array<{
    name: string;
    level: number;
    color: string;
  }>;
}

const skillCategories: SkillCategory[] = [
  {
    title: 'Programming Languages',
    icon: <Code size={24} />,
    color: 'from-blue-500 to-cyan-500',
    skills: [
      { name: 'Java (SE 8/11)', level: 95, color: 'bg-orange-500' },
      { name: 'JavaScript (ES6+)', level: 85, color: 'bg-yellow-500' },
      { name: 'TypeScript', level: 75, color: 'bg-blue-500' },
      { name: 'C#', level: 70, color: 'bg-purple-500' },
    ],
  },
  {
    title: 'Frontend Technologies',
    icon: <Layers size={24} />,
    color: 'from-purple-500 to-pink-500',
    skills: [
      { name: 'React', level: 80, color: 'bg-cyan-500' },
      { name: 'Swing', level: 90, color: 'bg-gray-600' },
      { name: 'JavaFX', level: 85, color: 'bg-orange-500' },
      { name: 'CesiumJS', level: 75, color: 'bg-green-500' },
    ],
  },
  {
    title: 'Backend & Graphics',
    icon: <Database size={24} />,
    color: 'from-green-500 to-teal-500',
    skills: [
      { name: 'OpenGL', level: 80, color: 'bg-red-500' },
      { name: 'RESTful APIs', level: 85, color: 'bg-indigo-500' },
      { name: 'Microservices', level: 75, color: 'bg-blue-600' },
      { name: 'PostGIS', level: 70, color: 'bg-green-600' },
    ],
  },
  {
    title: 'Tools & Methods',
    icon: <Wrench size={24} />,
    color: 'from-orange-500 to-red-500',
    skills: [
      { name: 'Git', level: 90, color: 'bg-orange-500' },
      { name: 'Docker', level: 75, color: 'bg-blue-500' },
      { name: 'Agile/Scrum', level: 85, color: 'bg-teal-500' },
      { name: 'Performance Optimization', level: 90, color: 'bg-purple-500' },
    ],
  },
];

const SkillsSection: React.FC = () => {
  return (
    <section id="skills" className="py-20 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Skills & Expertise
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-600 to-purple-600 mx-auto rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {skillCategories.map((category, index) => (
              <div 
                key={index}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700"
              >
                <div className={`p-6 bg-gradient-to-r ${category.color}`}>
                  <div className="flex items-center text-white">
                    <div className="p-3 bg-white/20 rounded-lg mr-4">
                      {category.icon}
                    </div>
                    <h3 className="text-xl font-bold">{category.title}</h3>
                  </div>
                </div>
                
                <div className="p-6 space-y-6">
                  {category.skills.map((skill, skillIndex) => (
                    <div key={skillIndex}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium text-gray-900 dark:text-white">
                          {skill.name}
                        </span>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {skill.level}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${skill.color} transition-all duration-1000 ease-out`}
                          style={{ width: `${skill.level}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-200 dark:border-gray-700">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Languages</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg">
                  <span className="font-medium text-gray-900 dark:text-white">Turkish</span>
                  <span className="px-3 py-1 bg-green-500 text-white rounded-full text-sm font-medium">
                    Native
                  </span>
                </div>
                <div className="flex justify-between items-center p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg">
                  <span className="font-medium text-gray-900 dark:text-white">English</span>
                  <span className="px-3 py-1 bg-blue-500 text-white rounded-full text-sm font-medium">
                    B1 - Intermediate
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-200 dark:border-gray-700">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Specializations</h3>
              <div className="space-y-3">
                <div className="p-3 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-lg">
                  <span className="font-medium text-gray-900 dark:text-white">Geospatial Visualization</span>
                </div>
                <div className="p-3 bg-gradient-to-r from-green-100 to-teal-100 dark:from-green-900/30 dark:to-teal-900/30 rounded-lg">
                  <span className="font-medium text-gray-900 dark:text-white">Algorithm Development</span>
                </div>
                <div className="p-3 bg-gradient-to-r from-orange-100 to-red-100 dark:from-orange-900/30 dark:to-red-900/30 rounded-lg">
                  <span className="font-medium text-gray-900 dark:text-white">Performance Optimization</span>
                </div>
                <div className="p-3 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-lg">
                  <span className="font-medium text-gray-900 dark:text-white">Legacy System Migration</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SkillsSection;