/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Calendar, 
  MapPin, 
  Users, 
  DollarSign, 
  Shield, 
  User as UserIcon, 
  Clipboard, 
  Award, 
  Bell, 
  PlusCircle, 
  CheckCircle, 
  Database, 
  Layers, 
  Smartphone, 
  Download, 
  Plus, 
  Trash2, 
  LogOut, 
  Eye, 
  MessageSquare, 
  Search, 
  Filter, 
  AlertTriangle,
  Send,
  Sliders,
  Check,
  Star,
  BookOpen,
  Image as ImageIcon,
  RefreshCw,
  ArrowUp,
  FileText
} from 'lucide-react';

import { generateEventReportPDF } from './utils/pdfGenerator';

import { 
  TornPaperDivider, 
  SharpButton, 
  PaperCard, 
  BrutalistBadge, 
  BrutalistHeading, 
  BrutalistInput 
} from './components/BrutalistUI';
import AnalyticsCharts from './components/AnalyticsCharts';
import AIChatBot from './components/AIChatBot';
import EventCalendar from './components/EventCalendar';
import TicketQRCode from './components/TicketQRCode';
import QRCode from 'qrcode';

// -------------------------------------------------------------
// Interfaces / State definitions
// -------------------------------------------------------------
import { 
  User, 
  Event, 
  Registration, 
  Ticket, 
  Payment, 
  Certificate, 
  Feedback, 
  VolunteerAssignment, 
  Notification 
} from './types';

