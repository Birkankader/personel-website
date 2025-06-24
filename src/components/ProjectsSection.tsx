import React from 'react';
import { ExternalLink, Github, Chrome, Filter, Twitter } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const ProjectsSection: React.FC = () => {
  const { t } = useLanguage();

  return (
    <section id="projects" className="py-20 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {t('projects.title')}
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-600 to-purple-600 mx-auto rounded-full"></div>
            <p className="text-gray-600 dark:text-gray-400 mt-6 max-w-2xl mx-auto">
              {t('projects.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Chrome Extension - Featured Project */}
            <div className="lg:col-span-2 bg-gradient-to-br from-red-50 via-white to-orange-50 dark:from-red-900/10 dark:via-gray-800 dark:to-orange-900/10 rounded-2xl shadow-xl overflow-hidden border border-red-100 dark:border-red-800/30">
              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                      <svg width="48" height="48" viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                          <linearGradient id="redGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#FF6B5A"/>
                            <stop offset="50%" stopColor="#FF3B30"/>
                            <stop offset="100%" stopColor="#E53E3E"/>
                          </linearGradient>
                          <linearGradient id="shadowGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#000000" stopOpacity="0.2"/>
                            <stop offset="100%" stopColor="#000000" stopOpacity="0.05"/>
                          </linearGradient>
                          <radialGradient id="glowGradient" cx="50%" cy="30%" r="70%">
                            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.3"/>
                            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0"/>
                          </radialGradient>
                        </defs>
                        
                        <circle cx="64" cy="64" r="50" fill="url(#shadowGradient)"/>
                        <circle cx="64" cy="64" r="48" fill="url(#glowGradient)"/>
                        <circle cx="64" cy="64" r="42" fill="none" stroke="url(#redGradient)" strokeWidth="12"/>
                        <circle cx="64" cy="64" r="42" fill="none" stroke="#FFFFFF" strokeWidth="2" opacity="0.4"/>
                        <line x1="42" y1="96" x2="86" y2="32" stroke="url(#redGradient)" strokeWidth="12" strokeLinecap="round"/>
                        <line x1="44" y1="94" x2="84" y2="34" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" opacity="0.5"/>
                        <text x="64" y="68" textAnchor="middle" fontSize="18" fontFamily="Arial, sans-serif" 
                              fill="#FFFFFF" stroke="#000000" strokeWidth="1" opacity="0.95" fontWeight="800">
                          UNWANTED
                        </text>
                        <text x="64" y="68" textAnchor="middle" fontSize="18" fontFamily="Arial, sans-serif" 
                              fill="#FFFFFF" opacity="0.3" fontWeight="800">
                          UNWANTED
                        </text>
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{t('projects.blockTheUnwanted')}</h3>
                      <p className="text-red-600 dark:text-red-400 font-medium">{t('projects.chromeExtension')}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Chrome className="w-6 h-6 text-blue-600" />
                    <span className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded-full text-sm font-medium">
                      {t('projects.comingSoon')}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
                      {t('projects.blockDescription')}
                    </p>

                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">{t('projects.keyFeatures')}</h4>
                        <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                          <li className="flex items-center">
                            <Filter className="w-4 h-4 mr-2 text-red-500" />
                            {t('projects.feature1')}
                          </li>
                          <li className="flex items-center">
                            <Twitter className="w-4 h-4 mr-2 text-blue-500" />
                            {t('projects.feature2')}
                          </li>
                          <li className="flex items-center">
                            <Chrome className="w-4 h-4 mr-2 text-green-500" />
                            {t('projects.feature3')}
                          </li>
                        </ul>
                      </div>

                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">{t('projects.technologies')}</h4>
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
                          <svg width="64" height="64" viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
                            <defs>
                              <linearGradient id="redGradient2" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#FF6B5A"/>
                                <stop offset="50%" stopColor="#FF3B30"/>
                                <stop offset="100%" stopColor="#E53E3E"/>
                              </linearGradient>
                              <linearGradient id="shadowGradient2" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#000000" stopOpacity="0.2"/>
                                <stop offset="100%" stopColor="#000000" stopOpacity="0.05"/>
                              </linearGradient>
                              <radialGradient id="glowGradient2" cx="50%" cy="30%" r="70%">
                                <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.3"/>
                                <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0"/>
                              </radialGradient>
                            </defs>
                            
                            <circle cx="64" cy="64" r="50" fill="url(#shadowGradient2)"/>
                            <circle cx="64" cy="64" r="48" fill="url(#glowGradient2)"/>
                            <circle cx="64" cy="64" r="42" fill="none" stroke="url(#redGradient2)" strokeWidth="12"/>
                            <circle cx="64" cy="64" r="42" fill="none" stroke="#FFFFFF" strokeWidth="2" opacity="0.4"/>
                            <line x1="42" y1="96" x2="86" y2="32" stroke="url(#redGradient2)" strokeWidth="12" strokeLinecap="round"/>
                            <line x1="44" y1="94" x2="84" y2="34" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" opacity="0.5"/>
                            <text x="64" y="68" textAnchor="middle" fontSize="18" fontFamily="Arial, sans-serif" 
                                  fill="#FFFFFF" stroke="#000000" strokeWidth="1" opacity="0.95" fontWeight="800">
                              UNWANTED
                            </text>
                            <text x="64" y="68" textAnchor="middle" fontSize="18" fontFamily="Arial, sans-serif" 
                                  fill="#FFFFFF" opacity="0.3" fontWeight="800">
                              UNWANTED
                            </text>
                          </svg>
                        </div>
                        <h5 className="font-bold text-gray-900 dark:text-white">{t('projects.availableSoon')}</h5>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">{t('projects.underReview')}</p>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="w-full flex items-center justify-center px-4 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg font-medium cursor-not-allowed opacity-75">
                          <Chrome className="w-5 h-5 mr-2" />
                          {t('projects.pendingReview')}
                        </div>
                        <a 
                          href="https://blocktheunwanted.birkankader.dev/" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="w-full flex items-center justify-center px-4 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:border-gray-400 dark:hover:border-gray-500 transition-all duration-300 font-medium"
                        >
                          <Github className="w-5 h-5 mr-2" />
                          {t('projects.viewSource')}
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
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">{t('projects.geospatialPlatform')}</h3>
                    <p className="text-blue-600 dark:text-blue-400">HAVELSAN</p>
                  </div>
                </div>
                
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {t('projects.geospatialDescription')}
                </p>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 rounded-full text-sm">Java</span>
                  <span className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-full text-sm">OpenGL</span>
                  <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-sm">Swing</span>
                </div>
                
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  <p>• {t('projects.improvement1')}</p>
                  <p>• {t('projects.improvement2')}</p>
                  <p>• {t('projects.improvement3')}</p>
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
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">{t('projects.webMapping')}</h3>
                    <p className="text-purple-600 dark:text-purple-400">HAVELSAN</p>
                  </div>
                </div>
                
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {t('projects.webMappingDescription')}
                </p>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="px-3 py-1 bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400 rounded-full text-sm">React</span>
                  <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-sm">CesiumJS</span>
                  <span className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded-full text-sm">JavaScript</span>
                </div>
                
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  <p>• {t('projects.improvement4')}</p>
                  <p>• {t('projects.improvement5')}</p>
                  <p>• {t('projects.improvement6')}</p>
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
