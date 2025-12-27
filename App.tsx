
import React, { useState, useEffect, useRef } from 'react';
import { AppView, Tenant, Service, Staff } from './types';
import { Navigation } from './components/Navigation';
import { Dashboard } from './Dashboard';
import { AuraAdmin } from './pages/AuraAdmin';
import { GeminiService } from './services/geminiService';
import { useAuth } from './src/hooks/useAuth';
import { supabase } from './src/lib/supabase';

// ... (existing constants MOCK_TENANT, MOCK_SERVICES, MOCK_STAFF, MOCK_TIMES, translations ...)

const MOCK_TENANT: Tenant = {
  id: '1',
  name: 'Luxe Hair & Spa',
  slug: 'luxe-spa',
  primaryColor: '#6366f1',
  secondaryColor: '#a855f7',
  description: 'The ultimate luxury experience for your hair and skin.',
  address: '123 Beauty Ave, Paris',
  languages: ['en', 'fr', 'pt', 'es', 'it', 'de'],
  timezone: 'Europe/Paris',
  currency: 'EUR',
  stripeConnected: true,
  status: 'ACTIVE'
};

const MOCK_SERVICES: Service[] = [
  { id: 's1', name: 'Signature Haircut', description: 'Master stylist cut & style including premium wash.', price: 85, duration: 45, category: 'Hair' },
  { id: 's2', name: 'Balayage Glow', description: 'Natural sun-kissed highlights with organic bleach.', price: 210, duration: 180, category: 'Hair' },
  { id: 's3', name: 'Aura Facial', description: 'Hydrating treatment with deep pore cleaning.', price: 120, duration: 60, category: 'Skin' },
  { id: 's4', name: 'Deep Tissue Massage', description: 'Intense pressure to release muscle tension.', price: 95, duration: 60, category: 'Body' },
  { id: 's5', name: 'Gel Manicure', description: 'Long-lasting polish with custom nail art.', price: 45, duration: 40, category: 'Nails' },
  { id: 's6', name: 'Brow Sculpting', description: 'Precision mapping and waxing for perfect brows.', price: 30, duration: 20, category: 'Eyes' },
  { id: 's7', name: 'Anti-Aging Therapy', description: 'Advanced serum infusion with cryo-technology.', price: 150, duration: 75, category: 'Skin' },
  { id: 's8', name: 'Beard Grooming', description: 'Detailed trim, hot towel, and oil treatment.', price: 40, duration: 30, category: 'Grooming' },
];

const MOCK_STAFF: Staff[] = [
  { id: 'p1', name: 'Elena Rossi', role: 'Master Stylist', avatar: 'https://picsum.photos/100/100?random=1', specialties: ['Cut', 'Color'] },
  { id: 'p2', name: 'Marc Dupont', role: 'Skin Specialist', avatar: 'https://picsum.photos/100/100?random=2', specialties: ['Facials', 'Massage'] },
];

const MOCK_TIMES = ["09:00", "10:00", "11:30", "14:00", "15:30", "17:00", "18:30"];

