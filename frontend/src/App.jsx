import React, { useState, useEffect, useRef } from 'react';
import { 
  BookOpen, 
  User, 
  Lock, 
  Mail, 
  Search, 
  MessageSquare, 
  Plus, 
  Edit, 
  Trash2, 
  Sliders, 
  AlertCircle, 
  LogOut, 
  CheckCircle, 
  RefreshCw, 
  Send, 
  Users, 
  ShieldAlert, 
  Sparkles, 
  ChevronRight, 
  FileText, 
  Award, 
  Target, 
  TrendingUp, 
  BookOpenCheck,
  Flame,
  CheckSquare,
  Shield,
  Layers,
  Settings as SettingsIcon,
  HelpCircle,
  Activity
} from 'lucide-react';

import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { StatCard, ProgressCard } from './components/StatCard';
import { CourseCard } from './components/CourseCard';
import { AIChat } from './components/AIChat';
import { Button, Modal, LoadingSpinner, EmptyState } from './components/UI';

// Mock/Default courses in case backend data is empty
const DEFAULT_COURSES = [
  {
    _id: 'mock-1',
    title: 'Java Backend Development',
    price: 199,
    instructor: 'John Doe',
    description: 'Master core Java OOP, data structures, MVC patterns, REST API servers, Spring Boot controllers, and SQL/NoSQL integrations.'
  },
  {
    _id: 'mock-2',
    title: 'Node.js & Express REST APIs',
    price: 149,
    instructor: 'Jane Smith',
    description: 'Learn how to build asynchronous backend services. Cover routers, middlewares, custom loggers, and auth security.'
  },
  {
    _id: 'mock-3',
    title: 'Generative AI & RAG Chatbots',
    price: 249,
    instructor: 'AI Specialist',
    description: 'Leverage text embedding models, compute cosine similarity, build vector stores, and ground LLM prompts to prevent hallucinations.'
  }
];

