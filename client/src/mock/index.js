// ─── SAHARA Mock Data ───────────────────────────────────────────────────────
// Used only during development before backend is connected.
// Replace these with real API responses without changing component contracts.

export const MOCK_USER = {
  id: 'u001',
  name: 'Manish Sharma',
  email: 'manish@example.com',
  role: 'patient',
  avatar: null,
  joinedAt: '2024-09-01',
  language: 'en',
}

export const MOCK_DOCTOR_USER = {
  id: 'd001',
  name: 'Dr. Priya Mehta',
  email: 'priya.mehta@sahara.care',
  role: 'doctor',
  specialty: 'Clinical Psychology',
  avatar: null,
  joinedAt: '2024-06-01',
}

export const MOCK_ADMIN_USER = {
  id: 'a001',
  name: 'Rahul Verma',
  email: 'admin@sahara.care',
  role: 'admin',
  avatar: null,
  joinedAt: '2024-01-01',
}

export const MOCK_DASHBOARD = {
  greeting: 'Good morning',
  wellnessProgress: 65,
  todayFocus: 'Complete today\'s journal and practice five minutes of mindful breathing.',
  currentMood: { value: 'calm', label: 'Calm', description: 'Feeling balanced today', emoji: '😌' },
  journalCount: 12,
  journalPeriod: 'This month',
  lastAssessment: { name: 'PHQ-9 & GAD-7', status: 'Completed', score: 7 },
  upcomingAppointments: 1,
  nextAppointment: 'Friday, 3:00 PM',
  aiInsights: {
    recommendations: [
      'You have maintained a positive mood over the past week.',
      'Consider writing a journal entry before bedtime for better reflection.',
      'Practice a 5-minute breathing exercise today.',
      'Your sleep patterns appear consistent — keep it up.',
    ],
    updatedAt: 'Today • 09:30 AM',
  },
  moodTrend: [
    { day: 'Mon', mood: 'good',      score: 4, label: 'Good'      },
    { day: 'Tue', mood: 'neutral',   score: 3, label: 'Neutral'   },
    { day: 'Wed', mood: 'good',      score: 4, label: 'Good'      },
    { day: 'Thu', mood: 'excellent', score: 5, label: 'Excellent' },
    { day: 'Fri', mood: 'good',      score: 4, label: 'Good'      },
    { day: 'Sat', mood: 'excellent', score: 5, label: 'Excellent' },
    { day: 'Sun', mood: 'calm',      score: 4, label: 'Calm'      },
  ],
  recentActivity: [
    { id: 1, type: 'journal',     label: 'Journal entry added',         time: 'Today, 08:15 AM'       },
    { id: 2, type: 'assessment',  label: 'PHQ-9 assessment completed',  time: 'Yesterday, 07:00 PM'   },
    { id: 3, type: 'appointment', label: 'Appointment booked',          time: 'Monday, 02:30 PM'      },
    { id: 4, type: 'mood',        label: 'Mood recorded — Excellent',   time: 'Sunday, 09:00 AM'      },
    { id: 5, type: 'journal',     label: 'Journal entry added',         time: 'Saturday, 10:45 PM'    },
  ],
}

export const MOCK_JOURNALS = [
  {
    id: 'j001',
    title: 'Finding calm in the chaos',
    content: 'Today was overwhelming at work, but I took ten minutes to breathe and it really helped. I noticed that when I step back from the noise, things become clearer. Grateful for the small moments.',
    mood: 'good',
    tags: ['Work', 'Gratitude', 'Progress'],
    createdAt: '2026-08-28T08:15:00',
    aiInsight: 'Your entry reflects self-awareness and healthy coping strategies. Acknowledging difficult situations while finding moments of calm is a positive pattern.',
  },
  {
    id: 'j002',
    title: 'Late night thoughts',
    content: 'Couldn\'t sleep again. Mind keeps racing about the upcoming presentation. Writing this down helps. Need to remember that preparation is the cure for anxiety.',
    mood: 'neutral',
    tags: ['Anxiety', 'Sleep', 'Work'],
    createdAt: '2026-08-27T23:45:00',
    aiInsight: null,
  },
  {
    id: 'j003',
    title: 'A really good day',
    content: 'Went for a long walk this morning. The weather was perfect. Felt connected with myself and nature. These simple moments remind me why wellness matters.',
    mood: 'excellent',
    tags: ['Gratitude', 'Exercise', 'Reflection'],
    createdAt: '2026-08-25T07:30:00',
    aiInsight: 'Physical activity combined with mindful observation shows strong wellness habits. This positive day pattern has appeared multiple times this month.',
  },
  {
    id: 'j004',
    title: 'Processing a difficult conversation',
    content: 'Had a hard talk with a family member today. It was necessary but draining. I\'m learning that honest conversations, even when hard, lead to better understanding.',
    mood: 'low',
    tags: ['Family', 'Relationships', 'Reflection'],
    createdAt: '2026-08-23T19:00:00',
    aiInsight: null,
  },
]