const translations: Record<string, Record<string, string>> = {
  en: {
    home: "Home", book: "Book", shop: "Shop", me: "Me",
    services: "Services", seeAll: "See all", bookingBot: "Aura Assistant",
    assistantHint: "Hello! I'm your Aura Assistant. How can I help you book today?",
    heroTitle: "Signature Styles", heroDesc: "Experience the Aura difference with our master stylists.",
    metaDesc: "The world's first autonomous beauty SaaS. Built to scale salons with AI, PWA, and SEO.",
    cookieTitle: "Cookie Settings",
    cookieDesc: "We use cookies to enhance your experience and remember your preferences like language and booking history.",
    cookieAccept: "Accept All",
    cookieReject: "Reject Non-Essential",
    navFeatures: "Features", navPricing: "Pricing", navLogin: "Login", navGetStarted: "Get Started",
    landingHeroTitle: "The Future of Beauty is Autonomous.",
    landingHeroSub: "The world's first AI-powered SaaS that builds, ranks, and manages your salon business while you sleep.",
    landingCTA: "Start Free Trial",
    landingDemo: "Watch AI in Action",
    statsSalons: "Active Salons", statsBookings: "Bookings Processed", statsLanguages: "Languages", statsAccuracy: "AI Accuracy",
    featuresTitle: "Built to Scale Globally.",
    featuresSub: "Aura isn't just management software. It's an autonomous growth engine.",
    feature1Title: "Instant Autonomous PWA",
    feature1Desc: "Complete onboarding in 5 minutes. We generate a high-performance web app, sitemaps, and SEO instantly.",
    feature2Title: "AI Concierge (Gemini 3)",
    feature2Desc: "Our AI doesn't just chat. It sells. Intelligent booking, consulting, and customer support in 15+ languages.",
    feature3Title: "Global SEO Domination",
    feature3Desc: "Automatic indexation on Google Search Console. We handle schema.org and localized keywords per branch.",
    aiSectionTitle: "The Receptionist That Never Sleeps.",
    aiBadge: "Powered by Gemini 3 Flash",
    aiFeature1: "Intelligent Scheduling: Detects user timezones and availability instantly.",
    aiFeature2: "Consultative Selling: Recommends additional services based on user preferences.",
    aiFeature3: "Contextual CRM: Remembers every detail about your customers across branches.",
    aiCTA: "Try AI Live Demo",
    aiBotName: "Aura Concierge",
    aiStatus: "Online",
    aiDemoUser: "Hi! Do you have any availability for a Balayage tomorrow afternoon?",
    aiDemoBot: "Hello! Yes, Elena has a slot at 2:30 PM. Based on your previous visit, I also recommend a Hydrating Facial. Should I book both?",
    pricingTitle: "Simple, Scalable Pricing",
    pricingSub: "Choose the plan that fits your ambition.",
    pricingMostPopular: "Most Popular",
    faqTitle: "Frequently Asked Questions",
    ctaTitle: "Ready to Aura Your Salon?",
    ctaSub: "Join 500+ premium salons redefining the beauty industry experience.",
    ctaButton: "Start Free Trial",
    footerDesc: "The global standard for autonomous beauty business management.",
    footerProduct: "Product", footerCompany: "Company", footerNewsletter: "Newsletter",
    footerNewsletterSub: "Growth tips for beauty leaders.", footerPlaceholder: "your@email.com",
    footerPrivacy: "Privacy Policy", footerGDPR: "GDPR Compliance", footerTerms: "Terms of Service",
    authTitle: "Join the Aura Revolution", authLogin: "Login", authSignUp: "Sign Up",
    authSub: "Empowering 500+ beauty leaders globally.", authTrial: "14-Day Free Trial",
    authNoCard: "No credit card required.", authName: "Full Name", authEmail: "Email Address",
    authPassword: "Password", authAction: "Create My Salon", authAlready: "Already have an account?",
    genLogo: "Generate Brand Identity",
    selectStaff: "Select Professional",
    anyStaff: "Any Available",
    selectDateTime: "Select Date & Time",
    confirmBooking: "Confirm Booking",
    bookingSuccess: "Booking Confirmed!",
    bookingSuccessSub: "We've sent a confirmation email and added this to your calendar.",
    total: "Total",
    next: "Next Step",
    back: "Back",
    confirm: "Confirm & Book"
  },
  pt: {
    home: "Início", book: "Agendar", shop: "Loja", me: "Eu",
    services: "Serviços", seeAll: "Ver todos", bookingBot: "Assistente Aura",
    assistantHint: "Olá! Sou seu Assistente Aura. Como posso ajudar você a agendar hoje?",
    heroTitle: "Estilos Exclusivos", heroDesc: "Sinta a diferença Aura com nossos mestres estilistas.",
    metaDesc: "O primeiro SaaS de beleza autônomo do mundo. Construído para escalar salões com IA, PWA e SEO.",
    cookieTitle: "Configurações de Cookies",
    cookieDesc: "Utilizamos cookies para melhorar sua experiência e lembrar suas preferências.",
    cookieAccept: "Aceitar Tudo",
    cookieReject: "Rejeitar Não-Essenciais",
    navFeatures: "Recursos", navPricing: "Preços", navLogin: "Entrar", navGetStarted: "Começar",
    landingHeroTitle: "O Futuro da Beleza é Autônomo.",
    landingHeroSub: "O primeiro SaaS do mundo com IA que constrói, ranqueia e gerencia seu salão enquanto você dorme.",
    landingCTA: "Começar Teste Grátis",
    landingDemo: "Ver IA em Ação",
    statsSalons: "Salões Ativos", statsBookings: "Agendamentos", statsLanguages: "Idiomas", statsAccuracy: "Precisão da IA",
    featuresTitle: "Feito para Escalar Globalmente.",
    featuresSub: "O Aura não é apenas um software de gestão. É um motor de crescimento autônomo.",
    feature1Title: "PWA Autônomo Instantâneo",
    feature1Desc: "Onboarding em 5 minutos. Geramos um web app de alta performance, sitemaps e SEO instantaneamente.",
    feature2Title: "Concierge com IA (Gemini 3)",
    feature2Desc: "Nossa IA não apenas conversa. Ela vende. Agendamento inteligente e suporte em mais de 15 idiomas.",
    feature3Title: "Domínio Global de SEO",
    feature3Desc: "Indexação automática no Google Search Console. Cuidamos do schema.org e palavras-chave locais.",
    aiSectionTitle: "A Recepcionista que Nunca Dorme.",
    aiBadge: "Powered by Gemini 3 Flash",
    aiFeature1: "Agendamento Inteligente: Detecta fuso horário e disponibilidade instantaneamente.",
    aiFeature2: "Venda Consultiva: Recomenda serviços adicionais baseados em preferências.",
    aiFeature3: "CRM Contextual: Lembra de cada detalhe do cliente em todas as unidades.",
    aiCTA: "Testar Demo da IA",
    aiBotName: "Concierge Aura",
    aiStatus: "Online",
    aiDemoUser: "Olá! Você tem horário para um Balayage amanhã à tarde?",
    aiDemoBot: "Olá! Sim, Elena tem uma vaga às 14:30. Baseado na sua última visita, recomendo um Facial Hidratante. Reservamos ambos?",
    pricingTitle: "Preços Simples e Escaláveis",
    pricingSub: "Escolha o plano que combina com sua ambição.",
    pricingMostPopular: "Mais Popular",
    faqTitle: "Perguntas Frequentes",
    ctaTitle: "Pronto para Aura seu Salão?",
    ctaSub: "Junte-se a mais de 500 salões premium redefinindo a experiência da beleza.",
    ctaButton: "Começar Teste Grátis",
    footerDesc: "O padrão global para gestão autônoma de negócios de beleza.",
    footerProduct: "Produto", footerCompany: "Empresa", footerNewsletter: "Newsletter",
    footerNewsletterSub: "Dicas de crescimento para líderes.", footerPlaceholder: "seu@email.com",
    footerPrivacy: "Privacidade", footerGDPR: "Compliance GDPR", footerTerms: "Termos de Uso",
    authTitle: "Junte-se à Revolução Aura", authLogin: "Entrar", authSignUp: "Criar Conta",
    authSub: "Capacitando 500+ líderes da beleza.", authTrial: "14 Dias Grátis",
    authNoCard: "Sem cartão necessário.", authName: "Nome Completo", authEmail: "E-mail",
    authPassword: "Senha", authAction: "Criar Meu Salão", authAlready: "Já tem uma conta?",
    genLogo: "Gerar Identidade Visual",
    selectStaff: "Selecionar Profissional",
    anyStaff: "Qualquer um Disponível",
    selectDateTime: "Escolher Data e Hora",
    confirmBooking: "Confirmar Agendamento",
    bookingSuccess: "Agendamento Confirmado!",
    bookingSuccessSub: "Enviamos um e-mail de confirmação e adicionamos ao seu calendário.",
    total: "Total",
    next: "Próximo Passo",
    back: "Voltar",
    confirm: "Confirmar e Agendar"
  },
  es: {
    home: "Inicio", book: "Reservar", shop: "Tienda", me: "Yo",
    services: "Servicios", seeAll: "Ver todo", bookingBot: "Asistente Aura",
    assistantHint: "¡Hola! Soy tu Asistente Aura.",
    heroTitle: "Estilos Exclusivos", heroDesc: "Siente la diferencia Aura.",
    metaDesc: "El primer SaaS de belleza autónomo del mundo. Construido con IA, PWA y SEO.",
    cookieTitle: "Cookies",
    cookieDesc: "Usamos cookies para mejorar tu experiencia.",
    cookieAccept: "Aceptar",
    cookieReject: "Rechazar",
    navFeatures: "Funciones", navPricing: "Precios", navLogin: "Entrar", navGetStarted: "Comenzar",
    landingHeroTitle: "El Futuro de la Belleza es Autónomo.",
    landingHeroSub: "El primer SaaS del mundo con IA que gestiona tu salón automáticamente.",
    landingCTA: "Prueba Gratis",
    landingDemo: "Ver Demo",
    statsSalons: "Salones Activos", statsBookings: "Reservas", statsLanguages: "Idiomas", statsAccuracy: "Precisión IA",
    featuresTitle: "Escalabilidad Global.",
    featuresSub: "Aura es un motor de crecimiento autónomo para tu negocio.",
    feature1Title: "PWA Autónoma Instantánea",
    feature1Desc: "Configuración en 5 minutos con SEO optimizado y sitemaps automáticos.",
    feature2Title: "Conserje IA (Gemini 3)",
    feature2Desc: "Reserva inteligente y soporte en más de 15 idiomas.",
    feature3Title: "Dominio de SEO Global",
    feature3Desc: "Indexación automática en Google Search Console.",
    aiSectionTitle: "La Recepcionista que Nunca Duerme.",
    aiBadge: "Powered by Gemini 3 Flash",
    aiFeature1: "Agendamiento Inteligente: Detecta zonas horarias al instante.",
    aiFeature2: "Venta Consultiva: Sugiere servicios adicionales personalizados.",
    aiFeature3: "CRM Contextual: Recuerda cada detalle del cliente.",
    aiCTA: "Prueba Demo IA",
    aiBotName: "Conserje Aura",
    aiStatus: "En línea",
    aiDemoUser: "¿Tienes disponibilidad para Balayage mañana?",
    aiDemoBot: "¡Hola! Sí, Elena tiene un hueco a las 14:30. ¿Lo reservamos?",
    pricingTitle: "Precios Simples",
    pricingSub: "Elige el plan ideal para tu ambición.",
    pricingMostPopular: "Más Popular",
    faqTitle: "Preguntas Frecuentes",
    ctaTitle: "¿Listo para Aura en tu Salón?",
    ctaSub: "Únete a más de 500 salones premium.",
    ctaButton: "Empezar Gratis",
    footerDesc: "El estándar global para la gestión de salones.",
    footerProduct: "Producto", footerCompany: "Empresa", footerNewsletter: "Boletín",
    footerNewsletterSub: "Consejos de crecimiento.", footerPlaceholder: "tu@email.com",
    footerPrivacy: "Privacidad", footerGDPR: "Cumplimiento GDPR", footerTerms: "Términos",
    authTitle: "Únete a la Revolución Aura", authLogin: "Entrar", authSignUp: "Regístrate",
    authSub: "Empoderando a líderes de la belleza.", authTrial: "14 Días Gratis",
    authNoCard: "Sin tarjeta de crédito.", authName: "Nombre", authEmail: "Email",
    authPassword: "Clave", authAction: "Crear mi Salón", authAlready: "¿Ya tienes cuenta?",
    genLogo: "Generar Identidad"
  },
  fr: {
    home: "Accueil", book: "Réserver", shop: "Boutique", me: "Moi",
    services: "Services", seeAll: "Voir tout", bookingBot: "Assistant Aura",
    assistantHint: "Bonjour! Je suis votre Assistant Aura.",
    heroTitle: "Styles Signature", heroDesc: "Vivez l'expérience Aura.",
    metaDesc: "Le premier SaaS beauté autonome. Construit avec IA, PWA et SEO.",
    cookieTitle: "Cookies",
    cookieDesc: "Nous utilisons des cookies pour votre expérience.",
    cookieAccept: "Accepter",
    cookieReject: "Refuser",
    navFeatures: "Fonctions", navPricing: "Tarifs", navLogin: "Connexion", navGetStarted: "Commencer",
    landingHeroTitle: "L'Avenir de la Beauté est Autonome.",
    landingHeroSub: "Le premier SaaS IA qui gère votre salon pendant que vous dormez.",
    landingCTA: "Essai Gratuit",
    landingDemo: "Voir la Démo",
    statsSalons: "Salons Actifs", statsBookings: "Réservations", statsLanguages: "Langues", statsAccuracy: "Précision IA",
    featuresTitle: "Évolutivité Mondiale.",
    featuresSub: "Aura est un moteur de croissance autonome.",
    feature1Title: "PWA Autonome Instantanée",
    feature1Desc: "Application web prête en 5 minutes avec SEO complet.",
    feature2Title: "Concierge IA (Gemini 3)",
    feature2Desc: "Réservation intelligente dans plus de 15 langues.",
    feature3Title: "Domination SEO Globale",
    feature3Desc: "Indexation automatique sur Google Search Console.",
    aiSectionTitle: "La Réceptionniste qui ne Dort Jamais.",
    aiBadge: "Propulsé par Gemini 3 Flash",
    aiFeature1: "Planification Intelligente: Détecte les fuseaux horaires.",
    aiFeature2: "Vente Consultative: Recommande des soins adaptés.",
    aiFeature3: "CRM Contextuel: Se souvient de chaque détail client.",
    aiCTA: "Essayer la Démo IA",
    aiBotName: "Concierge Aura",
    aiStatus: "En ligne",
    aiDemoUser: "Avez-vous de la place pour un balayage demain?",
    aiDemoBot: "Bonjour! Oui, Elena est libre à 14h30. Je réserve?",
    pricingTitle: "Tarifs Simples",
    pricingSub: "Choisissez le plan qui vous convient.",
    pricingMostPopular: "Populaire",
    faqTitle: "Questions Fréquentes",
    ctaTitle: "Prêt pour Aura?",
    ctaSub: "Rejoignez 500+ salons premium.",
    ctaButton: "Essai Gratuit",
    footerDesc: "Le standard mondial de gestion autonome.",
    footerProduct: "Produit", footerCompany: "Société", footerNewsletter: "Newsletter",
    footerNewsletterSub: "Conseils de croissance.", footerPlaceholder: "votre@email.fr",
    footerPrivacy: "Confidentialité", footerGDPR: "Conformité GDPR", footerTerms: "Conditions",
    authTitle: "Rejoignez Aura", authLogin: "Connexion", authSignUp: "Inscription",
    authSub: "Soutenir les leaders de la beauté.", authTrial: "14 Jours Gratuits",
    authNoCard: "Pas de carte requise.", authName: "Nom", authEmail: "Email",
    authPassword: "Mot de passe", authAction: "Créer mon Salon", authAlready: "Déjà inscrit?",
    genLogo: "Générer Logo"
  },
  it: {
    home: "Home", book: "Prenota", shop: "Negozio", me: "Io",
    services: "Servizi", seeAll: "Vedi tutto", bookingBot: "Assistente Aura",
    assistantHint: "Ciao! Sono il tuo Assistente Aura.",
    heroTitle: "Stili d'Autore", heroDesc: "Scopri la differenza Aura.",
    metaDesc: "Il primo SaaS bellezza autonomo. Costruito con IA, PWA e SEO.",
    cookieTitle: "Cookie",
    cookieDesc: "Utilizziamo i cookie per la tua esperienza.",
    cookieAccept: "Accetta",
    cookieReject: "Rifiuta",
    navFeatures: "Funzioni", navPricing: "Prezzi", navLogin: "Accedi", navGetStarted: "Inizia",
    landingHeroTitle: "Il Futuro della Bellezza è Autonomo.",
    landingHeroSub: "Il primo SaaS IA che gestisce il tuo salone automaticamente.",
    landingCTA: "Prova Gratis",
    landingDemo: "Guarda Demo",
    statsSalons: "Saloni Attivi", statsBookings: "Prenotazioni", statsLanguages: "Lingue", statsAccuracy: "Precisione IA",
    featuresTitle: "Scalabilità Globale.",
    featuresSub: "Aura è un motore di crescita autonomo.",
    feature1Title: "PWA Autonoma Istantanea",
    feature1Desc: "App web pronta in 5 minuti con SEO avanzato.",
    feature2Title: "Concierge IA (Gemini 3)",
    feature2Desc: "Prenotazioni intelligenti in 15+ lingue.",
    feature3Title: "SEO Globale",
    feature3Desc: "Indicizzazione automatica su Google Search Console.",
    aiSectionTitle: "La Receptionist che non Dorme Mai.",
    aiBadge: "Alimentato da Gemini 3 Flash",
    aiFeature1: "Prenotazione Intelligente: Rileva i fusi orari.",
    aiFeature2: "Vendita Consultiva: Suggerisce trattamenti mirati.",
    aiFeature3: "CRM Contestuale: Ricorda ogni dettaglio del cliente.",
    aiCTA: "Prova Demo IA",
    aiBotName: "Concierge Aura",
    aiStatus: "Online",
    aiDemoUser: "C'è posto per un Balayage domani?",
    aiDemoBot: "Ciao! Sì, Elena è libera alle 14:30. Prenotiamo?",
    pricingTitle: "Prezzi Semplici",
    pricingSub: "Scegli il piano ideale per te.",
    pricingMostPopular: "Popolare",
    faqTitle: "Domande Frequenti",
    ctaTitle: "Pronto per Aura?",
    ctaSub: "Unisciti a oltre 500 saloni premium.",
    ctaButton: "Inizia Prova Gratis",
    footerDesc: "Lo standard globale per la gestione autonoma.",
    footerProduct: "Prodotto", footerCompany: "Azienda", footerNewsletter: "Newsletter",
    footerNewsletterSub: "Consigli di crescita.", footerPlaceholder: "tua@email.it",
    footerPrivacy: "Privacy", footerGDPR: "GDPR", footerTerms: "Termini",
    authTitle: "Unisciti ad Aura", authLogin: "Accedi", authSignUp: "Registrati",
    authSub: "Supporto per i leader della bellezza.", authTrial: "14 Giorni Gratis",
    authNoCard: "Nessuna carta richiesta.", authName: "Nome", authEmail: "Email",
    authPassword: "Password", authAction: "Crea il mio Salone", authAlready: "Già registrato?",
    genLogo: "Genera Logo"
  },
  de: {
    home: "Home", book: "Buchen", shop: "Shop", me: "Ich",
    services: "Services", seeAll: "Alle ansehen", bookingBot: "Aura Assistent",
    assistantHint: "Hallo! Ich bin Ihr Aura Assistent.",
    heroTitle: "Signatur-Styles", heroDesc: "Erleben Sie den Aura-Unterschied.",
    metaDesc: "Das weltweit erste autonome Beauty-SaaS. Gebaut mit KI, PWA und SEO.",
    cookieTitle: "Cookies",
    cookieDesc: "Wir verwenden Cookies für Ihr Erlebnis.",
    cookieAccept: "Akzeptieren",
    cookieReject: "Ablehnen",
    navFeatures: "Funktionen", navPricing: "Preise", navLogin: "Login", navGetStarted: "Starten",
    landingHeroTitle: "Die Zukunft der Schönheit ist autonom.",
    landingHeroSub: "Das weltweit erste KI-SaaS, das Ihren Salon automatisch verwaltet.",
    landingCTA: "Gratis Testen",
    landingDemo: "Demo Ansehen",
    statsSalons: "Salons", statsBookings: "Buchungen", statsLanguages: "Sprachen", statsAccuracy: "KI-Genauigkeit",
    featuresTitle: "Global Skalierbar.",
    featuresSub: "Aura ist ein autonomer Wachstumsmotor.",
    feature1Title: "Sofortige PWA",
    feature1Desc: "Web-App in 5 Minuten bereit mit vollem SEO.",
    feature2Title: "KI-Concierge (Gemini 3)",
    feature2Desc: "Intelligente Buchung in über 15 Sprachen.",
    feature3Title: "Globales SEO",
    feature3Desc: "Automatische Indexierung bei Google.",
    aiSectionTitle: "Die Rezeptionistin, die nie schläft.",
    aiBadge: "Powered by Gemini 3 Flash",
    aiFeature1: "KI-Terminplanung: Erkennt Zeitzonen sofort.",
    aiFeature2: "Beratender Verkauf: Empfiehlt passende Services.",
    aiFeature3: "Kontext-CRM: Merkt sich jedes Kundendetail.",
    aiCTA: "KI-Demo Testen",
    aiBotName: "Aura Concierge",
    aiStatus: "Online",
    aiDemoUser: "Haben Sie morgen Zeit für Balayage?",
    aiDemoBot: "Hallo! Ja, Elena ist um 14:30 Uhr frei. Buchen?",
    pricingTitle: "Einfache Preise",
    pricingSub: "Wählen Sie den passenden Plan.",
    pricingMostPopular: "Beliebt",
    faqTitle: "Häufige Fragen",
    ctaTitle: "Bereit für Aura?",
    ctaSub: "Schließen Sie sich 500+ premium Salons an.",
    ctaButton: "Gratis Starten",
    footerDesc: "Der globale Standard für autonomes Management.",
    footerProduct: "Produkt", footerCompany: "Firma", footerNewsletter: "Newsletter",
    footerNewsletterSub: "Wachstumstipps.", footerPlaceholder: "ihre@email.de",
    footerPrivacy: "Datenschutz", footerGDPR: "GDPR Konformität", footerTerms: "AGB",
    authTitle: "Werde Teil von Aura", authLogin: "Login", authSignUp: "Registrieren",
    authSub: "Empowerment für Beauty-Leader.", authTrial: "14 Tage Gratis",
    authNoCard: "Keine Kreditkarte nötig.", authName: "Name", authEmail: "Email",
    authPassword: "Passwort", authAction: "Meinen Salon erstellen", authAlready: "Konto vorhanden?",
    genLogo: "Identität erstellen"
  }
};

