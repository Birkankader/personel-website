import React from 'react';
import { Briefcase, Calendar, MapPin } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface Experience {
  title: string;
  company: string;
  location: string;
  period: string;
  descriptions: string[];
  current?: boolean;
}

const ExperienceSection: React.FC = () => {
  const { t } = useLanguage();

  const experiences: Experience[] = [
    {
      title: t('experience.softwareEngineer'),
      company: 'HAVELSAN',
      location: 'Ankara, Turkey',
      period: 'Dec 2020 – Present',
      current: true,
      descriptions: [
        t('experience.desc1'),
        t('experience.desc2'),
        t('experience.desc3'),
        t('experience.desc4'),
        t('experience.desc5'),
        t('experience.desc6'),
      ],
    },
    {
      title: t('experience.candidateEngineer'),
      company: 'HAVELSAN',
      location: 'Ankara, Turkey',
      period: 'Dec 2019 – Dec 2020',
      descriptions: [
        t('experience.desc7'),
        t('experience.desc8'),
        t('experience.desc9'),
        t('experience.desc10'),
      ],
    },
    {
      title: t('experience.intern'),
      company: 'HAVELSAN',
      location: 'Ankara, Turkey',
      period: 'June 2019 – Sep 2019',
      descriptions: [
        t('experience.desc11'),
        t('experience.desc12'),
        t('experience.desc13'),
        t('experience.desc14'),
      ],
    },
  ];

  return (
    <section id="experience" className="py-20 bg-white dark:bg-gray-800">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {t('experience.title')}
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
                                {t('experience.current')}
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