export const MOCK_ASSESSMENTS = [
  {
    id: 'a001',
    type: 'PHQ-9',
    name: 'Patient Health Questionnaire',
    score: 7,
    maxScore: 27,
    severity: 'mild',
    severityLabel: 'Mild Depression Symptoms',
    completedAt: '2026-08-27T19:00:00',
    interpretation: 'Your responses indicate mild symptoms. This is a screening result, not a diagnosis.',
    recommendation: 'Consider speaking with a mental health professional for further evaluation and support.',
  },
  {
    id: 'a002',
    type: 'GAD-7',
    name: 'Generalized Anxiety Disorder Scale',
    score: 5,
    maxScore: 21,
    severity: 'mild',
    severityLabel: 'Mild Anxiety Symptoms',
    completedAt: '2026-08-27T19:15:00',
    interpretation: 'Your responses indicate mild anxiety symptoms. Monitoring and self-care strategies may help.',
    recommendation: 'Practice stress reduction techniques. If symptoms persist, professional support is recommended.',
  },
]

export const MOCK_APPOINTMENTS = [
  {
    id: 'ap001',
    doctor: { id: 'd001', name: 'Dr. Priya Mehta', specialty: 'Clinical Psychology', avatar: null },
    type: 'video',
    status: 'upcoming',
    date: '2026-08-29',
    time: '15:00',
    duration: 50,
    notes: 'Follow-up session — discuss PHQ-9 results',
  },
  {
    id: 'ap002',
    doctor: { id: 'd002', name: 'Dr. Arjun Nair', specialty: 'Counseling Psychology', avatar: null },
    type: 'in-person',
    status: 'completed',
    date: '2026-08-15',
    time: '10:00',
    duration: 60,
    notes: 'Initial intake session',
  },
]

export const MOCK_DOCTORS = [
  {
    id: 'd001',
    name: 'Dr. Priya Mehta',
    specialty: 'Clinical Psychology',
    qualifications: 'PhD Psychology, MPhil Clinical',
    experience: '12 years',
    languages: ['English', 'Hindi'],
    rating: 4.9,
    reviewCount: 128,
    available: true,
    avatar: null,
    bio: 'Specializes in cognitive-behavioral therapy, anxiety and mood disorders. Compassionate, evidence-based approach.',
    consultationFee: 1500,
    sessionTypes: ['video', 'in-person'],
  },
  {
    id: 'd002',
    name: 'Dr. Arjun Nair',
    specialty: 'Counseling Psychology',
    qualifications: 'MSc Counseling Psychology, PGD Psychotherapy',
    experience: '8 years',
    languages: ['English', 'Malayalam'],
    rating: 4.7,
    reviewCount: 86,
    available: true,
    avatar: null,
    bio: 'Focuses on stress management, relationship issues, and life transitions using a person-centered approach.',
    consultationFee: 1200,
    sessionTypes: ['video', 'phone'],
  },
  {
    id: 'd003',
    name: 'Dr. Anika Sharma',
    specialty: 'Psychiatry',
    qualifications: 'MD Psychiatry, DPM',
    experience: '15 years',
    languages: ['English', 'Hindi', 'Punjabi'],
    rating: 4.8,
    reviewCount: 204,
    available: false,
    avatar: null,
    bio: 'Senior psychiatrist with expertise in complex mood disorders, PTSD, and psychotherapy integration.',
    consultationFee: 2000,
    sessionTypes: ['video', 'in-person'],
  },
]

export const MOCK_NOTIFICATIONS = [
  { id: 'n001', type: 'appointment',  title: 'Upcoming Appointment',     message: 'Your session with Dr. Priya Mehta is tomorrow at 3:00 PM.', read: false, createdAt: '2026-08-28T09:00:00' },
  { id: 'n002', type: 'ai',           title: 'New Wellness Insight',      message: 'Your AI wellness analysis has been updated with new patterns.', read: false, createdAt: '2026-08-28T09:30:00' },
  { id: 'n003', type: 'assessment',   title: 'Assessment Reminder',       message: 'It has been 4 weeks since your last PHQ-9. Consider retaking it.', read: true, createdAt: '2026-08-25T10:00:00' },
  { id: 'n004', type: 'wellness',     title: 'Daily Wellness Reminder',   message: 'Don\'t forget to log your mood and write in your journal today.', read: true, createdAt: '2026-08-28T08:00:00' },
  { id: 'n005', type: 'care',         title: 'Professional Care Update',  message: 'Dr. Priya Mehta has reviewed your recent assessment results.', read: true, createdAt: '2026-08-27T16:00:00' },
]