const getCookie = (name: string) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift();
};

const setCookie = (name: string, value: string) => {
  const consent = getCookie('aura_consent');
  if (consent === 'true' || name === 'aura_consent') {
    document.cookie = `${name}=${value}; path=/; max-age=31536000; SameSite=Lax`;
  }
};

const LazyServiceCard: React.FC<{ service: Service, t: Record<string, string>, onBook: (s: Service) => void }> = ({ service, t, onBook }) => {
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    );
    if (cardRef.current) observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={cardRef}
      className={`p-4 rounded-[2rem] border border-slate-100 shadow-sm bg-white flex items-center gap-4 hover:border-indigo-200 hover:shadow-md transition-all group min-h-[110px] ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
      style={{ transitionDuration: '800ms', transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)' }}
    >
      <div className="w-20 h-20 rounded-2xl overflow-hidden bg-slate-50 flex-shrink-0 relative">
        {!isVisible && <div className="absolute inset-0 bg-slate-100 animate-pulse"></div>}
        {isVisible && (
          <img
            src={`https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&q=80&w=200&sig=${service.id}`}
            loading="lazy"
            className="w-full h-full object-cover transition-opacity duration-1000 opacity-0"
            onLoad={(e) => (e.currentTarget.style.opacity = '1')}
            alt={service.name}
          />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
          <span className="text-[10px] font-extrabold text-indigo-500 uppercase tracking-widest">{service.category}</span>
        </div>
        <h4 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors truncate">{service.name}</h4>
        {isVisible ? (
          <p className="text-xs text-slate-400 mt-0.5 line-clamp-1 animate-in fade-in slide-in-from-left-2 duration-1000">
            {service.description}
          </p>
        ) : (
          <div className="h-4 w-3/4 bg-slate-50 rounded mt-1"></div>
        )}
      </div>
      <div className="text-right flex flex-col items-end">
        <p className="font-extrabold text-slate-900 text-base tracking-tight">€{service.price}</p>
        <button
          onClick={() => onBook(service)}
          className="text-[10px] font-bold text-white bg-slate-900 px-4 py-2 rounded-xl mt-2 active:scale-95 transition-transform"
        >
          {t.book}
        </button>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const { user, tenant, role, isSuperAdmin, loading: authLoading, switchTenant } = useAuth();
  const [view, setView] = useState<AppView>(AppView.INSTITUTIONAL);

  // PWA State
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstall, setShowInstall] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstall(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setShowInstall(false);
    }
  };



  // Update view based on auth state
  useEffect(() => {
    if (!authLoading) {
      if (user) {
        if (isSuperAdmin && !tenant) {
          setView(AppView.AURA_ADMIN);
        } else if (tenant) {
          setView(AppView.DASHBOARD);
        }
      } else if (view === AppView.DASHBOARD || view === AppView.AURA_ADMIN) {
        setView(AppView.AUTH);
      }
    }
  }, [user, tenant, isSuperAdmin, authLoading]);

  // Use tenant from Auth or fallback to Mock (only for landing page visualization if needed)
  const activeTenant = tenant || MOCK_TENANT;

  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'ai', text: string }[]>([]);
  const [userInput, setUserInput] = useState("");
  const [language, setLanguage] = useState<string>(getCookie('aura_lang') || 'en');
  const [showConsent, setShowConsent] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('signup');
  const [auraLogo, setAuraLogo] = useState<string | null>(localStorage.getItem('aura_logo'));
  const [isGeneratingLogo, setIsGeneratingLogo] = useState(false);

  // Booking Flow State
  const [bookingStep, setBookingStep] = useState<number>(0);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const t = translations[language] || translations['en'];

  useEffect(() => {
    const consent = getCookie('aura_consent');
    if (!consent) setShowConsent(true);
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
    const baseTitle = activeTenant.name;
    const pageTitle = view === AppView.PWA ? t.home : (view === AppView.DASHBOARD ? "Admin Panel" : (view === AppView.AUTH ? "Join Aura" : "Aura Global"));
    document.title = `${baseTitle} | ${pageTitle}`;

    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', t.metaDesc);
  }, [language, view, activeTenant, t]);

  const handleLanguageChange = (newLang: string) => {
    setLanguage(newLang);
    setCookie('aura_lang', newLang);
  };

  const handleGenerateLogo = async () => {
    try {
      if (!(await window.aistudio.hasSelectedApiKey())) {
        await window.aistudio.openSelectKey();
      }
      setIsGeneratingLogo(true);
      const logoData = await GeminiService.generateLogo();
      if (logoData) {
        setAuraLogo(logoData);
        localStorage.setItem('aura_logo', logoData);
      }
    } catch (error: any) {
      console.error("Logo Generation Error:", error);
      if (error.message && error.message.includes("Requested entity was not found")) {
        await window.aistudio.openSelectKey();
      }
    } finally {
      setIsGeneratingLogo(false);
    }
  };

  const handleAISend = async () => {
    if (!userInput.trim()) return;
    const msg = userInput;
    setChatMessages(prev => [...prev, { role: 'user', text: msg }]);
    setUserInput("");
    const aiResponse = await GeminiService.processAIRequest(msg, {
      services: MOCK_SERVICES,
      staff: MOCK_STAFF,
      tenantName: activeTenant.name
    });
    setChatMessages(prev => [...prev, { role: 'ai', text: aiResponse.reply }]);
  };

  const startBooking = (service: Service) => {
    setSelectedService(service);
    setBookingStep(1);
    setSelectedStaff(null);
    setSelectedTime(null);
  };

  const renderBookingDrawer = () => {
    if (bookingStep === 0) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
        <div className="w-full max-w-md bg-white rounded-t-[3rem] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-1/2 duration-500 ease-out flex flex-col max-h-[90vh]">
          {/* Header */}
          <div className="p-6 border-b border-slate-50 flex items-center justify-between">
            <button
              onClick={() => setBookingStep(Math.max(0, bookingStep - 1))}
              className={`w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 ${bookingStep >= 4 ? 'invisible' : ''}`}
            >
              <i className="fas fa-chevron-left text-xs"></i>
            </button>
            <h3 className="font-bold text-slate-900">
              {bookingStep === 1 && t.selectStaff}
              {bookingStep === 2 && t.selectDateTime}
              {bookingStep === 3 && t.confirmBooking}
              {bookingStep === 4 && t.bookingSuccess}
            </h3>
            <button
              onClick={() => setBookingStep(0)}
              className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400"
            >
              <i className="fas fa-times"></i>
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-8">
            {bookingStep === 1 && (
              <div className="space-y-4">
                <button
                  onClick={() => { setSelectedStaff(null); setBookingStep(2); }}
                  className="w-full p-6 rounded-3xl border-2 border-slate-100 flex items-center gap-6 hover:border-indigo-200 transition-all bg-white"
                >
                  <div className="w-14 h-14 rounded-2xl aura-gradient flex items-center justify-center text-white shadow-lg">
                    <i className="fas fa-users text-xl"></i>
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-slate-900">{t.anyStaff}</p>
                    <p className="text-xs text-slate-400">Fastest availability</p>
                  </div>
                </button>
                {MOCK_STAFF.map(staff => (
                  <button
                    key={staff.id}
                    onClick={() => { setSelectedStaff(staff); setBookingStep(2); }}
                    className="w-full p-6 rounded-3xl border-2 border-slate-100 flex items-center gap-6 hover:border-indigo-200 transition-all bg-white"
                  >
                    <img src={staff.avatar} className="w-14 h-14 rounded-2xl object-cover shadow-md" alt={staff.name} />
                    <div className="text-left">
                      <p className="font-bold text-slate-900">{staff.name}</p>
                      <p className="text-xs text-slate-400">{staff.role}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {bookingStep === 2 && (
              <div className="space-y-8">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 block">Select Date</label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-200 font-bold text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 block">Select Time</label>
                  <div className="grid grid-cols-3 gap-3">
                    {MOCK_TIMES.map(time => (
                      <button
                        key={time}
                        onClick={() => setSelectedTime(time)}
                        className={`py-3 rounded-xl border-2 font-bold text-sm transition-all ${selectedTime === time
                          ? 'aura-gradient text-white border-transparent shadow-lg'
                          : 'bg-white border-slate-100 text-slate-600 hover:border-indigo-100'
                          }`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>
                <button
                  disabled={!selectedTime}
                  onClick={() => setBookingStep(3)}
                  className="w-full py-5 aura-gradient text-white font-black rounded-2xl shadow-xl shadow-indigo-100 disabled:opacity-50 transition-all mt-4"
                >
                  {t.next}
                </button>
              </div>
            )}

            {bookingStep === 3 && (
              <div className="space-y-8">
                <div className="bg-slate-50 rounded-[2rem] p-8 space-y-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Service</p>
                      <p className="font-bold text-slate-900">{selectedService?.name}</p>
                    </div>
                    <p className="font-bold text-indigo-600">€{selectedService?.price}</p>
                  </div>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Professional</p>
                      <p className="font-bold text-slate-900">{selectedStaff?.name || t.anyStaff}</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">When</p>
                      <p className="font-bold text-slate-900">{selectedDate} @ {selectedTime}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between px-4">
                  <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">{t.total}</p>
                  <p className="text-3xl font-black text-slate-900">€{selectedService?.price}</p>
                </div>
                <button
                  onClick={() => setBookingStep(4)}
                  className="w-full py-5 aura-gradient text-white font-black rounded-2xl shadow-xl shadow-indigo-100 transition-all"
                >
                  {t.confirm}
                </button>
              </div>
            )}

            {bookingStep === 4 && (
              <div className="text-center py-12 space-y-6 animate-in zoom-in-95 duration-500">
                <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto text-4xl shadow-lg animate-bounce">
                  <i className="fas fa-check"></i>
                </div>
                <h4 className="text-2xl font-black text-slate-900">{t.bookingSuccess}</h4>
                <p className="text-slate-500 text-sm leading-relaxed px-8">{t.bookingSuccessSub}</p>
                <button
                  onClick={() => setBookingStep(0)}
                  className="w-full py-5 bg-slate-900 text-white font-black rounded-2xl shadow-xl transition-all"
                >
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [shopName, setShopName] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(false);

  const handleAuth = async () => {
    setAuthError(null);
    setIsAuthLoading(true);
    try {
      if (authMode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        if (error) throw error;
      } else {
        // 1. Sign Up with Metadata (Triggers DB function)
        const { data: authData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              salon_name: shopName,
              full_name: fullName
            }
          }
        });
        if (signUpError) throw signUpError;
        if (!authData.user) throw new Error("No user created");

        // 2. Tenant & Profile are created automatically via DB Trigger
        // If email confirmation is required, the user will be prompted.
        if (authData.user && !authData.session) {
          setAuthError("Please check your email to confirm your account.");
          return;
        }
      }
    } catch (error: any) {
      console.error("Auth Error:", error);
      setAuthError(error.message || "An unexpected error occurred");
    } finally {
      setIsAuthLoading(false);
    }
  };

  const renderAuth = () => (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] aura-gradient rounded-full opacity-10 blur-[150px]"></div>
      <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] bg-indigo-600 rounded-full opacity-10 blur-[150px]"></div>
      <div
        onClick={() => setView(AppView.INSTITUTIONAL)}
        className="absolute top-8 left-8 flex items-center space-x-3 cursor-pointer group"
      >
        {auraLogo ? (
          <img src={auraLogo} alt="Aura Logo" className="w-10 h-10 object-contain rounded-xl shadow-lg" />
        ) : (
          <div className="w-10 h-10 aura-gradient rounded-xl flex items-center justify-center text-white shadow-lg">
            <i className="fas fa-sparkles text-xl"></i>
          </div>
        )}
        <span className="text-2xl font-bold tracking-tight text-slate-800">Aura</span>
      </div>
      <div className="w-full max-w-xl animate-in zoom-in-95 duration-500">
        <div className="bg-white/80 backdrop-blur-2xl border border-white shadow-2xl rounded-[3rem] overflow-hidden">
          <div className="p-10 md:p-14">
            <div className="text-center mb-10">
              <h2 className="text-4xl font-black text-slate-900 mb-4">{t.authTitle}</h2>
              <p className="text-slate-500 font-medium">{t.authSub}</p>
            </div>
            <div className="flex bg-slate-100 p-1.5 rounded-2xl mb-10 relative">
              <button onClick={() => setAuthMode('signup')} className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all relative z-10 ${authMode === 'signup' ? 'text-indigo-600' : 'text-slate-500'}`}>{t.authSignUp}</button>
              <button onClick={() => setAuthMode('login')} className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all relative z-10 ${authMode === 'login' ? 'text-indigo-600' : 'text-slate-500'}`}>{t.authLogin}</button>
              <div className={`absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-white rounded-xl shadow-md transition-all duration-300 ${authMode === 'signup' ? 'left-1.5' : 'left-[calc(50%+3px)]'}`}></div>
            </div>

            {authError && (
              <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm font-bold border border-red-100 flex items-center gap-2">
                <i className="fas fa-exclamation-circle"></i>
                {authError}
              </div>
            )}

            <div className="space-y-6">
              {authMode === 'signup' && (
                <>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">{t.authName}</label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all font-medium text-slate-700"
                      placeholder="John Doe"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Salon Name</label>
                    <input
                      type="text"
                      value={shopName}
                      onChange={(e) => setShopName(e.target.value)}
                      className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all font-medium text-slate-700"
                      placeholder="Luxe Beauty"
                    />
                  </div>
                </>
              )}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">{t.authEmail}</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all font-medium text-slate-700"
                  placeholder="john@example.com"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">{t.authPassword}</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all font-medium text-slate-700"
                  placeholder="••••••••"
                />
              </div>
              <button
                onClick={handleAuth}
                disabled={isAuthLoading}
                className="w-full py-5 aura-gradient text-white font-black rounded-2xl shadow-xl shadow-indigo-100 hover:scale-[1.02] active:scale-95 transition-all mt-4 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isAuthLoading && <i className="fas fa-circle-notch animate-spin"></i>}
                {authMode === 'signup' ? t.authAction : t.authLogin}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderInstitutional = () => (
    <div className="bg-white overflow-x-hidden">
      <Navigation
        setView={setView}
        currentLanguage={language}
        onLanguageChange={handleLanguageChange}
        logoUrl={auraLogo}
        labels={{
          features: t.navFeatures,
          pricing: t.navPricing,
          login: t.navLogin,
          getStarted: t.navGetStarted
        }}
      />

      {/* 1. HERO SECTION */}
      <section className="relative min-h-screen pt-32 pb-20 flex items-center justify-center bg-slate-50 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] aura-gradient rounded-full opacity-10 blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-600 rounded-full opacity-5 blur-[120px]"></div>

        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10 text-center lg:text-left">
          <div className="animate-in fade-in slide-in-from-left-10 duration-1000">
            <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-indigo-50 border border-indigo-100 mb-8 mx-auto lg:mx-0">
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">Global SaaS 2.0</span>
            </div>
            <h1 className="text-5xl md:text-8xl font-black text-slate-900 leading-[1.05] mb-8">{t.landingHeroTitle}</h1>
            <p className="text-xl text-slate-500 mb-12 max-w-lg leading-relaxed mx-auto lg:mx-0">{t.landingHeroSub}</p>
            <div className="flex flex-col sm:flex-row justify-center lg:justify-start space-y-4 sm:space-y-0 sm:space-x-6">
              <button onClick={() => { setAuthMode('signup'); setView(AppView.AUTH); }} className="px-10 py-5 aura-gradient text-white font-black rounded-2xl shadow-2xl shadow-indigo-200 hover:scale-105 active:scale-95 transition-all">{t.landingCTA} <i className="fas fa-rocket ml-2"></i></button>

              <button
                onClick={handleGenerateLogo}
                disabled={isGeneratingLogo}
                className="px-8 py-5 bg-white border-2 border-slate-200 text-slate-700 font-bold rounded-2xl hover:bg-slate-50 transition-colors flex items-center justify-center disabled:opacity-50"
              >
                <i className={`fas ${isGeneratingLogo ? 'fa-circle-notch animate-spin' : 'fa-wand-magic-sparkles'} mr-3 text-indigo-500`}></i>
                {isGeneratingLogo ? 'Creating Brand...' : t.genLogo}
              </button>
            </div>
          </div>
          <div className="relative animate-in fade-in slide-in-from-right-10 duration-1000 delay-200">
            <div className="relative z-20 rounded-[3.5rem] overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,0.12)] border border-white/50 bg-white/30 backdrop-blur-xl p-4">
              <div className="bg-slate-900 rounded-[3rem] overflow-hidden aspect-video relative group">
                {auraLogo ? (
                  <img src={auraLogo} className="w-full h-full object-contain" alt="Aura Brand" />
                ) : (
                  <img src="https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&q=80&w=1200" className="w-full h-full object-cover opacity-60" alt="Platform Preview" />
                )}
                {!auraLogo && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-20 h-20 aura-gradient rounded-full flex items-center justify-center text-white text-2xl shadow-xl animate-pulse">
                      <i className="fas fa-sparkles"></i>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. TRUST STATS SECTION */}
      <section className="py-16 bg-white border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center opacity-60 text-center">
            {[
              { val: "500+", label: t.statsSalons },
              { val: "1.2M", label: t.statsBookings },
              { val: "15+", label: t.statsLanguages },
              { val: "98%", label: t.statsAccuracy }
            ].map((stat, i) => (
              <div key={i} className="flex flex-col items-center">
                <span className="text-3xl font-black text-slate-900">{stat.val}</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. CORE FEATURES GRID */}
      <section id="features" className="py-32 bg-slate-50 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-24">
            <h2 className="text-5xl md:text-6xl font-black text-slate-900 mb-6 tracking-tight leading-tight">{t.featuresTitle}</h2>
            <p className="text-slate-500 max-w-2xl mx-auto text-lg leading-relaxed">{t.featuresSub}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { icon: 'fa-rocket', title: t.feature1Title, desc: t.feature1Desc, color: 'bg-indigo-500' },
              { icon: 'fa-wand-magic-sparkles', title: t.feature2Title, desc: t.feature2Desc, color: 'aura-gradient' },
              { icon: 'fa-magnifying-glass-chart', title: t.feature3Title, desc: t.feature3Desc, color: 'bg-slate-900' }
            ].map((feature, i) => (
              <div key={i} className="bg-white p-12 rounded-[3.5rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group">
                <div className={`w-16 h-16 ${feature.color} rounded-2xl flex items-center justify-center text-white mb-10 shadow-lg transition-transform group-hover:rotate-12`}>
                  <i className={`fas ${feature.icon} text-2xl`}></i>
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-6">{feature.title}</h3>
                <p className="text-slate-500 leading-relaxed text-sm font-medium">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. AI SHOWCASE SECTION */}
      <section className="py-32 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full aura-gradient opacity-10 blur-[150px]"></div>
        <div className="max-w-7xl mx-auto px-6 relative z-10 flex flex-col lg:flex-row items-center gap-20">
          <div className="flex-1 text-center lg:text-left">
            <div className="inline-block px-4 py-2 rounded-full bg-white/10 border border-white/20 mb-10 text-xs font-bold text-indigo-400 uppercase tracking-widest">
              {t.aiBadge}
            </div>
            <h2 className="text-5xl md:text-7xl font-black mb-12 leading-[1.1]">{t.aiSectionTitle}</h2>
            <div className="space-y-8 mb-16">
              {[t.aiFeature1, t.aiFeature2, t.aiFeature3].map((text, i) => (
                <div key={i} className="flex items-start gap-5">
                  <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center text-green-500 shrink-0 mt-1"><i className="fas fa-check text-[10px]"></i></div>
                  <p className="text-slate-300 font-medium leading-relaxed">{text}</p>
                </div>
              ))}
            </div>
            <button className="px-10 py-5 bg-white text-slate-900 font-black rounded-2xl hover:bg-indigo-50 transition-all hover:scale-105 active:scale-95">
              {t.aiCTA}
            </button>
          </div>
          <div className="flex-1 w-full max-w-lg">
            <div className="bg-white/5 border border-white/10 rounded-[3.5rem] p-10 backdrop-blur-3xl shadow-2xl relative">
              <div className="flex items-center gap-4 mb-10 pb-6 border-b border-white/5">
                <div className="w-14 h-14 aura-gradient rounded-2xl flex items-center justify-center text-white shadow-xl"><i className="fas fa-robot text-xl"></i></div>
                <div>
                  <p className="font-black text-lg leading-tight">{t.aiBotName}</p>
                  <p className="text-green-400 text-xs font-black uppercase tracking-widest mt-1">{t.aiStatus}</p>
                </div>
              </div>
              <div className="space-y-8 mb-10">
                <div className="p-6 rounded-[2rem] bg-white/10 text-sm text-slate-200 ml-auto max-w-[85%] rounded-tr-none font-medium leading-relaxed">{t.aiDemoUser}</div>
                <div className="p-6 rounded-[2rem] bg-indigo-600 text-sm text-white mr-auto max-w-[90%] rounded-tl-none font-bold shadow-xl leading-relaxed">{t.aiDemoBot}</div>
              </div>
              <div className="h-14 bg-white/5 rounded-2xl flex items-center px-6 text-xs text-slate-500 border border-white/5 italic">...</div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. PRICING ARCHITECTURE */}
      <section id="pricing" className="py-32 bg-white relative">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-5xl font-black text-slate-900 mb-8 tracking-tight">{t.pricingTitle}</h2>
          <p className="text-slate-500 mb-24 text-lg max-w-xl mx-auto font-medium">{t.pricingSub}</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              { name: 'Starter', price: '49', features: ['1 Branch', 'Autonomous PWA', 'Basic SEO Generator', 'Multilingual Support'], color: 'border-slate-100' },
              { name: 'Professional', price: '99', features: ['5 Branches', 'AI Concierge Pro', 'Full SEO Domination', 'Priority Support', 'Stripe Connect'], color: 'border-indigo-500 ring-4 ring-indigo-500/10', popular: true },
              { name: 'Elite', price: '249', features: ['Unlimited Branches', 'Academy Module', 'Custom AI Training', 'Dedicated Success Manager', 'API Access'], color: 'border-slate-900 bg-slate-900 text-white' }
            ].map((plan, i) => (
              <div key={i} className={`p-12 rounded-[4rem] border text-left flex flex-col relative ${plan.color} transition-all duration-500 hover:scale-[1.03] shadow-sm hover:shadow-2xl`}>
                {plan.popular && (
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 px-8 py-2.5 aura-gradient text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-2xl border-4 border-white">{t.pricingMostPopular}</div>
                )}
                <h3 className="text-2xl font-black mb-6">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-10">
                  <span className="text-6xl font-black tracking-tighter">€{plan.price}</span>
                  <span className={`${plan.name === 'Elite' ? 'text-slate-400' : 'text-slate-500'} font-black text-sm uppercase tracking-widest`}>/mo</span>
                </div>
                <ul className="space-y-6 mb-12 flex-1">
                  {plan.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-4 text-sm font-bold"><i className={`fas fa-check-circle ${plan.name === 'Elite' ? 'text-indigo-400' : 'text-indigo-500'}`}></i> {f}</li>
                  ))}
                </ul>
                <button onClick={() => { setAuthMode('signup'); setView(AppView.AUTH); }} className={`w-full py-6 rounded-[2.5rem] font-black transition-all hover:scale-[1.02] active:scale-95 ${plan.name === 'Elite' ? 'bg-white text-slate-900 hover:bg-indigo-50' : 'bg-slate-900 text-white hover:shadow-xl'}`}>{t.navGetStarted}</button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. FAQ & FINAL CTA */}
      <section className="py-32 bg-slate-50">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-4xl font-black text-center mb-24 tracking-tight">{t.faqTitle}</h2>
          <div className="space-y-6 mb-32">
            {[
              { q: language === 'pt' ? "O onboarding é realmente autônomo?" : "Is onboarding really autonomous?", a: language === 'pt' ? "Sim. Nosso motor coleta seus dados e constrói o PWA instantaneamente." : "Yes. Our engine pulls your basic business data and builds the PWA structure instantly." },
              { q: language === 'pt' ? "Posso gerenciar múltiplos países?" : "Can I manage multiple countries?", a: language === 'pt' ? "Com certeza. O Aura é multi-tenant e nativo para localização internacional." : "Absolutely. Aura is multi-tenant and localization-native for international scale." }
            ].map((faq, i) => (
              <div key={i} className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm transition-all hover:border-indigo-100">
                <h4 className="font-black text-lg mb-4 text-slate-900">{faq.q}</h4>
                <p className="text-slate-500 text-sm font-medium leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>

          <div className="aura-gradient rounded-[4rem] p-16 md:p-24 text-center text-white relative shadow-2xl animate-in zoom-in-95 duration-700">
            <div className="relative z-10">
              <h2 className="text-5xl md:text-7xl font-black mb-12 leading-tight tracking-tight">{t.ctaTitle}</h2>
              <p className="text-xl text-white/80 mb-16 max-w-lg mx-auto leading-relaxed font-medium">{t.ctaSub}</p>
              <button onClick={() => { setAuthMode('signup'); setView(AppView.AUTH); }} className="px-14 py-7 bg-white text-slate-900 font-black rounded-[2.5rem] text-xl shadow-2xl hover:scale-110 active:scale-95 transition-all flex items-center gap-4 mx-auto">
                {t.ctaButton} <i className="fas fa-arrow-right"></i>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 7. PREMIUM FOOTER */}
      <footer className="py-24 bg-slate-950 text-white">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-20 border-b border-white/5 pb-20 mb-12">
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center space-x-3 mb-10">
              {auraLogo ? (
                <img src={auraLogo} alt="Aura Logo" className="w-12 h-12 object-contain rounded-2xl" />
              ) : (
                <div className="w-12 h-12 aura-gradient rounded-2xl flex items-center justify-center text-white shadow-lg"><i className="fas fa-sparkles text-2xl"></i></div>
              )}
              <span className="text-3xl font-black tracking-tighter">Aura</span>
            </div>
            <p className="text-slate-500 text-sm leading-relaxed font-medium">{t.footerDesc}</p>
          </div>
          <div>
            <h5 className="font-black mb-10 uppercase tracking-widest text-[11px] text-indigo-400">{t.footerProduct}</h5>
            <ul className="space-y-5 text-sm font-bold text-slate-500">
              <li className="hover:text-white cursor-pointer transition-colors">AI Concierge</li>
              <li className="hover:text-white cursor-pointer transition-colors">Global SEO</li>
              <li className="hover:text-white cursor-pointer transition-colors">PWA Generator</li>
              <li className="hover:text-white cursor-pointer transition-colors">Academy</li>
            </ul>
          </div>
          <div>
            <h5 className="font-black mb-10 uppercase tracking-widest text-[11px] text-indigo-400">{t.footerCompany}</h5>
            <ul className="space-y-5 text-sm font-bold text-slate-500">
              <li className="hover:text-white cursor-pointer transition-colors">About Us</li>
              <li className="hover:text-white cursor-pointer transition-colors">Success Stories</li>
              <li className="hover:text-white cursor-pointer transition-colors">Partners</li>
              <li className="hover:text-white cursor-pointer transition-colors">Legal</li>
            </ul>
          </div>
          <div>
            <h5 className="font-black mb-10 uppercase tracking-widest text-[11px] text-indigo-400">{t.footerNewsletter}</h5>
            <p className="text-sm font-medium text-slate-500 mb-8">{t.footerNewsletterSub}</p>
            <div className="flex gap-3">
              <input type="text" className="bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm flex-1 outline-none focus:ring-2 focus:ring-indigo-500/50 font-bold" placeholder={t.footerPlaceholder} />
              <button className="w-14 h-14 aura-gradient rounded-2xl text-white shadow-lg shadow-indigo-500/20"><i className="fas fa-paper-plane"></i></button>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8 text-[11px] font-black uppercase tracking-widest text-slate-600">
          <span>© 2024 Aura Platforms Inc. Global Ready.</span>
          <div className="flex space-x-8">
            <span className="hover:text-indigo-400 cursor-pointer">{t.footerPrivacy}</span>
            <span className="hover:text-indigo-400 cursor-pointer">{t.footerGDPR}</span>
            <span className="hover:text-indigo-400 cursor-pointer">{t.footerTerms}</span>
          </div>
        </div>
      </footer>
    </div>
  );



  const renderPWA = () => (
    <div className="min-h-screen bg-white max-w-md mx-auto relative flex flex-col shadow-2xl overflow-x-hidden">
      <header className="p-5 sticky top-0 bg-white/90 backdrop-blur-xl z-30 border-b border-slate-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {auraLogo ? (
              <img src={auraLogo} alt="Aura Logo" className="w-11 h-11 object-contain rounded-2xl shadow-lg" />
            ) : (
              <div className="w-11 h-11 aura-gradient rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
                <i className="fas fa-sparkles text-lg"></i>
              </div>
            )}
            <div className="flex flex-col">
              <h1 className="font-bold text-slate-900 text-lg leading-tight">{activeTenant.name}</h1>
              <div className="flex items-center gap-1.5">
                <i className="fas fa-location-dot text-[9px] text-indigo-500"></i>
                <span className="text-[11px] font-medium text-slate-400 truncate max-w-[120px]">{activeTenant.address}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="group relative flex items-center bg-slate-50 border border-slate-200/60 rounded-xl">
              <select value={language} onChange={(e) => handleLanguageChange(e.target.value)} className="text-[11px] font-bold pl-2 pr-7 py-2.5 outline-none bg-transparent text-slate-600 uppercase appearance-none cursor-pointer tracking-wider">
                {activeTenant.languages.map(lang => (<option key={lang} value={lang}>{lang}</option>))}
              </select>
              <i className="fas fa-chevron-down text-[8px] text-slate-300 absolute right-2.5 pointer-events-none"></i>
            </div>
            <button onClick={() => setView(AppView.DASHBOARD)} className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-md"><i className="fas fa-user text-xs"></i></button>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6 space-y-8 pb-32">
        <section>
          <div className="relative rounded-[2.5rem] overflow-hidden aspect-[4/3] shadow-xl group">
            <img src="https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=800" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="Hero" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-8">
              <h2 className="text-white text-3xl font-bold mb-2">{t.heroTitle}</h2>
              <p className="text-white/80 text-sm max-w-[200px]">{t.heroDesc}</p>
            </div>
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-slate-900">{t.services}</h3>
            <span className="text-indigo-600 text-sm font-bold bg-indigo-50 px-3 py-1 rounded-full cursor-pointer">{t.seeAll}</span>
          </div>
          <div className="grid grid-cols-1 gap-4">
            {MOCK_SERVICES.map(service => (
              <LazyServiceCard key={service.id} service={service} t={t} onBook={startBooking} />
            ))}
          </div>
        </section>
      </div>

      {renderBookingDrawer()}

      <button onClick={() => setChatOpen(true)} className="fixed bottom-24 right-6 w-16 h-16 aura-gradient text-white rounded-[1.5rem] shadow-2xl flex items-center justify-center z-50 animate-bounce">
        <i className="fas fa-wand-magic-sparkles text-2xl"></i>
      </button>

      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/80 backdrop-blur-2xl border-t border-slate-100 flex items-center justify-around py-5 px-6 z-40 rounded-t-[2.5rem] shadow-lg">
        <button onClick={() => setView(AppView.PWA)} className="text-indigo-600 flex flex-col items-center gap-1">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center"><i className="fas fa-home text-sm"></i></div>
          <span className="text-[10px] font-extrabold uppercase tracking-tighter">{t.home}</span>
        </button>
        <button onClick={() => setBookingStep(1)} className="text-slate-400 flex flex-col items-center gap-1">
          <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center"><i className="fas fa-calendar-alt text-sm"></i></div>
          <span className="text-[10px] font-extrabold uppercase tracking-tighter">{t.book}</span>
        </button>
      </nav>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {view === AppView.INSTITUTIONAL && (
        <>
          {renderInstitutional()}
          {showInstall && (
            <button
              onClick={handleInstallClick}
              className="fixed bottom-6 left-6 z-50 bg-indigo-600 text-white px-6 py-3 rounded-full shadow-2xl font-bold flex items-center space-x-2 hover:scale-105 active:scale-95 transition-all text-sm animate-in fade-in slide-in-from-bottom-4"
            >
              <i className="fas fa-download"></i>
              <span>Install App</span>
            </button>
          )}
        </>
      )}
      {view === AppView.AUTH && renderAuth()}
      {view === AppView.DASHBOARD && (
        <Dashboard
          setView={setView}
          activeTenant={activeTenant}
          auraLogo={auraLogo}
          handleGenerateLogo={handleGenerateLogo}
          isGeneratingLogo={isGeneratingLogo}
          showInstall={showInstall}
          onInstall={handleInstallClick}
          isSuperAdmin={isSuperAdmin}
          onSwitchToAdmin={() => switchTenant(null)}
          user={user}
          onLogout={() => supabase.auth.signOut()}
        />
      )}
      {view === AppView.PWA && renderPWA()}
      {view === AppView.AURA_ADMIN && (
        <AuraAdmin
          onSwitchTenant={switchTenant}
          activeTenantId={tenant?.id}
          onLogout={() => supabase.auth.signOut()}
        />
      )}
    </div>
  );
};

export default App;
