import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'en' | 'tr';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations = {
  en: {
    // Header
    'nav.home': 'Home',
    'nav.about': 'About',
    'nav.projects': 'Projects',
    'nav.experience': 'Experience',
    'nav.skills': 'Skills',
    'nav.contact': 'Contact',

    // Hero Section
    'hero.title': 'Sifa Birkan KADER',
    'hero.subtitle': 'Software Engineer specializing in Geospatial Visualization and Java Development',
    'hero.location': 'Ankara, Turkey',
    'hero.getInTouch': 'Get In Touch',
    'hero.viewWork': 'View My Work',

    // About Section
    'about.title': 'About Me',
    'about.whoIAm': 'Who I Am',
    'about.whoIAmText': "I'm a passionate Software Engineer with 4+ years of experience at HAVELSAN, specializing in high-performance desktop and web mapping applications. My expertise spans from pure Java/OpenGL pipelines to modern React + Cesium frontends.",
    'about.whatIDo': 'What I Do',
    'about.whatIDoText': 'I develop advanced geospatial visualization solutions, implement complex pathfinding algorithms (A*, elevation-based slope analysis), and optimize rendering performance. I\'ve successfully led Java 8→11 migration projects and improved tactical graphic rendering by 50%.',
    'about.myGoal': 'My Goal',
    'about.myGoalText': 'Currently seeking to leverage my deep geospatial visualization skills in a senior GIS or defense-tech role where I can continue developing innovative mapping solutions and advance the field of geospatial technologies.',
    'about.keyAchievements': 'Key Achievements',
    'about.achievement1': 'Led successful Java 8 to Java 11 migration project',
    'about.achievement2': 'Boosted tactical graphic rendering performance by 50%',
    'about.achievement3': 'Implemented advanced A* pathfinding algorithms',
    'about.achievement4': 'Integrated JavaFX components into legacy Swing UI',
    'about.achievement5': 'Reduced map analysis load time by 20%',
    'about.interests': 'Interests',
    'about.interest1': 'Art Book Collecting',
    'about.interest2': 'Specialty Coffee',
    'about.interest3': 'Geospatial Tech',
    'about.interest4': 'Data Visualization',

    // Projects Section
    'projects.title': 'Featured Projects',
    'projects.subtitle': 'Here are some of my notable projects, including my latest Chrome extension and professional work.',
    'projects.chromeExtension': 'Chrome Extension',
    'projects.published': 'Published',
    'projects.blockTheUnwanted': 'Block The Unwanted',
    'projects.blockDescription': 'A powerful Chrome extension that filters Twitter content based on keywords. Clean up your Twitter feed by blocking unwanted content automatically, making your social media experience more focused and enjoyable.',
    'projects.keyFeatures': 'Key Features:',
    'projects.feature1': 'Keyword-based content filtering',
    'projects.feature2': 'Real-time Twitter feed cleaning',
    'projects.feature3': 'Easy-to-use Chrome extension',
    'projects.technologies': 'Technologies:',
    'projects.availableNow': 'Available Now',
    'projects.chromeWebStore': 'Published on Chrome Web Store',
    'projects.installExtension': 'Install Extension',
    'projects.rateReview': 'Rate & Review',
    'projects.geospatialPlatform': 'Geospatial Mapping Platform',
    'projects.geospatialDescription': 'High-performance desktop mapping application with advanced pathfinding algorithms and real-time tactical graphics rendering.',
    'projects.webMapping': 'Web Mapping Interface',
    'projects.webMappingDescription': 'Modern web-based mapping solution built with React and CesiumJS for interactive 3D geospatial visualization and analysis.',
    'projects.improvement1': '50% performance improvement in rendering',
    'projects.improvement2': 'A* pathfinding implementation',
    'projects.improvement3': 'Java 8→11 migration leadership',
    'projects.improvement4': '20% reduction in analysis load time',
    'projects.improvement5': 'Interactive 3D mapping components',
    'projects.improvement6': 'Real-time data visualization',

    // Experience Section
    'experience.title': 'Professional Experience',
    'experience.current': 'Current',
    'experience.softwareEngineer': 'Software Engineer',
    'experience.candidateEngineer': 'Candidate Engineer',
    'experience.intern': 'Software Engineering Intern',
    'experience.desc1': 'Develop high-performance desktop applications using pure Java and OpenGL for geospatial visualization',
    'experience.desc2': 'Led successful migration from Java 8 to Java 11, ensuring compatibility and performance optimization',
    'experience.desc3': 'Integrated JavaFX components into legacy Swing UI, enabling modern interface capabilities',
    'experience.desc4': 'Implemented advanced navigation and route-planning with A* algorithms and elevation-based slope analysis',
    'experience.desc5': 'Achieved 50% performance improvement in tactical-graphic rendering through optimization techniques',
    'experience.desc6': 'Enhanced elevation-based analytical modules for faster computation and better user experience',
    'experience.desc7': 'Developed new map components using React JS with CesiumJS for 3D geospatial visualization',
    'experience.desc8': 'Improved map-analysis capabilities and updated related reporting interfaces',
    'experience.desc9': 'Optimized performance resulting in 20% reduction in map-analysis load time',
    'experience.desc10': 'Collaborated with senior engineers on complex geospatial algorithms and data processing',
    'experience.desc11': 'Created NATO symbology graphics in SVG format and resolved rendering issues in Java pipeline',
    'experience.desc12': 'Enhanced in-house Java SVG parser by adding support for complex "path" elements',
    'experience.desc13': 'Contributed to tactical graphic description language development (classified project)',
    'experience.desc14': 'Gained hands-on experience with military-grade software development standards',

    // Skills Section
    'skills.title': 'Skills & Expertise',
    'skills.programmingLanguages': 'Programming Languages',
    'skills.frontendTechnologies': 'Frontend Technologies',
    'skills.backendGraphics': 'Backend & Graphics',
    'skills.toolsMethods': 'Tools & Methods',
    'skills.expert': 'Expert',
    'skills.advanced': 'Advanced',
    'skills.intermediate': 'Intermediate',
    'skills.javaDesc': '4+ years of enterprise Java development with OpenGL integration',
    'skills.jsDesc': 'Modern JavaScript with ES6+ features and async programming',
    'skills.tsDesc': 'Type-safe development with strong typing and interfaces',
    'skills.csharpDesc': 'Object-oriented programming and .NET framework experience',
    'skills.reactDesc': 'Component-based UI development with hooks and context',
    'skills.swingDesc': 'Desktop GUI development with custom components and layouts',
    'skills.javafxDesc': 'Modern Java desktop applications with FXML and CSS styling',
    'skills.cesiumDesc': '3D geospatial visualization and interactive mapping solutions',
    'skills.openglDesc': 'High-performance graphics programming and shader development',
    'skills.restDesc': 'API design, implementation, and integration with microservices',
    'skills.microservicesDesc': 'Distributed system architecture and service communication',
    'skills.postgisDesc': 'Spatial database queries and geospatial data management',
    'skills.gitDesc': 'Version control, branching strategies, and collaborative development',
    'skills.dockerDesc': 'Containerization and deployment automation',
    'skills.agileDesc': 'Scrum methodology and agile project management',
    'skills.perfDesc': 'Code optimization, profiling, and performance tuning',
    'skills.languages': 'Languages',
    'skills.turkish': 'Turkish',
    'skills.english': 'English',
    'skills.native': 'Native',
    'skills.specializations': 'Specializations',
    'skills.geospatialVisualization': 'Geospatial Visualization',
    'skills.algorithmDevelopment': 'Algorithm Development',
    'skills.performanceOptimization': 'Performance Optimization',
    'skills.legacySystemMigration': 'Legacy System Migration',

    // Contact Section
    'contact.title': 'Let\'s Work Together',
    'contact.subtitle': 'I\'m always interested in new opportunities and exciting projects. Let\'s discuss how we can work together.',
    'contact.getInTouch': 'Get In Touch',
    'contact.email': 'Email',
    'contact.location': 'Location',
    'contact.responseTime': 'Response Time',
    'contact.responseTimeText': 'Usually within 24 hours',
    'contact.connectWithMe': 'Connect with me',
    'contact.availableFor': 'Available For',
    'contact.fullTime': 'Full-time positions',
    'contact.seniorRoles': 'Senior software engineering roles',
    'contact.consultations': 'Project consultations',
    'contact.freelance': 'Freelance opportunities',
    'contact.sendMessage': 'Send Me a Message',
    'contact.yourName': 'Your Name',
    'contact.yourEmail': 'Your Email',
    'contact.subject': 'Subject',
    'contact.message': 'Message',
    'contact.sendButton': 'Send Message',
    'contact.sending': 'Sending Message...',
    'contact.successMessage': 'Thank you! Your message has been sent successfully.',
    'contact.errorMessage': 'Sorry, there was an error sending your message. Please try again.',
    'contact.namePlaceholder': 'John Doe',
    'contact.emailPlaceholder': 'john.doe@example.com',
    'contact.subjectPlaceholder': 'Job Opportunity / Project Collaboration',
    'contact.messagePlaceholder': 'Tell me about your project or opportunity...',

    // Footer
    'footer.madeWith': 'Made with',
    'footer.using': 'using React & Tailwind CSS',
    'footer.allRightsReserved': 'All rights reserved.',
  },
  tr: {
    // Header
    'nav.home': 'Ana Sayfa',
    'nav.about': 'Hakkımda',
    'nav.projects': 'Projeler',
    'nav.experience': 'Deneyim',
    'nav.skills': 'Yetenekler',
    'nav.contact': 'İletişim',

    // Hero Section
    'hero.title': 'Sifa Birkan KADER',
    'hero.subtitle': 'Coğrafi Görselleştirme ve Java Geliştirme konularında uzmanlaşmış Yazılım Mühendisi',
    'hero.location': 'Ankara, Türkiye',
    'hero.getInTouch': 'İletişime Geç',
    'hero.viewWork': 'Çalışmalarımı Gör',

    // About Section
    'about.title': 'Hakkımda',
    'about.whoIAm': 'Ben Kimim',
    'about.whoIAmText': 'HAVELSAN\'da 4+ yıllık deneyime sahip, yüksek performanslı masaüstü ve web haritalama uygulamaları konusunda uzmanlaşmış tutkulu bir Yazılım Mühendisiyim. Uzmanlığım saf Java/OpenGL pipeline\'larından modern React + Cesium frontend\'lerine kadar uzanmaktadır.',
    'about.whatIDo': 'Ne Yapıyorum',
    'about.whatIDoText': 'Gelişmiş coğrafi görselleştirme çözümleri geliştiriyorum, karmaşık yol bulma algoritmaları (A*, yükseklik tabanlı eğim analizi) uyguluyorum ve render performansını optimize ediyorum. Java 8→11 geçiş projelerini başarıyla yönettim ve taktik grafik render performansını %50 artırdım.',
    'about.myGoal': 'Hedefim',
    'about.myGoalText': 'Şu anda derin coğrafi görselleştirme becerilerimi, yenilikçi haritalama çözümleri geliştirmeye devam edebileceğim ve coğrafi teknolojiler alanını ilerletebileceğim kıdemli bir GIS veya savunma teknolojisi rolünde kullanmayı hedefliyorum.',
    'about.keyAchievements': 'Önemli Başarılar',
    'about.achievement1': 'Java 8\'den Java 11\'e başarılı geçiş projesini yönetti',
    'about.achievement2': 'Taktik grafik render performansını %50 artırdı',
    'about.achievement3': 'Gelişmiş A* yol bulma algoritmalarını uyguladı',
    'about.achievement4': 'JavaFX bileşenlerini eski Swing UI\'ya entegre etti',
    'about.achievement5': 'Harita analiz yükleme süresini %20 azalttı',
    'about.interests': 'İlgi Alanları',
    'about.interest1': 'Sanat Kitabı Koleksiyonu',
    'about.interest2': 'Özel Kahve',
    'about.interest3': 'Coğrafi Teknoloji',
    'about.interest4': 'Veri Görselleştirme',

    // Projects Section
    'projects.title': 'Öne Çıkan Projeler',
    'projects.subtitle': 'En son Chrome uzantım ve profesyonel çalışmalarım dahil olmak üzere önemli projelerim.',
    'projects.chromeExtension': 'Chrome Uzantısı',
    'projects.published': 'Yayınlandı',
    'projects.blockTheUnwanted': 'Block The Unwanted',
    'projects.blockDescription': 'Twitter içeriğini anahtar kelimelere göre filtreleyen güçlü bir Chrome uzantısı. İstenmeyen içeriği otomatik olarak engelleyerek Twitter akışınızı temizleyin ve sosyal medya deneyiminizi daha odaklı ve keyifli hale getirin.',
    'projects.keyFeatures': 'Temel Özellikler:',
    'projects.feature1': 'Anahtar kelime tabanlı içerik filtreleme',
    'projects.feature2': 'Gerçek zamanlı Twitter akışı temizleme',
    'projects.feature3': 'Kullanımı kolay Chrome uzantısı',
    'projects.technologies': 'Teknolojiler:',
    'projects.availableNow': 'Şimdi Mevcut',
    'projects.chromeWebStore': 'Chrome Web Store\'da yayınlandı',
    'projects.installExtension': 'Uzantıyı Yükle',
    'projects.rateReview': 'Değerlendir ve Yorum Yap',
    'projects.geospatialPlatform': 'Coğrafi Haritalama Platformu',
    'projects.geospatialDescription': 'Gelişmiş yol bulma algoritmaları ve gerçek zamanlı taktik grafik render özellikli yüksek performanslı masaüstü haritalama uygulaması.',
    'projects.webMapping': 'Web Haritalama Arayüzü',
    'projects.webMappingDescription': 'Etkileşimli 3D coğrafi görselleştirme ve analiz için React ve CesiumJS ile oluşturulmuş modern web tabanlı haritalama çözümü.',
    'projects.improvement1': 'Render performansında %50 iyileştirme',
    'projects.improvement2': 'A* yol bulma algoritması uygulaması',
    'projects.improvement3': 'Java 8→11 geçiş liderliği',
    'projects.improvement4': 'Analiz yükleme süresinde %20 azalma',
    'projects.improvement5': 'Etkileşimli 3D haritalama bileşenleri',
    'projects.improvement6': 'Gerçek zamanlı veri görselleştirme',

    // Experience Section
    'experience.title': 'Profesyonel Deneyim',
    'experience.current': 'Mevcut',
    'experience.softwareEngineer': 'Yazılım Mühendisi',
    'experience.candidateEngineer': 'Aday Mühendis',
    'experience.intern': 'Yazılım Mühendisliği Stajyeri',
    'experience.desc1': 'Coğrafi görselleştirme için saf Java ve OpenGL kullanarak yüksek performanslı masaüstü uygulamaları geliştirme',
    'experience.desc2': 'Java 8\'den Java 11\'e başarılı geçişi yönetti, uyumluluk ve performans optimizasyonu sağladı',
    'experience.desc3': 'JavaFX bileşenlerini eski Swing UI\'ya entegre etti, modern arayüz yetenekleri sağladı',
    'experience.desc4': 'A* algoritmaları ve yükseklik tabanlı eğim analizi ile gelişmiş navigasyon ve rota planlama uyguladı',
    'experience.desc5': 'Optimizasyon teknikleri ile taktik grafik render performansında %50 iyileştirme sağladı',
    'experience.desc6': 'Daha hızlı hesaplama ve daha iyi kullanıcı deneyimi için yükseklik tabanlı analitik modülleri geliştirdi',
    'experience.desc7': '3D coğrafi görselleştirme için React JS ve CesiumJS kullanarak yeni harita bileşenleri geliştirdi',
    'experience.desc8': 'Harita analiz yeteneklerini geliştirdi ve ilgili raporlama arayüzlerini güncelledi',
    'experience.desc9': 'Harita analiz yükleme süresinde %20 azalma sağlayan performans optimizasyonu yaptı',
    'experience.desc10': 'Karmaşık coğrafi algoritmalar ve veri işleme konularında kıdemli mühendislerle işbirliği yaptı',
    'experience.desc11': 'SVG formatında NATO semboloji grafikleri oluşturdu ve Java pipeline\'daki render sorunlarını çözdü',
    'experience.desc12': 'Karmaşık "path" elemanları desteği ekleyerek şirket içi Java SVG parser\'ını geliştirdi',
    'experience.desc13': 'Taktik grafik tanımlama dili geliştirme projesine katkıda bulundu (gizli proje)',
    'experience.desc14': 'Askeri standartlarda yazılım geliştirme konusunda uygulamalı deneyim kazandı',

    // Skills Section
    'skills.title': 'Yetenekler ve Uzmanlık',
    'skills.programmingLanguages': 'Programlama Dilleri',
    'skills.frontendTechnologies': 'Frontend Teknolojileri',
    'skills.backendGraphics': 'Backend ve Grafikler',
    'skills.toolsMethods': 'Araçlar ve Yöntemler',
    'skills.expert': 'Uzman',
    'skills.advanced': 'İleri Seviye',
    'skills.intermediate': 'Orta Seviye',
    'skills.javaDesc': 'OpenGL entegrasyonu ile 4+ yıllık kurumsal Java geliştirme',
    'skills.jsDesc': 'ES6+ özellikleri ve asenkron programlama ile modern JavaScript',
    'skills.tsDesc': 'Güçlü tipleme ve arayüzlerle tip güvenli geliştirme',
    'skills.csharpDesc': 'Nesne yönelimli programlama ve .NET framework deneyimi',
    'skills.reactDesc': 'Hook\'lar ve context ile bileşen tabanlı UI geliştirme',
    'skills.swingDesc': 'Özel bileşenler ve düzenlerle masaüstü GUI geliştirme',
    'skills.javafxDesc': 'FXML ve CSS stillendirme ile modern Java masaüstü uygulamaları',
    'skills.cesiumDesc': '3D coğrafi görselleştirme ve etkileşimli haritalama çözümleri',
    'skills.openglDesc': 'Yüksek performanslı grafik programlama ve shader geliştirme',
    'skills.restDesc': 'Mikroservislerle API tasarımı, uygulaması ve entegrasyonu',
    'skills.microservicesDesc': 'Dağıtık sistem mimarisi ve servis iletişimi',
    'skills.postgisDesc': 'Mekansal veritabanı sorguları ve coğrafi veri yönetimi',
    'skills.gitDesc': 'Versiyon kontrolü, dallanma stratejileri ve işbirlikçi geliştirme',
    'skills.dockerDesc': 'Konteynerleştirme ve dağıtım otomasyonu',
    'skills.agileDesc': 'Scrum metodolojisi ve çevik proje yönetimi',
    'skills.perfDesc': 'Kod optimizasyonu, profilleme ve performans ayarlama',
    'skills.languages': 'Diller',
    'skills.turkish': 'Türkçe',
    'skills.english': 'İngilizce',
    'skills.native': 'Ana Dil',
    'skills.specializations': 'Uzmanlık Alanları',
    'skills.geospatialVisualization': 'Coğrafi Görselleştirme',
    'skills.algorithmDevelopment': 'Algoritma Geliştirme',
    'skills.performanceOptimization': 'Performans Optimizasyonu',
    'skills.legacySystemMigration': 'Eski Sistem Geçişi',

    // Contact Section
    'contact.title': 'Birlikte Çalışalım',
    'contact.subtitle': 'Her zaman yeni fırsatlar ve heyecan verici projelerle ilgileniyorum. Nasıl birlikte çalışabileceğimizi konuşalım.',
    'contact.getInTouch': 'İletişime Geç',
    'contact.email': 'E-posta',
    'contact.location': 'Konum',
    'contact.responseTime': 'Yanıt Süresi',
    'contact.responseTimeText': 'Genellikle 24 saat içinde',
    'contact.connectWithMe': 'Benimle bağlantı kur',
    'contact.availableFor': 'Uygun Olduğum Alanlar',
    'contact.fullTime': 'Tam zamanlı pozisyonlar',
    'contact.seniorRoles': 'Kıdemli yazılım mühendisliği rolleri',
    'contact.consultations': 'Proje danışmanlıkları',
    'contact.freelance': 'Freelance fırsatları',
    'contact.sendMessage': 'Bana Mesaj Gönder',
    'contact.yourName': 'Adınız',
    'contact.yourEmail': 'E-posta Adresiniz',
    'contact.subject': 'Konu',
    'contact.message': 'Mesaj',
    'contact.sendButton': 'Mesaj Gönder',
    'contact.sending': 'Mesaj Gönderiliyor...',
    'contact.successMessage': 'Teşekkürler! Mesajınız başarıyla gönderildi.',
    'contact.errorMessage': 'Üzgünüm, mesajınız gönderilirken bir hata oluştu. Lütfen tekrar deneyin.',
    'contact.namePlaceholder': 'Ahmet Yılmaz',
    'contact.emailPlaceholder': 'ahmet.yilmaz@example.com',
    'contact.subjectPlaceholder': 'İş Fırsatı / Proje İşbirliği',
    'contact.messagePlaceholder': 'Projeniz veya fırsatınız hakkında bana bilgi verin...',

    // Footer
    'footer.madeWith': 'ile yapıldı',
    'footer.using': 'React & Tailwind CSS kullanılarak',
    'footer.allRightsReserved': 'Tüm hakları saklıdır.',
  },
};

// Detect browser language
const detectBrowserLanguage = (): Language => {
  if (typeof window === 'undefined') return 'en';
  
  const browserLang = navigator.language.toLowerCase();
  if (browserLang.startsWith('tr')) {
    return 'tr';
  }
  return 'en';
};

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    if (typeof window === 'undefined') return 'en';
    
    const saved = localStorage.getItem('language') as Language;
    if (saved && (saved === 'en' || saved === 'tr')) {
      return saved;
    }
    
    return detectBrowserLanguage();
  });

  useEffect(() => {
    localStorage.setItem('language', language);
    document.documentElement.lang = language;
  }, [language]);

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};