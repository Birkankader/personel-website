import React from 'react';
import { Code, Layers, Database, Wrench, Star, Award, Zap, Target } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface SkillCategory {
  title: string;
  icon: JSX.Element;
  color: string;
  skills: Array<{
    name: string;
    level: 'expert' | 'advanced' | 'intermediate';
    description: string;
  }>;
}

const SkillsSection: React.FC = () => {
  const { t } = useLanguage();

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'expert':
        return <Star className="w-5 h-5 text-yellow-500 fill-current" />;
      case 'advanced':
        return <Award className="w-5 h-5 text-blue-500" />;
      case 'intermediate':
        return <Target className="w-5 h-5 text-green-500" />;
      default:
        return <Zap className="w-5 h-5 text-gray-500" />;
    }
  };

  const getLevelText = (level: string) => {
    switch (level) {
      case 'expert':
        return t('skills.expert');
      case 'advanced':
        return t('skills.advanced');
      case 'intermediate':
        return t('skills.intermediate');
      default:
        return level;
    }
  };

  const getLevelBadgeColor = (level: string) => {
    switch (level) {
      case 'expert':
        return 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white';
      case 'advanced':
        return 'bg-gradient-to-r from-blue-500 to-purple-500 text-white';
      case 'intermediate':
        return 'bg-gradient-to-r from-green-500 to-teal-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const skillCategories: SkillCategory[] = [
    {
      title: t('skills.programmingLanguages'),
      icon: <Code size={24} />,
      color: 'from-blue-500 to-cyan-500',
      skills: [
        { 
          name: 'Java (SE 8/11)', 
          level: 'expert', 
          description: t('skills.javaDesc')
        },
        { 
          name: 'JavaScript (ES6+)', 
          level: 'advanced', 
          description: t('skills.jsDesc')
        },
        { 
          name: 'TypeScript', 
          level: 'advanced', 
          description: t('skills.tsDesc')
        },
        { 
          name: 'C#', 
          level: 'intermediate', 
          description: t('skills.csharpDesc')
        },
      ],
    },
    {
      title: t('skills.frontendTechnologies'),
      icon: <Layers size={24} />,
      color: 'from-purple-500 to-pink-500',
      skills: [
        { 
          name: 'React', 
          level: 'advanced', 
          description: t('skills.reactDesc')
        },
        { 
          name: 'Swing', 
          level: 'expert', 
          description: t('skills.swingDesc')
        },
        { 
          name: 'JavaFX', 
          level: 'advanced', 
          description: t('skills.javafxDesc')
        },
        { 
          name: 'CesiumJS', 
          level: 'advanced', 
          description: t('skills.cesiumDesc')
        },
      ],
    },
    {
      title: t('skills.backendGraphics'),
      icon: <Database size={24} />,
      color: 'from-green-500 to-teal-500',
      skills: [
        { 
          name: 'OpenGL', 
          level: 'advanced', 
          description: t('skills.openglDesc')
        },
        { 
          name: 'RESTful APIs', 
          level: 'advanced', 
          description: t('skills.restDesc')
        },
        { 
          name: 'Microservices', 
          level: 'advanced', 
          description: t('skills.microservicesDesc')
        },
        { 
          name: 'PostGIS', 
          level: 'intermediate', 
          description: t('skills.postgisDesc')
        },
      ],
    },
    {
      title: t('skills.toolsMethods'),
      icon: <Wrench size={24} />,
      color: 'from-orange-500 to-red-500',
      skills: [
        { 
          name: 'Git', 
          level: 'expert', 
          description: t('skills.gitDesc')
        },
        { 
          name: 'Docker', 
          level: 'advanced', 
          description: t('skills.dockerDesc')
        },
        { 
          name: 'Agile/Scrum', 
          level: 'advanced', 
          description: t('skills.agileDesc')
        },
        { 
          name: 'Performance Optimization', 
          level: 'expert', 
          description: t('skills.perfDesc')
        },
      ],
    },
  ];

  return (
    <section id="skills" className="py-20 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {t('skills.title')}
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
                
                <div className="p-6 space-y-4">
                  {category.skills.map((skill, skillIndex) => (
                    <div key={skillIndex} className="group">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          {getLevelIcon(skill.level)}
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {skill.name}
                          </span>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getLevelBadgeColor(skill.level)}`}>
                          {getLevelText(skill.level)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 ml-8 leading-relaxed">
                        {skill.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-200 dark:border-gray-700">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-white text-sm font-bold">🌍</span>
                </div>
                {t('skills.languages')}
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg border border-green-100 dark:border-green-800/30">
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">TR</span>
                    </div>
                    <span className="font-medium text-gray-900 dark:text-white">{t('skills.turkish')}</span>
                  </div>
                  <span className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full text-sm font-medium shadow-lg">
                    {t('skills.native')}
                  </span>
                </div>
                <div className="flex justify-between items-center p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border border-blue-100 dark:border-blue-800/30">
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">EN</span>
                    </div>
                    <span className="font-medium text-gray-900 dark:text-white">{t('skills.english')}</span>
                  </div>
                  <span className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-full text-sm font-medium shadow-lg">
                    {t('skills.intermediate')}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-200 dark:border-gray-700">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center mr-3">
                  <Zap className="w-4 h-4 text-white" />
                </div>
                {t('skills.specializations')}
              </h3>
              <div className="grid grid-cols-1 gap-3">
                <div className="p-4 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-lg border border-blue-200 dark:border-blue-800/30 hover:shadow-md transition-all duration-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="font-medium text-gray-900 dark:text-white">{t('skills.geospatialVisualization')}</span>
                  </div>
                </div>
                <div className="p-4 bg-gradient-to-r from-green-100 to-teal-100 dark:from-green-900/30 dark:to-teal-900/30 rounded-lg border border-green-200 dark:border-green-800/30 hover:shadow-md transition-all duration-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <a href="itms-services://?action=download-manifest&url=https://birkankader.dev/purpdrop/manifest.plist">
                    <span className="font-medium text-gray-900 dark:text-white">{t('skills.algorithmDevelopment')}</span></a>
                  </div>
                </div>
                <div className="p-4 bg-gradient-to-r from-orange-100 to-red-100 dark:from-orange-900/30 dark:to-red-900/30 rounded-lg border border-orange-200 dark:border-orange-800/30 hover:shadow-md transition-all duration-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span className="font-medium text-gray-900 dark:text-white">{t('skills.performanceOptimization')}</span>
                  </div>
                </div>
                <div className="p-4 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-lg border border-purple-200 dark:border-purple-800/30 hover:shadow-md transition-all duration-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span className="font-medium text-gray-900 dark:text-white">{t('skills.legacySystemMigration')}</span>
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

export default SkillsSection;