export const MOCK_ADMIN_STATS = {
  totalUsers:       1247,
  activeUsers:      843,
  professionals:    28,
  appointments:     156,
  assessmentsToday: 34,
  flaggedCases:     7,
  userGrowth: [
    { month: 'Mar', users: 620 },
    { month: 'Apr', users: 745 },
    { month: 'May', users: 890 },
    { month: 'Jun', users: 950 },
    { month: 'Jul', users: 1100 },
    { month: 'Aug', users: 1247 },
  ],
  assessmentActivity: [
    { month: 'Mar', phq9: 145, gad7: 120 },
    { month: 'Apr', phq9: 178, gad7: 155 },
    { month: 'May', phq9: 210, gad7: 188 },
    { month: 'Jun', phq9: 195, gad7: 172 },
    { month: 'Jul', phq9: 240, gad7: 215 },
    { month: 'Aug', phq9: 256, gad7: 230 },
  ],
  riskDistribution: [
    { name: 'Minimal', value: 58, color: '#22c55e' },
    { name: 'Mild',    value: 27, color: '#0ea5e9' },
    { name: 'Moderate',value: 10, color: '#f59e0b' },
    { name: 'Severe',  value: 5,  color: '#ef4444' },
  ],
}

export const MOCK_DOCTOR_PATIENTS = [
  {
    id: 'u001',
    name: 'Manish Sharma',
    age: 28,
    lastSession: '2026-08-15',
    nextSession: '2026-08-29',
    riskLevel: 'mild',
    lastAssessment: { type: 'PHQ-9', score: 7, date: '2026-08-27' },
    status: 'active',
    avatar: null,
  },
  {
    id: 'u002',
    name: 'Sneha Kapoor',
    age: 34,
    lastSession: '2026-08-20',
    nextSession: '2026-09-03',
    riskLevel: 'moderate',
    lastAssessment: { type: 'GAD-7', score: 12, date: '2026-08-19' },
    status: 'active',
    avatar: null,
  },
  {
    id: 'u003',
    name: 'Rahul Desai',
    age: 22,
    lastSession: '2026-08-10',
    nextSession: null,
    riskLevel: 'minimal',
    lastAssessment: { type: 'PHQ-9', score: 3, date: '2026-08-10' },
    status: 'stable',
    avatar: null,
  },
]

export const PHQ9_QUESTIONS = [
  { id: 1, text: 'Little interest or pleasure in doing things?' },
  { id: 2, text: 'Feeling down, depressed, or hopeless?' },
  { id: 3, text: 'Trouble falling or staying asleep, or sleeping too much?' },
  { id: 4, text: 'Feeling tired or having little energy?' },
  { id: 5, text: 'Poor appetite or overeating?' },
  { id: 6, text: 'Feeling bad about yourself — or that you are a failure or have let yourself or your family down?' },
  { id: 7, text: 'Trouble concentrating on things, such as reading the newspaper or watching television?' },
  { id: 8, text: 'Moving or speaking so slowly that other people could have noticed? Or the opposite — being so fidgety or restless that you have been moving around a lot more than usual?' },
  { id: 9, text: 'Thoughts that you would be better off dead, or of hurting yourself in some way?' },
]

export const GAD7_QUESTIONS = [
  { id: 1, text: 'Feeling nervous, anxious, or on edge?' },
  { id: 2, text: 'Not being able to stop or control worrying?' },
  { id: 3, text: 'Worrying too much about different things?' },
  { id: 4, text: 'Trouble relaxing?' },
  { id: 5, text: 'Being so restless that it is hard to sit still?' },
  { id: 6, text: 'Becoming easily annoyed or irritable?' },
  { id: 7, text: 'Feeling afraid, as if something awful might happen?' },
]

export const ASSESSMENT_OPTIONS = [
  { value: 0, label: 'Not at all' },
  { value: 1, label: 'Several days' },
  { value: 2, label: 'More than half the days' },
  { value: 3, label: 'Nearly every day' },
]

export const MOCK_CHAT_MESSAGES = [
  {
    id: 1,
    role: 'assistant',
    content: 'Hello! I\'m your SAHARA wellness assistant. I\'m here to listen and support your mental wellness journey. How are you feeling today?',
    timestamp: new Date(Date.now() - 60000).toISOString(),
  },
]

export const CHAT_SUGGESTED_PROMPTS = [
  'I\'m feeling anxious today',
  'I need help with stress management',
  'Can you suggest a breathing exercise?',
  'I\'ve been having trouble sleeping',
  'I want to understand my mood patterns',
  'Help me set a wellness goal',
]