function App() {
  // Routing State
  const [activeRoute, setActiveRoute] = useState('auth'); // 'auth' | 'dashboard' | 'courses' | 'course-details' | 'mylearning' | 'progress' | 'quizzes' | 'aitutor' | 'profile' | 'settings' | 'instructor'
  
  // Connection Settings
  const [backendUrl, setBackendUrl] = useState(() => {
    return localStorage.getItem('studystack_backend_url') || 'http://localhost:5000';
  });
  const [testConnStatus, setTestConnStatus] = useState(''); // 'success' | 'error' | ''
  const [testConnMsg, setTestConnMsg] = useState('');

  // Authentication State
  const [user, setUser] = useState(null); // { id, name, email, role, token }
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'
  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '', role: 'student' });
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  // Courses Catalogue State
  const [courses, setCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [errorCourses, setErrorCourses] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourse, setSelectedCourse] = useState(null);

  // Student Enrollments State (in-memory simulation)
  const [enrolledCourses, setEnrolledCourses] = useState([
    { courseId: 'mock-1', progress: 72, activeModule: 'Module 4: REST APIs', checkedModules: [true, true, true, false, false, false] }
  ]);

  // Quiz State
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState({}); // { questionIdx: optionIdx }
  const [quizGrade, setQuizGrade] = useState({ score: 0, feedback: '' });

  // Instructor Board States (Courses & Users CRUD)
  const [instructorTab, setInstructorTab] = useState('courses'); // 'courses' | 'users'
  const [showCourseForm, setShowCourseForm] = useState(false);
  const [courseForm, setCourseForm] = useState({ title: '', price: '', instructor: '', description: '' });
  const [editingCourseId, setEditingCourseId] = useState(null);
  const [courseFormLoading, setCourseFormLoading] = useState(false);
  const [courseFormError, setCourseFormError] = useState('');

  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [errorUsers, setErrorUsers] = useState('');
  const [showUserForm, setShowUserForm] = useState(false);
  const [userForm, setUserForm] = useState({ name: '', email: '', password: '', role: 'student' });
  const [editingUserId, setEditingUserId] = useState(null);
  const [userFormLoading, setUserFormLoading] = useState(false);
  const [userFormError, setUserFormError] = useState('');

  // RAG Chatbot State
  const [chatHistory, setChatHistory] = useState([
    {
      sender: 'bot',
      text: 'Hi! I am your StudyStack Assistant. Click "Index PDF" in the corner to parse the syllabus, or ask me any question about the curriculum modules!',
      sources: []
    }
  ]);
  const [chatLoading, setChatLoading] = useState(false);
  const [chatQuestion, setChatQuestion] = useState('');
  const [indexingLoading, setIndexingLoading] = useState(false);
  const [indexingMessage, setIndexingMessage] = useState('');
  const chatEndRef = useRef(null);

  // Settings Toggles State
  const [settingsToggles, setSettingsToggles] = useState({
    darkMode: true,
    emailAlerts: true,
    hapticFeedback: false
  });

  // Auto-scroll chat window
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, chatLoading]);

  // Load courses from backend
  useEffect(() => {
    fetchCourses();
    localStorage.setItem('studystack_backend_url', backendUrl);
  }, [backendUrl]);

  // Fetch users list (Instructors only)
  useEffect(() => {
    if (user && user.role === 'instructor') {
      fetchUsers();
    }
  }, [user, backendUrl]);

  // Redirect to Dashboard if logged in, otherwise Auth
  useEffect(() => {
    if (user) {
      if (activeRoute === 'auth') setActiveRoute('dashboard');
    } else {
      setActiveRoute('auth');
    }
  }, [user]);

  // Courses API Get
  const fetchCourses = async () => {
    setLoadingCourses(true);
    setErrorCourses('');
    try {
      const res = await fetch(`${backendUrl}/api/courses`);
      if (!res.ok) {
        throw new Error(`Connection success, but failed to retrieve catalog (${res.status})`);
      }
      const data = await res.json();
      setCourses(data.length > 0 ? data : DEFAULT_COURSES);
    } catch (err) {
      setErrorCourses(err.message || 'Unable to connect to backend server. Reverting to fallback course lists.');
      setCourses(DEFAULT_COURSES);
    } finally {
      setLoadingCourses(false);
    }
  };

  // Student Registry Users API Get
  const fetchUsers = async () => {
    if (!user || !user.token) return;
    setLoadingUsers(true);
    setErrorUsers('');
    try {
      const res = await fetch(`${backendUrl}/api/users`, {
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      if (!res.ok) {
        throw new Error(`Failed to load student list (${res.status})`);
      }
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      setErrorUsers(err.message);
    } finally {
      setLoadingUsers(false);
    }
  };

  // Test Server Connection
  const handleTestConnection = async () => {
    setTestConnStatus('');
    setTestConnMsg('Pinging backend server...');
    try {
      const res = await fetch(backendUrl);
      if (res.ok) {
        setTestConnStatus('success');
        setTestConnMsg('Connection established! Unified Express server is online.');
      } else {
        setTestConnStatus('error');
        setTestConnMsg(`Server returned status ${res.status}.`);
      }
    } catch (err) {
      setTestConnStatus('error');
      setTestConnMsg(`Connection failed: Cannot reach host at ${backendUrl}. Check server execution status.`);
    }
  };

  // Login & Register Controller
  const handleAuth = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError('');

    const endpoint = authMode === 'login' ? '/login' : '/register';
    const payload = authMode === 'login'
      ? { email: authForm.email, password: authForm.password }
      : authForm;

    try {
      const res = await fetch(`${backendUrl}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Authentication rejected. Verify email and credentials.');
      }

      setUser({
        id: data.user.id || data.user._id,
        name: data.user.name,
        email: data.user.email,
        role: data.user.role,
        token: data.token
      });

      // Clear forms
      setAuthForm({ name: '', email: '', password: '', role: 'student' });
    } catch (err) {
      // Offline fallback: Simulation Mode for Testing
      if (err.message.includes('Failed to fetch')) {
        console.warn('Backend server offline. Setting up offline simulation mode.');
        const mockName = authForm.name || (authForm.email.split('@')[0]);
        const capitalizedMockName = mockName.charAt(0).toUpperCase() + mockName.slice(1);
        setUser({
          id: 'mock-user-id',
          name: capitalizedMockName,
          email: authForm.email,
          role: authForm.role || 'student',
          token: 'mock-jwt-token'
        });
      } else {
        setAuthError(err.message);
      }
    } finally {
      setAuthLoading(false);
    }
  };

  // Logout Handler
  const handleLogout = () => {
    setUser(null);
    setUsers([]);
    setActiveRoute('auth');
  };

  // Enrollment Handler
  const handleEnrollCourse = (courseId) => {
    if (!user) return;
    if (enrolledCourses.find(ec => ec.courseId === courseId)) return;

    const newEnrollment = {
      courseId: courseId,
      progress: 0,
      activeModule: 'Module 1: Getting Started',
      checkedModules: [false, false, false, false, false, false]
    };

    setEnrolledCourses([...enrolledCourses, newEnrollment]);
    setActiveRoute('mylearning');
  };

  // Course Details Module Checkoff Handler
  const handleToggleModule = (courseId, idx) => {
    const updated = enrolledCourses.map(ec => {
      if (ec.courseId === courseId) {
        const checked = [...ec.checkedModules];
        checked[idx] = !checked[idx];
        
        // Compute progress percent
        const trueCount = checked.filter(Boolean).length;
        const progressVal = Math.round((trueCount / checked.length) * 100);

        // Determine active lesson
        let activeLesson = 'Course Completed';
        const modules = getSyllabusModules(courses.find(c => c._id === courseId)?.title || '');
        const nextUndone = checked.findIndex(v => !v);
        if (nextUndone !== -1) {
          activeLesson = modules[nextUndone];
        }

        return {
          ...ec,
          checkedModules: checked,
          progress: progressVal,
          activeModule: activeLesson
        };
      }
      return ec;
    });

    setEnrolledCourses(updated);
  };

  // Retrieve course syllabus modules based on title
  const getSyllabusModules = (title) => {
    const t = title.toLowerCase();
    if (t.includes('java')) {
      return ['01 Java Fundamentals', '02 Object Oriented Programming', '03 Collections API', '04 REST APIs & Spring MVC', '05 Boot Controller architecture', '06 DB Persistance & JPA'];
    }
    if (t.includes('node') || t.includes('express')) {
      return ['01 Event Loop & Async IO', '02 Express Routing fundamentals', '03 Custom middlewares & logs', '04 Database Schema modelling', '05 JWT Encryption rules', '06 Error interceptors'];
    }
    if (t.includes('genai') || t.includes('rag') || t.includes('chat') || t.includes('ai')) {
      return ['01 Embeddings concept & models', '02 Tokenizing text chunks', '03 Cosine similarities formulas', '04 Grounded system prompting', '05 Gemini LLM endpoints', '06 Prompt Injection defenses'];
    }
    return ['01 Core Setup', '02 Basic configurations', '03 Intermediate syntax', '04 Advanced controllers', '05 Database mappings', '06 Scaling & Deployments'];
  };

  // Graded Quiz Controller
  const QUIZ_QUESTIONS = [
    {
      q: "Which HTTP method is used to create a new resource in a REST API?",
      options: ["GET", "POST", "PUT", "DELETE"],
      correct: 1
    },
    {
      q: "In Retrieval-Augmented Generation (RAG), what is the core purpose of text retrieval?",
      options: ["To compress PDF file sizes", "To fine-tune LLM weights directly", "To fetch semantic reference contexts from external files", "To translate code to JavaScript"],
      correct: 2
    },
    {
      q: "Which calculation measures the similarity between two embedding vectors?",
      options: ["Cosine Similarity", "Euclidean Distance", "Manhattan grid count", "Hamming XOR matching"],
      correct: 0
    },
    {
      q: "What component does Mongoose utilize to structuralize MongoDB schemas in Node.js?",
      options: ["CSS stylesheets", "Centralized router tables", "Mongoose Schemas & Models", "HTML template binders"],
      correct: 2
    },
    {
      q: "Why is password hashing (e.g. via bcrypt) standard practice in database management?",
      options: ["To format and lowercase user input", "To protect user credentials from plain-text exposure", "To execute logins faster", "To compress email strings"],
      correct: 1
    }
  ];

  const handleAnswerSelect = (qIdx, optIdx) => {
    setQuizAnswers({ ...quizAnswers, [qIdx]: optIdx });
  };

  const handleSubmitQuiz = () => {
    let score = 0;
    QUIZ_QUESTIONS.forEach((q, idx) => {
      if (quizAnswers[idx] === q.correct) score++;
    });

    let fb = '';
    if (score === 5) fb = 'Incredible! You got a perfect score. Your understanding of Web Dev and GenAI RAG is exemplary.';
    else if (score >= 3) fb = 'Great job! You have a solid grasp of these architectures. Review syllabus modules to clear remaining doubts.';
    else fb = 'Review the courses and ask the AI Tutor to clarify concepts around REST routing, vector stores, and encryption.';

    setQuizGrade({ score, feedback: fb });
    setQuizSubmitted(true);
  };

  const handleResetQuiz = () => {
    setQuizStarted(false);
    setQuizSubmitted(false);
    setQuizAnswers({});
    setQuizGrade({ score: 0, feedback: '' });
  };

  // Instructor Board Course Form CRUD submit
  const handleCourseFormSubmit = async (e) => {
    e.preventDefault();
    if (!user || user.role !== 'instructor') return;
    
    setCourseFormLoading(true);
    setCourseFormError('');

    const method = editingCourseId ? 'PUT' : 'POST';
    const url = editingCourseId 
      ? `${backendUrl}/api/courses/${editingCourseId}`
      : `${backendUrl}/api/courses`;

    try {
      const res = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify(courseForm)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save course.');

      fetchCourses();
      setCourseForm({ title: '', price: '', instructor: user.name, description: '' });
      setEditingCourseId(null);
      setShowCourseForm(false);
    } catch (err) {
      // Offline fallback
      if (err.message.includes('Failed to fetch')) {
        const mockNewCourse = {
          _id: editingCourseId || `mock-${Date.now()}`,
          ...courseForm
        };
        if (editingCourseId) {
          setCourses(courses.map(c => c._id === editingCourseId ? mockNewCourse : c));
        } else {
          setCourses([...courses, mockNewCourse]);
        }
        setCourseForm({ title: '', price: '', instructor: user.name, description: '' });
        setEditingCourseId(null);
        setShowCourseForm(false);
      } else {
        setCourseFormError(err.message);
      }
    } finally {
      setCourseFormLoading(false);
    }
  };

  const handleDeleteCourse = async (courseId) => {
    if (!user || user.role !== 'instructor') return;
    if (!window.confirm('Delete this course from the catalog?')) return;

    try {
      const res = await fetch(`${backendUrl}/api/courses/${courseId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      if (!res.ok) throw new Error('Deletion rejected.');
      fetchCourses();
    } catch (err) {
      // Offline fallback
      setCourses(courses.filter(c => c._id !== courseId));
    }
  };

  const openCourseEdit = (c) => {
    setEditingCourseId(c._id);
    setCourseForm({ title: c.title, price: c.price, instructor: c.instructor, description: c.description || '' });
    setShowCourseForm(true);
  };

  // Instructor Board User Form CRUD submit
  const handleUserFormSubmit = async (e) => {
    e.preventDefault();
    if (!user || user.role !== 'instructor') return;

    setUserFormLoading(true);
    setUserFormError('');

    const method = editingUserId ? 'PUT' : 'POST';
    const url = editingUserId 
      ? `${backendUrl}/api/users/${editingUserId}`
      : `${backendUrl}/api/users`;

    try {
      const res = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify(userForm)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save registry user.');

      fetchUsers();
      setUserForm({ name: '', email: '', password: '', role: 'student' });
      setEditingUserId(null);
      setShowUserForm(false);
    } catch (err) {
      // Offline fallback
      if (err.message.includes('Failed to fetch')) {
        const mockNewUser = {
          _id: editingUserId || `mock-u-${Date.now()}`,
          name: userForm.name,
          email: userForm.email,
          role: userForm.role
        };
        if (editingUserId) {
          setUsers(users.map(u => (u._id || u.id) === editingUserId ? mockNewUser : u));
        } else {
          setUsers([...users, mockNewUser]);
        }
        setUserForm({ name: '', email: '', password: '', role: 'student' });
        setEditingUserId(null);
        setShowUserForm(false);
      } else {
        setUserFormError(err.message);
      }
    } finally {
      setUserFormLoading(false);
    }
  };

  const handleDeleteUser = async (targetUserId) => {
    if (!user || user.role !== 'instructor') return;
    if (targetUserId === user.id) {
      alert('You cannot remove yourself from active control.');
      return;
    }
    if (!window.confirm('Delete this user account?')) return;

    try {
      const res = await fetch(`${backendUrl}/api/users/${targetUserId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      if (!res.ok) throw new Error('Deletion rejected.');
      fetchUsers();
    } catch (err) {
      // Offline fallback
      setUsers(users.filter(u => (u._id || u.id) !== targetUserId));
    }
  };

  const openUserEdit = (u) => {
    setEditingUserId(u._id || u.id);
    setUserForm({ name: u.name, email: u.email, password: '', role: u.role });
    setShowUserForm(true);
  };

  // Chatbot Syllabus Index
  const handleIndexSyllabus = async () => {
    setIndexingLoading(true);
    setIndexingMessage('');
    try {
      const res = await fetch(`${backendUrl}/api/index`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Vector store failed.');

      setIndexingMessage(data.message || 'Syllabus indexed successfully!');
      setChatHistory(prev => [
        ...prev,
        {
          sender: 'bot',
          text: `Success! I have successfully extracted content chunks from "course-syllabus.pdf" and generated text embeddings inside the memory vector store. Ask me anything!`,
          sources: []
        }
      ]);
    } catch (err) {
      setIndexingMessage(`Error: ${err.message}`);
    } finally {
      setIndexingLoading(false);
    }
  };

  // Chatbot Question Submit
  const handleChatQuestionSubmit = async (e) => {
    e.preventDefault();
    if (!chatQuestion.trim()) return;

    const query = chatQuestion;
    setChatQuestion('');
    setChatHistory(prev => [...prev, { sender: 'user', text: query, sources: [] }]);
    setChatLoading(true);

    try {
      const res = await fetch(`${backendUrl}/api/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: query })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Server error.');

      setChatHistory(prev => [
        ...prev,
        { sender: 'bot', text: data.answer, sources: data.sources || [] }
      ]);
    } catch (err) {
      // Mock Answers when offline
      setTimeout(() => {
        let answer = "This is a simulated chatbot response since the backend is currently offline. To get real syllabus retrival, make sure your backend server is running and your GEMINI_API_KEY is configured in your .env.";
        const lowercaseQuery = query.toLowerCase();
        
        if (lowercaseQuery.includes('rest') || lowercaseQuery.includes('api')) {
          answer = "REST APIs use standard HTTP verbs (GET, POST, PUT, DELETE) to represent CRUD operations on server-side resources. In Module 1 and 2, you will write controllers mapping requests to Express routers and Mongoose database methods.";
        } else if (lowercaseQuery.includes('embedding') || lowercaseQuery.includes('cosine')) {
          answer = "Embeddings convert string chunks into vectors representing semantic meanings. Cosine similarity calculates the directional dot product between two vector fields. This acts as the Open-book search for RAG chatbot context retrieval.";
        }

        setChatHistory(prev => [
          ...prev,
          {
            sender: 'bot',
            text: answer,
            sources: ['Syllabus Module 1 details', 'Syllabus Module 4 details']
          }
        ]);
        setChatLoading(false);
      }, 700);
    }
  };

  const handleClearChat = () => {
    setChatHistory([
      {
        sender: 'bot',
        text: 'Chat history cleared. Ask me any questions regarding the course modules!',
        sources: []
      }
    ]);
  };

  // Filters for Course Catalog
  const filteredCourses = courses.filter(c =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#0b0f19] text-gray-100 flex font-sans selection:bg-purple-500/30">
      
      {/* Background gradients */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-15%] w-[45%] h-[45%] rounded-full bg-blue-600/5 blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-15%] w-[45%] h-[45%] rounded-full bg-purple-650/5 blur-[120px]"></div>
      </div>

      {/* Main Auth Page View (If not authed) */}
      {activeRoute === 'auth' ? (
        <div className="flex-1 flex flex-col justify-center items-center p-6 relative z-10">
          
          <div className="max-w-md w-full space-y-6">
            
            {/* Branding Logo */}
            <div className="flex flex-col items-center text-center space-y-2.5">
              <div className="bg-gradient-to-tr from-blue-600 to-purple-650 p-3 rounded-2xl text-white shadow-xl shadow-purple-500/10">
                <BookOpen className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-2xl font-black bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent leading-none">
                  StudyStack
                </h1>
                <p className="text-xs text-gray-500 font-semibold tracking-wide uppercase mt-1">Unified E-Learning Ecosystem</p>
              </div>
            </div>

            {/* Glass Box form */}
            <div className="bg-[#0d1324]/50 border border-slate-800 p-6 rounded-3xl shadow-2xl shadow-black/30 backdrop-blur-xl">
              <div className="flex border-b border-slate-800 pb-3 justify-center gap-6 mb-5">
                <button
                  onClick={() => { setAuthMode('login'); setAuthError(''); }}
                  className={`pb-2 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
                    authMode === 'login' ? 'border-blue-500 text-blue-400' : 'border-transparent text-gray-400 hover:text-white'
                  }`}
                >
                  Sign In
                </button>
                <button
                  onClick={() => { setAuthMode('register'); setAuthError(''); }}
                  className={`pb-2 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
                    authMode === 'register' ? 'border-purple-500 text-purple-400' : 'border-transparent text-gray-400 hover:text-white'
                  }`}
                >
                  Register
                </button>
              </div>

              {authError && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-300 p-3 rounded-xl mb-4 text-xs flex gap-2 items-center">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              <form onSubmit={handleAuth} className="space-y-4">
                {authMode === 'register' && (
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 mb-1.5 uppercase">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                      <input
                        required
                        type="text"
                        placeholder="John Doe"
                        value={authForm.name}
                        onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })}
                        className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-950/80 border border-slate-800 rounded-xl focus:outline-none focus:border-purple-500 text-gray-200"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-[10px] font-bold text-gray-400 mb-1.5 uppercase">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                    <input
                      required
                      type="email"
                      placeholder="you@domain.com"
                      value={authForm.email}
                      onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-950/80 border border-slate-800 rounded-xl focus:outline-none focus:border-blue-500 text-gray-200"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-400 mb-1.5 uppercase">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                    <input
                      required
                      type="password"
                      placeholder="••••••••"
                      value={authForm.password}
                      onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-950/80 border border-slate-800 rounded-xl focus:outline-none focus:border-blue-500 text-gray-200"
                    />
                  </div>
                </div>

                {authMode === 'register' && (
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 mb-1.5 uppercase">Role</label>
                    <select
                      value={authForm.role}
                      onChange={(e) => setAuthForm({ ...authForm, role: e.target.value })}
                      className="w-full px-3 py-2.5 text-xs bg-slate-950/80 border border-slate-800 rounded-xl focus:outline-none focus:border-purple-500 text-gray-200"
                    >
                      <option value="student">Student</option>
                      <option value="instructor">Instructor</option>
                    </select>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={authLoading}
                  className={`w-full py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 ${
                    authMode === 'login'
                      ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/10'
                      : 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-500/10'
                  }`}
                >
                  {authLoading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : authMode === 'login' ? (
                    'Sign In'
                  ) : (
                    'Register Account'
                  )}
                </button>
              </form>

              {/* Informative Help Text */}
              <div className="mt-5 border-t border-slate-850 pt-4 flex gap-2 text-[10px] text-gray-500 items-start">
                <HelpCircle className="w-4 h-4 text-slate-650 shrink-0" />
                <p>
                  StudyStack uses a secure JWT authentication. If your server is offline, we will automatically run in local simulated test mode.
                </p>
              </div>

            </div>

          </div>

        </div>
      ) : (
        // DASHBOARD INTERFACE (Authorized)
        <div className="flex-1 flex overflow-hidden z-10 relative">
          
          {/* Sidebar Left Navigation */}
          <Sidebar 
            activeRoute={activeRoute} 
            setActiveRoute={setActiveRoute} 
            user={user} 
            onLogout={handleLogout} 
          />

          {/* Right Main Panel */}
          <div className="flex-1 flex flex-col overflow-hidden">
            
            {/* Top Navbar */}
            <Navbar 
              user={user} 
              activeRoute={activeRoute} 
              setActiveRoute={setActiveRoute}
              searchQuery={searchQuery}
              onSearchChange={(e) => setSearchQuery(e.target.value)}
            />

            {/* Dashboard Routing Screens */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">

              {/* ROUTE: Dashboard Home */}
              {activeRoute === 'dashboard' && (
                <div className="space-y-6">
                  
                  {/* Banner Greeting Card */}
                  <div className="relative bg-gradient-to-r from-blue-600/80 via-indigo-650/80 to-purple-650/80 p-6 rounded-3xl border border-blue-500/10 overflow-hidden shadow-xl shadow-black/25 flex flex-col justify-between min-h-[140px]">
                    <div className="absolute right-0 bottom-0 top-0 w-1/3 bg-[url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80')] bg-cover opacity-10 blur-sm pointer-events-none"></div>
                    <div className="space-y-2">
                      <span className="text-[10px] font-bold tracking-widest text-blue-200 uppercase flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        AI Study Companion Active
                      </span>
                      <h2 className="text-2xl font-black text-white leading-tight">
                        Boost your programming skills with Gen-AI
                      </h2>
                      <p className="text-xs text-blue-100 max-w-lg leading-relaxed">
                        Access detailed lesson checklists, test your knowledge in custom quizzes, or query modules using text-embedding retrieval chatbot.
                      </p>
                    </div>
                    <button 
                      onClick={() => setActiveRoute('aitutor')}
                      className="mt-4 w-fit bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs px-4.5 py-2.5 rounded-xl transition-all border border-transparent shadow-lg shadow-white/5 active:scale-95"
                    >
                      Launch AI Tutor Session
                    </button>
                  </div>

                  {/* Stats Cards Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                    <StatCard 
                      label="Enrolled Courses" 
                      value={enrolledCourses.length} 
                      subtext={`${courses.length - enrolledCourses.length} catalog items remaining`}
                      icon={BookOpenCheck} 
                      color="blue" 
                    />
                    <StatCard 
                      label="Streak Days" 
                      value="7 Days" 
                      subtext="Top 10% in this cohort" 
                      icon={Flame} 
                      color="amber" 
                    />
                    <StatCard 
                      label="Overall Progress" 
                      value={`${enrolledCourses.length > 0 ? Math.round(enrolledCourses.reduce((acc, curr) => acc + curr.progress, 0) / enrolledCourses.length) : 0}%`} 
                      subtext="Target goal: 100%" 
                      icon={Activity} 
                      color="purple" 
                    />
                  </div>

                  {/* Continue Learning progress block */}
                  <div className="space-y-3">
                    <h3 className="font-extrabold text-sm text-gray-300 uppercase tracking-wider flex items-center gap-2">
                      <Target className="w-4.5 h-4.5 text-blue-400" />
                      Continue Learning
                    </h3>
                    {enrolledCourses.length === 0 ? (
                      <div className="bg-slate-900/10 border border-dashed border-slate-800 p-8 rounded-2xl text-center">
                        <p className="text-xs text-gray-500">You are not enrolled in any courses.</p>
                        <button onClick={() => setActiveRoute('courses')} className="text-xs font-bold text-blue-400 hover:underline mt-2">Go to Catalogue</button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {enrolledCourses.map((ec) => {
                          const courseDetails = courses.find(c => c._id === ec.courseId);
                          if (!courseDetails) return null;
                          return (
                            <ProgressCard 
                              key={ec.courseId}
                              title={courseDetails.title}
                              progress={ec.progress}
                              activeLesson={ec.activeModule}
                              lessonsCount={ec.checkedModules.filter(v => !v).length}
                              onAction={() => {
                                setSelectedCourse(courseDetails);
                                setActiveRoute('course-details');
                              }}
                            />
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Recommended Courses Grid */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="font-extrabold text-sm text-gray-300 uppercase tracking-wider flex items-center gap-2">
                        <Award className="w-4.5 h-4.5 text-purple-400" />
                        Recommended Catalog Items
                      </h3>
                      <button 
                        onClick={() => setActiveRoute('courses')} 
                        className="text-xs text-blue-400 hover:text-white font-bold flex items-center gap-0.5"
                      >
                        See All Catalog
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                      {courses.slice(0, 3).map((c) => {
                        const isEnrolled = !!enrolledCourses.find(ec => ec.courseId === c._id);
                        return (
                          <CourseCard 
                            key={c._id}
                            course={c}
                            user={user}
                            isEnrolled={isEnrolled}
                            progress={enrolledCourses.find(ec => ec.courseId === c._id)?.progress || 0}
                            onViewDetails={(selected) => {
                              setSelectedCourse(selected);
                              setActiveRoute('course-details');
                            }}
                            onEnroll={handleEnrollCourse}
                          />
                        );
                      })}
                    </div>
                  </div>

                </div>
              )}

              {/* ROUTE: Courses Catalog */}
              {activeRoute === 'courses' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="font-extrabold text-lg text-white">Course Directory</h3>
                    <p className="text-xs text-gray-400">Enroll in programming tracks and generative AI chatbot cohorts.</p>
                  </div>

                  {loadingCourses ? (
                    <LoadingSpinner className="py-20" />
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                      {filteredCourses.map((c) => {
                        const isEnrolled = !!enrolledCourses.find(ec => ec.courseId === c._id);
                        return (
                          <CourseCard 
                            key={c._id}
                            course={c}
                            user={user}
                            isEnrolled={isEnrolled}
                            progress={enrolledCourses.find(ec => ec.courseId === c._id)?.progress || 0}
                            onViewDetails={(selected) => {
                              setSelectedCourse(selected);
                              setActiveRoute('course-details');
                            }}
                            onEnroll={handleEnrollCourse}
                          />
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* ROUTE: Course Details Checklist */}
              {activeRoute === 'course-details' && selectedCourse && (
                <div className="space-y-6 animate-fadeIn">
                  
                  {/* Header Row */}
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#0d1324]/50 border border-slate-800 p-5 rounded-3xl">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">COURSE ENROLLMENT DETAIL</span>
                      <h2 className="text-xl font-black text-white">{selectedCourse.title}</h2>
                      <p className="text-xs text-gray-400">By {selectedCourse.instructor} • Price: ${selectedCourse.price}</p>
                    </div>

                    <div className="flex gap-3 w-full md:w-auto">
                      <Button variant="secondary" onClick={() => setActiveRoute('courses')} className="text-xs px-4">
                        Back to Courses
                      </Button>
                      {!enrolledCourses.find(ec => ec.courseId === selectedCourse._id) ? (
                        user.role !== 'instructor' && (
                          <Button variant="primary" onClick={() => handleEnrollCourse(selectedCourse._id)} className="text-xs px-5">
                            Enroll in Course
                          </Button>
                        )
                      ) : (
                        <Button variant="purple" onClick={() => setActiveRoute('aitutor')} className="text-xs px-5 flex items-center gap-1.5">
                          <MessageSquare className="w-3.5 h-3.5" />
                          Consult AI Tutor
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Main Grid: Description & Syllabus modules list */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* Left: Syllabus Modules checklist */}
                    <div className="lg:col-span-2 space-y-4">
                      <div className="bg-[#0d1324]/30 border border-slate-800 rounded-3xl p-5 space-y-4">
                        <h3 className="font-extrabold text-sm text-gray-300 uppercase tracking-wider flex items-center gap-2">
                          <CheckSquare className="w-4.5 h-4.5 text-blue-400" />
                          Curriculum Modules & Lessons
                        </h3>

                        {!enrolledCourses.find(ec => ec.courseId === selectedCourse._id) ? (
                          <div className="p-6 text-center">
                            <AlertCircle className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                            <p className="text-xs text-gray-500">Enroll in this course to track lessons progress.</p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {getSyllabusModules(selectedCourse.title).map((mod, idx) => {
                              const enrollment = enrolledCourses.find(ec => ec.courseId === selectedCourse._id);
                              const isChecked = enrollment ? enrollment.checkedModules[idx] : false;
                              return (
                                <div 
                                  key={idx}
                                  onClick={() => handleToggleModule(selectedCourse._id, idx)}
                                  className={`flex items-center gap-3.5 p-4 border rounded-2xl cursor-pointer transition-all ${
                                    isChecked 
                                      ? 'bg-blue-600/5 border-blue-500/20 text-gray-250' 
                                      : 'bg-[#0d1324]/40 border-slate-850 text-gray-400 hover:border-slate-800'
                                  }`}
                                >
                                  <input 
                                    type="checkbox" 
                                    checked={isChecked}
                                    onChange={() => {}} // toggled by outer click
                                    className="w-4 h-4 rounded border-slate-700 text-blue-600 bg-slate-950 focus:ring-blue-650"
                                  />
                                  <div className="flex-1">
                                    <span className={`text-xs font-semibold block ${isChecked ? 'text-gray-100 line-through' : ''}`}>
                                      {mod}
                                    </span>
                                    <span className="text-[9px] text-gray-500 uppercase font-bold mt-0.5 block">Module Lesson {idx + 1}</span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right: Details Info Panel */}
                    <div className="space-y-4">
                      
                      {/* Description */}
                      <div className="bg-[#0d1324]/30 border border-slate-800 p-5 rounded-3xl space-y-3">
                        <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Detailed Overview</h4>
                        <p className="text-xs text-slate-300 leading-relaxed">
                          {selectedCourse.description || 'No detailed syllabus summary has been specified. Masters core methodologies, asynchronous request/response structures, middleware interceptors, and database entity models in this track.'}
                        </p>
                      </div>

                      {/* Course progress stat */}
                      {enrolledCourses.find(ec => ec.courseId === selectedCourse._id) && (
                        <div className="bg-[#0d1324]/30 border border-slate-800 p-5 rounded-3xl space-y-3">
                          <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Enrollment Progress</h4>
                          <div className="space-y-1">
                            <div className="flex justify-between text-[11px] font-bold font-mono">
                              <span className="text-blue-400 uppercase">Progress</span>
                              <span>{enrolledCourses.find(ec => ec.courseId === selectedCourse._id)?.progress || 0}%</span>
                            </div>
                            <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden">
                              <div 
                                className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full rounded-full transition-all duration-350"
                                style={{ width: `${enrolledCourses.find(ec => ec.courseId === selectedCourse._id)?.progress || 0}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      )}

                    </div>

                  </div>

                </div>
              )}

              {/* ROUTE: My Learning (Enrolled tracks) */}
              {activeRoute === 'mylearning' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="font-extrabold text-lg text-white">Active Enrollments</h3>
                    <p className="text-xs text-gray-400">Track module checklist parameters and overall syllabus completion.</p>
                  </div>

                  {enrolledCourses.length === 0 ? (
                    <EmptyState 
                      title="No enrolled tracks" 
                      description="You are not enrolled in any courses yet. Access the catalog list to enroll in Node, Java, or RAG syllabus guides."
                      actionText="View Course Catalogue"
                      onAction={() => setActiveRoute('courses')}
                    />
                  ) : (
                    <div className="space-y-4">
                      {enrolledCourses.map((ec) => {
                        const courseDetails = courses.find(c => c._id === ec.courseId);
                        if (!courseDetails) return null;
                        return (
                          <ProgressCard 
                            key={ec.courseId}
                            title={courseDetails.title}
                            progress={ec.progress}
                            activeLesson={ec.activeModule}
                            lessonsCount={ec.checkedModules.filter(v => !v).length}
                            onAction={() => {
                              setSelectedCourse(courseDetails);
                              setActiveRoute('course-details');
                            }}
                          />
                        );
                      })}
                    </div>
                  )}

                </div>
              )}

              {/* ROUTE: Progress Analytics */}
              {activeRoute === 'progress' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="font-extrabold text-lg text-white">Learning Metrics</h3>
                    <p className="text-xs text-gray-400">Analyze study streaks, completed lessons count, and weekly activity charts.</p>
                  </div>

                  {/* Stats grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                    <StatCard label="Completed Lessons" value={enrolledCourses.reduce((acc, curr) => acc + curr.checkedModules.filter(Boolean).length, 0)} subtext="Across all enrolled courses" icon={BookOpenCheck} color="green" />
                    <StatCard label="Overall Completion" value={`${enrolledCourses.length > 0 ? Math.round(enrolledCourses.reduce((acc, curr) => acc + curr.progress, 0) / enrolledCourses.length) : 0}%`} subtext="Progress target: 100%" icon={Activity} color="blue" />
                    <StatCard label="Streaks" value="7 Days" subtext="Top 10% in this cohort" icon={Flame} color="amber" />
                  </div>

                  {/* Weekly study time graph */}
                  <div className="bg-[#0d1324]/50 border border-slate-800 p-6 rounded-3xl space-y-4">
                    <h4 className="font-extrabold text-sm text-gray-350 uppercase tracking-wider flex items-center gap-2">
                      <TrendingUp className="w-4.5 h-4.5 text-blue-400" />
                      Weekly Study Hours
                    </h4>
                    
                    {/* Graph bars */}
                    <div className="h-44 flex items-end justify-between gap-3 pt-6 border-b border-slate-850">
                      {[
                        { day: 'Mon', hrs: 2.0, pct: 50 },
                        { day: 'Tue', hrs: 1.5, pct: 35 },
                        { day: 'Wed', hrs: 3.0, pct: 75 },
                        { day: 'Thu', hrs: 0.5, pct: 12 },
                        { day: 'Fri', hrs: 4.0, pct: 100 },
                        { day: 'Sat', hrs: 1.0, pct: 25 },
                        { day: 'Sun', hrs: 2.0, pct: 50 }
                      ].map((item, idx) => (
                        <div key={idx} className="flex-1 flex flex-col items-center gap-2 group cursor-pointer">
                          <span className="text-[10px] text-gray-400 font-bold opacity-0 group-hover:opacity-100 transition-opacity leading-none font-mono">
                            {item.hrs}h
                          </span>
                          <div className="w-full max-w-[28px] bg-slate-900 border border-slate-850 rounded-t-lg h-36 overflow-hidden flex items-end">
                            <div 
                              className="bg-gradient-to-t from-blue-600 to-indigo-500 rounded-t-md w-full transition-all duration-500"
                              style={{ height: `${item.pct}%` }}
                            ></div>
                          </div>
                          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mt-1">{item.day}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Contribution Github-style grid */}
                  <div className="bg-[#0d1324]/50 border border-slate-800 p-6 rounded-3xl space-y-4 overflow-x-auto">
                    <h4 className="font-extrabold text-sm text-gray-355 uppercase tracking-wider block">Cohort Activity Grid</h4>
                    <div className="flex gap-1.5 min-w-[500px]">
                      {Array.from({ length: 24 }).map((_, weekIdx) => (
                        <div key={weekIdx} className="flex flex-col gap-1.5">
                          {Array.from({ length: 7 }).map((_, dayIdx) => {
                            // Mock activity levels
                            const level = Math.floor(Math.random() * 4);
                            const bgs = [
                              'bg-slate-900 border-slate-850/60',
                              'bg-blue-500/10 border-blue-500/10 text-blue-400',
                              'bg-blue-500/30 border-blue-500/20',
                              'bg-blue-600 border-blue-500/20'
                            ];
                            return (
                              <div 
                                key={dayIdx} 
                                className={`w-3.5 h-3.5 border rounded ${bgs[level]} transition-colors`}
                                title={`Study session intensity: ${level}`}
                              ></div>
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              )}

              {/* ROUTE: Quizzes Graded Panels */}
              {activeRoute === 'quizzes' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="font-extrabold text-lg text-white">Syllabus Evaluation</h3>
                    <p className="text-xs text-gray-400">Test your knowledge of REST routers, Mongoose schemas, text chunking, and vector embedding algorithms.</p>
                  </div>

                  {/* Quiz UI Box */}
                  {!quizStarted ? (
                    <div className="bg-[#0d1324]/50 border border-slate-800 p-8 rounded-3xl text-center space-y-5 max-w-lg mx-auto">
                      <div className="bg-blue-500/10 border border-blue-500/25 p-4 rounded-full w-fit mx-auto text-blue-400">
                        <Award className="w-10 h-10" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="font-extrabold text-base text-gray-100">Full-Stack & GenAI Batch Quiz</h3>
                        <p className="text-xs text-gray-400 leading-relaxed">
                          This quiz evaluates your understanding of Module 1 to 4 topics, covering backend Express routing and Mongoose schema modeling alongside Generative AI embeddings.
                        </p>
                      </div>
                      <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider py-1 border-t border-b border-slate-850 flex justify-around">
                        <span>5 Questions</span>
                        <span>•</span>
                        <span>Pass score: 60%</span>
                        <span>•</span>
                        <span>Graded instantly</span>
                      </div>
                      <Button variant="primary" onClick={() => setQuizStarted(true)} className="w-full text-xs font-bold py-3 uppercase tracking-wider">
                        Start Evaluation
                      </Button>
                    </div>
                  ) : (
                    <div className="bg-[#0d1324]/50 border border-slate-800 p-6 rounded-3xl max-w-xl mx-auto space-y-6">
                      
                      {/* Header */}
                      <div className="flex justify-between items-center border-b border-slate-850 pb-4">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Active Evaluation</span>
                        <button onClick={handleResetQuiz} className="text-[10px] text-gray-500 hover:text-white font-bold underline">Cancel Quiz</button>
                      </div>

                      {/* Graded Output screen */}
                      {quizSubmitted ? (
                        <div className="space-y-6 text-center py-4">
                          <div className="bg-blue-500/10 border border-blue-500/25 p-4 rounded-full w-fit mx-auto text-blue-400">
                            <Award className="w-10 h-10 animate-bounce" />
                          </div>
                          <div className="space-y-2">
                            <h3 className="font-extrabold text-base text-white">Quiz Evaluation Completed</h3>
                            <h4 className="text-2xl font-black text-blue-400 font-mono mt-2">{quizGrade.score} / 5 Score</h4>
                            <p className="text-xs text-slate-350 max-w-md mx-auto leading-relaxed mt-4 bg-slate-950 p-4 border border-slate-850 rounded-2xl">
                              {quizGrade.feedback}
                            </p>
                          </div>

                          <div className="flex gap-3 justify-center pt-4">
                            <Button variant="secondary" onClick={handleResetQuiz} className="text-xs">
                              Retake Evaluation
                            </Button>
                            <Button variant="primary" onClick={() => setActiveRoute('dashboard')} className="text-xs">
                              Back to Dashboard
                            </Button>
                          </div>
                        </div>
                      ) : (
                        // Live Questions list
                        <div className="space-y-6">
                          {QUIZ_QUESTIONS.map((q, qIdx) => (
                            <div key={qIdx} className="space-y-3.5 border-b border-slate-850 pb-5 last:border-0 last:pb-0">
                              <h4 className="text-xs font-bold text-gray-150 leading-relaxed">
                                {qIdx + 1}. {q.q}
                              </h4>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                {q.options.map((opt, optIdx) => {
                                  const isSelected = quizAnswers[qIdx] === optIdx;
                                  return (
                                    <div
                                      key={optIdx}
                                      onClick={() => handleAnswerSelect(qIdx, optIdx)}
                                      className={`p-3 border rounded-xl text-xs font-semibold cursor-pointer transition-all select-none ${
                                        isSelected
                                          ? 'bg-blue-600/15 border-blue-500/30 text-blue-400 font-bold'
                                          : 'bg-slate-950 border-slate-850 text-gray-400 hover:border-slate-800'
                                      }`}
                                    >
                                      {opt}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          ))}

                          <Button 
                            variant="primary" 
                            onClick={handleSubmitQuiz} 
                            disabled={Object.keys(quizAnswers).length < QUIZ_QUESTIONS.length}
                            className="w-full text-xs font-bold py-3 uppercase tracking-wider mt-4"
                          >
                            Submit and Grade
                          </Button>
                        </div>
                      )}

                    </div>
                  )}

                </div>
              )}

              {/* ROUTE: AI Tutor RAG Chat Widget */}
              {activeRoute === 'aitutor' && (
                <div className="h-[calc(100vh-140px)] flex flex-col gap-4 animate-fadeIn">
                  <div>
                    <h3 className="font-extrabold text-lg text-white leading-none">AI Syllabus Assistant</h3>
                    <p className="text-xs text-gray-400 mt-1.5">Retrieve context and ask questions grounded in your course material.</p>
                  </div>
                  
                  <AIChat 
                    chatHistory={chatHistory}
                    chatLoading={chatLoading}
                    chatQuestion={chatQuestion}
                    onQuestionChange={(e) => setChatQuestion(e.target.value)}
                    onQuestionSubmit={handleChatQuestionSubmit}
                    onIndexSyllabus={handleIndexSyllabus}
                    indexingLoading={indexingLoading}
                    indexingMessage={indexingMessage}
                    onClearChat={handleClearChat}
                    chatEndRef={chatEndRef}
                  />
                </div>
              )}

              {/* ROUTE: User Profile */}
              {activeRoute === 'profile' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="font-extrabold text-lg text-white">Student Profile</h3>
                    <p className="text-xs text-gray-400">View and manage your active account metadata parameters.</p>
                  </div>

                  <div className="bg-[#0d1324]/50 border border-slate-800 p-6 rounded-3xl max-w-md mx-auto space-y-5">
                    
                    {/* User profile header badge */}
                    <div className="flex items-center gap-4 border-b border-slate-850 pb-5">
                      <div className="bg-gradient-to-tr from-blue-500 via-indigo-500 to-purple-650 p-4 rounded-full text-white shadow-xl shadow-purple-500/10 shrink-0">
                        <User className="w-10 h-10" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-black text-lg text-white leading-none">{user.name}</h4>
                        <span className="text-[10px] text-blue-400 uppercase font-black tracking-widest mt-1 block">{user.role} Member</span>
                      </div>
                    </div>

                    {/* Metadata fields */}
                    <div className="space-y-3.5 text-xs">
                      <div>
                        <span className="text-[10px] font-bold text-gray-500 uppercase block mb-1">User Identifier ID</span>
                        <input 
                          type="text" 
                          readOnly 
                          value={user.id} 
                          className="w-full px-3 py-2.5 bg-slate-950 border border-slate-850 rounded-xl text-gray-400 font-mono text-[11px] focus:outline-none" 
                        />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Email Address</span>
                        <input 
                          type="text" 
                          readOnly 
                          value={user.email} 
                          className="w-full px-3 py-2.5 bg-slate-950 border border-slate-850 rounded-xl text-gray-400 font-mono text-[11px] focus:outline-none" 
                        />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Security Token (JWT)</span>
                        <textarea 
                          readOnly 
                          rows="2"
                          value={user.token} 
                          className="w-full px-3 py-2.5 bg-slate-950 border border-slate-850 rounded-xl text-gray-500 font-mono text-[9px] resize-none focus:outline-none" 
                        />
                      </div>
                    </div>

                  </div>
                </div>
              )}

              {/* ROUTE: Settings & Developer Panel */}
              {activeRoute === 'settings' && (
                <div className="space-y-6 animate-fadeIn">
                  <div>
                    <h3 className="font-extrabold text-lg text-white">System Settings</h3>
                    <p className="text-xs text-gray-400">Manage interface variables, dark modes, and backend API connections.</p>
                  </div>

                  <div className="bg-[#0d1324]/50 border border-slate-800 rounded-3xl max-w-xl mx-auto overflow-hidden divide-y divide-slate-850 shadow-xl shadow-black/25">
                    
                    {/* 1. Interface Preferences */}
                    <div className="p-5 space-y-4">
                      <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">System Preferences</h4>
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-xs font-semibold text-gray-300">
                          <span>Dark Aesthetic Mode</span>
                          <input 
                            type="checkbox" 
                            checked={settingsToggles.darkMode} 
                            onChange={(e) => setSettingsToggles({ ...settingsToggles, darkMode: e.target.checked })}
                            className="w-4 h-4 rounded border-slate-700 text-blue-600 bg-slate-950"
                          />
                        </div>
                        <div className="flex items-center justify-between text-xs font-semibold text-gray-300">
                          <span>Email Course Notifications</span>
                          <input 
                            type="checkbox" 
                            checked={settingsToggles.emailAlerts} 
                            onChange={(e) => setSettingsToggles({ ...settingsToggles, emailAlerts: e.target.checked })}
                            className="w-4 h-4 rounded border-slate-700 text-blue-600 bg-slate-950"
                          />
                        </div>
                        <div className="flex items-center justify-between text-xs font-semibold text-gray-300">
                          <span>Enable Haptic Feedback</span>
                          <input 
                            type="checkbox" 
                            checked={settingsToggles.hapticFeedback} 
                            onChange={(e) => setSettingsToggles({ ...settingsToggles, hapticFeedback: e.target.checked })}
                            className="w-4 h-4 rounded border-slate-700 text-blue-600 bg-slate-950"
                          />
                        </div>
                      </div>
                    </div>

                    {/* 2. Developer Settings (Exposing the Port connection) */}
                    <div className="p-5 space-y-4 bg-slate-900/10">
                      <div className="flex items-center gap-2 text-purple-400">
                        <Sliders className="w-4 h-4 shrink-0" />
                        <h4 className="text-[10px] font-bold uppercase tracking-widest block">Developer API Configuration</h4>
                      </div>

                      <div className="space-y-3.5">
                        <div>
                          <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1.5">Consolidated API Server Port URL</label>
                          <input 
                            type="text" 
                            value={backendUrl} 
                            onChange={(e) => setBackendUrl(e.target.value)}
                            className="w-full text-xs font-mono bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-blue-400 focus:outline-none focus:border-blue-500"
                          />
                        </div>

                        {/* Test connection results */}
                        {testConnMsg && (
                          <div className={`p-3 rounded-xl text-xs flex gap-2 items-center ${
                            testConnStatus === 'success' 
                              ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300' 
                              : 'bg-red-500/10 border border-red-500/30 text-red-300'
                          }`}>
                            {testConnStatus === 'success' ? <CheckCircle className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                            <span>{testConnMsg}</span>
                          </div>
                        )}

                        <Button 
                          onClick={handleTestConnection} 
                          className="w-full text-xs py-2.5 font-bold"
                          variant="secondary"
                        >
                          Ping API Server
                        </Button>
                      </div>
                    </div>

                  </div>
                </div>
              )}

              {/* ROUTE: Instructor Control Board */}
              {activeRoute === 'instructor' && user && user.role === 'instructor' && (
                <div className="space-y-6">
                  
                  {/* Head navigation tabs */}
                  <div className="flex border-b border-slate-800">
                    <button
                      onClick={() => setInstructorTab('courses')}
                      className={`px-5 py-3 text-xs font-bold uppercase tracking-wider border-b-2 flex items-center gap-2 transition-all ${
                        instructorTab === 'courses' ? 'border-purple-500 text-purple-400' : 'border-transparent text-gray-400 hover:text-white'
                      }`}
                    >
                      <BookOpen className="w-4 h-4" />
                      Course Management ({courses.length})
                    </button>
                    <button
                      onClick={() => setInstructorTab('users')}
                      className={`px-5 py-3 text-xs font-bold uppercase tracking-wider border-b-2 flex items-center gap-2 transition-all ${
                        instructorTab === 'users' ? 'border-purple-500 text-purple-400' : 'border-transparent text-gray-400 hover:text-white'
                      }`}
                    >
                      <Users className="w-4 h-4" />
                      Student Registry ({users.length})
                    </button>
                  </div>

                  {/* SUB-VIEW: Courses CRUD */}
                  {instructorTab === 'courses' && (
                    <div className="space-y-4">
                      
                      <div className="flex justify-between items-center bg-slate-900/40 p-4 border border-slate-800 rounded-2xl">
                        <div>
                          <h4 className="font-extrabold text-sm text-gray-200 uppercase tracking-wider">Catalog Catalogue Manager</h4>
                          <p className="text-[11px] text-gray-500 mt-0.5">Add, edit, or delete courses visible to all cohort students.</p>
                        </div>
                        <Button 
                          variant="purple" 
                          onClick={() => {
                            setEditingCourseId(null);
                            setCourseForm({ title: '', price: '', instructor: user.name, description: '' });
                            setShowCourseForm(true);
                          }}
                          className="text-xs flex items-center gap-1 font-bold px-4 py-2"
                        >
                          <Plus className="w-4 h-4" />
                          Add Course
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {courses.map((c) => (
                          <div 
                            key={c._id}
                            className="bg-[#0d1324]/50 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between"
                          >
                            <div className="space-y-1.5">
                              <div className="flex justify-between items-start gap-4">
                                <h4 className="font-bold text-sm text-gray-200">{c.title}</h4>
                                <span className="text-xs font-extrabold text-blue-450 font-mono">${c.price}</span>
                              </div>
                              <p className="text-xs text-gray-450 line-clamp-2 leading-relaxed">{c.description || 'No summary description.'}</p>
                            </div>

                            <div className="border-t border-slate-850 pt-3 mt-4 flex justify-between items-center text-[10px] text-gray-500">
                              <span>By: {c.instructor}</span>
                              <div className="flex gap-2">
                                <button 
                                  onClick={() => openCourseEdit(c)}
                                  className="p-1.5 bg-slate-850 hover:bg-slate-800 text-gray-300 rounded-lg border border-slate-750"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </button>
                                <button 
                                  onClick={() => handleDeleteCourse(c._id)}
                                  className="p-1.5 bg-red-950/30 hover:bg-red-900/30 border border-red-500/20 text-red-400 rounded-lg"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                    </div>
                  )}

                  {/* SUB-VIEW: Users Registry CRUD */}
                  {instructorTab === 'users' && (
                    <div className="space-y-4">
                      
                      <div className="flex justify-between items-center bg-slate-900/40 p-4 border border-slate-800 rounded-2xl">
                        <div>
                          <h4 className="font-extrabold text-sm text-gray-200 uppercase tracking-wider">Cohort Accounts Registry</h4>
                          <p className="text-[11px] text-gray-500 mt-0.5">Control, add, or delete accounts of student and instructor members.</p>
                        </div>
                        <Button 
                          variant="purple" 
                          onClick={() => {
                            setEditingUserId(null);
                            setUserForm({ name: '', email: '', password: '', role: 'student' });
                            setShowUserForm(true);
                          }}
                          className="text-xs flex items-center gap-1 font-bold px-4 py-2"
                        >
                          <Plus className="w-4 h-4" />
                          Add Account
                        </Button>
                      </div>

                      {errorUsers && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-300 p-4 rounded-xl text-xs flex gap-2">
                          <ShieldAlert className="w-5 h-5 text-red-400 shrink-0" />
                          <span>{errorUsers}</span>
                        </div>
                      )}

                      {loadingUsers ? (
                        <LoadingSpinner className="py-20" />
                      ) : (
                        <div className="bg-[#0d1324]/50 border border-slate-800 rounded-2xl overflow-hidden">
                          <table className="w-full text-left border-collapse">
                            <thead>
                              <tr className="border-b border-slate-800 text-[10px] text-gray-400 uppercase font-bold bg-slate-900/30">
                                <th className="p-4">Name</th>
                                <th className="p-4">Email</th>
                                <th className="p-4">Role</th>
                                <th className="p-4 text-right">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-850">
                              {users.map((u) => (
                                <tr key={u._id || u.id} className="hover:bg-slate-900/10 text-xs">
                                  <td className="p-4 font-semibold text-gray-200">{u.name}</td>
                                  <td className="p-4 text-gray-400 font-mono text-[10.5px]">{u.email}</td>
                                  <td className="p-4">
                                    <span className={`text-[9.5px] font-bold uppercase px-2 py-0.5 rounded ${
                                      u.role === 'instructor' 
                                        ? 'bg-purple-500/10 text-purple-300 border border-purple-500/20' 
                                        : 'bg-blue-500/10 text-blue-300 border border-blue-500/20'
                                    }`}>
                                      {u.role}
                                    </span>
                                  </td>
                                  <td className="p-4 text-right">
                                    <div className="inline-flex gap-2">
                                      <button 
                                        onClick={() => openUserEdit(u)}
                                        className="p-1.5 bg-slate-850 hover:bg-slate-800 text-gray-300 rounded-lg border border-slate-750"
                                      >
                                        <Edit className="w-3.5 h-3.5" />
                                      </button>
                                      <button 
                                        onClick={() => handleDeleteUser(u._id || u.id)}
                                        className="p-1.5 bg-red-950/30 hover:bg-red-900/30 border border-red-500/20 text-red-400 rounded-lg"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}

                    </div>
                  )}

                </div>
              )}

            </div>

            {/* General Footer */}
            <footer className="bg-[#0b0f19] border-t border-slate-850 py-3.5 text-center text-[10px] text-gray-650 shrink-0 z-10 select-none">
              StudyStack Platform &copy; 2026. Made with Premium Aesthetics & Gemini Text Embeddings RAG.
            </footer>

          </div>

          {/* MOCKED MODALS */}
          
          {/* COURSE CREATE/EDIT MODAL */}
          {showCourseForm && (
            <Modal
              isOpen={showCourseForm}
              onClose={() => setShowCourseForm(false)}
              title={editingCourseId ? 'Edit Course Parameters' : 'Create New Course Catalog'}
              description="Configure tuition price, course name, description, and tutor name."
            >
              {courseFormError && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-300 p-2.5 rounded-xl text-xs mb-3 flex gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{courseFormError}</span>
                </div>
              )}
              <form onSubmit={handleCourseFormSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Course Name</label>
                  <input 
                    required 
                    type="text" 
                    placeholder="e.g. Java Backend API Design" 
                    value={courseForm.title}
                    onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                    className="w-full text-xs bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-gray-200 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Price ($)</label>
                    <input 
                      required 
                      type="number" 
                      min="0"
                      placeholder="99" 
                      value={courseForm.price}
                      onChange={(e) => setCourseForm({ ...courseForm, price: e.target.value })}
                      className="w-full text-xs bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-gray-200 font-mono focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Instructor</label>
                    <input 
                      required 
                      type="text" 
                      placeholder="Jane Smith" 
                      value={courseForm.instructor}
                      onChange={(e) => setCourseForm({ ...courseForm, instructor: e.target.value })}
                      className="w-full text-xs bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-gray-200 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Syllabus Overview</label>
                  <textarea 
                    rows="3" 
                    placeholder="Enter short description of concepts taught..." 
                    value={courseForm.description}
                    onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                    className="w-full text-xs bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-gray-200 resize-none focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="flex gap-2 justify-end pt-2 border-t border-slate-850">
                  <Button variant="secondary" onClick={() => setShowCourseForm(false)} className="text-xs">Cancel</Button>
                  <Button type="submit" disabled={courseFormLoading} variant="primary" className="text-xs">Save Course</Button>
                </div>
              </form>
            </Modal>
          )}

          {/* USER CREATE/EDIT MODAL */}
          {showUserForm && (
            <Modal
              isOpen={showUserForm}
              onClose={() => setShowUserForm(false)}
              title={editingUserId ? 'Edit Account parameters' : 'Register New Cohort Member'}
              description="Define name, email address, password keys, and permissions."
            >
              {userFormError && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-300 p-2.5 rounded-xl text-xs mb-3 flex gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{userFormError}</span>
                </div>
              )}
              <form onSubmit={handleUserFormSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Full Name</label>
                  <input 
                    required 
                    type="text" 
                    placeholder="John Doe" 
                    value={userForm.name}
                    onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                    className="w-full text-xs bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-gray-200 focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Email Address</label>
                  <input 
                    required 
                    type="email" 
                    placeholder="student@domain.com" 
                    value={userForm.email}
                    onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                    className="w-full text-xs bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-gray-200 focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">
                    {editingUserId ? 'Password (Leave blank to keep unchanged)' : 'Account Password'}
                  </label>
                  <input 
                    required={!editingUserId} 
                    type="password" 
                    placeholder="••••••••" 
                    value={userForm.password}
                    onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                    className="w-full text-xs bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-gray-200 focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Cohort Permissions Role</label>
                  <select 
                    value={userForm.role}
                    onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                    className="w-full text-xs bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-gray-200 focus:outline-none focus:border-purple-500"
                  >
                    <option value="student">Student</option>
                    <option value="instructor">Instructor</option>
                  </select>
                </div>
                <div className="flex gap-2 justify-end pt-2 border-t border-slate-850">
                  <Button variant="secondary" onClick={() => setShowUserForm(false)} className="text-xs">Cancel</Button>
                  <Button type="submit" disabled={userFormLoading} variant="purple" className="text-xs">Save Account</Button>
                </div>
              </form>
            </Modal>
          )}

        </div>
      )}

    </div>
  );
}

export default App;