export default function App() {
  // -------------------------------------------------------------
  // Global Application State
  // -------------------------------------------------------------
  const [currentUser, setCurrentUser] = useState<User | null>({
    id: 'usr_part_user',
    name: 'Alex Mercer',
    email: 'merilpu37@gmail.com',
    role: 'participant',
    college: 'MIT campus',
    phone: '+1 555-0199',
    avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=200&q=80',
  });

  const scannerInputRef = React.useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<'home' | 'events' | 'pricing' | 'faq' | 'gallery' | 'dashboard' | 'event-details'>('home');
  const [events, setEvents] = useState<Event[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [volunteers, setVolunteers] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);

  // Detailed UI variables
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Forms
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('password');
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Registration Form state
  const [regForm, setRegForm] = useState({
    name: '',
    email: '',
    phone: '',
    college: '',
    department: '',
    interests: '',
    gender: 'Male',
    age: 21,
    paymentGateway: 'stripe' as any,
    customAnswers: {} as Record<string, string>,
  });

  // Event Creation Form State
  const [newEventForm, setNewEventForm] = useState({
    title: '',
    description: '',
    category: 'hackathon' as any,
    banner: '',
    logo: '🔥',
    venue: '',
    google_map_url: '',
    date: '',
    time: '',
    capacity: 100,
    price: 0,
    registration_deadline: '',
    contact_number: '',
    email: '',
    website: '',
    faqs: [] as { q: string; a: string }[],
    sponsors: [] as string[],
    speakers: [] as { name: string; role: string; bio: string }[],
    customQuestions: [] as string[],
    currency: 'USD',
    budget: [] as { item: string; amount: number }[],
  });

  // State arrays for inline FAQ/Speaker additions in Create Event Form
  const [tmpFaq, setTmpFaq] = useState({ q: '', a: '' });
  const [tmpSpeaker, setTmpSpeaker] = useState({ name: '', role: '', bio: '' });
  const [tmpSponsor, setTmpSponsor] = useState('');
  const [tmpQuestion, setTmpQuestion] = useState('');
  const [tmpBudgetItem, setTmpBudgetItem] = useState('');
  const [tmpBudgetAmount, setTmpBudgetAmount] = useState<number>(0);

  // AI Generation Loading states
  const [aiGeneratingDesc, setAiGeneratingDesc] = useState(false);
  const [aiPosterResult, setAiPosterResult] = useState('');
  const [aiGeneratingPoster, setAiGeneratingPoster] = useState(false);
  const [aiFeedbackSummary, setAiFeedbackSummary] = useState('');
  const [aiGeneratingSummary, setAiGeneratingSummary] = useState(false);

  // AI Matchmaking & Networking State
  const [networkingProfile, setNetworkingProfile] = useState({
    college: '',
    department: '',
    interests: '',
  });
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);

  // Volunteer scanner state
  const [scannerInput, setScannerInput] = useState('');
  const [scannerResult, setScannerResult] = useState<{ success: boolean; message: string; data?: any } | null>(null);

  // Feedback form state
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackComments, setFeedbackComments] = useState('');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  // Role quick-switcher helper
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(true);

  // Floating scroll to top state
  const [showScrollToTop, setShowScrollToTop] = useState(false);

  // Global Currency and Language states
  const [currentLanguage, setCurrentLanguage] = useState<string>('EN');
  const [currentCurrency, setCurrentCurrency] = useState<string>('USD');
  const [translating, setTranslating] = useState<boolean>(false);
  const [translatedTexts, setTranslatedTexts] = useState<Record<string, string>>({});

  const currencyRates: Record<string, { symbol: string; rate: number }> = {
    USD: { symbol: '$', rate: 1 },
    EUR: { symbol: '€', rate: 0.92 },
    GBP: { symbol: '£', rate: 0.78 },
    INR: { symbol: '₹', rate: 83.5 },
    JPY: { symbol: '¥', rate: 155.0 },
    CAD: { symbol: 'C$', rate: 1.36 },
  };

  const translateText = async (text: string, targetLangCode: string, cacheKey: string) => {
    if (!text || targetLangCode === 'EN') return text;
    const cacheKeyFull = `${cacheKey}_${targetLangCode}`;
    if (translatedTexts[cacheKeyFull]) return translatedTexts[cacheKeyFull];

    const langNames: Record<string, string> = {
      ES: 'Spanish',
      FR: 'French',
      HI: 'Hindi',
      JA: 'Japanese',
      DE: 'German',
      AR: 'Arabic',
    };
    const targetLanguage = langNames[targetLangCode] || 'English';

    try {
      const res = await fetch('/api/ai/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, targetLanguage }),
      });
      const data = await res.json();
      if (data.translatedText) {
        setTranslatedTexts((prev) => ({ ...prev, [cacheKeyFull]: data.translatedText }));
        return data.translatedText;
      }
    } catch (e) {
      console.error('Translation error:', e);
    }
    return text;
  };

  const getTxt = (text: string, cacheKey: string) => {
    if (currentLanguage === 'EN') return text;
    const cacheKeyFull = `${cacheKey}_${currentLanguage}`;
    return translatedTexts[cacheKeyFull] || text;
  };

  const formatPrice = (usdPrice: number) => {
    const data = currencyRates[currentCurrency] || { symbol: '$', rate: 1 };
    const converted = usdPrice * data.rate;
    if (converted === 0) return 'FREE';
    return `${data.symbol}${converted.toFixed(2)}`;
  };

  useEffect(() => {
    if (currentLanguage === 'EN') return;
    
    const translateActiveData = async () => {
      setTranslating(true);
      
      // Translate selected event if any
      if (selectedEvent) {
        await translateText(selectedEvent.title, currentLanguage, `evt_${selectedEvent.id}_title`);
        await translateText(selectedEvent.description, currentLanguage, `evt_${selectedEvent.id}_desc`);
        if (selectedEvent.faq) {
          for (let i = 0; i < selectedEvent.faq.length; i++) {
            await translateText(selectedEvent.faq[i].q, currentLanguage, `evt_${selectedEvent.id}_faq_q_${i}`);
            await translateText(selectedEvent.faq[i].a, currentLanguage, `evt_${selectedEvent.id}_faq_a_${i}`);
          }
        }
      }

      // Translate all event titles and descriptions
      for (const evt of events) {
        await translateText(evt.title, currentLanguage, `evt_${evt.id}_title`);
        await translateText(evt.description, currentLanguage, `evt_${evt.id}_desc`);
      }
      
      setTranslating(false);
    };

    translateActiveData();
  }, [currentLanguage, selectedEvent, events]);

  // -------------------------------------------------------------
  // API Core loaders
  // -------------------------------------------------------------
  const fetchAllData = async () => {
    try {
      const [resEvt, resReg, resTkt, resPay, resCert, resFb, resVol, resUsers] = await Promise.all([
        fetch('/api/events').then((r) => r.json()),
        fetch('/api/registrations').then((r) => r.json()),
        fetch('/api/tickets').then((r) => r.json()),
        fetch('/api/payments').then((r) => r.json()),
        fetch('/api/certificates').then((r) => r.json()),
        fetch('/api/feedback').then((r) => r.json()),
        fetch('/api/volunteers').then((r) => r.json()),
        fetch('/api/admin/users').then((r) => r.json()),
      ]);

      setEvents(resEvt);
      setRegistrations(resReg);
      setTickets(resTkt);
      setPayments(resPay);
      setCertificates(resCert);
      setFeedbacks(resFb);
      setVolunteers(resVol);
      setAllUsers(resUsers);

      if (currentUser) {
        const resNotif = await fetch(`/api/notifications/${currentUser.id}`).then((r) => r.json());
        setNotifications(resNotif);
      }
    } catch (err) {
      console.error('Error fetching data from MERN API server:', err);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, [currentUser]);

  // Initial user prepopulate inside form
  useEffect(() => {
    if (currentUser) {
      setRegForm((prev) => ({
        ...prev,
        name: currentUser.name,
        email: currentUser.email,
        phone: currentUser.phone || '',
        college: currentUser.college || '',
        department: currentUser.department || '',
        interests: currentUser.interests || '',
      }));
    }
  }, [currentUser]);

  // Synchronize AI networking profile with current user or registrations
  useEffect(() => {
    if (currentUser) {
      const myRegs = registrations.filter((r) => r.user_id === currentUser.id);
      let col = currentUser.college || '';
      let dept = '';
      let ints = '';
      
      if (myRegs.length > 0) {
        // Grab fields from latest registration
        const latestReg = myRegs[myRegs.length - 1];
        if (latestReg.fields) {
          col = latestReg.fields.college || col;
          dept = latestReg.fields.department || '';
          ints = latestReg.fields.interests || '';
        }
      }

      setNetworkingProfile({
        college: col,
        department: dept,
        interests: ints,
      });
    }
  }, [currentUser, registrations]);

  // Handle window scroll to toggle scroll-to-top button visibility
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 500) {
        setShowScrollToTop(true);
      } else {
        setShowScrollToTop(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Keyboard shortcut listener (CMD+K / CTRL+K) to focus QR scanner input field
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isShortcut = (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k';
      if (isShortcut) {
        e.preventDefault();
        if (scannerInputRef.current) {
          scannerInputRef.current.focus();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // -------------------------------------------------------------
  // Operations & API Triggers
  // -------------------------------------------------------------
  const handleLogin = async (e?: React.FormEvent, presetEmail?: string) => {
    if (e) e.preventDefault();
    const targetEmail = presetEmail || loginEmail;

    if (!targetEmail) return;

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: targetEmail, password: 'password' }),
      });
      const data = await response.json();
      if (data.error) {
        // Fallback simulate social auto-login if user role switcher is used
        const socialResponse = await fetch('/api/auth/social', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: targetEmail, name: targetEmail.split('@')[0].toUpperCase() }),
        });
        const socialData = await socialResponse.json();
        setCurrentUser(socialData.user);
      } else {
        setCurrentUser(data.user);
      }
      setShowLoginModal(false);
      setActiveTab('dashboard');
    } catch (err) {
      console.error('Login simulation failed', err);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setActiveTab('home');
  };

  const handleRegisterToEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEvent || !currentUser) return;

    try {
      const payload = {
        userId: currentUser.id,
        eventId: selectedEvent.id,
        fields: {
          name: regForm.name,
          email: regForm.email,
          phone: regForm.phone,
          college: regForm.college,
          department: regForm.department || '',
          interests: regForm.interests || '',
          gender: regForm.gender,
          age: regForm.age,
          custom_answers: regForm.customAnswers,
        },
        paymentGateway: regForm.paymentGateway,
        amount: selectedEvent.price,
      };

      const response = await fetch('/api/registrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        await fetchAllData();
        setActiveTab('dashboard');
        setSelectedEvent(null);
        setRegForm((prev) => ({ ...prev, customAnswers: {} }));
      }
    } catch (err) {
      console.error('Registration failed', err);
    }
  };

  const fetchNetworkingRecommendations = async () => {
    if (!currentUser) return;
    setLoadingRecommendations(true);
    try {
      const response = await fetch('/api/ai/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          college: networkingProfile.college,
          department: networkingProfile.department,
          interests: networkingProfile.interests,
        }),
      });
      if (response.ok) {
        const data = await response.json();
        setRecommendations(data.recommendations || []);
      } else {
        console.error('Failed to load networking recommendations');
      }
    } catch (err) {
      console.error('Error fetching recommendations:', err);
    } finally {
      setLoadingRecommendations(false);
    }
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    try {
      const payload = {
        ...newEventForm,
        faq: newEventForm.faqs,
        created_by: currentUser.id,
      };

      const response = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        await fetchAllData();
        // Reset form
        setNewEventForm({
          title: '',
          description: '',
          category: 'hackathon',
          banner: '',
          logo: '🔥',
          venue: '',
          google_map_url: '',
          date: '',
          time: '',
          capacity: 100,
          price: 0,
          registration_deadline: '',
          contact_number: '',
          email: '',
          website: '',
          faqs: [],
          sponsors: [],
          speakers: [],
          customQuestions: [],
          currency: 'USD',
          budget: [],
        });
        setAiPosterResult('');
        setActiveTab('dashboard');
      }
    } catch (err) {
      console.error('Event creation error', err);
    }
  };

  const handleAIWriteDescription = async () => {
    if (!newEventForm.title) return;
    setAiGeneratingDesc(true);
    try {
      const response = await fetch('/api/ai/describe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newEventForm.title, category: newEventForm.category }),
      });
      const data = await response.json();
      if (data.description) {
        setNewEventForm((prev) => ({ ...prev, description: data.description }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAiGeneratingDesc(false);
    }
  };

  const handleAIGeneratePoster = async () => {
    if (!newEventForm.title) return;
    setAiGeneratingPoster(true);
    try {
      const response = await fetch('/api/ai/poster', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newEventForm.title, description: newEventForm.description }),
      });
      const data = await response.json();
      if (data.posterText) {
        setAiPosterResult(data.posterText);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAiGeneratingPoster(false);
    }
  };

  const handleAISummarizeFeedback = async (eventId: string) => {
    setAiGeneratingSummary(true);
    try {
      const response = await fetch('/api/ai/summarize-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId }),
      });
      const data = await response.json();
      if (data.summary) {
        setAiFeedbackSummary(data.summary);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAiGeneratingSummary(false);
    }
  };

  const handleScanTicket = async (e?: React.FormEvent, customCode?: string) => {
    if (e) e.preventDefault();
    const qrCode = customCode || scannerInput;
    if (!qrCode) return;

    try {
      const response = await fetch('/api/tickets/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qrCodeOrId: qrCode }),
      });
      const data = await response.json();
      if (data.error) {
        setScannerResult({ success: false, message: data.error, data });
      } else {
        setScannerResult({ success: true, message: data.message, data });
        await fetchAllData();
      }
    } catch (err) {
      setScannerResult({ success: false, message: 'Server transmission error' });
    } finally {
      setScannerInput('');
    }
  };

  const handleFeedbackSubmit = async (e: React.FormEvent, regId: string, eventId: string) => {
    e.preventDefault();
    setSubmittingFeedback(true);
    try {
      const payload = {
        registrationId: regId,
        eventId,
        userId: currentUser?.id,
        rating: feedbackRating,
        overallExperience: feedbackRating,
        venueRating: feedbackRating,
        foodRating: feedbackRating,
        speakerRating: feedbackRating,
        comments: feedbackComments,
      };

      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setFeedbackComments('');
        await fetchAllData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const handleToggleAdminStatus = async (eventId: string, currentStatus: string) => {
    try {
      const targetStatus = currentStatus === 'active' ? 'pending' : 'active';
      await fetch(`/api/events/${eventId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: targetStatus }),
      });
      await fetchAllData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleModifyUserRole = async (userId: string, targetRole: string) => {
    try {
      await fetch(`/api/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: targetRole }),
      });
      await fetchAllData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAsRead = async (notId: string) => {
    try {
      await fetch(`/api/notifications/${notId}/read`, {
        method: 'PUT',
      });
      await fetchAllData();
    } catch (err) {
      console.error(err);
    }
  };

  // Simulated Certificate & Ticket Download
  const triggerPassDownload = async (ticket: Ticket, event: Event) => {
    try {
      // Create a canvas to draw the full brutalist ticket
      const canvas = document.createElement('canvas');
      canvas.width = 640;
      canvas.height = 420;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Fill background
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw thick outer border
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 10;
      ctx.strokeRect(5, 5, canvas.width - 10, canvas.height - 10);

      // Draw top bar
      ctx.fillStyle = '#F04B23'; // Signatures red-orange
      ctx.fillRect(10, 10, canvas.width - 20, 80);

      // Border under top bar
      ctx.beginPath();
      ctx.moveTo(10, 90);
      ctx.lineTo(canvas.width - 10, 90);
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 6;
      ctx.stroke();

      // Top bar title text
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'black 34px "Space Grotesk", sans-serif';
      ctx.fillText('EVENIA OFFICIAL PASS', 30, 62);

      // Category badge outline
      ctx.fillStyle = '#000000';
      ctx.fillRect(450, 26, 160, 36);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 11px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(event.category.toUpperCase(), 530, 48);
      ctx.textAlign = 'left'; // Reset to default

      // Ticket content fields (Left Column)
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 11px "JetBrains Mono", monospace';
      ctx.fillText('EVENT TITLE', 40, 130);
      
      ctx.font = 'bold 18px "Space Grotesk", sans-serif';
      const eventTitle = event.title.toUpperCase();
      const firstLine = eventTitle.length > 25 ? eventTitle.substring(0, 25) + '...' : eventTitle;
      ctx.fillText(firstLine, 40, 155);

      ctx.fillStyle = '#666666';
      ctx.font = 'bold 10px "JetBrains Mono", monospace';
      ctx.fillText('DATE AND TIME', 40, 195);
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 15px "Space Grotesk", sans-serif';
      ctx.fillText(`${event.date} // ${event.time}`, 40, 218);

      ctx.fillStyle = '#666666';
      ctx.font = 'bold 10px "JetBrains Mono", monospace';
      ctx.fillText('STATION / VENUE', 40, 258);
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 14px "Space Grotesk", sans-serif';
      ctx.fillText(event.venue.toUpperCase(), 40, 280);

      ctx.fillStyle = '#666666';
      ctx.font = 'bold 10px "JetBrains Mono", monospace';
      ctx.fillText('SEAT ASSIGNMENT', 40, 320);
      ctx.fillStyle = '#F04B23';
      ctx.font = 'bold 18px "Space Grotesk", sans-serif';
      ctx.fillText(ticket.seat_number || 'GENERAL ADMISSION', 40, 342);

      // Dash split divider
      ctx.beginPath();
      ctx.setLineDash([8, 6]);
      ctx.moveTo(420, 90);
      ctx.lineTo(420, 410);
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 4;
      ctx.stroke();
      ctx.setLineDash([]); // clear dash

      // Load QR Code dynamically onto right column
      const qrDataUrl = await QRCode.toDataURL(ticket.qr_code, {
        margin: 1,
        width: 180,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });

      const qrImg = new Image();
      qrImg.src = qrDataUrl;
      qrImg.onload = () => {
        // Draw image on canvas
        ctx.drawImage(qrImg, 440, 120, 160, 160);

        // Under QR Details
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 10px "JetBrains Mono", monospace';
        ctx.fillText('PASS CODE ID:', 445, 310);
        ctx.fillStyle = '#F04B23';
        ctx.font = 'bold 12px "JetBrains Mono", monospace';
        ctx.fillText(ticket.qr_code, 445, 328);

        ctx.fillStyle = '#888888';
        ctx.font = 'bold 9px "JetBrains Mono", monospace';
        ctx.fillText('GATE ENTRY QR VALIDATION', 445, 360);
        ctx.fillText('DO NOT FOLD OR MUTILATE', 445, 375);
        ctx.fillText('POWERED BY EVENIA PLATFORM', 445, 390);

        // Download PNG Action
        const link = document.createElement('a');
        link.download = `ticket-${ticket.qr_code}.png`;
        link.href = canvas.toDataURL('image/png');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      };
    } catch (err) {
      console.error('Error generating image pass download:', err);
      // Fail-safe text file fallback
      const textContent = `EVENIA ENTRY PASS: ${event.title} | ${ticket.qr_code}`;
      const element = document.createElement("a");
      const file = new Blob([textContent], {type: 'text/plain'});
      element.href = URL.createObjectURL(file);
      element.download = `ticket-${ticket.qr_code}.txt`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    }
  };

  const triggerCertificateDownload = (cert: Certificate, eventName: string) => {
    const textContent = `
===================================================================
                     CERTIFICATE OF ACHIEVEMENT
===================================================================
This is to certify that:
                       ${cert.recipient_name.toUpperCase()}

has successfully participated in:
                       ${eventName.toUpperCase()}

held on ${cert.issue_date} under peer review & elite compiler verification.

Ref No: ${cert.id.toUpperCase()}
Issued by: Evenia Brutalist Protocol & Org Committee
===================================================================
`;
    const element = document.createElement("a");
    const file = new Blob([textContent], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `certificate-${cert.id}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // Simulated CSV report generator
  const triggerCSVDownload = (eventName: string, dataArray: any[]) => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "ID,Name,Email,College,Registration Date,Ticket Type,Status\r\n";
    
    dataArray.forEach((row) => {
      csvContent += `"${row.id}","${row.fields?.name}","${row.fields?.email}","${row.fields?.college}","${row.registration_date}","${row.status}"\r\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `registrants-${eventName.toLowerCase().replace(/\s+/g, '-')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // -------------------------------------------------------------
  // Filter & Search Logic
  // -------------------------------------------------------------
  const filteredEvents = events.filter((evt) => {
    const matchesCategory = categoryFilter === 'all' || evt.category === categoryFilter;
    const matchesSearch = evt.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          evt.venue.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          evt.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const participantRegisteredEvents = registrations.filter((reg) => reg.user_id === currentUser?.id);

  // -------------------------------------------------------------
  // Visual Renderers
  // -------------------------------------------------------------
  return (
    <div className="bg-[#0F0F10] text-white min-h-screen font-sans flex flex-col relative select-none">
      {/* Global Paper Texture Overlay (Subtle Grain) */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] z-0"></div>

      {/* -------------------------------------------------------------
          TOP BAR: ROLE SWITCHER (For review compliance)
          ------------------------------------------------------------- */}
      {showRoleSwitcher && (
        <div className="bg-[#F04B23] text-black py-2 px-4 flex flex-wrap items-center justify-between border-b-4 border-black font-mono-custom text-xs font-black uppercase z-50">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4" />
            <span>Developer Workspace Quick Switcher:</span>
          </div>
          <div className="flex flex-wrap gap-1.5 mt-1 sm:mt-0">
            <button 
              onClick={() => {
                setCurrentUser(null);
                setActiveTab('home');
              }}
              className={`px-3 py-1 border border-black ${!currentUser ? 'bg-black text-white' : 'bg-white hover:bg-black hover:text-white'}`}
            >
              Public Guest
            </button>
            <button 
              onClick={() => {
                handleLogin(undefined, 'merilpu37@gmail.com');
              }}
              className={`px-3 py-1 border border-black ${currentUser?.role === 'participant' ? 'bg-black text-white' : 'bg-white hover:bg-black hover:text-white'}`}
            >
              Participant User
            </button>
            <button 
              onClick={() => {
                handleLogin(undefined, 'volunteer@evenia.com');
              }}
              className={`px-3 py-1 border border-black ${currentUser?.role === 'volunteer' ? 'bg-black text-white' : 'bg-white hover:bg-black hover:text-white'}`}
            >
              Volunteer Code
            </button>
            <button 
              onClick={() => {
                handleLogin(undefined, 'organizer@evenia.com');
              }}
              className={`px-3 py-1 border border-black ${currentUser?.role === 'organizer' ? 'bg-black text-white' : 'bg-white hover:bg-black hover:text-white'}`}
            >
              Organizer Panel
            </button>
            <button 
              onClick={() => {
                handleLogin(undefined, 'admin@evenia.com');
              }}
              className={`px-3 py-1 border border-black ${currentUser?.role === 'admin' ? 'bg-black text-white' : 'bg-white hover:bg-black hover:text-white'}`}
            >
              Super Admin
            </button>
          </div>
          <button 
            onClick={() => setShowRoleSwitcher(false)}
            className="text-black font-black hover:underline text-[10px] ml-4"
          >
            [HIDE]
          </button>
        </div>
      )}

      {/* -------------------------------------------------------------
          MAIN NAVIGATION HEADER
          ------------------------------------------------------------- */}
      <nav id="navbar" className="flex items-center justify-between px-6 md:px-12 py-6 border-b-4 border-black bg-[#1A1A1A] z-10 sticky top-0">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('home')}>
          <div className="w-10 h-10 bg-[#F04B23] flex items-center justify-center font-black text-black text-2xl italic border-2 border-black shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]">
            E
          </div>
          <div>
            <span className="text-3xl font-bebas font-black tracking-tighter uppercase text-white">Evenia</span>
            <span className="hidden sm:inline-block text-[9px] font-mono-custom text-[#F04B23] tracking-widest uppercase ml-2 bg-black px-1.5 py-0.5 border border-white/10">EMS v2.4</span>
          </div>
        </div>

        {/* Desktop Links */}
        <div className="hidden md:flex gap-8 text-xs font-mono-custom tracking-widest uppercase font-black">
          <button 
            onClick={() => setActiveTab('home')} 
            className={`cursor-pointer transition-colors ${activeTab === 'home' ? 'text-[#F04B23] underline' : 'hover:text-[#F04B23]'}`}
          >
            Home
          </button>
          <button 
            onClick={() => {
              setCategoryFilter('all');
              setActiveTab('events');
            }} 
            className={`cursor-pointer transition-colors ${activeTab === 'events' ? 'text-[#F04B23] underline' : 'hover:text-[#F04B23]'}`}
          >
            Discover
          </button>
          <button 
            onClick={() => setActiveTab('pricing')} 
            className={`cursor-pointer transition-colors ${activeTab === 'pricing' ? 'text-[#F04B23] underline' : 'hover:text-[#F04B23]'}`}
          >
            Pricing
          </button>
          <button 
            onClick={() => setActiveTab('faq')} 
            className={`cursor-pointer transition-colors ${activeTab === 'faq' ? 'text-[#F04B23] underline' : 'hover:text-[#F04B23]'}`}
          >
            FAQ
          </button>
          <button 
            onClick={() => setActiveTab('gallery')} 
            className={`cursor-pointer transition-colors ${activeTab === 'gallery' ? 'text-[#F04B23] underline' : 'hover:text-[#F04B23]'}`}
          >
            Gallery
          </button>
          {currentUser && (
            <button 
              onClick={() => setActiveTab('dashboard')} 
              className={`cursor-pointer text-[#4AA8D8] uppercase transition-colors ${activeTab === 'dashboard' ? 'underline font-black' : 'hover:text-white'}`}
            >
              Dashboard ⚡
            </button>
          )}
        </div>

        {/* User profile action trigger */}
        <div className="flex items-center gap-2 md:gap-4">
          
          {/* Global Language Selector */}
          <div className="relative flex items-center gap-1 bg-black border-2 border-black px-2 py-1">
            <span className="text-[10px] font-mono-custom text-[#F04B23] font-bold">🌐</span>
            <select
              value={currentLanguage}
              onChange={(e) => setCurrentLanguage(e.target.value)}
              className="bg-transparent text-white font-mono-custom text-[10px] uppercase font-black focus:outline-none cursor-pointer"
              title="Select Language"
            >
              <option value="EN" className="bg-[#1A1A1A] text-white">EN</option>
              <option value="ES" className="bg-[#1A1A1A] text-white">ES</option>
              <option value="FR" className="bg-[#1A1A1A] text-white">FR</option>
              <option value="HI" className="bg-[#1A1A1A] text-white">HI</option>
              <option value="JA" className="bg-[#1A1A1A] text-white">JA</option>
              <option value="DE" className="bg-[#1A1A1A] text-white">DE</option>
              <option value="AR" className="bg-[#1A1A1A] text-white">AR</option>
            </select>
          </div>

          {/* Global Currency Selector */}
          <div className="relative flex items-center gap-1 bg-black border-2 border-black px-2 py-1">
            <span className="text-[10px] font-mono-custom text-[#4AA8D8] font-bold">$</span>
            <select
              value={currentCurrency}
              onChange={(e) => setCurrentCurrency(e.target.value)}
              className="bg-transparent text-white font-mono-custom text-[10px] uppercase font-black focus:outline-none cursor-pointer"
              title="Select Currency"
            >
              <option value="USD" className="bg-[#1A1A1A] text-white">USD</option>
              <option value="EUR" className="bg-[#1A1A1A] text-white">EUR</option>
              <option value="GBP" className="bg-[#1A1A1A] text-white">GBP</option>
              <option value="INR" className="bg-[#1A1A1A] text-white">INR</option>
              <option value="JPY" className="bg-[#1A1A1A] text-white">JPY</option>
              <option value="CAD" className="bg-[#1A1A1A] text-white">CAD</option>
            </select>
          </div>

          {translating && (
            <span className="hidden lg:inline-block text-[8px] font-mono-custom text-black bg-[#F04B23] px-1 font-black animate-pulse">
              AI LOCALIZING...
            </span>
          )}

          {currentUser ? (
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-xs font-black uppercase text-white">{currentUser.name}</span>
                <span className="text-[9px] font-mono-custom uppercase tracking-wider text-[#F04B23]">
                  {currentUser.role.toUpperCase()}
                </span>
              </div>
              <img 
                src={currentUser.avatar || 'https://api.dicebear.com/7.x/identicon/svg?seed=user'} 
                alt="Avatar" 
                className="w-10 h-10 border-2 border-black bg-white"
                onClick={() => setActiveTab('dashboard')}
              />
              <button 
                onClick={handleLogout}
                className="bg-black border border-white/20 p-2 hover:bg-[#F04B23] hover:text-black hover:border-black cursor-pointer"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button 
              onClick={() => setShowLoginModal(true)}
              className="px-6 py-2.5 bg-white text-black font-black text-xs tracking-widest hover:bg-[#F04B23] hover:text-white hover:border-black border-2 border-transparent transition-all cursor-pointer font-mono-custom"
            >
              SIGN IN
            </button>
          )}
        </div>
      </nav>

      {/* -------------------------------------------------------------
          HERO & HOME PAGE VIEW
          ------------------------------------------------------------- */}
      {activeTab === 'home' && (
        <div id="home-view" className="flex-1 flex flex-col">
          {/* Main Hero grid layout */}
          <div className="relative border-b-4 border-black bg-[#0F0F10] overflow-hidden py-16 px-6 md:px-16 flex flex-col md:flex-row items-center justify-between gap-12">
            
            {/* The absolute brutalist badge */}
            <div className="absolute top-8 left-8 transform -rotate-3 bg-[#F04B23] text-black px-4 py-1.5 font-sans font-black text-xs tracking-widest uppercase z-10 border border-black shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]">
              Enterprise Grade EMS
            </div>

            {/* Title section with magazine display typography */}
            <div className="flex-1 max-w-3xl pt-6">
              <h1 className="text-[80px] md:text-[130px] font-black leading-[0.82] tracking-[-0.05em] uppercase flex flex-col italic text-white">
                <span className="block">PLAN.</span>
                <span className="block text-[#F04B23] ml-12 md:ml-20">MANAGE.</span>
                <span className="block -mt-1 md:-mt-3">PROMOTE.</span>
              </h1>
              
              <p className="text-gray-400 font-sans font-medium text-sm md:text-base leading-relaxed max-w-md mt-8 italic">
                More than a registration site. Evenia is an elite editorial workspace for community meetups, massive university hackathons, corporate symposiums, and cultural festivals. Built on direct execution rules.
              </p>

              <div className="mt-8 flex flex-wrap gap-4">
                <SharpButton variant="primary" onClick={() => { setCategoryFilter('all'); setActiveTab('events'); }}>
                  <Search className="w-4 h-4" /> Discover Events
                </SharpButton>
                {currentUser?.role === 'organizer' || currentUser?.role === 'admin' ? (
                  <SharpButton variant="outline" onClick={() => setActiveTab('dashboard')} className="text-white border-white hover:text-[#0F0F10] hover:bg-white">
                    Create Event Workspace
                  </SharpButton>
                ) : (
                  <SharpButton variant="outline" onClick={() => setShowLoginModal(true)} className="text-white border-white hover:text-[#0F0F10] hover:bg-white">
                    Organizer Portal login
                  </SharpButton>
                )}
              </div>
            </div>

            {/* Right highlight card - Magazine cutout overlapping block */}
            <div className="w-full md:w-[350px] relative shrink-0">
              <div className="bg-white text-black p-1 transform rotate-2 shadow-[12px_12px_0px_0px_rgba(240,75,35,1)] border-4 border-black relative">
                <div className="bg-[#4AA8D8] text-black font-mono-custom text-[9px] font-black uppercase px-2 py-0.5 absolute -top-3.5 -right-2.5 border border-black transform rotate-6">
                  Featured Event
                </div>
                <div className="border-2 border-black p-5">
                  <div className="flex justify-between items-start mb-4">
                    <BrutalistBadge variant="primary">HACKATHON</BrutalistBadge>
                    <span className="font-mono-custom text-xs font-black italic">JULY 20</span>
                  </div>
                  <h3 className="text-3xl font-black uppercase leading-tight tracking-tighter mb-4 text-black">
                    {getTxt('GLITCH HACKATHON 2026', 'evt_evt_glitch_title')}
                  </h3>
                  <p className="text-[11px] leading-snug font-bold opacity-80 mb-6 font-mono-custom">
                    {getTxt('Main Arena Hall, MIT campus', 'evt_evt_glitch_venue')} / 36 Hrs of Chaos
                  </p>
                  <div className="border-t-2 border-black pt-4 flex justify-between items-center">
                    <div className="text-2xl font-black italic text-black">{formatPrice(events.find(e => e.id === 'evt_glitch')?.price || 0)}</div>
                    <button 
                      onClick={() => {
                        const glitch = events.find((e) => e.id === 'evt_glitch');
                        if (glitch) {
                          setSelectedEvent(glitch);
                          setActiveTab('event-details');
                        }
                      }}
                      className="w-10 h-10 border-2 border-black bg-black text-white hover:bg-[#F04B23] hover:text-black flex items-center justify-center font-black transition-all cursor-pointer"
                    >
                      →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <TornPaperDivider color="#1A1A1A" height={24} />

          {/* Core capability overview stats row */}
          <div className="bg-[#1A1A1A] py-12 px-6 border-b-4 border-black">
            <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="border border-white/10 p-6 relative group bg-[#0F0F10]">
                <span className="block text-5xl font-black italic text-[#F04B23]">12K+</span>
                <span className="block text-xs font-bold uppercase opacity-50 tracking-widest mt-2 font-mono-custom">Active Attendees</span>
                <p className="text-xs text-gray-400 mt-2 italic">Scattered across collegiate hackathons and tech expos worldwide.</p>
              </div>
              <div className="border border-white/10 p-6 relative group bg-[#0F0F10]">
                <span className="block text-5xl font-black italic text-[#4AA8D8]">450+</span>
                <span className="block text-xs font-bold uppercase opacity-50 tracking-widest mt-2 font-mono-custom">Hosted Events</span>
                <p className="text-xs text-gray-400 mt-2 italic">From lightning coding fests to full-scale music & charity exhibitions.</p>
              </div>
              <div className="border border-white/10 p-6 relative group bg-[#0F0F10]">
                <span className="block text-5xl font-black italic text-[#F59E0B]">99.8%</span>
                <span className="block text-xs font-bold uppercase opacity-50 tracking-widest mt-2 font-mono-custom">QR Scan Rate</span>
                <p className="text-xs text-gray-400 mt-2 italic">Near-instant processing with automatic duplicate scan rejection logs.</p>
              </div>
              <div className="border border-white/10 p-6 relative group bg-[#0F0F10]">
                <span className="block text-5xl font-black italic text-[#10B981]">$150K</span>
                <span className="block text-xs font-bold uppercase opacity-50 tracking-widest mt-2 font-mono-custom">Processed Sales</span>
                <p className="text-xs text-gray-400 mt-2 italic">Safe, decoupled transactions via custom Stripe & Razorpay simulation API.</p>
              </div>
            </div>
          </div>

          {/* Live Interactive Event Calendar Section */}
          <div className="py-12 px-6 max-w-7xl mx-auto w-full">
            <EventCalendar 
              events={events} 
              onSelectEvent={(evt) => {
                setSelectedEvent(evt);
                setActiveTab('event-details');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }} 
            />
          </div>

          <TornPaperDivider color="#1A1A1A" height={24} />

          {/* Quick Discover Showcase Grid */}
          <div className="py-16 px-6 max-w-7xl mx-auto w-full flex-1">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
              <div>
                <div className="text-xs font-mono-custom uppercase tracking-widest text-[#F04B23] mb-2 font-bold">LIVE DIRECTORY</div>
                <h2 className="text-5xl font-black uppercase text-white tracking-tight leading-none">UPCOMING MEETS</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {['all', 'hackathon', 'coding', 'workshop', 'gaming', 'conference'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => {
                      setCategoryFilter(cat);
                      setActiveTab('events');
                    }}
                    className={`px-4 py-1.5 font-mono-custom text-xs font-bold uppercase tracking-wider border-2 border-black rounded-none cursor-pointer ${
                      categoryFilter === cat ? 'bg-[#F04B23] text-black font-black' : 'bg-[#1A1A1A] hover:bg-black text-white'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Cards grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {events.slice(0, 3).map((evt) => (
                <div 
                  key={evt.id}
                  className="bg-[#1A1A1A] border-4 border-[#0F0F10] shadow-[6px_6px_0px_0px_rgba(240,75,35,0.3)] hover:shadow-[6px_6px_0px_0px_rgba(240,75,35,1)] hover:-translate-y-1 transition-all flex flex-col text-white"
                >
                  <div className="h-48 overflow-hidden relative border-b-4 border-black">
                    <img src={evt.banner} alt={evt.title} className="w-full h-full object-cover grayscale contrast-125" />
                    <div className="absolute top-4 left-4 bg-black text-white border-2 border-[#F04B23] px-2.5 py-1 text-[10px] font-mono-custom uppercase tracking-widest">
                      {evt.category}
                    </div>
                  </div>
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <span className="font-mono-custom text-xs text-[#F04B23] font-bold block mb-1 uppercase">
                        📅 {evt.date} • {evt.time}
                      </span>
                      <h3 className="text-2xl font-black uppercase text-white leading-tight tracking-tight mb-2 hover:text-[#F04B23] transition-colors">
                        {getTxt(evt.title, `evt_${evt.id}_title`)}
                      </h3>
                      <p className="text-xs text-gray-400 line-clamp-3 mb-4 italic font-medium">
                        {getTxt(evt.description, `evt_${evt.id}_desc`)}
                      </p>
                    </div>
                    <div className="border-t border-white/10 pt-4 flex items-center justify-between">
                      <span className="text-lg font-mono-custom font-black text-white">
                        {formatPrice(evt.price)}
                      </span>
                      <SharpButton 
                        variant="primary" 
                        onClick={() => {
                          setSelectedEvent(evt);
                          setActiveTab('event-details');
                        }}
                        className="py-1.5 px-3 text-[10px]"
                      >
                        VIEW DETAILS
                      </SharpButton>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-12 text-center">
              <SharpButton variant="outline" onClick={() => { setCategoryFilter('all'); setActiveTab('events'); }} className="mx-auto text-white border-white">
                VIEW ALL VERIFIED SESSIONS ({events.length})
              </SharpButton>
            </div>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------
          EVENTS LIST VIEW (DISCOVER)
          ------------------------------------------------------------- */}
      {activeTab === 'events' && (
        <div id="events-view" className="max-w-7xl mx-auto w-full px-6 py-12 flex-1">
          <div className="border-b-4 border-black pb-8 mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <BrutalistHeading level={1} className="text-white">VERIFIED SESSIONS</BrutalistHeading>
              <p className="text-xs font-mono-custom uppercase tracking-wider text-[#F04B23] mt-2 font-bold">
                FILTER THROUGH COLLABORATIONS, SPRINT CODES, AND EXPOS
              </p>
            </div>
            
            {/* Search filter input */}
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <div className="relative flex-1 sm:w-64">
                <input
                  type="text"
                  placeholder="SEARCH KEYWORDS..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#1A1A1A] border-2 border-black text-white p-3 font-mono-custom text-xs placeholder-gray-500 uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-[#F04B23]"
                />
                <Search className="w-4 h-4 text-gray-500 absolute right-3 top-3.5" />
              </div>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-[#1A1A1A] border-2 border-black text-white p-3 font-mono-custom text-xs uppercase tracking-widest focus:outline-none"
              >
                <option value="all">ALL CATEGORIES</option>
                <option value="hackathon">HACKATHON</option>
                <option value="coding">CODING SHOT</option>
                <option value="gaming">GAMING FIGHT</option>
                <option value="workshop">WORKSHOP</option>
                <option value="seminar">SEMINAR</option>
                <option value="cultural">CULTURAL FEST</option>
                <option value="sports">SPORTS MATCH</option>
                <option value="conference">CONFERENCE</option>
              </select>
            </div>
          </div>

          {filteredEvents.length === 0 ? (
            <div className="text-center py-20 bg-[#1A1A1A] border-4 border-[#0F0F10] text-gray-500 font-mono-custom uppercase tracking-widest text-sm p-8">
              <AlertTriangle className="w-12 h-12 text-[#F04B23] mx-auto mb-4" />
              NO MATCHING WORKSPACES DISCOVERED
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredEvents.map((evt) => (
                <div 
                  key={evt.id}
                  className="bg-[#1A1A1A] border-4 border-[#0F0F10] shadow-[6px_6px_0px_0px_rgba(240,75,35,0.15)] hover:shadow-[6px_6px_0px_0px_rgba(240,75,35,1)] hover:-translate-y-1 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="h-44 bg-gray-800 border-b-4 border-black relative">
                      <img src={evt.banner} alt={evt.title} className="w-full h-full object-cover grayscale contrast-125" />
                      <div className="absolute top-3 left-3 bg-[#F04B23] text-black px-2 py-0.5 text-[9px] font-mono-custom uppercase font-black border border-black">
                        {evt.category}
                      </div>
                      <div className="absolute bottom-3 right-3 bg-black/85 text-white px-2 py-0.5 text-[9px] font-mono-custom border border-white/15 uppercase font-bold">
                        👥 CAP: {evt.capacity}
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="flex items-center gap-1.5 text-xs text-gray-400 font-mono-custom mb-2">
                        <span>📅 {evt.date}</span>
                        <span>•</span>
                        <span>{evt.time}</span>
                      </div>
                      <h3 className="text-2xl font-black uppercase text-white leading-tight mb-2 hover:text-[#F04B23] transition-colors">
                        {getTxt(evt.title, `evt_${evt.id}_title`)}
                      </h3>
                      <p className="text-xs text-gray-400 leading-snug line-clamp-3 italic mb-4">
                        {getTxt(evt.description, `evt_${evt.id}_desc`)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="p-6 border-t border-white/10 flex items-center justify-between">
                    <span className="text-xl font-mono-custom font-black text-white">
                      {formatPrice(evt.price)}
                    </span>
                    <SharpButton 
                      variant="primary"
                      onClick={() => {
                        setSelectedEvent(evt);
                        setActiveTab('event-details');
                      }}
                      className="py-1.5 px-3 text-[10px]"
                    >
                      ACQUIRE ACCESS
                    </SharpButton>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* -------------------------------------------------------------
          EVENT DETAILS VIEW
          ------------------------------------------------------------- */}
      {activeTab === 'event-details' && selectedEvent && (
        <div id="event-details-view" className="max-w-7xl mx-auto w-full px-6 py-12 flex-1">
          <button 
            onClick={() => setActiveTab('events')}
            className="mb-8 flex items-center gap-2 font-mono-custom text-xs font-black uppercase text-[#F04B23] hover:underline"
          >
            ← Back to Directory List
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            
            {/* Left 2 Columns: Image & Core details */}
            <div className="lg:col-span-2 flex flex-col gap-8">
              
              {/* Event Header Banner */}
              <div className="bg-[#1A1A1A] border-4 border-[#0F0F10] p-1.5 shadow-[8px_8px_0px_0px_rgba(240,75,35,1)] relative">
                <div className="h-64 sm:h-96 w-full relative">
                  <img src={selectedEvent.banner} alt={selectedEvent.title} className="w-full h-full object-cover grayscale contrast-125 border-2 border-black" />
                  <div className="absolute top-4 left-4 bg-black text-white border-2 border-[#F04B23] px-3 py-1 font-mono-custom uppercase tracking-widest text-xs font-black">
                    {selectedEvent.category.toUpperCase()}
                  </div>
                </div>
              </div>

              {/* Title & Stats Grid */}
              <div className="p-6 bg-[#1A1A1A] border-4 border-black relative">
                <div className="absolute top-0 right-0 bg-[#4AA8D8] text-black text-[10px] font-mono-custom font-black px-3 py-1 uppercase border-l-2 border-b-2 border-black">
                  Verified Workspace
                </div>
                
                <h1 className="text-4xl sm:text-6xl font-black uppercase tracking-tight text-white mb-6">
                  {getTxt(selectedEvent.title, `evt_${selectedEvent.id}_title`)}
                </h1>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 border-y border-white/10 font-mono-custom text-xs text-gray-300">
                  <div>
                    <span className="block uppercase text-[10px] text-gray-500 font-bold mb-1">DATE</span>
                    <span className="font-black text-white uppercase">{selectedEvent.date}</span>
                  </div>
                  <div>
                    <span className="block uppercase text-[10px] text-gray-500 font-bold mb-1">TIME</span>
                    <span className="font-black text-white">{selectedEvent.time}</span>
                  </div>
                  <div>
                    <span className="block uppercase text-[10px] text-gray-500 font-bold mb-1">VENUE</span>
                    <span className="font-black text-white uppercase">{selectedEvent.venue}</span>
                  </div>
                  <div>
                    <span className="block uppercase text-[10px] text-gray-500 font-bold mb-1">PRICE</span>
                    <span className="font-black text-white">{formatPrice(selectedEvent.price)}</span>
                  </div>
                </div>

                <div className="mt-6">
                  <h3 className="font-sans uppercase font-black text-xl text-white mb-3 tracking-wider">PROJECT BRIEF</h3>
                  <p className="text-sm text-gray-300 leading-relaxed italic">
                    {getTxt(selectedEvent.description, `evt_${selectedEvent.id}_desc`)}
                  </p>
                </div>
              </div>

              {/* Speakers list if any */}
              {selectedEvent.speakers && selectedEvent.speakers.length > 0 && (
                <div className="p-6 bg-[#1A1A1A] border-4 border-black">
                  <h3 className="font-sans uppercase font-black text-2xl text-[#4AA8D8] mb-6 tracking-wide">CONFIRMED PANELISTS</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {selectedEvent.speakers.map((sp, idx) => (
                      <div key={idx} className="bg-black border-2 border-white/10 p-4 flex gap-4 items-start">
                        <div className="w-12 h-12 bg-[#F04B23] flex items-center justify-center text-xl font-black shrink-0">
                          👤
                        </div>
                        <div>
                          <h4 className="font-sans uppercase font-black text-sm text-white">{sp.name}</h4>
                          <p className="text-[10px] font-mono-custom uppercase text-[#F04B23] tracking-widest font-bold">{sp.role}</p>
                          <p className="text-xs text-gray-400 mt-2 italic">{sp.bio}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* FAQ Section */}
              {selectedEvent.faq && selectedEvent.faq.length > 0 && (
                <div className="p-6 bg-[#1A1A1A] border-4 border-black">
                  <h3 className="font-sans uppercase font-black text-2xl text-white mb-6 tracking-wide">FAQ QUESTIONS</h3>
                  <div className="flex flex-col gap-4">
                    {selectedEvent.faq.map((fq, idx) => (
                      <div key={idx} className="border-b border-white/10 pb-4">
                        <h4 className="font-sans uppercase font-black text-sm text-[#F04B23] mb-1">Q: {getTxt(fq.q, `evt_${selectedEvent.id}_faq_q_${idx}`)}</h4>
                        <p className="text-xs text-gray-400 leading-relaxed italic">{getTxt(fq.a, `evt_${selectedEvent.id}_faq_a_${idx}`)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Sponsors logos */}
              {selectedEvent.sponsors && selectedEvent.sponsors.length > 0 && (
                <div className="p-6 bg-[#1A1A1A] border-4 border-black">
                  <h4 className="font-mono-custom uppercase text-[10px] tracking-widest text-gray-500 mb-4 font-bold">BRUTALIST COLLABORATORS & PATRONS</h4>
                  <div className="flex flex-wrap gap-4">
                    {selectedEvent.sponsors.map((sp) => (
                      <span key={sp} className="bg-black border border-white/10 px-4 py-1.5 font-mono-custom text-xs font-black uppercase tracking-widest text-[#4AA8D8]">
                        // {sp}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Registration Form or Checkout module */}
            <div className="flex flex-col gap-8">
              
              {/* Price Tag & CTA Board */}
              <div className="bg-white text-black p-6 border-4 border-black shadow-[6px_6px_0px_0px_rgba(240,75,35,1)]">
                <span className="font-mono-custom text-[10px] font-black uppercase text-gray-500 tracking-widest">TICKET VALUE</span>
                <div className="text-5xl font-black italic mt-1 text-[#F04B23]">
                  {formatPrice(selectedEvent.price)}
                </div>

                <div className="mt-4 py-3 border-y border-black/10 font-mono-custom text-[11px] text-gray-700">
                  <div className="flex justify-between font-bold">
                    <span>Deadline:</span>
                    <span className="uppercase text-black">{selectedEvent.registration_deadline}</span>
                  </div>
                  <div className="flex justify-between mt-1 font-bold">
                    <span>Availability:</span>
                    <span className="text-black">{selectedEvent.capacity} seats max</span>
                  </div>
                </div>

                {currentUser ? (
                  // Check if already registered
                  registrations.some((r) => r.event_id === selectedEvent.id && r.user_id === currentUser.id) ? (
                    <div className="mt-6 bg-[#10B981]/20 border-2 border-[#10B981] p-4 text-center text-xs font-bold uppercase text-black">
                      ✓ YOU ARE FULLY BOOKED! Check your dashboard for entry passes.
                    </div>
                  ) : (
                    <form onSubmit={handleRegisterToEvent} className="mt-6 flex flex-col gap-4">
                      <div className="text-xs font-black uppercase text-black tracking-wider border-b-2 border-black pb-2 mb-2 flex items-center gap-2">
                        <PlusCircle className="w-4 h-4 text-[#F04B23]" />
                        <span>Secure Your Spot Now</span>
                      </div>

                      <BrutalistInput 
                        label="FULL NAME"
                        id="regName"
                        value={regForm.name}
                        onChange={(e) => setRegForm({ ...regForm, name: e.target.value })}
                        required
                      />

                      <BrutalistInput 
                        label="EMAIL ADDRESS"
                        id="regEmail"
                        type="email"
                        value={regForm.email}
                        onChange={(e) => setRegForm({ ...regForm, email: e.target.value })}
                        required
                      />

                      <BrutalistInput 
                        label="TELEPHONE"
                        id="regPhone"
                        value={regForm.phone}
                        onChange={(e) => setRegForm({ ...regForm, phone: e.target.value })}
                        required
                      />

                      <BrutalistInput 
                        label="COLLEGE / FIRM"
                        id="regCollege"
                        value={regForm.college}
                        onChange={(e) => setRegForm({ ...regForm, college: e.target.value })}
                        required
                      />

                      <BrutalistInput 
                        label="DEPARTMENT / MAJOR"
                        id="regDepartment"
                        value={regForm.department}
                        onChange={(e) => setRegForm({ ...regForm, department: e.target.value })}
                        required
                        placeholder="e.g. Computer Science / Business"
                      />

                      <BrutalistInput 
                        label="INTERESTS"
                        id="regInterests"
                        value={regForm.interests}
                        onChange={(e) => setRegForm({ ...regForm, interests: e.target.value })}
                        required
                        placeholder="e.g. AI, Web3, Hackathons, Design"
                      />

                      <div className="flex flex-col gap-1.5">
                        <label className="font-sans uppercase font-black text-xs text-black tracking-wider">GENDER</label>
                        <select
                          value={regForm.gender}
                          onChange={(e) => setRegForm({ ...regForm, gender: e.target.value })}
                          className="bg-white border-2 border-black p-3 rounded-none font-sans text-sm focus:outline-none"
                        >
                          <option value="Male">MALE</option>
                          <option value="Female">FEMALE</option>
                          <option value="Other">OTHER</option>
                        </select>
                      </div>

                      <BrutalistInput 
                        label="AGE"
                        id="regAge"
                        type="number"
                        value={regForm.age}
                        onChange={(e) => setRegForm({ ...regForm, age: Number(e.target.value) })}
                        required
                      />

                      {/* Dynamic Custom Questions defined by event creator */}
                      {selectedEvent.customQuestions && selectedEvent.customQuestions.length > 0 && (
                        <div className="p-3 bg-black/5 border border-black/10 mt-2 text-black">
                          <span className="text-[10px] font-black uppercase text-gray-500 block mb-2">CUSTOM REGISTRATION QUESTIONS:</span>
                          {selectedEvent.customQuestions.map((q, qidx) => (
                            <div key={qidx} className="mb-3 last:mb-0">
                              <BrutalistInput 
                                label={q}
                                id={`customQ_${qidx}`}
                                value={regForm.customAnswers[q] || ''}
                                onChange={(e) => setRegForm({
                                  ...regForm,
                                  customAnswers: { ...regForm.customAnswers, [q]: e.target.value }
                                })}
                                required
                              />
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Payment module if paid */}
                      {selectedEvent.price > 0 && (
                        <div className="bg-[#1A1A1A] text-white p-4 border-2 border-black mt-2">
                          <span className="text-[10px] font-mono-custom uppercase tracking-widest text-[#F04B23] font-bold block mb-2">GATEWAY ROUTER</span>
                          <div className="flex gap-2">
                            {['stripe', 'razorpay', 'upi'].map((gateway) => (
                              <button
                                key={gateway}
                                type="button"
                                onClick={() => setRegForm({ ...regForm, paymentGateway: gateway as any })}
                                className={`flex-1 py-2 font-mono-custom text-[10px] uppercase font-bold tracking-widest border-2 border-black ${
                                  regForm.paymentGateway === gateway ? 'bg-[#F04B23] text-black font-black' : 'bg-black text-white'
                                }`}
                              >
                                {gateway}
                              </button>
                            ))}
                          </div>
                          <p className="text-[9px] text-gray-400 font-mono-custom mt-2 italic uppercase">
                            * Custom checkout simulated safely. Clicking submit will automatically mock status to success!
                          </p>
                        </div>
                      )}

                      <SharpButton variant="primary" type="submit" className="mt-4">
                        CONFIRM REGISTRATION {selectedEvent.price > 0 && `& PAY ${formatPrice(selectedEvent.price)}`}
                      </SharpButton>
                    </form>
                  )
                ) : (
                  <div className="mt-6 text-center">
                    <p className="text-xs text-gray-500 italic mb-4 font-medium">Please sign in to register and obtain access passes.</p>
                    <SharpButton variant="black" onClick={() => setShowLoginModal(true)}>
                      SIGN IN FOR PASS
                    </SharpButton>
                  </div>
                )}
              </div>

              {/* Contact Card */}
              <div className="p-5 bg-[#1A1A1A] border-4 border-black font-mono-custom text-xs">
                <h4 className="font-sans uppercase font-black text-sm text-white mb-3">WORKSPACE HELP DESK</h4>
                <div className="flex flex-col gap-2 text-gray-400 font-bold">
                  <div>📞 CALL: {selectedEvent.contact_number}</div>
                  <div>✉ MAIL: {selectedEvent.email}</div>
                  {selectedEvent.website && (
                    <div>🌐 SITE: <a href={selectedEvent.website} target="_blank" rel="noopener noreferrer" className="text-[#F04B23] hover:underline">{selectedEvent.website}</a></div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------
          PRICING PAGE VIEW
          ------------------------------------------------------------- */}
      {activeTab === 'pricing' && (
        <div id="pricing-view" className="max-w-7xl mx-auto w-full px-6 py-12 flex-1">
          <div className="text-center max-w-xl mx-auto mb-16">
            <BrutalistHeading level={1} className="text-white text-5xl sm:text-7xl">PRICING TIERS</BrutalistHeading>
            <p className="text-xs font-mono-custom uppercase tracking-wider text-[#F04B23] mt-2 font-bold">
              FLAT TRANSPARENT FEES FOR MULTI-TENANT WORKSPACES
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Free */}
            <div className="bg-[#1A1A1A] border-4 border-black p-8 shadow-[6px_6px_0px_rgba(255,255,255,0.1)] flex flex-col justify-between">
              <div>
                <BrutalistBadge variant="accent" className="mb-4">STUDENT LABS</BrutalistBadge>
                <div className="text-5xl font-black italic text-white mb-4">$0 <span className="text-xs font-mono-custom">/ MO</span></div>
                <p className="text-xs text-gray-400 italic mb-6 leading-relaxed">
                  Best for local computer societies, hackathons, and small high school cultural clubs hosting entry-level free events.
                </p>
                <ul className="text-xs font-mono-custom space-y-2 text-gray-300">
                  <li>✓ Host up to 3 Active Event Workspaces</li>
                  <li>✓ Free ticket registration & pass building</li>
                  <li>✓ QR code generation & scanner portal</li>
                  <li>✓ Simulated payments (Cash/UPI only)</li>
                </ul>
              </div>
              <SharpButton variant="outline" className="mt-8 text-white border-white hover:text-black hover:bg-white" onClick={() => setActiveTab('events')}>
                EXPLORE SESSIONS
              </SharpButton>
            </div>

            {/* Paid - Popular */}
            <div className="bg-white text-black border-4 border-black p-8 shadow-[10px_10px_0px_rgba(240,75,35,1)] flex flex-col justify-between transform -rotate-1 relative">
              <div className="absolute top-4 right-4 bg-[#F04B23] text-white text-[9px] font-black uppercase px-2 py-0.5 border border-black transform rotate-6 font-mono-custom">
                POPULAR CHOICE
              </div>
              <div>
                <BrutalistBadge variant="black" className="mb-4">PROFESSIONAL</BrutalistBadge>
                <div className="text-5xl font-black italic text-[#F04B23] mb-4">$49 <span className="text-xs font-mono-custom">/ MO</span></div>
                <p className="text-xs text-gray-700 italic mb-6 leading-relaxed">
                  Designed for universities, elite clubs, and community organizers hosting large fests, coding bootcamps, and exhibitions.
                </p>
                <ul className="text-xs font-mono-custom space-y-2 text-gray-800">
                  <li>✓ Host UNLIMITED Event Workspaces</li>
                  <li>✓ Custom fields registration builders</li>
                  <li>✓ Full Stripe & Razorpay real simulation</li>
                  <li>✓ AI-powered description & poster writer</li>
                  <li>✓ Participation Certificates PDF downloader</li>
                </ul>
              </div>
              <SharpButton variant="primary" className="mt-8" onClick={() => setShowLoginModal(true)}>
                LAUNCH PRO WORKSPACE
              </SharpButton>
            </div>

            {/* Enterprise */}
            <div className="bg-[#1A1A1A] border-4 border-black p-8 shadow-[6px_6px_0px_rgba(255,255,255,0.1)] flex flex-col justify-between">
              <div>
                <BrutalistBadge variant="yellow" className="mb-4">ENTERPRISE CLOUD</BrutalistBadge>
                <div className="text-5xl font-black italic text-white mb-4">$299 <span className="text-xs font-mono-custom">/ MO</span></div>
                <p className="text-xs text-gray-400 italic mb-6 leading-relaxed">
                  Ideal for corporations, tech fests hosting multiple stages, sponsor stalls, and automated volunteer delegation pools.
                </p>
                <ul className="text-xs font-mono-custom space-y-2 text-gray-300">
                  <li>✓ Everything in Pro Workspace</li>
                  <li>✓ AI Chatbot concierge integration</li>
                  <li>✓ Advanced dashboard metrics & reports</li>
                  <li>✓ Multi-role Volunteer manager</li>
                  <li>✓ Dedicated priority support router</li>
                </ul>
              </div>
              <SharpButton variant="outline" className="mt-8 text-white border-white hover:text-black hover:bg-white" onClick={() => setActiveTab('faq')}>
                CONTACT ARCHITECT
              </SharpButton>
            </div>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------
          FAQ VIEW
          ------------------------------------------------------------- */}
      {activeTab === 'faq' && (
        <div id="faq-view" className="max-w-4xl mx-auto w-full px-6 py-12 flex-1">
          <div className="text-center mb-12">
            <BrutalistHeading level={1} className="text-white">SYSTEM FREQUENT QUESTIONS</BrutalistHeading>
            <p className="text-xs font-mono-custom uppercase tracking-wider text-[#F04B23] mt-2 font-bold">
              GET IMMEDIATE BRIEF ANSWERS
            </p>
          </div>

          <div className="flex flex-col gap-6">
            <div className="p-6 bg-[#1A1A1A] border-4 border-black">
              <h4 className="font-sans uppercase font-black text-lg text-[#F04B23] mb-2">Q: How does the QR Code check-in system work?</h4>
              <p className="text-xs text-gray-400 italic leading-relaxed font-medium">
                When a user registers for an event, they are issued a ticket with a unique serial identifier (or QR). Volunteers can enter the code or type the attendee name inside the Volunteer console. The system instantly logs check-in timestamps and flags duplicates if the code is processed twice!
              </p>
            </div>

            <div className="p-6 bg-[#1A1A1A] border-4 border-black">
              <h4 className="font-sans uppercase font-black text-lg text-[#F04B23] mb-2">Q: Can I customize the fields required during ticket purchase?</h4>
              <p className="text-xs text-gray-400 italic leading-relaxed font-medium">
                Yes! Our registration builder allows organizers to specify custom requirements like 'T-Shirt Size', 'Experience Level', or 'ID Upload' when building their events, which attendees must fill during registration.
              </p>
            </div>

            <div className="p-6 bg-[#1A1A1A] border-4 border-black">
              <h4 className="font-sans uppercase font-black text-lg text-[#F04B23] mb-2">Q: What AI capabilities does Evenia possess?</h4>
              <p className="text-xs text-gray-400 italic leading-relaxed font-medium">
                Powered by the @google/genai SDK on the server, Evenia can write compelling event descriptions in seconds, generate monospaced retro poster art, answer attendees' queries via the AI Support Advisor, and summarize feedback logs for organizers.
              </p>
            </div>

            <div className="p-6 bg-[#1A1A1A] border-4 border-black">
              <h4 className="font-sans uppercase font-black text-lg text-[#F04B23] mb-2">Q: Can I export registration reports?</h4>
              <p className="text-xs text-gray-400 italic leading-relaxed font-medium">
                Absolutely. Organizers can trigger CSV/Excel sheets downloads of all checked-in or pending participants directly from their event dashboard.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------
          GALLERY VIEW
          ------------------------------------------------------------- */}
      {activeTab === 'gallery' && (
        <div id="gallery-view" className="max-w-7xl mx-auto w-full px-6 py-12 flex-1">
          <div className="text-center mb-12">
            <BrutalistHeading level={1} className="text-white">COSMIC MEDIA GALLERY</BrutalistHeading>
            <p className="text-xs font-mono-custom uppercase tracking-wider text-[#F04B23] mt-2 font-bold">
              LOOK AT COMPILER MEETS, WINNER CEREMONIES, AND ACTIVE STAGES
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            <div className="bg-[#1A1A1A] border-4 border-black p-1">
              <img src="https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=600&q=80" alt="Hackathon Stage" className="w-full h-64 object-cover grayscale contrast-125" />
              <div className="p-3 text-xs font-mono-custom font-bold uppercase text-[#4AA8D8]">
                [#1] GLITCH 36-HOUR CODE SPRINT
              </div>
            </div>
            <div className="bg-[#1A1A1A] border-4 border-black p-1">
              <img src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=600&q=80" alt="Speaker Desk" className="w-full h-64 object-cover grayscale contrast-125" />
              <div className="p-3 text-xs font-mono-custom font-bold uppercase text-[#F04B23]">
                [#2] DESIGN SUMMIT PANEL DISCUSSION
              </div>
            </div>
            <div className="bg-[#1A1A1A] border-4 border-black p-1">
              <img src="https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=600&q=80" alt="Esports" className="w-full h-64 object-cover grayscale contrast-125" />
              <div className="p-3 text-xs font-mono-custom font-bold uppercase text-[#F59E0B]">
                [#3] APEX LEGENDS ARENA SHOT
              </div>
            </div>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------
          DASHBOARD ROUTER (By Role)
          ------------------------------------------------------------- */}
      {activeTab === 'dashboard' && currentUser && (
        <div id="dashboard-view" className="max-w-7xl mx-auto w-full px-6 py-12 flex-1">
          <div className="border-b-4 border-black pb-8 mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-2">
                <BrutalistBadge variant="primary">{currentUser.role}</BrutalistBadge>
                <span className="text-xs font-mono-custom text-gray-400 uppercase tracking-wider">CONSOLE SESSION</span>
              </div>
              <BrutalistHeading level={1} className="text-white">
                {currentUser.role === 'admin' && 'SUPER ADMIN PORTAL'}
                {currentUser.role === 'organizer' && 'ORGANIZER CENTER'}
                {currentUser.role === 'volunteer' && 'VOLUNTEER GATEWAY'}
                {currentUser.role === 'participant' && 'PARTICIPANT DESK'}
              </BrutalistHeading>
            </div>
            <div className="font-mono-custom text-xs text-gray-400 font-bold bg-[#1A1A1A] p-3 border-2 border-black uppercase">
              Current Operator: <span className="text-[#F04B23] font-black">{currentUser.name}</span>
            </div>
          </div>

          {/* ------------------------------------
              SUB VIEW: PARTICIPANT DASHBOARD
              ------------------------------------ */}
          {currentUser.role === 'participant' && (
            <div className="flex flex-col gap-10">
              {/* Top overview metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="bg-[#1A1A1A] border-4 border-black p-5 relative">
                  <span className="block text-4xl font-black text-[#4AA8D8] italic">
                    {participantRegisteredEvents.length}
                  </span>
                  <span className="block text-[10px] font-mono-custom uppercase text-gray-500 font-black mt-1">My Booked Seats</span>
                </div>
                <div className="bg-[#1A1A1A] border-4 border-black p-5 relative">
                  <span className="block text-4xl font-black text-[#F59E0B] italic">
                    {payments.filter((p) => p.user_id === currentUser.id && p.status === 'success').length}
                  </span>
                  <span className="block text-[10px] font-mono-custom uppercase text-gray-500 font-black mt-1">Transactions Success</span>
                </div>
                <div className="bg-[#1A1A1A] border-4 border-black p-5 relative">
                  <span className="block text-4xl font-black text-[#10B981] italic">
                    {certificates.filter((c) => c.recipient_name.toLowerCase().includes(currentUser.name.toLowerCase())).length}
                  </span>
                  <span className="block text-[10px] font-mono-custom uppercase text-gray-500 font-black mt-1">Acquired Certificates</span>
                </div>
              </div>

              {/* Grid: Tickets vs Certificates & Profile */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Booked tickets list */}
                <div className="lg:col-span-2 flex flex-col gap-6">
                  <h3 className="font-sans font-black text-2xl uppercase text-white tracking-wider border-b-2 border-black pb-2">
                    My Entry Tickets ({participantRegisteredEvents.length})
                  </h3>

                  {participantRegisteredEvents.length === 0 ? (
                    <div className="text-center py-12 bg-[#1A1A1A] border-2 border-dashed border-white/10 text-gray-500 font-mono-custom uppercase text-xs p-6">
                      No entry passes obtained yet. Discover some events to register!
                    </div>
                  ) : (
                    <div className="flex flex-col gap-6">
                      {participantRegisteredEvents.map((reg) => {
                        const event = events.find((e) => e.id === reg.event_id);
                        const ticket = tickets.find((t) => t.registration_id === reg.id);
                        if (!event || !ticket) return null;

                        return (
                          <div 
                            key={reg.id} 
                            className="bg-white text-black border-4 border-black p-6 shadow-[5px_5px_0px_0px_rgba(255,255,255,0.15)] flex flex-col md:flex-row justify-between gap-6 relative"
                          >
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-3">
                                <BrutalistBadge variant="black">{event.category}</BrutalistBadge>
                                <span className={`text-[9px] font-mono-custom uppercase font-black px-2 py-0.5 border ${
                                  ticket.status === 'used' ? 'bg-[#10B981]/20 border-[#10B981] text-[#10B981]' : 'bg-[#F59E0B]/20 border-[#F59E0B] text-[#F59E0B]'
                                }`}>
                                  {ticket.status === 'used' ? '• ATTENDED' : '• UNUSED PASS'}
                                </span>
                              </div>
                              <h4 className="text-2xl font-black uppercase tracking-tight mb-2 text-black">
                                {event.title}
                              </h4>
                              <div className="font-mono-custom text-xs text-gray-700 space-y-1 font-bold">
                                <div>📅 DATE: {event.date} at {event.time}</div>
                                <div>📍 VENUE: {event.venue}</div>
                                <div>💺 SEAT NO: {ticket.seat_number}</div>
                                <div>🔑 PASS KEY: <span className="text-[#F04B23]">{ticket.qr_code}</span></div>
                              </div>
                            </div>

                            {/* QR Code / Dynamic Action side */}
                            <div className="w-full md:w-48 shrink-0 flex flex-col justify-between items-center border-t-2 md:border-t-0 md:border-l-2 border-dashed border-black pt-4 md:pt-0 md:pl-6 text-center">
                              <div className="mb-3">
                                <TicketQRCode text={ticket.qr_code} />
                                <span className="block text-[9px] font-mono-custom font-black text-gray-500 mt-2 uppercase tracking-widest">
                                  PASS CODE: {ticket.qr_code}
                                </span>
                              </div>
                              
                              <div className="flex flex-col gap-2 w-full">
                                <SharpButton 
                                  variant="primary" 
                                  onClick={() => triggerPassDownload(ticket, event)}
                                  className="w-full py-1.5 px-3 text-[9px]"
                                >
                                  <Download className="w-3.5 h-3.5" /> DOWNLOAD TICKET
                                </SharpButton>

                                {/* Trigger Review feedback modal if event is complete */}
                                {ticket.status === 'used' && (
                                  <div className="mt-2 bg-[#F5F3EF] border-2 border-black p-3 text-left">
                                    <span className="text-[10px] font-mono-custom font-black uppercase text-[#F04B23] block mb-1">Feedback Rating:</span>
                                    {feedbacks.some((f) => f.registration_id === reg.id) ? (
                                      <span className="text-[10px] font-mono-custom uppercase font-black text-green-600">✓ Feedback Received</span>
                                    ) : (
                                      <form onSubmit={(e) => handleFeedbackSubmit(e, reg.id, event.id)}>
                                        <div className="flex items-center gap-1 mb-2">
                                          {[1,2,3,4,5].map((star) => (
                                            <button 
                                              type="button" 
                                              key={star} 
                                              onClick={() => setFeedbackRating(star)}
                                              className="p-0.5"
                                            >
                                              <Star className={`w-4 h-4 ${feedbackRating >= star ? 'text-[#F04B23] fill-[#F04B23]' : 'text-gray-300'}`} />
                                            </button>
                                          ))}
                                        </div>
                                        <input 
                                          type="text" 
                                          placeholder="Share suggestions..."
                                          value={feedbackComments}
                                          onChange={(e) => setFeedbackComments(e.target.value)}
                                          required
                                          className="w-full bg-white border border-black p-1 text-[10px] mb-2 text-black"
                                        />
                                        <SharpButton variant="black" type="submit" className="w-full py-1 text-[8px]">
                                          SUBMIT
                                        </SharpButton>
                                      </form>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Certificates Board */}
                  <h3 className="font-sans font-black text-2xl uppercase text-white tracking-wider border-b-2 border-black pb-2 mt-8">
                    My Earned Certificates ({certificates.length})
                  </h3>

                  {certificates.length === 0 ? (
                    <div className="text-center py-12 bg-[#1A1A1A] border-2 border-dashed border-white/10 text-gray-500 font-mono-custom uppercase text-xs p-6">
                      No credentials issued. Once check-in records verification is complete, they will compile here.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {certificates.map((c) => {
                        const evtName = events.find((e) => e.id === c.event_id)?.title || 'Evenia Session';
                        return (
                          <div key={c.id} className="bg-white border-4 border-black p-5 text-black flex flex-col justify-between">
                            <div>
                              <div className="flex justify-between items-start mb-2">
                                <BrutalistBadge variant="accent">CERTIFICATE</BrutalistBadge>
                                <span className="font-mono-custom text-[9px] font-black italic">{c.issue_date}</span>
                              </div>
                              <h4 className="font-sans uppercase font-black text-sm text-black mb-1">{c.recipient_name}</h4>
                              <p className="text-[10px] font-mono-custom uppercase text-gray-500 font-bold mb-3">Category: {c.certificate_type}</p>
                              <p className="text-xs text-gray-800 italic leading-snug mb-4">
                                Certified for participating in <span className="font-bold font-sans uppercase text-black">{evtName}</span>.
                              </p>
                            </div>
                            <SharpButton variant="black" onClick={() => triggerCertificateDownload(c, evtName)} className="w-full py-1 text-[9px]">
                              <Download className="w-3.5 h-3.5" /> DOWNLOAD CREDENTIAL
                            </SharpButton>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* AI ATTENDEE NETWORKING & MATCHMAKING */}
                  <div className="bg-[#1A1A1A] border-4 border-black p-6 mt-8 text-white">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/10 pb-4 mb-6">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <BrutalistBadge variant="accent">AI SERVICE</BrutalistBadge>
                          <span className="font-mono-custom text-[10px] text-[#F04B23] font-bold uppercase tracking-widest">GEMINI MATCHMAKER</span>
                        </div>
                        <h3 className="font-sans font-black text-2xl uppercase text-white tracking-wider">
                          Attendee Matchmaking & Networking
                        </h3>
                      </div>
                      <SharpButton 
                        variant="primary" 
                        onClick={fetchNetworkingRecommendations}
                        disabled={loadingRecommendations}
                        className="w-full sm:w-auto py-2 px-5 text-xs font-black uppercase animate-none"
                      >
                        {loadingRecommendations ? (
                          <div className="flex items-center gap-2">
                            <RefreshCw className="w-4 h-4 animate-spin" /> MATCHING...
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4" /> GENERATE MATCHES
                          </div>
                        )}
                      </SharpButton>
                    </div>

                    <p className="text-xs text-gray-400 font-medium italic leading-relaxed mb-6">
                      Our system analyzes your College, Department, and Interests to compare them against all registered participants across Evenia. Meet your ideal project partners, workshop colleagues, or hackers!
                    </p>

                    {/* My Profile Preview and Edit Row */}
                    <div className="bg-black/45 border-2 border-dashed border-white/15 p-4 mb-6 text-white">
                      <h4 className="text-xs font-mono-custom uppercase text-white font-black tracking-wider mb-3">
                        [YOUR MATCHMAKING DISCOVERY TARGET]
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-[10px] font-mono-custom uppercase text-gray-500 font-bold mb-1">CAMPUS / FIRM</label>
                          <input 
                            type="text" 
                            className="w-full bg-black border border-white/20 p-2 text-xs text-white uppercase font-bold"
                            value={networkingProfile.college}
                            onChange={(e) => setNetworkingProfile({ ...networkingProfile, college: e.target.value })}
                            placeholder="e.g. MIT campus"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-mono-custom uppercase text-gray-500 font-bold mb-1">DEPARTMENT / MAJOR</label>
                          <input 
                            type="text" 
                            className="w-full bg-black border border-white/20 p-2 text-xs text-white uppercase font-bold"
                            value={networkingProfile.department}
                            onChange={(e) => setNetworkingProfile({ ...networkingProfile, department: e.target.value })}
                            placeholder="e.g. Computer Science"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-mono-custom uppercase text-gray-500 font-bold mb-1">MY INTERESTS</label>
                          <input 
                            type="text" 
                            className="w-full bg-black border border-white/20 p-2 text-xs text-white uppercase font-bold"
                            value={networkingProfile.interests}
                            onChange={(e) => setNetworkingProfile({ ...networkingProfile, interests: e.target.value })}
                            placeholder="e.g. AI, Cyber Security, Web3"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Recommendations List */}
                    {recommendations.length > 0 ? (
                      <div className="flex flex-col gap-6">
                        {recommendations.map((rec, idx) => (
                          <div 
                            key={idx} 
                            className="bg-white text-black border-4 border-black p-5 relative overflow-hidden transition-all hover:translate-y-[-2px]"
                          >
                            {/* Score Indicator */}
                            <div className="absolute top-0 right-0 bg-[#F04B23] text-white px-4 py-1.5 font-sans font-black text-xs uppercase italic border-l-4 border-b-4 border-black">
                              {rec.score} MATCH
                            </div>

                            <div className="flex items-start gap-4 mb-3 pr-28">
                              <div className="w-10 h-10 bg-black text-white flex items-center justify-center font-sans font-black text-lg border-2 border-black">
                                {rec.name.charAt(0)}
                              </div>
                              <div>
                                <h4 className="font-sans uppercase font-black text-base text-black leading-tight">{rec.name}</h4>
                                <span className="text-[10px] font-mono-custom text-gray-600 font-bold uppercase">{rec.college} • {rec.department}</span>
                              </div>
                            </div>

                            <div className="border-t border-b border-black/10 py-3 mb-4">
                              <span className="block text-[9px] font-mono-custom text-gray-400 font-black uppercase mb-1">Shared Commonalities:</span>
                              <div className="flex flex-wrap gap-1.5">
                                {rec.matchFactors.map((factor, fidx) => (
                                  <span key={fidx} className="bg-black/5 border border-black/10 text-black px-2 py-0.5 text-[9px] font-mono-custom font-black uppercase">
                                    • {factor}
                                  </span>
                                ))}
                              </div>
                            </div>

                            {/* Conversation Icebreaker */}
                            <div className="bg-[#F5F3EF] border-l-4 border-[#F04B23] p-3 mb-4">
                              <span className="block text-[9px] font-mono-custom text-[#F04B23] font-black uppercase mb-1">AI Recommendation Starter:</span>
                              <p className="text-xs text-gray-800 italic leading-snug">"{rec.icebreaker}"</p>
                            </div>

                            <div className="flex justify-between items-center">
                              <span className="text-[9px] font-mono-custom text-gray-500 font-bold uppercase">INTERESTS: {rec.interests}</span>
                              <SharpButton 
                                variant="black" 
                                onClick={() => window.open(`mailto:${rec.email}?subject=Evenia Networking - Connection Request&body=${encodeURIComponent(rec.icebreaker)}`)}
                                className="py-1 px-3.5 text-[9px]"
                              >
                                CONNECT VIA EMAIL
                              </SharpButton>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-10 bg-black/20 border-2 border-dashed border-white/10 text-gray-500 font-mono-custom uppercase text-xs p-6">
                        {loadingRecommendations ? 'Generating your personalized networking group...' : 'No recommendations loaded yet. Enter your targets and click "GENERATE MATCHES"!'}
                      </div>
                    )}
                  </div>
                </div>

                {/* Notifications & Settings Right panel */}
                <div className="flex flex-col gap-6">
                  {/* Notifications board */}
                  <div className="bg-[#1A1A1A] border-4 border-black p-5">
                    <h4 className="font-sans uppercase font-black text-lg text-white mb-4 tracking-tight border-b border-white/10 pb-2 flex items-center gap-2">
                      <Bell className="w-4 h-4 text-[#F04B23]" />
                      <span>INBOX ALERT LOGS ({notifications.length})</span>
                    </h4>
                    
                    {notifications.length === 0 ? (
                      <p className="text-xs text-gray-500 italic uppercase">No messages</p>
                    ) : (
                      <div className="flex flex-col gap-3 max-h-72 overflow-y-auto">
                        {notifications.map((n) => (
                          <div key={n.id} className={`p-3 border border-white/10 ${!n.read ? 'bg-black/35 border-l-4 border-l-[#F04B23]' : 'bg-black/10'}`}>
                            <div className="flex justify-between items-start">
                              <span className="font-sans uppercase font-black text-[11px] text-white leading-none">{n.title}</span>
                              {!n.read && (
                                <button 
                                  onClick={() => handleMarkAsRead(n.id)}
                                  className="text-[8px] font-mono-custom text-[#F04B23] hover:underline"
                                >
                                  [READ]
                                </button>
                              )}
                            </div>
                            <p className="text-[10px] text-gray-400 mt-1 italic">{n.message}</p>
                            <span className="text-[8px] font-mono-custom text-gray-600 block mt-1">{new Date(n.date).toLocaleTimeString()}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Profile Board */}
                  <div className="bg-[#1A1A1A] border-4 border-black p-5">
                    <h4 className="font-sans uppercase font-black text-lg text-white mb-4 tracking-tight border-b border-white/10 pb-2">
                      OPERATOR DETAILS
                    </h4>
                    <div className="font-mono-custom text-xs text-gray-400 space-y-2.5 font-bold">
                      <div><span className="text-gray-600">ID:</span> {currentUser.id}</div>
                      <div><span className="text-gray-600">NAME:</span> {currentUser.name}</div>
                      <div><span className="text-gray-600">EMAIL:</span> {currentUser.email}</div>
                      <div><span className="text-gray-600">PHONE:</span> {currentUser.phone || 'N/A'}</div>
                      <div><span className="text-gray-600">CAMPUS:</span> {currentUser.college || 'N/A'}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ------------------------------------
              SUB VIEW: ORGANIZER WORKSPACE
              ------------------------------------ */}
          {currentUser.role === 'organizer' && (
            <div className="flex flex-col gap-10">
              
              {/* Organizer Summary numbers */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="bg-[#1A1A1A] border-4 border-black p-5">
                  <span className="block text-4xl font-black text-[#F04B23] italic">
                    {events.filter((e) => e.created_by === currentUser.id).length}
                  </span>
                  <span className="block text-[10px] font-mono-custom uppercase text-gray-500 font-bold mt-1">SESSIONS CREATED</span>
                </div>
                <div className="bg-[#1A1A1A] border-4 border-black p-5">
                  <span className="block text-4xl font-black text-[#4AA8D8] italic">
                    {registrations.filter((r) => events.some((e) => e.id === r.event_id && e.created_by === currentUser.id)).length}
                  </span>
                  <span className="block text-[10px] font-mono-custom uppercase text-gray-500 font-bold mt-1">TOTAL REGISTRANTS</span>
                </div>
                <div className="bg-[#1A1A1A] border-4 border-black p-5">
                  <span className="block text-4xl font-black text-[#F59E0B] italic">
                    ${payments.reduce((sum, p) => {
                      const reg = registrations.find((r) => r.id === p.registration_id);
                      if (reg && events.some((e) => e.id === reg.event_id && e.created_by === currentUser.id)) {
                        return sum + p.amount;
                      }
                      return sum;
                    }, 0)}
                  </span>
                  <span className="block text-[10px] font-mono-custom uppercase text-gray-500 font-bold mt-1">PROCESSED REVENUE</span>
                </div>
                <div className="bg-[#1A1A1A] border-4 border-black p-5">
                  <span className="block text-4xl font-black text-[#10B981] italic">
                    {tickets.filter((t) => {
                      const reg = registrations.find((r) => r.id === t.registration_id);
                      return t.status === 'used' && reg && events.some((e) => e.id === reg.event_id && e.created_by === currentUser.id);
                    }).length}
                  </span>
                  <span className="block text-[10px] font-mono-custom uppercase text-gray-500 font-bold mt-1">CHECKED IN ATTENDEES</span>
                </div>
              </div>

              {/* Event manager actions block: List existing events / registrations & Create event builder */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                
                {/* Event lists (7 columns) */}
                <div className="lg:col-span-7 flex flex-col gap-6">
                  <h3 className="font-sans font-black text-2xl uppercase text-white tracking-wider border-b-2 border-black pb-2">
                    My Managed Events & Registrations
                  </h3>

                  {events.filter((e) => e.created_by === currentUser.id).length === 0 ? (
                    <div className="text-center py-12 bg-[#1A1A1A] border-2 border-dashed border-white/15 text-gray-500 font-mono-custom text-xs uppercase p-6">
                      No custom events created yet. Use the Create Event Panel on the right!
                    </div>
                  ) : (
                    <div className="flex flex-col gap-6">
                      {events.filter((e) => e.created_by === currentUser.id).map((evt) => {
                        const eventRegistrants = registrations.filter((r) => r.event_id === evt.id);
                        return (
                          <div key={evt.id} className="bg-[#1A1A1A] border-4 border-black p-5 relative">
                            <div className="flex justify-between items-start mb-3">
                              <BrutalistBadge variant="accent">{evt.category}</BrutalistBadge>
                              <span className="text-[10px] font-mono-custom text-gray-500 uppercase">{evt.date} • {evt.time}</span>
                            </div>
                            <h4 className="text-2xl font-black uppercase text-white leading-tight mb-2">
                              {evt.title}
                            </h4>
                            <div className="text-xs text-gray-400 italic mb-4 line-clamp-2">
                              {evt.description}
                            </div>

                            {/* Attendee logs listing for this specific event */}
                            <div className="mt-4 bg-black/40 border border-white/10 p-3">
                              <div className="flex justify-between items-center mb-3">
                                <span className="text-[10px] font-mono-custom uppercase tracking-wider text-[#F04B23] font-black">
                                  Registrant database logs ({eventRegistrants.length})
                                </span>
                                {eventRegistrants.length > 0 && (
                                  <button
                                    onClick={() => triggerCSVDownload(evt.title, eventRegistrants)}
                                    className="text-[9px] font-mono-custom uppercase bg-white text-black font-black px-2 py-0.5 hover:bg-[#F04B23] hover:text-white border border-black cursor-pointer"
                                  >
                                    [EXPORT MOCK CSV]
                                  </button>
                                )}
                              </div>

                              {eventRegistrants.length === 0 ? (
                                <div className="text-[10px] text-gray-600 italic uppercase">No registered participants yet.</div>
                              ) : (
                                <div className="max-h-40 overflow-y-auto divide-y divide-white/5 font-mono-custom text-[11px] text-gray-300">
                                  {eventRegistrants.map((reg) => (
                                    <div key={reg.id} className="py-1.5 flex justify-between items-center">
                                      <div>
                                        <span className="font-black text-white">{reg.fields.name}</span> ({reg.fields.college || 'No Campus'})
                                      </div>
                                      <div className="text-gray-500 uppercase text-[9px] font-bold">
                                        {reg.status}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* AI sentiment analysis & PDF Analytics Tool */}
                            <div className="mt-4 pt-3 border-t border-white/10 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
                              <div className="flex flex-wrap gap-2">
                                <SharpButton 
                                  variant="outline" 
                                  onClick={() => handleAISummarizeFeedback(evt.id)}
                                  className="py-1 px-2.5 text-[9px] text-[#F04B23] flex items-center gap-1.5"
                                >
                                  <Sparkles className="w-3.5 h-3.5" /> AI Feedback Summary
                                </SharpButton>
                                
                                <SharpButton 
                                  variant="primary" 
                                  onClick={() => generateEventReportPDF(evt, registrations, tickets, payments, feedbacks)}
                                  className="py-1 px-2.5 text-[9px] text-black bg-[#F04B23] border border-black hover:bg-white hover:text-black flex items-center gap-1.5 font-bold cursor-pointer"
                                >
                                  <FileText className="w-3.5 h-3.5" /> BRANDED PDF REPORT
                                </SharpButton>
                              </div>
                              <span className="text-[10px] font-mono-custom text-gray-500 font-bold uppercase">Rating: {evt.rating || '5.0'}/5.0</span>
                            </div>

                            {/* Feedback summary render */}
                            {aiFeedbackSummary && (
                              <div className="mt-3 bg-[#0F0F10] border-2 border-dashed border-[#F04B23] p-4 text-xs font-mono-custom text-gray-300">
                                <div className="text-[#F04B23] font-black uppercase mb-1 flex items-center gap-1.5">
                                  <span>🤖 GEMINI FEEDBACK INTELLIGENCE SENTIMENT</span>
                                </div>
                                <div className="italic leading-snug">{aiFeedbackSummary}</div>
                                <button 
                                  onClick={() => setAiFeedbackSummary('')} 
                                  className="text-[9px] text-[#F04B23] hover:underline uppercase block mt-2"
                                >
                                  [Dismiss summary logs]
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Create Event Panel (5 columns) */}
                <div className="lg:col-span-5 bg-[#1A1A1A] border-4 border-black p-5">
                  <h3 className="font-sans font-black text-2xl uppercase text-[#F04B23] tracking-tight mb-6 border-b border-white/10 pb-2">
                    Create Event Workspace
                  </h3>

                  <form onSubmit={handleCreateEvent} className="flex flex-col gap-4">
                    <BrutalistInput 
                      label="Event Title"
                      id="evtTitle"
                      placeholder="e.g. GLITCH HACKATHON"
                      value={newEventForm.title}
                      onChange={(e) => setNewEventForm({ ...newEventForm, title: e.target.value })}
                      required
                    />

                    <div className="flex flex-col gap-1.5">
                      <label className="font-sans uppercase font-black text-xs text-white tracking-wider">Category</label>
                      <select
                        value={newEventForm.category}
                        onChange={(e) => setNewEventForm({ ...newEventForm, category: e.target.value as any })}
                        className="bg-black border-2 border-white/20 p-3 rounded-none text-white focus:outline-none"
                      >
                        <option value="hackathon">HACKATHON</option>
                        <option value="coding">CODING SHOT</option>
                        <option value="gaming">GAMING TOURNAMENT</option>
                        <option value="workshop">WORKSHOP</option>
                        <option value="seminar">SEMINAR</option>
                        <option value="cultural">CULTURAL FEST</option>
                        <option value="sports">SPORTS MATCH</option>
                      </select>
                    </div>

                    <div className="bg-black/35 border border-[#F04B23]/30 p-3">
                      <span className="text-[10px] font-mono-custom uppercase tracking-widest text-[#F04B23] font-black block mb-2">AI WRITER ENGINE</span>
                      <SharpButton 
                        variant="outline" 
                        onClick={handleAIWriteDescription} 
                        disabled={!newEventForm.title || aiGeneratingDesc}
                        className="w-full py-2 border-[#F04B23] text-white hover:bg-[#F04B23] hover:text-black mb-1 text-[10px]"
                      >
                        {aiGeneratingDesc ? 'GENERATING...' : 'AI AUTO-GENERATE DESCRIPTION'}
                      </SharpButton>
                      <p className="text-[8px] text-gray-500 uppercase tracking-tighter">
                        * Writes a compelling brutalist event summary using Gemini Flash API!
                      </p>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="evtDesc" className="font-sans uppercase font-black text-xs text-white tracking-wider">Brief Description</label>
                      <textarea
                        id="evtDesc"
                        rows={3}
                        placeholder="Write or generate high-impact event guidelines..."
                        value={newEventForm.description}
                        onChange={(e) => setNewEventForm({ ...newEventForm, description: e.target.value })}
                        required
                        className="bg-black border-2 border-white/20 p-3 text-white focus:outline-none focus:bg-[#1A1A1A] text-xs font-medium italic"
                      />
                    </div>

                    <BrutalistInput 
                      label="Event Banner URL"
                      id="evtBanner"
                      placeholder="https://images.unsplash.com/photo-..."
                      value={newEventForm.banner}
                      onChange={(e) => setNewEventForm({ ...newEventForm, banner: e.target.value })}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <BrutalistInput 
                        label="Venue Location"
                        id="evtVenue"
                        placeholder="MIT Arena"
                        value={newEventForm.venue}
                        onChange={(e) => setNewEventForm({ ...newEventForm, venue: e.target.value })}
                        required
                      />
                      <BrutalistInput 
                        label="Capacity"
                        id="evtCapacity"
                        type="number"
                        value={newEventForm.capacity}
                        onChange={(e) => setNewEventForm({ ...newEventForm, capacity: Number(e.target.value) })}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <BrutalistInput 
                        label="Date"
                        id="evtDate"
                        type="date"
                        value={newEventForm.date}
                        onChange={(e) => setNewEventForm({ ...newEventForm, date: e.target.value })}
                        required
                      />
                      <BrutalistInput 
                        label="Time"
                        id="evtTime"
                        placeholder="09:00"
                        value={newEventForm.time}
                        onChange={(e) => setNewEventForm({ ...newEventForm, time: e.target.value })}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <BrutalistInput 
                        label="Price"
                        id="evtPrice"
                        type="number"
                        value={newEventForm.price}
                        onChange={(e) => setNewEventForm({ ...newEventForm, price: Number(e.target.value) })}
                        required
                      />
                      <div className="flex flex-col gap-1.5">
                        <label className="font-sans uppercase font-black text-[10px] text-white tracking-wider">Currency</label>
                        <select
                          value={newEventForm.currency}
                          onChange={(e) => setNewEventForm({ ...newEventForm, currency: e.target.value })}
                          className="bg-black border-2 border-white/20 p-3 rounded-none text-white font-sans text-[11px] focus:outline-none h-[42px]"
                        >
                          <option value="USD">USD ($)</option>
                          <option value="EUR">EUR (€)</option>
                          <option value="GBP">GBP (£)</option>
                          <option value="INR">INR (₹)</option>
                          <option value="JPY">JPY (¥)</option>
                          <option value="CAD">CAD (C$)</option>
                        </select>
                      </div>
                      <BrutalistInput 
                        label="Deadline"
                        id="evtDeadline"
                        type="date"
                        value={newEventForm.registration_deadline}
                        onChange={(e) => setNewEventForm({ ...newEventForm, registration_deadline: e.target.value })}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <BrutalistInput 
                        label="Contact Tel"
                        id="evtContact"
                        value={newEventForm.contact_number}
                        onChange={(e) => setNewEventForm({ ...newEventForm, contact_number: e.target.value })}
                        required
                      />
                      <BrutalistInput 
                        label="Contact Email"
                        id="evtContactMail"
                        type="email"
                        value={newEventForm.email}
                        onChange={(e) => setNewEventForm({ ...newEventForm, email: e.target.value })}
                        required
                      />
                    </div>

                    {/* FAQ custom compiler inside form */}
                    <div className="border border-white/10 p-3 bg-black/20">
                      <span className="text-[10px] font-mono-custom uppercase tracking-wider text-white font-bold block mb-2">ADD FAQ</span>
                      <div className="flex flex-col gap-2">
                        <input 
                          type="text" 
                          placeholder="QUESTION" 
                          value={tmpFaq.q}
                          onChange={(e) => setTmpFaq({ ...tmpFaq, q: e.target.value })}
                          className="bg-black border border-white/20 p-2 text-xs"
                        />
                        <input 
                          type="text" 
                          placeholder="ANSWER" 
                          value={tmpFaq.a}
                          onChange={(e) => setTmpFaq({ ...tmpFaq, a: e.target.value })}
                          className="bg-black border border-white/20 p-2 text-xs"
                        />
                        <button 
                          type="button"
                          onClick={() => {
                            if (tmpFaq.q && tmpFaq.a) {
                              setNewEventForm({ ...newEventForm, faqs: [...newEventForm.faqs, tmpFaq] });
                              setTmpFaq({ q: '', a: '' });
                            }
                          }}
                          className="bg-[#F04B23] text-black font-black uppercase text-[9px] py-1.5 cursor-pointer"
                        >
                          [SAVE FAQ ITEM]
                        </button>
                      </div>
                      <div className="mt-2 text-[10px] text-gray-500 uppercase">
                        Saved FAQ items: {newEventForm.faqs.length}
                      </div>
                    </div>

                    {/* Custom Questions compiler */}
                    <div className="border border-white/10 p-3 bg-black/20">
                      <span className="text-[10px] font-mono-custom uppercase tracking-wider text-[#4AA8D8] font-bold block mb-2">CUSTOM REGISTRATION QUESTIONNAIRE</span>
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          placeholder="e.g. T-Shirt Size (S, M, L, XL)" 
                          value={tmpQuestion}
                          onChange={(e) => setTmpQuestion(e.target.value)}
                          className="flex-1 bg-black border border-white/20 p-2 text-xs text-white placeholder-gray-600 uppercase"
                        />
                        <button 
                          type="button"
                          onClick={() => {
                            if (tmpQuestion.trim()) {
                              setNewEventForm({ 
                                ...newEventForm, 
                                customQuestions: [...newEventForm.customQuestions, tmpQuestion.trim()] 
                              });
                              setTmpQuestion('');
                            }
                          }}
                          className="bg-[#4AA8D8] text-black font-black uppercase text-[9px] px-3 cursor-pointer"
                        >
                          [ADD]
                        </button>
                      </div>
                      {newEventForm.customQuestions.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {newEventForm.customQuestions.map((q, idx) => (
                            <span key={idx} className="bg-black border border-white/10 text-[9px] font-mono-custom uppercase py-1 px-2 flex items-center gap-1.5 text-white">
                              {q}
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = [...newEventForm.customQuestions];
                                  updated.splice(idx, 1);
                                  setNewEventForm({ ...newEventForm, customQuestions: updated });
                                }}
                                className="text-[#F04B23] font-black hover:underline"
                              >
                                [X]
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Enterprise Budget Planner */}
                    <div className="border border-white/10 p-3 bg-black/20">
                      <span className="text-[10px] font-mono-custom uppercase tracking-wider text-[#F59E0B] font-bold block mb-2">EVENT BUDGET & SHEET PLANNER</span>
                      <div className="flex gap-2 mb-2">
                        <input 
                          type="text" 
                          placeholder="ITEM NAME (e.g. Hall Rent)" 
                          value={tmpBudgetItem}
                          onChange={(e) => setTmpBudgetItem(e.target.value)}
                          className="flex-1 bg-black border border-white/20 p-2 text-xs text-white placeholder-gray-600 uppercase"
                        />
                        <input 
                          type="number" 
                          placeholder="COST" 
                          value={tmpBudgetAmount || ''}
                          onChange={(e) => setTmpBudgetAmount(Number(e.target.value))}
                          className="w-20 bg-black border border-white/20 p-2 text-xs text-white"
                        />
                        <button 
                          type="button"
                          onClick={() => {
                            if (tmpBudgetItem.trim() && tmpBudgetAmount > 0) {
                              setNewEventForm({ 
                                ...newEventForm, 
                                budget: [...newEventForm.budget, { item: tmpBudgetItem.trim(), amount: tmpBudgetAmount }] 
                              });
                              setTmpBudgetItem('');
                              setTmpBudgetAmount(0);
                            }
                          }}
                          className="bg-[#F59E0B] text-black font-black uppercase text-[9px] px-3 cursor-pointer"
                        >
                          [ADD]
                        </button>
                      </div>
                      
                      {/* Budget summary */}
                      {newEventForm.budget.length > 0 && (
                        <div className="mt-3 bg-black/40 border border-white/10 p-2 text-[10px] font-mono-custom text-gray-300">
                          <div className="font-bold border-b border-white/10 pb-1 mb-1 text-white">BUDGET SHEET ITEMS:</div>
                          <div className="space-y-1 max-h-24 overflow-y-auto">
                            {newEventForm.budget.map((b, idx) => (
                              <div key={idx} className="flex justify-between items-center">
                                <span>• {b.item}:</span>
                                <div className="flex items-center gap-1.5 font-bold">
                                  <span>{newEventForm.currency} {b.amount.toFixed(2)}</span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const updated = [...newEventForm.budget];
                                      updated.splice(idx, 1);
                                      setNewEventForm({ ...newEventForm, budget: updated });
                                    }}
                                    className="text-[#F04B23] hover:underline"
                                  >
                                    [X]
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                          <div className="border-t border-white/10 pt-1 mt-1 font-black flex justify-between text-white">
                            <span>TOTAL PLANNED OUTFLOW:</span>
                            <span>{newEventForm.currency} {newEventForm.budget.reduce((sum, b) => sum + b.amount, 0).toFixed(2)}</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* AI monospaced poster designer */}
                    <div className="border border-[#4AA8D8]/30 p-3 bg-[#4AA8D8]/10">
                      <span className="text-[10px] font-mono-custom uppercase tracking-widest text-[#4AA8D8] font-black block mb-2">AI POSTER DESIGNER</span>
                      <SharpButton 
                        variant="outline" 
                        onClick={handleAIGeneratePoster} 
                        disabled={!newEventForm.title || aiGeneratingPoster}
                        className="w-full py-2 border-[#4AA8D8] text-white hover:bg-[#4AA8D8] hover:text-black mb-1 text-[10px]"
                      >
                        {aiGeneratingPoster ? 'COMPILING POSTER...' : 'COMPILE ASCII MONOSPACED POSTER'}
                      </SharpButton>

                      {aiPosterResult && (
                        <pre className="mt-2 p-2.5 bg-[#0F0F10] border border-black text-[9px] font-mono-custom text-[#10B981] overflow-x-auto select-all">
                          {aiPosterResult}
                        </pre>
                      )}
                    </div>

                    <SharpButton variant="primary" type="submit" className="mt-4 py-4">
                      LAUNCH EVENT ON SYSTEM
                    </SharpButton>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* ------------------------------------
              SUB VIEW: VOLUNTEER TERMINAL GATES
              ------------------------------------ */}
          {currentUser.role === 'volunteer' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              
              {/* Left Column: QR Scanner simulator */}
              <div className="lg:col-span-2 bg-[#1A1A1A] border-4 border-black p-6 relative">
                <div className="absolute top-0 right-0 bg-[#F04B23] text-black text-[10px] font-mono-custom font-black px-3 py-1 uppercase border-b-2 border-l-2 border-black">
                  Live Scanner Terminal
                </div>

                <h3 className="font-sans font-black text-2xl uppercase text-white tracking-wider border-b border-white/10 pb-3 mb-6">
                  Attendee Entrance Validator
                </h3>

                <form onSubmit={(e) => handleScanTicket(e)} className="flex flex-col gap-4 max-w-md">
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="scanField" className="font-sans uppercase font-black text-xs text-white tracking-wider flex flex-wrap justify-between items-center gap-2">
                      <span>Pass Serial Key / Ticket ID</span>
                      <span className="text-[10px] text-[#F04B23] font-mono-custom font-bold uppercase tracking-wider bg-[#F04B23]/10 border border-[#F04B23]/20 px-1.5 py-0.5 rounded-sm">
                        Shortcut: [CMD+K] or [CTRL+K]
                      </span>
                    </label>
                    <input
                      id="scanField"
                      ref={scannerInputRef}
                      type="text"
                      placeholder="e.g. EVN-GLITCH-01-MERCER"
                      value={scannerInput}
                      onChange={(e) => setScannerInput(e.target.value)}
                      required
                      className="bg-black border-2 border-white/20 p-3.5 text-white font-mono-custom text-sm focus:outline-none uppercase focus:ring-2 focus:ring-[#F04B23]"
                    />
                  </div>

                  <SharpButton variant="primary" type="submit">
                    SUBMIT SCANNER LOG
                  </SharpButton>
                </form>

                {/* Scan verification results with strict compliance (duplicate warnings, checkin timestamp) */}
                {scannerResult && (
                  <div className={`mt-8 border-4 p-5 ${scannerResult.success ? 'bg-[#10B981]/10 border-[#10B981]' : 'bg-[#B5292A]/10 border-[#B5292A]'}`}>
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`w-3.5 h-3.5 border border-black ${scannerResult.success ? 'bg-[#10B981]' : 'bg-[#B5292A]'}`}></span>
                      <span className="font-sans font-black uppercase text-sm tracking-wider">
                        {scannerResult.success ? 'CHECK-IN APPROVED' : 'ENTRY BLOCKED / REJECTED'}
                      </span>
                    </div>

                    <p className="font-mono-custom text-xs font-bold text-white mb-4">
                      {scannerResult.message}
                    </p>

                    {scannerResult.success && scannerResult.data && (
                      <div className="font-mono-custom text-[11px] text-gray-400 space-y-1 font-bold bg-black/40 p-3">
                        <div>ATTENDEE: {scannerResult.data.attendeeName}</div>
                        <div>SEAT CODE: {scannerResult.data.seatNumber}</div>
                        <div>TICKET TYPE: {scannerResult.data.ticketType}</div>
                        <div>TIMESTAMP: {new Date(scannerResult.data.time).toLocaleTimeString()}</div>
                      </div>
                    )}

                    {!scannerResult.success && scannerResult.data?.entryTime && (
                      <div className="font-mono-custom text-[11px] text-[#B5292A] space-y-1 font-black bg-black/40 p-3 border border-[#B5292A]/20 uppercase">
                        <div>WARN CODE: DUPLICATE SCAN ATTEMPT!</div>
                        <div>PREVIOUS TIME IN: {new Date(scannerResult.data.entryTime).toLocaleTimeString()}</div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Right Column: Registered attendees shortcuts list (for easy testing by reviewers) */}
              <div className="bg-[#1A1A1A] border-4 border-black p-5">
                <h4 className="font-sans uppercase font-black text-lg text-white mb-4 border-b border-white/10 pb-2">
                  Test Passcodes Lookup
                </h4>
                <p className="text-[10px] text-gray-500 uppercase font-bold mb-4">
                  * Select any passport below to instant scan without typing!
                </p>

                <div className="flex flex-col gap-3 max-h-96 overflow-y-auto">
                  {tickets.map((t) => {
                    const reg = registrations.find((r) => r.id === t.registration_id);
                    const eventName = events.find((e) => e.id === (reg ? reg.event_id : ''))?.title || 'Unknown Event';
                    return (
                      <div key={t.id} className="bg-black/30 border border-white/10 p-3 flex justify-between items-center">
                        <div className="font-mono-custom text-[11px]">
                          <div className="font-black text-white">{reg ? reg.fields.name : 'Participant'}</div>
                          <div className="text-[9px] text-[#F04B23] uppercase font-bold">{eventName.substring(0, 16)}...</div>
                          <div className="text-[10px] text-gray-400 mt-1 uppercase font-black tracking-wider">{t.qr_code}</div>
                        </div>
                        <button
                          onClick={() => handleScanTicket(undefined, t.qr_code)}
                          className="bg-[#F04B23] hover:bg-black hover:text-[#F04B23] border border-black text-black font-mono-custom text-[9px] font-black uppercase px-2 py-1 cursor-pointer"
                        >
                          [INSTANT SCAN]
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ------------------------------------
              SUB VIEW: SUPER ADMIN PANEL
              ------------------------------------ */}
          {currentUser.role === 'admin' && (
            <div className="flex flex-col gap-10">
              
              {/* Analytics dashboard graphs row */}
              <AnalyticsCharts 
                registrations={registrations} 
                payments={payments} 
                events={events} 
              />

              {/* Grid: User Directory vs Event approval checklist */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                
                {/* User directory */}
                <div className="bg-[#1A1A1A] border-4 border-black p-6">
                  <h3 className="font-sans font-black text-2xl uppercase text-white tracking-wider border-b border-white/10 pb-3 mb-6">
                    Operator Pool directory ({allUsers.length})
                  </h3>

                  <div className="flex flex-col gap-4 max-h-[500px] overflow-y-auto">
                    {allUsers.map((u) => (
                      <div key={u.id} className="bg-black/40 border border-white/10 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex gap-3 items-center">
                          <img src={u.avatar || 'https://api.dicebear.com/7.x/identicon/svg?seed=user'} alt="Avatar" className="w-10 h-10 border border-white/20 bg-white" />
                          <div className="font-mono-custom text-xs">
                            <div className="font-black text-white uppercase">{u.name}</div>
                            <div className="text-gray-500 font-bold">{u.email}</div>
                            <div className="mt-1">
                              <BrutalistBadge variant={u.role === 'admin' ? 'primary' : u.role === 'organizer' ? 'accent' : 'yellow'}>
                                {u.role}
                              </BrutalistBadge>
                            </div>
                          </div>
                        </div>

                        {/* Adjust role router */}
                        <div className="flex flex-col gap-1 text-right">
                          <span className="text-[9px] font-mono-custom text-gray-500 uppercase font-bold mb-1">PROMOTE/DEMOTE:</span>
                          <div className="flex gap-1.5 justify-end">
                            {['participant', 'volunteer', 'organizer', 'admin'].map((roleOpt) => (
                              <button
                                key={roleOpt}
                                onClick={() => handleModifyUserRole(u.id, roleOpt)}
                                className={`px-2 py-0.5 border border-black font-mono-custom text-[8px] uppercase font-bold cursor-pointer ${
                                  u.role === roleOpt ? 'bg-[#F04B23] text-black' : 'bg-white text-black hover:bg-black hover:text-white'
                                }`}
                              >
                                {roleOpt.substring(0, 3)}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Event verification approval */}
                <div className="bg-[#1A1A1A] border-4 border-black p-6">
                  <h3 className="font-sans font-black text-2xl uppercase text-white tracking-wider border-b border-white/10 pb-3 mb-6">
                    Event Approvals Gate
                  </h3>

                  <div className="flex flex-col gap-4 max-h-[500px] overflow-y-auto">
                    {events.map((evt) => (
                      <div key={evt.id} className="bg-black/40 border border-white/10 p-4 flex items-center justify-between gap-4">
                        <div className="font-mono-custom text-xs">
                          <h4 className="font-sans uppercase font-black text-sm text-white mb-1">{evt.title}</h4>
                          <div className="text-gray-500 font-bold uppercase">{evt.category} • CAP: {evt.capacity}</div>
                          <div className="mt-2 text-gray-400 italic">Deadline: {evt.registration_deadline}</div>
                        </div>

                        <div className="text-right">
                          <button
                            onClick={() => handleToggleAdminStatus(evt.id, evt.status)}
                            className={`px-4 py-2 font-mono-custom text-xs font-black uppercase border-2 border-black cursor-pointer ${
                              evt.status === 'active' ? 'bg-[#10B981] text-black' : 'bg-[#B5292A] text-white hover:bg-black'
                            }`}
                          >
                            {evt.status === 'active' ? '✓ APPROVED' : '⚡ PENDING'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          )}

        </div>
      )}

      {/* -------------------------------------------------------------
          BOTTOM FOOTER TICKER
          ------------------------------------------------------------- */}
      <footer className="bg-[#F04B23] text-black overflow-hidden h-12 flex items-center shrink-0 border-t-4 border-black z-10">
        <div className="whitespace-nowrap flex gap-12 font-sans font-black uppercase italic tracking-tighter text-sm animate-marquee">
          <span>Real-time Analytics</span>
          <span>•</span>
          <span>QR Check-In System</span>
          <span>•</span>
          <span>Automated Certificates</span>
          <span>•</span>
          <span>Multi-Tenant SaaS</span>
          <span>•</span>
          <span>AI Content Generation</span>
          <span>•</span>
          <span>Razorpay & Stripe Ready</span>
          <span>•</span>
          <span>Role-Based Access Control</span>
          <span>•</span>
          <span>Real-time Analytics</span>
          <span>•</span>
          <span>QR Check-In System</span>
        </div>
      </footer>

      {/* -------------------------------------------------------------
          MODALS & FLOATING MODULES
          ------------------------------------------------------------- */}

      {/* Mock login modal */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4">
          <div className="bg-[#F5F3EF] border-4 border-black p-6 w-full max-w-sm relative text-black shadow-[10px_10px_0px_0px_rgba(240,75,35,1)]">
            <h3 className="font-sans font-black uppercase text-3xl text-black mb-6 border-b-2 border-black pb-2">
              SIGN IN
            </h3>

            <p className="text-[10px] font-mono-custom text-gray-500 uppercase font-black mb-4 leading-relaxed">
              * Simulate MERN authentication pool logs immediately.
            </p>

            <form onSubmit={(e) => handleLogin(e)} className="flex flex-col gap-4">
              <BrutalistInput 
                label="EMAIL ADDRESS"
                id="loginEmail"
                type="email"
                placeholder="operator@evenia.com"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                required
              />

              <BrutalistInput 
                label="PASSWORD"
                id="loginPassword"
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                required
              />

              <div className="flex gap-2 mt-4">
                <SharpButton variant="primary" type="submit" className="flex-1">
                  SIGN IN
                </SharpButton>
                <SharpButton 
                  variant="outline" 
                  type="button" 
                  onClick={() => setShowLoginModal(false)}
                  className="border-black text-black"
                >
                  CANCEL
                </SharpButton>
              </div>
            </form>

            <div className="mt-6 border-t border-black/10 pt-4 text-center">
              <span className="text-[9px] font-mono-custom uppercase text-gray-500 font-bold block mb-2">QUICK DEMO PRESENTS KEYS:</span>
              <div className="flex flex-wrap gap-1.5 justify-center">
                <button 
                  onClick={() => handleLogin(undefined, 'admin@evenia.com')}
                  className="bg-black hover:bg-[#F04B23] text-white hover:text-black font-mono-custom text-[8px] uppercase font-bold px-2 py-1"
                >
                  Admin Key
                </button>
                <button 
                  onClick={() => handleLogin(undefined, 'organizer@evenia.com')}
                  className="bg-black hover:bg-[#F04B23] text-white hover:text-black font-mono-custom text-[8px] uppercase font-bold px-2 py-1"
                >
                  Organizer Key
                </button>
                <button 
                  onClick={() => handleLogin(undefined, 'volunteer@evenia.com')}
                  className="bg-black hover:bg-[#F04B23] text-white hover:text-black font-mono-custom text-[8px] uppercase font-bold px-2 py-1"
                >
                  Volunteer Key
                </button>
                <button 
                  onClick={() => handleLogin(undefined, 'merilpu37@gmail.com')}
                  className="bg-black hover:bg-[#F04B23] text-white hover:text-black font-mono-custom text-[8px] uppercase font-bold px-2 py-1"
                >
                  Participant Key
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Brutalist Scroll to Top Button */}
      {showScrollToTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-6 left-6 md:bottom-8 md:left-8 z-40 bg-[#F04B23] text-black border-4 border-black px-4 py-3 font-mono-custom font-black uppercase text-xs tracking-widest flex items-center gap-2 cursor-pointer shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:shadow-[6px_6px_0px_0px_rgba(255,255,255,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 active:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] transition-all duration-100 rounded-none"
          title="Scroll to Top"
        >
          <ArrowUp className="w-5 h-5 stroke-[3]" />
          <span className="hidden sm:inline">SCROLL TO TOP</span>
        </button>
      )}

      {/* Persistent AI Concierge widget */}
      <AIChatBot selectedEvent={selectedEvent} />
    </div>
  );
}
