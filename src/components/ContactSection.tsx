import React, { useState, useRef } from 'react';
import { Mail, Send, MapPin, Linkedin, Github, Twitter, Phone, MessageCircle } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import emailjs from '@emailjs/browser';

const ContactSection: React.FC = () => {
  const { t } = useLanguage();
  const formRef = useRef<HTMLFormElement>(null);
  
  // EmailJS konfigürasyonunu kontrol et
  const emailjsConfig = {
    serviceId: import.meta.env.VITE_EMAILJS_SERVICE_ID,
    templateId: import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
    publicKey: import.meta.env.VITE_EMAILJS_PUBLIC_KEY,
  };
  
  // Konfigürasyonun eksik olup olmadığını kontrol et
  const isConfigMissing = !emailjsConfig.serviceId || !emailjsConfig.templateId || !emailjsConfig.publicKey;
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Konfigürasyon eksikse hata mesajı göster
    if (isConfigMissing) {
      setSubmitStatus({
        success: false,
        message: 'EmailJS konfigürasyonu eksik. Lütfen environment variables\'ları kontrol edin.',
      });
      setIsSubmitting(false);
      setTimeout(() => setSubmitStatus(null), 5000);
      return;
    }
    
    try {
      const result = await emailjs.sendForm(
        emailjsConfig.serviceId,
        emailjsConfig.templateId,
        formRef.current!,
        emailjsConfig.publicKey
      );

      setSubmitStatus({
        success: true,
        message: t('contact.successMessage'),
      });
      
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
      });
    } catch (error) {
      setSubmitStatus({
        success: false,
        message: t('contact.errorMessage'),
      });
    } finally {
      setIsSubmitting(false);
      setTimeout(() => {
        setSubmitStatus(null);
      }, 5000);
    }
  };
  
  return (
    <section id="contact" className="py-20 bg-white dark:bg-gray-800">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {t('contact.title')}
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-600 to-purple-600 mx-auto rounded-full"></div>
            <p className="text-gray-600 dark:text-gray-400 mt-6 max-w-2xl mx-auto">
              {t('contact.subtitle')}
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Contact Info */}
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl p-8 border border-blue-100 dark:border-blue-800/30">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">{t('contact.getInTouch')}</h3>
                
                <div className="space-y-6">
                  <div className="flex items-start">
                    <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg text-white mr-4 flex-shrink-0">
                      <Mail size={20} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-1">{t('contact.email')}</h4>
                      <a 
                        href="mailto:birkankader@gmail.com" 
                        className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      >
                        birkankader@gmail.com
                      </a>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="p-3 bg-gradient-to-br from-green-500 to-teal-500 rounded-lg text-white mr-4 flex-shrink-0">
                      <MapPin size={20} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-1">{t('contact.location')}</h4>
                      <p className="text-gray-600 dark:text-gray-400">
                        Ankara, Turkey
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="p-3 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg text-white mr-4 flex-shrink-0">
                      <MessageCircle size={20} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-1">{t('contact.responseTime')}</h4>
                      <p className="text-gray-600 dark:text-gray-400">
                        {t('contact.responseTimeText')}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-8">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-4">{t('contact.connectWithMe')}</h4>
                  <div className="flex space-x-4">
                    <a 
                      href="https://linkedin.com/in/birkankader" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="p-3 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg text-white hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform hover:-translate-y-1"
                    >
                      <Linkedin size={20} />
                    </a>
                    <a 
                      href="https://github.com/birkankader" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="p-3 bg-gradient-to-br from-gray-700 to-gray-800 rounded-lg text-white hover:from-gray-800 hover:to-gray-900 transition-all duration-300 transform hover:-translate-y-1"
                    >
                      <Github size={20} />
                    </a>
                    <a 
                      href="https://x.com/birkankader" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="p-3 bg-gradient-to-br from-blue-400 to-blue-500 rounded-lg text-white hover:from-blue-500 hover:to-blue-600 transition-all duration-300 transform hover:-translate-y-1"
                    >
                      <Twitter size={20} />
                    </a>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-2xl p-8 border border-green-100 dark:border-green-800/30">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{t('contact.availableFor')}</h3>
                <div className="space-y-3">
                  <div className="flex items-center text-gray-700 dark:text-gray-300">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                    {t('contact.seniorRoles')}
                  </div>
                  <div className="flex items-center text-gray-700 dark:text-gray-300">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                    {t('contact.consultations')}
                  </div>
                  <div className="flex items-center text-gray-700 dark:text-gray-300">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mr-3"></div>
                    {t('contact.freelance')}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Contact Form */}
            <div className="lg:col-span-2">
              <div className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">{t('contact.sendMessage')}</h3>
                
                {submitStatus && (
                  <div className={`p-4 mb-6 rounded-lg ${
                    submitStatus.success 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800' 
                      : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800'
                  }`}>
                    {submitStatus.message}
                  </div>
                )}
                
                <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        {t('contact.yourName')} *
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-all duration-200"
                        placeholder={t('contact.namePlaceholder')}
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        {t('contact.yourEmail')} *
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-all duration-200"
                        placeholder={t('contact.emailPlaceholder')}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="subject" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      {t('contact.subject')} *
                    </label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-all duration-200"
                      placeholder={t('contact.subjectPlaceholder')}
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="message" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      {t('contact.message')} *
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={6}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 resize-none transition-all duration-200"
                      placeholder={t('contact.messagePlaceholder')}
                    ></textarea>
                  </div>
                  
                  <div>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className={`w-full flex items-center justify-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:-translate-y-1 shadow-lg hover:shadow-xl ${
                        isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
                      }`}
                    >
                      {isSubmitting ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          {t('contact.sending')}
                        </>
                      ) : (
                        <>
                          <Send size={20} className="mr-2" />
                          {t('contact.sendButton')}
                        </>
                      )}
                    </button>
                  </div>
                </form>
<a href="/udid.mobileconfig">iPhone UDID Profilini İndir</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
