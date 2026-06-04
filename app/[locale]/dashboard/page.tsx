'use client'

import { useTranslations, useLocale } from 'next-intl'
import { useEffect, useState } from 'react'
import Navbar from '@/components/layout/Navbar'
import { Star, Clock, MapPin, Bell, Award, ChevronRight, Calendar, QrCode, Download, CheckCircle, BookOpen, Compass, Zap, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react'
import { getSession } from '@/lib/store'
import { api, ApiError } from '@/lib/api'

type VolunteerProfile = {
  id: string; full_name: string; commune: string; status: string;
  tier?: string | null; ai_score?: number | null; ai_assessment?: string | null;
  assigned_role?: string | null; assigned_dept?: string | null;
  latest_feedback?: string | null; created_at?: string;
}

type Deployment = {
  id: string; role_id: string; location: string; scheduled_date: string;
  shift: string; status: string; roles?: { name: string; dept_name: string }
}

type QuizQuestion = { q: string; options: string[]; answer: number }
type Module = { title: string; youtubeId: string; duration: string; lessons: string[]; quiz: QuizQuestion[] }

const TIER_CONFIG: Record<string, { label: string; color: string; bg: string; nextMonths: number }> = {
  bronze:   { label: 'Bronze',   color: '#D97706', bg: '#FEF3C7', nextMonths: 3 },
  silver:   { label: 'Silver',   color: '#6B7280', bg: '#F3F4F6', nextMonths: 6 },
  gold:     { label: 'Gold',     color: '#B45309', bg: '#FFFBEB', nextMonths: 12 },
  platinum: { label: 'Platinum', color: '#7C3AED', bg: '#F5F3FF', nextMonths: 12 },
}

const TRAINING_BY_DEPT: Record<string, Module[]> = {
  'Health & Sanitation': [
    {
      title: 'First Aid Basics',
      youtubeId: 'dSP5NUBHklg',
      duration: '8 min',
      lessons: [
        'Always ensure your own safety before helping an injured person.',
        'Check for responsiveness by tapping the shoulder and calling out loudly.',
        'For unconscious patients: open the airway, check breathing, call 108 immediately.',
        'Control bleeding by applying firm direct pressure with a clean cloth.',
        'Do not remove embedded objects — stabilise and transport to hospital.',
        'For burns, cool with running water for 10 minutes. Do not apply toothpaste or oil.',
        'Recovery position: place unconscious breathing patient on their side to prevent choking.',
      ],
      quiz: [
        { q: 'What is the first thing you should do before helping an injured person?', options: ['Start CPR immediately', 'Ensure your own safety', 'Call the nodal officer', 'Apply bandage'], answer: 1 },
        { q: 'Which number should you call for a medical emergency in India?', options: ['100', '101', '108', '112'], answer: 2 },
        { q: 'How long should you cool a burn under running water?', options: ['2 minutes', '5 minutes', '10 minutes', '20 minutes'], answer: 2 },
        { q: 'What should you do for an unconscious breathing patient?', options: ['Give water', 'Place in recovery position', 'Perform CPR', 'Leave them flat on back'], answer: 1 },
        { q: 'To control bleeding, you should:', options: ['Apply oil', 'Apply toothpaste', 'Apply firm direct pressure', 'Wash with soap'], answer: 2 },
      ],
    },
    {
      title: 'Health Camp Organisation',
      youtubeId: 'Q0_PYBfNCsA',
      duration: '12 min',
      lessons: [
        'Health camps require registration desks, waiting areas, consultation zones, and medicine counters.',
        'Always maintain a patient register with name, age, commune, and complaint.',
        'Maintain queue discipline — give tokens to patients on arrival.',
        'Confidentiality: never share patient information with unauthorised persons.',
        'Ensure clean water, hand sanitiser, and waste bins are available at all times.',
        'Volunteers should wear ID badges and follow instructions from medical staff only.',
        'Report any adverse reactions or emergencies to the doctor immediately.',
      ],
      quiz: [
        { q: 'What should every patient receive on arrival at a health camp?', options: ['Medicine', 'A token for queue', 'Water bottle', 'Discharge form'], answer: 1 },
        { q: 'Patient information at a health camp should be:', options: ['Posted publicly', 'Kept confidential', 'Shared with all volunteers', 'Posted on social media'], answer: 1 },
        { q: 'Volunteers should take instructions from:', options: ['Other volunteers', 'The patient', 'Medical staff only', 'The nodal officer only'], answer: 2 },
        { q: 'What must be maintained throughout the health camp?', options: ['Entertainment', 'Patient register', 'Social media updates', 'Photography'], answer: 1 },
        { q: 'In case of an adverse reaction, you should:', options: ['Handle it yourself', 'Ask other patients', 'Report to the doctor immediately', 'Send the patient home'], answer: 2 },
      ],
    },
    {
      title: 'Blood Donation Drive',
      youtubeId: 'SJpj3utFNGo',
      duration: '6 min',
      lessons: [
        'Donors must be between 18–65 years, weigh at least 45kg, and be in good health.',
        'Donor registration requires: name, age, blood group, last donation date, and health declaration.',
        'Ensure donors are seated comfortably and have had a meal before donation.',
        'After donation, donors must rest for 15 minutes and have refreshments.',
        'Donated blood must be stored in WHO-standard blood bags and refrigerated immediately.',
        'Never pressurise anyone to donate — donation must be completely voluntary.',
        'Keep the donation area clean and maintain donor privacy during the process.',
      ],
      quiz: [
        { q: 'Minimum weight for blood donation is:', options: ['35 kg', '40 kg', '45 kg', '50 kg'], answer: 2 },
        { q: 'After donating blood, the donor should rest for:', options: ['2 minutes', '5 minutes', '15 minutes', '1 hour'], answer: 2 },
        { q: 'Blood donation should be:', options: ['Mandatory for all', 'Paid activity', 'Completely voluntary', 'Only for government employees'], answer: 2 },
        { q: 'What age range is eligible for blood donation?', options: ['15–50', '18–65', '20–60', '16–70'], answer: 1 },
        { q: 'Donors should have before donation:', options: ['Nothing at all', 'Only water', 'A proper meal', 'Coffee only'], answer: 2 },
      ],
    },
  ],
  'Environment & Coastal': [
    {
      title: 'Beach Cleanup Drive',
      youtubeId: '9ZtLzPQFDpg',
      duration: '10 min',
      lessons: [
        'Always wear gloves and closed-toe footwear during beach cleanups.',
        'Collect waste in colour-coded bags: blue for recyclables, black for general waste.',
        'Never burn plastic on the beach — it releases toxic fumes and pollutes the air.',
        'Micro-plastics are tiny particles harmful to marine life — collect them carefully.',
        'Record the type and quantity of waste collected for government reporting.',
        'Avoid disturbing nesting areas of sea turtles or shore birds during cleanup.',
        'Wash hands thoroughly after the cleanup and before eating or drinking.',
      ],
      quiz: [
        { q: 'What colour bag is used for recyclables in a beach cleanup?', options: ['Black', 'Red', 'Blue', 'Green'], answer: 2 },
        { q: 'Plastic should be dealt with by:', options: ['Burning on the beach', 'Burying in sand', 'Collecting in bags for disposal', 'Throwing in the sea'], answer: 2 },
        { q: 'What protective gear must volunteers wear during cleanup?', options: ['Helmet', 'Gloves and closed footwear', 'Face mask only', 'Nothing special'], answer: 1 },
        { q: 'Why should you avoid nesting areas during cleanup?', options: ['They are restricted by police', 'To protect sea turtles and shore birds', 'They are private property', 'They have no waste'], answer: 1 },
        { q: 'After cleanup, volunteers should:', options: ['Go swimming', 'Wash hands before eating', 'Remove gloves and eat immediately', 'Leave without cleaning up'], answer: 1 },
      ],
    },
    {
      title: 'Waste Segregation',
      youtubeId: 'bBp7QYHIQ-Q',
      duration: '7 min',
      lessons: [
        'Waste is classified into: wet waste (biodegradable), dry waste (recyclable), and hazardous waste.',
        'Wet waste: food scraps, vegetable peels, garden waste — goes to composting.',
        'Dry waste: paper, plastic, glass, metal — goes to recycling.',
        'Hazardous waste: batteries, medicines, chemicals — needs special disposal.',
        'Never mix sanitary waste with other categories.',
        'Educate households to use separate bins for each category.',
        'Volunteer role is to demonstrate correct segregation, not enforce by penalty.',
      ],
      quiz: [
        { q: 'Food scraps and vegetable peels are classified as:', options: ['Dry waste', 'Wet waste', 'Hazardous waste', 'Recyclable waste'], answer: 1 },
        { q: 'Old batteries and medicines are classified as:', options: ['Wet waste', 'Dry waste', 'Hazardous waste', 'Compostable waste'], answer: 2 },
        { q: 'The volunteer role in waste segregation is to:', options: ['Penalise households', 'Demonstrate correct segregation', 'Collect money for bins', 'Report families to police'], answer: 1 },
        { q: 'Which of these goes to recycling?', options: ['Food scraps', 'Garden waste', 'Glass bottles', 'Used medicines'], answer: 2 },
        { q: 'Sanitary waste should be:', options: ['Mixed with food waste', 'Burned at home', 'Never mixed with other categories', 'Thrown on the beach'], answer: 2 },
      ],
    },
    {
      title: 'Mangrove Plantation',
      youtubeId: '3OR3ZME44L4',
      duration: '9 min',
      lessons: [
        'Mangroves protect coastlines from erosion, storms, and tsunamis.',
        'Plant mangrove saplings during high tide mark areas — they need brackish water.',
        'Space saplings at least 1 metre apart to allow root growth.',
        'Do not uproot or damage existing mangrove roots during plantation.',
        'Water saplings with brackish water — fresh water alone is not sufficient.',
        'Monitor planted saplings weekly for the first month.',
        'Record GPS location of plantation sites for government tracking.',
      ],
      quiz: [
        { q: 'What do mangroves protect coastlines from?', options: ['Air pollution', 'Erosion and storms', 'Deforestation', 'Heat waves'], answer: 1 },
        { q: 'Mangrove saplings should be spaced at least:', options: ['10 cm apart', '50 cm apart', '1 metre apart', '5 metres apart'], answer: 2 },
        { q: 'Mangroves grow best in:', options: ['Pure fresh water', 'Desert conditions', 'Brackish water areas', 'Mountain regions'], answer: 2 },
        { q: 'After planting, saplings should be monitored:', options: ['Never', 'Once a year', 'Weekly for the first month', 'Daily forever'], answer: 2 },
        { q: 'What should you never do during mangrove plantation?', options: ['Water the saplings', 'Record GPS location', 'Uproot existing mangrove roots', 'Space saplings properly'], answer: 2 },
      ],
    },
  ],
  'Law & Order / Traffic': [
    {
      title: 'Traffic Management Basics',
      youtubeId: 'KkxRCpKDDwk',
      duration: '11 min',
      lessons: [
        'Traffic volunteers assist police — they do not have authority to detain or fine anyone.',
        'Always wear your fluorescent safety vest and carry your volunteer ID.',
        'Use clear hand signals: right arm up = stop, both arms spread = slow down.',
        'Priority order at intersections: emergency vehicles > pedestrians > regular traffic.',
        'Never argue with motorists — politely redirect and escalate to police if needed.',
        'Keep emergency lanes completely clear at all times during events.',
        'Report any accidents or incidents immediately to the police control room: 100.',
      ],
      quiz: [
        { q: 'Traffic volunteers have the authority to:', options: ['Fine motorists', 'Detain people', 'Assist police in directing traffic', 'Arrest violators'], answer: 2 },
        { q: 'What is the police emergency number in India?', options: ['108', '101', '100', '112'], answer: 2 },
        { q: 'At intersections, who gets priority first?', options: ['Regular traffic', 'Pedestrians', 'Emergency vehicles', 'Cyclists'], answer: 2 },
        { q: 'The hand signal for STOP is:', options: ['Both arms spread', 'Right arm raised up', 'Left arm pointing', 'Waving both hands'], answer: 1 },
        { q: 'If a motorist argues with you, you should:', options: ['Argue back firmly', 'Fine them', 'Politely redirect and escalate to police', 'Physically stop them'], answer: 2 },
      ],
    },
    {
      title: 'Crowd Control',
      youtubeId: 'Y8_fGBrLt5Q',
      duration: '8 min',
      lessons: [
        'Crowd management begins before the event — clear signage and barriers are essential.',
        'Identify entry, exit, and emergency evacuation routes before the event starts.',
        'Never allow crowd density to exceed safe limits — use barriers and queue systems.',
        'Communicate clearly and calmly — panic spreads quickly in crowds.',
        'If someone falls in a crowd, create immediate space and call for medical help.',
        'Watch for signs of heat stress: dizziness, pale skin, fainting — act quickly.',
        'Always maintain communication with your team leader via phone or walkie-talkie.',
      ],
      quiz: [
        { q: 'Before the event, volunteers must identify:', options: ['Food stalls', 'VIP seating', 'Entry, exit, and evacuation routes', 'Parking spaces only'], answer: 2 },
        { q: 'If someone falls in a crowd, first:', options: ['Leave them', 'Call media', 'Create immediate space and get medical help', 'Continue managing crowd'], answer: 2 },
        { q: 'Signs of heat stress include:', options: ['Loud laughing', 'Dancing', 'Dizziness and fainting', 'Running fast'], answer: 2 },
        { q: 'To prevent crowd panic, communicate:', options: ['Loudly and urgently', 'Calmly and clearly', 'Using alarms', 'Not at all'], answer: 1 },
        { q: 'Crowd density should be managed using:', options: ['Ropes only', 'Volunteers standing in a line', 'Barriers and queue systems', 'Megaphones'], answer: 2 },
      ],
    },
    {
      title: 'Emergency Lane Coordination',
      youtubeId: 'cWMjFZLpJi4',
      duration: '6 min',
      lessons: [
        'Emergency lanes must remain completely clear for ambulances and fire engines.',
        'Post volunteers at key points to actively prevent vehicles from entering emergency lanes.',
        'If a vehicle is blocking the lane, politely ask them to move — do not touch the vehicle.',
        'Use hand signals and verbal communication to redirect vehicles quickly.',
        'Coordinate with police if vehicles refuse to clear the lane.',
        'Emergency lane widths must allow at least one ambulance to pass at all times.',
        'During processions, always designate and mark emergency lanes clearly.',
      ],
      quiz: [
        { q: 'Emergency lanes are kept clear for:', options: ['VIP vehicles', 'Ambulances and fire engines', 'Police jeeps only', 'Food delivery vehicles'], answer: 1 },
        { q: 'If a vehicle blocks the emergency lane, you should:', options: ['Push the vehicle away', 'Politely ask them to move', 'Ignore it', 'Fine them immediately'], answer: 1 },
        { q: 'Emergency lane width must allow:', options: ['A bicycle to pass', 'At least one ambulance to pass', 'Two trucks side by side', 'Only motorcycles'], answer: 1 },
        { q: 'If a vehicle refuses to clear the lane, you should:', options: ['Leave it', 'Coordinate with police', 'Block other vehicles too', 'Call media'], answer: 1 },
        { q: 'During processions, emergency lanes should be:', options: ['Marked clearly', 'Left unmarked', 'Open to all vehicles', 'Blocked completely'], answer: 0 },
      ],
    },
  ],
  'Education': [
    {
      title: 'Teaching Assistant Skills',
      youtubeId: 'LHY6YGLDFCM',
      duration: '14 min',
      lessons: [
        'Teaching assistants support the teacher — never take over without permission.',
        'Use simple Tamil/English words appropriate to the student\'s age and level.',
        'Encourage participation through questions, not pressure or criticism.',
        'Never humiliate a student publicly — always correct privately and kindly.',
        'Use visual aids, stories, and examples relevant to Puducherry\'s local context.',
        'Report attendance and any safeguarding concerns to the teacher immediately.',
        'Keep the classroom environment calm, clean, and welcoming at all times.',
      ],
      quiz: [
        { q: 'Teaching assistants should:', options: ['Replace the teacher', 'Support the teacher', 'Ignore the teacher', 'Take independent decisions'], answer: 1 },
        { q: 'If a student makes an error, you should:', options: ['Humiliate them publicly', 'Ignore it', 'Correct privately and kindly', 'Send them home'], answer: 2 },
        { q: 'Student participation should be encouraged through:', options: ['Pressure and fear', 'Questions and encouragement', 'Strict punishments', 'Ignoring quiet students'], answer: 1 },
        { q: 'Attendance should be reported to:', options: ['Parents directly', 'The nodal officer', 'The teacher immediately', 'Social media'], answer: 2 },
        { q: 'Teaching materials should be relevant to:', options: ['Foreign contexts', 'Puducherry\'s local context', 'Only Tamil Nadu examples', 'Global news only'], answer: 1 },
      ],
    },
    {
      title: 'Digital Literacy Training',
      youtubeId: 'Iqf6j5WUiN0',
      duration: '10 min',
      lessons: [
        'Start with the very basics: how to turn on a device, use a mouse/touchscreen.',
        'Teach internet safety: never share passwords, OTPs, or bank details online.',
        'Show how to access government services like Aadhaar, DigiLocker, and UMANG app.',
        'Be patient — senior citizens and first-time users may need repeated demonstrations.',
        'Use simple Tamil-language interfaces wherever available.',
        'Warn against online scams, fake calls, and UPI fraud clearly with examples.',
        'Always demonstrate first, then guide the learner to try it themselves.',
      ],
      quiz: [
        { q: 'What should never be shared online?', options: ['Your name', 'Your city', 'Passwords and OTPs', 'Your language preference'], answer: 2 },
        { q: 'When teaching seniors, you should be:', options: ['Fast and impatient', 'Patient with repeated demonstrations', 'Skip difficult topics', 'Use English only'], answer: 1 },
        { q: 'The best teaching method is:', options: ['Lecture only', 'Demonstrate first, then let them try', 'Give handouts and leave', 'Online video only'], answer: 1 },
        { q: 'Government services can be accessed via:', options: ['Only computers', 'UMANG app and DigiLocker', 'Only at offices', 'Paid apps only'], answer: 1 },
        { q: 'UPI fraud warnings should be given with:', options: ['Technical jargon', 'Clear examples', 'No explanation', 'Foreign language examples'], answer: 1 },
      ],
    },
    {
      title: 'Adult Literacy Facilitation',
      youtubeId: 'iBfASFJHsZ8',
      duration: '8 min',
      lessons: [
        'Adult learners have life experience — respect them and build on what they know.',
        'Never use children\'s textbooks for adults — use materials relevant to adult life.',
        'Focus on functional literacy: reading bus signs, medicine labels, and government forms.',
        'Sessions should be short (45–60 minutes) and highly practical.',
        'Create a judgment-free environment — adults may feel embarrassed about not knowing.',
        'Use local Tamil newspapers and Puducherry-specific signage as reading practice.',
        'Celebrate every small achievement to build confidence and motivation.',
      ],
      quiz: [
        { q: 'Adult learners should be taught using:', options: ['Children\'s textbooks', 'Materials relevant to adult life', 'Foreign language books', 'Technical manuals'], answer: 1 },
        { q: 'Functional literacy focuses on:', options: ['Poetry and literature', 'Reading signs, labels, and forms', 'Advanced grammar', 'Competitive exams'], answer: 1 },
        { q: 'Adult literacy sessions should be:', options: ['4 hours long', 'Theoretical and long', '45-60 minutes and practical', 'Homework-heavy'], answer: 2 },
        { q: 'Adults may feel embarrassed — you should create:', options: ['A competitive environment', 'A judgment-free environment', 'Public testing sessions', 'Strict rules'], answer: 1 },
        { q: 'To build motivation in adult learners:', options: ['Criticise errors frequently', 'Celebrate every small achievement', 'Compare them to others', 'Give exams weekly'], answer: 1 },
      ],
    },
  ],
  'Tourism & Cultural Events': [
    {
      title: 'Puducherry Heritage Guide',
      youtubeId: 'YXIfb-DxkXI',
      duration: '15 min',
      lessons: [
        'Puducherry was a French colony until 1954 — the French Quarter (White Town) reflects this history.',
        'Key landmarks: French War Memorial, Sacred Heart Basilica, Aurobindo Ashram, Promenade Beach.',
        'Puducherry has four communes: Puducherry, Villianur, Bahour, and Ariyankuppam.',
        'Tamil and French are both official languages — English is widely spoken.',
        'Auroville, 10km from Puducherry, is an international township built around the Matrimandir.',
        'Major festivals: Pongal, Bastille Day (July 14), Tamil New Year, and Karthigai Deepam.',
        'Always give accurate information — if unsure, politely say "let me find out" rather than guessing.',
      ],
      quiz: [
        { q: 'Puducherry was a French colony until:', options: ['1947', '1950', '1954', '1962'], answer: 2 },
        { q: 'How many communes does Puducherry have?', options: ['2', '3', '4', '5'], answer: 2 },
        { q: 'Auroville is located approximately how far from Puducherry?', options: ['2 km', '5 km', '10 km', '25 km'], answer: 2 },
        { q: 'Bastille Day is celebrated on:', options: ['January 14', 'July 14', 'August 15', 'November 1'], answer: 1 },
        { q: 'If a tourist asks something you don\'t know, you should:', options: ['Make up an answer', 'Ignore them', 'Politely say you\'ll find out', 'Direct them away'], answer: 2 },
      ],
    },
    {
      title: 'Event Volunteer Management',
      youtubeId: 'Q0_PYBfNCsA',
      duration: '9 min',
      lessons: [
        'Know the full event schedule and your specific zone assignment before the event.',
        'Arrive 30 minutes before the event starts for briefing.',
        'Wear your volunteer ID and event-specific identification at all times.',
        'Direct visitors clearly using signs and verbal guidance — smile and be welcoming.',
        'Report any safety hazards, suspicious behaviour, or incidents to the coordinator immediately.',
        'Do not leave your assigned zone without informing your supervisor.',
        'After the event, participate in the debrief and fill out the volunteer feedback form.',
      ],
      quiz: [
        { q: 'Volunteers should arrive before the event:', options: ['On time exactly', '30 minutes early', '1 hour late', '15 minutes late'], answer: 1 },
        { q: 'If you see a safety hazard, you should:', options: ['Ignore it', 'Handle it yourself', 'Report to coordinator immediately', 'Take a photo and post online'], answer: 2 },
        { q: 'You should leave your assigned zone:', options: ['Whenever you want', 'Only after informing supervisor', 'During peak hours', 'Never under any circumstances'], answer: 1 },
        { q: 'After the event, volunteers should:', options: ['Leave immediately', 'Participate in debrief and fill feedback form', 'Post on social media', 'Collect souvenirs'], answer: 1 },
        { q: 'Visitors should be directed with:', options: ['Rude gestures', 'Smiles and clear guidance', 'Silence', 'Written notes only'], answer: 1 },
      ],
    },
    {
      title: 'Tourist Information Skills',
      youtubeId: 'YXIfb-DxkXI',
      duration: '7 min',
      lessons: [
        'A good tourist guide is accurate, friendly, and speaks clearly at a moderate pace.',
        'Learn key phrases in Tamil, English, and French — Puducherry attracts all three groups.',
        'Common tourist questions: where to eat, transport options, beach timings, entry fees.',
        'Always direct tourists to official information — avoid personal opinions on private businesses.',
        'Know the nearest hospital, police station, and pharmacy locations.',
        'Photography rules: Sacred Heart Basilica allows photos outside, check rules inside temples.',
        'Respect cultural sensitivities — advise tourists on appropriate dress at religious sites.',
      ],
      quiz: [
        { q: 'Puducherry attracts tourists who speak:', options: ['Only English', 'Only Tamil', 'Tamil, English, and French', 'Only French'], answer: 2 },
        { q: 'When asked about restaurants, you should:', options: ['Recommend your favourite', 'Direct to official information', 'Make up information', 'Refuse to answer'], answer: 1 },
        { q: 'At religious sites, tourists should be advised on:', options: ['Where to eat', 'Photography and dress codes', 'Hotel prices', 'Shopping discounts'], answer: 1 },
        { q: 'A good tourist guide speaks:', options: ['Very fast', 'Only in Tamil', 'Clearly at a moderate pace', 'Very softly'], answer: 2 },
        { q: 'Volunteers should know the location of:', options: ['All ATMs', 'Nearest hospital and police station', 'All restaurants', 'All hotels'], answer: 1 },
      ],
    },
  ],
  'Disaster Management': [
    {
      title: 'Disaster Preparedness',
      youtubeId: '8KoLnR6BYAQ',
      duration: '13 min',
      lessons: [
        'NDMA (National Disaster Management Authority) sets guidelines for all disaster response in India.',
        'Puducherry is vulnerable to: cyclones, flooding, sea erosion, and heat waves.',
        'Community warning systems: sirens, SMS alerts, and door-to-door notification.',
        'Emergency kit: water (3 litres/person/day), food for 3 days, torch, first aid kit, documents.',
        'Evacuation routes must be known to all volunteers before any disaster event.',
        'Never spread unverified information during a disaster — only share official updates.',
        'After rescue operations, document all displaced persons for government tracking.',
      ],
      quiz: [
        { q: 'NDMA stands for:', options: ['National Defence Military Authority', 'National Disaster Management Authority', 'National Development Management Agency', 'None of the above'], answer: 1 },
        { q: 'Emergency water requirement per person per day is:', options: ['1 litre', '2 litres', '3 litres', '5 litres'], answer: 2 },
        { q: 'During a disaster, volunteers should share:', options: ['WhatsApp forwards', 'Unverified news', 'Official updates only', 'Personal opinions'], answer: 2 },
        { q: 'Puducherry is most vulnerable to:', options: ['Earthquakes and volcanoes', 'Cyclones and flooding', 'Landslides and snowfall', 'Wildfires'], answer: 1 },
        { q: 'After rescue operations, displaced persons should be:', options: ['Left to manage themselves', 'Documented for government tracking', 'Sent to other states', 'Ignored'], answer: 1 },
      ],
    },
    {
      title: 'Flood Relief Distribution',
      youtubeId: 'Y8_fGBrLt5Q',
      duration: '10 min',
      lessons: [
        'Relief distribution must be fair, systematic, and based on verified beneficiary lists.',
        'Use tokens or numbered passes to prevent chaos at distribution points.',
        'Priority groups: pregnant women, infants, elderly, and disabled persons.',
        'Keep detailed records of what was distributed, to whom, and when.',
        'Never accept payments or gifts for relief distribution — this is strictly prohibited.',
        'Contaminated water is the biggest health risk after floods — distribute only clean water.',
        'Maintain hygiene at distribution points — wash hands, wear gloves when handling food.',
      ],
      quiz: [
        { q: 'During relief distribution, priority should be given to:', options: ['Strongest individuals first', 'Pregnant women, infants, and elderly', 'Government employees first', 'Whoever arrives first'], answer: 1 },
        { q: 'Accepting payment for relief distribution is:', options: ['Allowed if small amount', 'Strictly prohibited', 'Encouraged', 'Optional'], answer: 1 },
        { q: 'The biggest health risk after floods is:', options: ['Heatstroke', 'Contaminated water', 'Sunburn', 'Mosquitoes only'], answer: 1 },
        { q: 'To prevent chaos at distribution points, use:', options: ['Loudspeakers', 'Tokens or numbered passes', 'Police force only', 'No system needed'], answer: 1 },
        { q: 'Records of relief distribution should include:', options: ['Nothing', 'Only total quantity', 'What, to whom, and when', 'Only photos'], answer: 2 },
      ],
    },
    {
      title: 'Cyclone Safety Protocol',
      youtubeId: 'KkxRCpKDDwk',
      duration: '8 min',
      lessons: [
        'Cyclone categories: Category 1 (least severe) to Category 5 (most severe).',
        'IMD (India Meteorological Department) issues cyclone alerts — monitor official channels.',
        'Evacuation must begin when IMD issues Red Alert — do not wait for landfall.',
        'Volunteers assist in community evacuation, never in isolated areas alone.',
        'During cyclone: stay indoors, away from windows, in the strongest part of the building.',
        'After the cyclone: check for damaged structures, gas leaks, and downed power lines.',
        'Do not wade through floodwater — it may be electrified or conceal open manholes.',
      ],
      quiz: [
        { q: 'IMD stands for:', options: ['Indian Military Department', 'India Meteorological Department', 'Indian Management Division', 'None'], answer: 1 },
        { q: 'Evacuation should begin when IMD issues:', options: ['Yellow Alert', 'Orange Alert', 'Red Alert', 'Blue Alert'], answer: 2 },
        { q: 'During a cyclone, you should stay:', options: ['Near windows for air', 'On the roof', 'Indoors in the strongest part of the building', 'Outdoors to monitor'], answer: 2 },
        { q: 'Floodwater should not be waded through because:', options: ['It is too cold', 'It may be electrified or hide manholes', 'It is too deep always', 'It has fish'], answer: 1 },
        { q: 'After a cyclone, first check for:', options: ['Food availability', 'Mobile signal', 'Damaged structures, gas leaks, downed power lines', 'Road conditions only'], answer: 2 },
      ],
    },
  ],
  'Municipal & Administration': [
    {
      title: 'Voter Awareness Campaign',
      youtubeId: 'Iqf6j5WUiN0',
      duration: '7 min',
      lessons: [
        'Every Indian citizen above 18 years is eligible to vote — encourage registration.',
        'Voter ID (EPIC card) is the primary identification for voting.',
        'Voter registration can be done online at voters.eci.gov.in or Form 6 offline.',
        'Inform communities about polling booth locations and voting dates well in advance.',
        'Voting is a right and a responsibility — never promote any specific party or candidate.',
        'Help elderly and disabled voters understand the accessible voting facilities available.',
        'Report any voter intimidation or malpractice to the Election Commission immediately.',
      ],
      quiz: [
        { q: 'Voting eligibility age in India is:', options: ['16 years', '18 years', '21 years', '25 years'], answer: 1 },
        { q: 'Voter registration can be done online at:', options: ['aadhaar.gov.in', 'voters.eci.gov.in', 'india.gov.in', 'digilocker.gov.in'], answer: 1 },
        { q: 'As a voter awareness volunteer, you should:', options: ['Promote your preferred party', 'Never promote any party or candidate', 'Discourage opposition voters', 'Help only certain communities'], answer: 1 },
        { q: 'Voter intimidation should be reported to:', options: ['Local media', 'Social media', 'Election Commission', 'Your nodal officer only'], answer: 2 },
        { q: 'The primary ID for voting is:', options: ['Aadhaar only', 'Passport', 'EPIC (Voter ID) card', 'Driving licence only'], answer: 2 },
      ],
    },
    {
      title: 'Census Data Collection',
      youtubeId: 'iBfASFJHsZ8',
      duration: '9 min',
      lessons: [
        'Census data is confidential — it cannot be shared with any third party or used for other purposes.',
        'Knock and introduce yourself clearly: name, organization, and purpose of visit.',
        'Record data accurately — do not guess or fill in responses without asking.',
        'All household members must be counted — including infants and elderly.',
        'Religious, caste, and language data is collected but never used for discrimination.',
        'If a household refuses, note it and escalate to your supervisor — never force entry.',
        'Submit completed forms on the same day — never keep forms overnight at home.',
      ],
      quiz: [
        { q: 'Census data must be:', options: ['Shared publicly', 'Sold to businesses', 'Kept strictly confidential', 'Posted on social media'], answer: 2 },
        { q: 'If a household refuses to participate, you should:', options: ['Force entry', 'Argue with them', 'Note it and escalate to supervisor', 'Fill it yourself'], answer: 2 },
        { q: 'All household members to be counted include:', options: ['Only adults', 'Only earning members', 'Infants and elderly too', 'Only registered voters'], answer: 2 },
        { q: 'Completed census forms should be submitted:', options: ['Weekly', 'On the same day', 'After a month', 'Only at year end'], answer: 1 },
        { q: 'Census data on religion and caste is collected:', options: ['For discrimination', 'Never', 'But never used for discrimination', 'Only in cities'], answer: 2 },
      ],
    },
    {
      title: 'Senior Citizen Welfare',
      youtubeId: 'LegPlU-gyHs',
      duration: '11 min',
      lessons: [
        'Senior citizens (60+) are entitled to government welfare schemes — know the key ones.',
        'Key schemes: Indira Gandhi National Old Age Pension, Annapurna (free food grains), Rashtriya Vayoshri Yojana (free aids).',
        'Always speak clearly and slowly — many seniors have hearing difficulties.',
        'Check on health, nutrition, loneliness, and any signs of elder abuse during visits.',
        'Help seniors navigate digital services like online pension tracking and Aadhaar updates.',
        'Report any signs of elder abuse or neglect to the child and senior welfare department.',
        'Maintain visit records including date, health status observed, and any referrals made.',
      ],
      quiz: [
        { q: 'Senior citizens eligible for government welfare are aged:', options: ['50 and above', '55 and above', '60 and above', '65 and above'], answer: 2 },
        { q: 'Rashtriya Vayoshri Yojana provides:', options: ['Cash transfers', 'Free food grains', 'Free aids like walking sticks', 'Housing'], answer: 2 },
        { q: 'When speaking to seniors with hearing difficulty, you should:', options: ['Shout loudly', 'Speak clearly and slowly', 'Use only written notes', 'Give up and leave'], answer: 1 },
        { q: 'Signs of elder abuse should be reported to:', options: ['Local media', 'Neighbours', 'Child and senior welfare department', 'Police only'], answer: 2 },
        { q: 'Visit records should include:', options: ['Nothing', 'Date, health status, and referrals', 'Only the name', 'Photos only'], answer: 1 },
      ],
    },
  ],
  'Women & Child Welfare': [
    {
      title: 'Anganwadi Support',
      youtubeId: 'LHY6YGLDFCM',
      duration: '10 min',
      lessons: [
        'Anganwadi centres provide nutrition, health, and early education to children under 6.',
        'Volunteer role: assist in meal distribution, growth monitoring, and attendance recording.',
        'Growth monitoring uses a weighing scale and height chart — record monthly.',
        'Malnutrition signs: low weight for age, pale skin, swollen belly, hair loss.',
        'Refer malnourished children to the nearest PHC (Primary Health Centre) immediately.',
        'Never substitute Anganwadi meals — government-supplied nutrition is nutritionally designed.',
        'Maintain strict hygiene when handling food for children.',
      ],
      quiz: [
        { q: 'Anganwadi centres serve children aged:', options: ['6-12 years', 'Under 6 years', '10-14 years', 'All ages'], answer: 1 },
        { q: 'Growth monitoring should be done:', options: ['Daily', 'Weekly', 'Monthly', 'Yearly'], answer: 2 },
        { q: 'A malnourished child should be referred to:', options: ['Another Anganwadi', 'Nearest PHC', 'A private hospital only', 'The nodal officer'], answer: 1 },
        { q: 'Signs of malnutrition include:', options: ['High energy levels', 'Low weight, pale skin, swollen belly', 'Good height for age', 'Active behaviour'], answer: 1 },
        { q: 'Anganwadi meals should be:', options: ['Substituted with better food', 'Skipped on some days', 'Never substituted', 'Given only to some children'], answer: 2 },
      ],
    },
    {
      title: 'Women SHG Facilitation',
      youtubeId: 'bBp7QYHIQ-Q',
      duration: '12 min',
      lessons: [
        'SHG (Self Help Group) is a group of 10-20 women who save together and support each other.',
        'Volunteer role: facilitate meetings, help maintain records, and connect to government schemes.',
        'Key government schemes for SHGs: NRLM (National Rural Livelihoods Mission), Kudumbashree.',
        'Meetings should be regular (weekly or monthly) and minutes must be recorded.',
        'Encourage participation from all members — never let one person dominate.',
        'Help SHGs access bank accounts, loans, and government skill training programmes.',
        'All financial transactions must be transparent and recorded in the group ledger.',
      ],
      quiz: [
        { q: 'An SHG typically consists of:', options: ['2-5 women', '10-20 women', '50-100 women', '5-8 men'], answer: 1 },
        { q: 'NRLM stands for:', options: ['National Rural Labour Movement', 'National Rural Livelihoods Mission', 'National Resource Loan Management', 'None'], answer: 1 },
        { q: 'SHG meetings should be:', options: ['Whenever convenient', 'Never recorded', 'Regular with minutes recorded', 'Only annual'], answer: 2 },
        { q: 'Financial transactions in an SHG must be:', options: ['Secret', 'Known only to the leader', 'Transparent and recorded in ledger', 'Informal'], answer: 2 },
        { q: 'In SHG meetings, participation should be:', options: ['Dominated by one person', 'Encouraged from all members', 'Optional', 'Only for educated members'], answer: 1 },
      ],
    },
    {
      title: 'Child Safety Awareness',
      youtubeId: 'SJpj3utFNGo',
      duration: '8 min',
      lessons: [
        'Every child has the right to safety, education, and protection from abuse.',
        'Child abuse types: physical, emotional, sexual, and neglect.',
        'Warning signs: unexplained injuries, sudden behaviour changes, fear of specific adults.',
        'POCSO Act (Protection of Children from Sexual Offences) — report any suspicion immediately.',
        'Report child safety concerns to Childline: 1098 (free, 24/7 helpline).',
        'Never investigate child abuse yourself — always refer to authorities.',
        'Maintain complete confidentiality when handling child safety cases.',
      ],
      quiz: [
        { q: 'Childline helpline number is:', options: ['100', '108', '1098', '1800'], answer: 2 },
        { q: 'POCSO Act protects children from:', options: ['Poverty', 'Sexual offences', 'Poor education', 'Malnutrition'], answer: 1 },
        { q: 'If you suspect child abuse, you should:', options: ['Investigate yourself', 'Ignore it', 'Report to authorities immediately', 'Tell the neighbours'], answer: 2 },
        { q: 'Warning signs of abuse include:', options: ['High academic performance', 'Unexplained injuries and behaviour changes', 'Making new friends', 'Being active in sports'], answer: 1 },
        { q: 'Child safety cases must be handled with:', options: ['Public discussion', 'Complete confidentiality', 'Social media posts', 'Open community meetings'], answer: 1 },
      ],
    },
  ],
}

const DEFAULT_MODULES: Module[] = [
  {
    title: 'Volunteer Orientation',
    youtubeId: 'LegPlU-gyHs',
    duration: '10 min',
    lessons: [
      'PondySevAi connects verified civic volunteers with Puducherry government departments.',
      'Your role is to support government staff — not replace them.',
      'Always carry your volunteer ID card during deployments.',
      'Report to your assigned nodal officer for all instructions and queries.',
      'Volunteer service is unpaid but rewarded through the tier system (Bronze to Platinum).',
      'Maintain confidentiality of all information you encounter during your service.',
      'Your behaviour represents the Government of Puducherry — conduct yourself with dignity.',
    ],
    quiz: [
      { q: 'What does PondySevAi connect?', options: ['Students and colleges', 'Civic volunteers with government departments', 'Businesses and customers', 'NGOs and donors'], answer: 1 },
      { q: 'Your role as a volunteer is to:', options: ['Replace government staff', 'Support government staff', 'Work independently', 'Take decisions alone'], answer: 1 },
      { q: 'For instructions during deployment, report to:', options: ['Any senior citizen', 'Your assigned nodal officer', 'The nearest police officer', 'Any government building'], answer: 1 },
      { q: 'Volunteer service in PondySevAi is:', options: ['Highly paid', 'Unpaid but rewarded through tier system', 'Paid monthly', 'Paid per event'], answer: 1 },
      { q: 'Information encountered during service should be:', options: ['Posted on social media', 'Shared with friends', 'Kept confidential', 'Published in newspapers'], answer: 2 },
    ],
  },
  {
    title: 'Code of Conduct',
    youtubeId: 'Q0_PYBfNCsA',
    duration: '6 min',
    lessons: [
      'Treat every citizen with respect regardless of religion, caste, gender, or economic status.',
      'Never accept gifts, money, or favours in exchange for your volunteer services.',
      'Do not use your volunteer status for personal gain or to access restricted areas.',
      'Arrive on time for all assignments — inform your supervisor if you will be late.',
      'Do not use your mobile phone excessively during active volunteer duty.',
      'Disagreements with supervisors should be raised privately, not in front of the public.',
      'Any misconduct can result in removal from the PondySevAi programme.',
    ],
    quiz: [
      { q: 'Volunteers should treat citizens:', options: ['Based on their status', 'With respect regardless of background', 'Only if they are polite', 'Based on religion'], answer: 1 },
      { q: 'Accepting gifts for volunteer services is:', options: ['Allowed if small', 'Encouraged', 'Never allowed', 'Allowed from friends'], answer: 2 },
      { q: 'If you disagree with your supervisor, you should:', options: ['Argue publicly', 'Raise it privately', 'Leave the assignment', 'Post on social media'], answer: 1 },
      { q: 'What happens if a volunteer shows misconduct?', options: ['Nothing', 'They get promoted', 'They may be removed from the programme', 'They get a warning only'], answer: 2 },
      { q: 'During active volunteer duty, mobile phone use should be:', options: ['Constant', 'For social media', 'Not excessive', 'Unlimited'], answer: 2 },
    ],
  },
  {
    title: 'Safety & First Aid Basics',
    youtubeId: 'dSP5NUBHklg',
    duration: '8 min',
    lessons: [
      'Always assess the scene for safety before approaching an injured person.',
      'Emergency numbers: Ambulance 108, Police 100, Fire 101, Disaster 1078.',
      'For unconscious person: check breathing, place in recovery position, call 108.',
      'Control bleeding with direct pressure using a clean cloth.',
      'For fainting: lay person flat, raise legs, loosen tight clothing.',
      'Heat stroke: move to shade, cool with water, fan, give fluids if conscious.',
      'Never move a person with suspected spinal injury — wait for medical help.',
    ],
    quiz: [
      { q: 'Ambulance emergency number in India is:', options: ['100', '101', '108', '112'], answer: 2 },
      { q: 'For an unconscious breathing person, you should:', options: ['Give water', 'Perform CPR', 'Place in recovery position and call 108', 'Leave them'], answer: 2 },
      { q: 'For heat stroke, you should:', options: ['Give spicy food', 'Move to shade and cool with water', 'Leave in the sun', 'Give hot drinks'], answer: 1 },
      { q: 'A person with suspected spinal injury should be:', options: ['Moved quickly', 'Sat upright', 'Not moved — wait for medical help', 'Given water'], answer: 2 },
      { q: 'To control bleeding, apply:', options: ['Oil', 'Toothpaste', 'Direct pressure with clean cloth', 'Ice only'], answer: 2 },
    ],
  },
  {
    title: 'Community Engagement',
    youtubeId: 'bBp7QYHIQ-Q',
    duration: '7 min',
    lessons: [
      'Community engagement means building trust through consistent, respectful behaviour.',
      'Listen actively — let community members express their concerns fully before responding.',
      'Use simple Tamil or English — avoid jargon or official language that confuses people.',
      'Be culturally sensitive — understand local customs, festivals, and sensitivities.',
      'Never make promises you cannot keep — be honest about what you can and cannot do.',
      'Build relationships over time — community trust is earned through repeated positive interactions.',
      'Feedback from the community should be recorded and passed to your nodal officer.',
    ],
    quiz: [
      { q: 'Community trust is built through:', options: ['One visit only', 'Repeated positive interactions over time', 'Giving gifts', 'Making big promises'], answer: 1 },
      { q: 'When a community member is speaking, you should:', options: ['Interrupt quickly', 'Check your phone', 'Listen actively until they finish', 'Look away'], answer: 2 },
      { q: 'Communication with community should use:', options: ['Official jargon', 'Simple Tamil or English', 'Only English', 'Technical terms'], answer: 1 },
      { q: 'Community feedback should be:', options: ['Ignored', 'Posted online', 'Recorded and passed to nodal officer', 'Kept to yourself'], answer: 2 },
      { q: 'If you cannot fulfil a request, you should:', options: ['Make a promise anyway', 'Be honest about limitations', 'Avoid the person', 'Give a fake answer'], answer: 1 },
    ],
  },
]

export default function DashboardPage() {
  const t = useTranslations('dashboard')
  const locale = useLocale()
  const [session, setSession] = useState<{ role: string | null; name: string }>({ role: null, name: '' })
  const [profile, setProfile] = useState<VolunteerProfile | null>(null)
  const [deployments, setDeployments] = useState<Deployment[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'training' | 'orientation' | 'deployment'>('overview')
  const [expandedModule, setExpandedModule] = useState<number | null>(null)
  const [completedModules, setCompletedModules] = useState<number[]>([])
  const [quizState, setQuizState] = useState<Record<string, 'pass' | 'fail'>>({})
  const [activeQuiz, setActiveQuiz] = useState<number | null>(null)
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({})
  const [quizSubmitted, setQuizSubmitted] = useState(false)

  useEffect(() => {
    setSession(getSession())
    loadData()
    const saved = localStorage.getItem('psevai_completed_modules')
    if (saved) setCompletedModules(JSON.parse(saved))
    const savedQuiz = localStorage.getItem('psevai_quiz_state')
    if (savedQuiz) setQuizState(JSON.parse(savedQuiz))
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [profileData, deployData] = await Promise.allSettled([
        api.volunteers.me() as Promise<VolunteerProfile>,
        api.deployments.my() as Promise<{ deployments: Deployment[] }>,
      ])
      if (profileData.status === 'fulfilled') setProfile(profileData.value)
      if (deployData.status === 'fulfilled') setDeployments(deployData.value.deployments)
    } catch { } finally { setLoading(false) }
  }

  const tier = profile?.tier ? TIER_CONFIG[profile.tier] : null
  const completedDeployments = deployments.filter(d => d.status === 'completed').length
  const totalHours = completedDeployments * 8
  const dept = profile?.assigned_dept || ''
  const trainingModules = TRAINING_BY_DEPT[dept] || DEFAULT_MODULES
  const passedCount = Object.values(quizState).filter(v => v === 'pass').length
  const progressPct = Math.round((passedCount / trainingModules.length) * 100)

  const startQuiz = (idx: number) => {
    setActiveQuiz(idx)
    setQuizAnswers({})
    setQuizSubmitted(false)
  }

  const submitQuiz = (idx: number) => {
    const module = trainingModules[idx]
    const correct = module.quiz.filter((q, i) => quizAnswers[i] === q.answer).length
    const pct = (correct / module.quiz.length) * 100
    const passed = pct >= 65
    const newState = { ...quizState, [idx]: passed ? 'pass' : 'fail' }
    setQuizState(newState)
    localStorage.setItem('psevai_quiz_state', JSON.stringify(newState))
    if (passed && !completedModules.includes(idx)) {
      const updated = [...completedModules, idx]
      setCompletedModules(updated)
      localStorage.setItem('psevai_completed_modules', JSON.stringify(updated))
    }
    setQuizSubmitted(true)
  }

  if (!session.role) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#F9F9F7' }}>
      <div className="text-center">
        <div className="text-4xl mb-4">🔒</div>
        <h2 className="font-bold text-xl mb-2" style={{ color: '#1A2B4A' }}>Login Required</h2>
        <a href={`/${locale}/login/volunteer`} style={{ color: '#E65C00' }}>Login as Volunteer</a>
      </div>
    </div>
  )

  const TABS = [
    { key: 'overview', label: 'Overview', icon: '⚡' },
    { key: 'training', label: 'Training', icon: '📚' },
    { key: 'orientation', label: 'Orientation', icon: '🧭' },
    { key: 'deployment', label: 'Deployment', icon: '📅' },
  ]

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-[72px]" style={{ background: '#F9F9F7' }}>
        <div className="max-w-7xl mx-auto px-5 lg:px-8 py-8">

          {/* Welcome bar */}
          <div className="rounded-2xl p-6 mb-6 relative overflow-hidden" style={{ background: '#1A2B4A' }}>
            <div className="absolute right-0 top-0 w-64 h-64 rounded-full translate-x-1/4 -translate-y-1/4" style={{ background: '#E65C00', opacity: 0.08 }} />
            <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-4 justify-between">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full mb-2"
                  style={{ background: 'rgba(74,222,128,0.2)', color: '#4ade80' }}>
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse inline-block" />
                  {profile?.status?.replace('_', ' ') || 'Active Volunteer'}
                </div>
                <h1 className="font-bold text-white text-2xl" style={{ fontFamily: 'var(--font-sora),sans-serif' }}>
                  Welcome{profile?.full_name ? `, ${profile.full_name.split(' ')[0]}` : ''}! 👋
                </h1>
                <p className="text-sm mt-0.5" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  {profile?.assigned_role || profile?.commune || 'PondySevAi Volunteer'}
                </p>
              </div>
              <div className="flex gap-3">
                {tier && (
                  <div className="rounded-xl px-4 py-2 text-center" style={{ background: 'rgba(255,255,255,0.1)' }}>
                    <div className="text-xs mb-0.5" style={{ color: 'rgba(255,255,255,0.5)' }}>Tier</div>
                    <div className="font-bold text-sm" style={{ color: tier.color }}>🏅 {tier.label}</div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mb-6 p-1 rounded-xl w-fit" style={{ background: '#EBEBEB' }}>
            {TABS.map(tab => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key as typeof activeTab)}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5"
                style={{
                  background: activeTab === tab.key ? 'white' : 'transparent',
                  color: activeTab === tab.key ? '#1A2B4A' : '#888',
                  boxShadow: activeTab === tab.key ? '0 1px 3px rgba(0,0,0,0.08)' : 'none'
                }}>
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>

          {/* ── OVERVIEW TAB ── */}
          {activeTab === 'overview' && (
            <>
              <div className="grid grid-cols-3 gap-4 mb-6">
                {[
                  { num: completedDeployments.toString(), label: 'Months Served', icon: '📅' },
                  { num: totalHours.toString(), label: 'Hours Contributed', icon: '⏱️' },
                  { num: deployments.length.toString(), label: 'Total Deployments', icon: '🎯' },
                ].map(stat => (
                  <div key={stat.label} className="bg-white rounded-2xl p-5 shadow-sm text-center" style={{ border: '1px solid #EBEBEB' }}>
                    <div className="text-2xl mb-1">{stat.icon}</div>
                    <div className="font-black text-3xl tracking-tight mb-0.5" style={{ fontFamily: 'var(--font-sora),sans-serif', color: '#1A2B4A' }}>{stat.num}</div>
                    <div className="text-xs" style={{ color: '#aaa' }}>{stat.label}</div>
                  </div>
                ))}
              </div>

              {tier && (
                <div className="bg-white rounded-2xl p-5 mb-6 shadow-sm" style={{ border: '1px solid #EBEBEB' }}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Award size={18} style={{ color: tier.color }} />
                      <span className="font-semibold" style={{ fontFamily: 'var(--font-sora),sans-serif', color: '#1A2B4A' }}>🏅 {tier.label} Tier</span>
                    </div>
                    <span className="text-xs" style={{ color: '#aaa' }}>Next tier in {tier.nextMonths - completedDeployments} months</span>
                  </div>
                  <div className="h-2 rounded-full" style={{ background: '#F0F0EE' }}>
                    <div className="h-full rounded-full" style={{ width: `${Math.min((completedDeployments / tier.nextMonths) * 100, 100)}%`, background: tier.color }} />
                  </div>
                </div>
              )}

              {profile?.ai_assessment && (
                <div className="rounded-2xl p-5 mb-6" style={{ background: '#EEF2FA', border: '1px solid rgba(26,86,219,0.2)' }}>
                  <div className="text-xs font-semibold mb-2" style={{ color: '#1A56DB' }}>⚡ Your AI Profile Assessment</div>
                  <p className="text-sm" style={{ color: '#1A2B4A' }}>{profile.ai_assessment}</p>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <div className="bg-white rounded-2xl p-6 shadow-sm" style={{ border: '1px solid #EBEBEB' }}>
                    <h2 className="font-semibold mb-4" style={{ fontFamily: 'var(--font-sora),sans-serif', color: '#1A2B4A' }}>Current Assignment</h2>
                    {profile?.assigned_role ? (
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 text-sm"><Calendar size={16} style={{ color: '#aaa' }} /><span style={{ color: '#444' }}>{profile.assigned_role}</span></div>
                        <div className="flex items-center gap-3 text-sm"><MapPin size={16} style={{ color: '#aaa' }} /><span style={{ color: '#444' }}>{profile.assigned_dept || 'Government of Puducherry'}</span></div>
                        <div className="mt-4">
                          <button onClick={() => setActiveTab('deployment')}
                            className="flex items-center gap-2 text-white rounded-xl py-3 px-5 text-sm font-medium"
                            style={{ background: '#E65C00' }}>
                            <QrCode size={16} /> QR Check-in
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm py-4" style={{ color: '#aaa' }}>
                        {profile?.status === 'registered' ? 'Your application is being reviewed. A nodal officer will assign you a role soon.' : 'No active assignment yet.'}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  {profile?.latest_feedback && (
                    <div className="bg-white rounded-2xl p-5 shadow-sm" style={{ border: '1px solid #EBEBEB' }}>
                      <h3 className="font-semibold text-sm mb-3" style={{ color: '#1A2B4A' }}>Performance</h3>
                      <div className="flex items-center gap-2 rounded-xl px-4 py-3" style={{ background: '#FEFCE8' }}>
                        <Star size={18} style={{ color: '#D97706', fill: '#D97706' }} />
                        <div>
                          <div className="text-sm font-semibold" style={{ color: '#1A2B4A' }}>
                            {profile.latest_feedback.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </div>
                          <div className="text-xs" style={{ color: '#888' }}>Latest feedback</div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="bg-white rounded-2xl p-5 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                    style={{ border: '1px solid #EBEBEB' }}
                    onClick={() => setActiveTab('training')}>
                    <h3 className="font-semibold text-sm mb-3" style={{ color: '#1A2B4A' }}>Training Progress</h3>
                    <div className="flex justify-between text-xs mb-2" style={{ color: '#666' }}>
                      <span>{passedCount}/{trainingModules.length} passed</span>
                      <span>{progressPct}%</span>
                    </div>
                    <div className="h-2 rounded-full mb-2" style={{ background: '#F0F0EE' }}>
                      <div className="h-full rounded-full" style={{ width: `${progressPct}%`, background: '#E65C00' }} />
                    </div>
                    <span className="text-xs font-medium" style={{ color: '#E65C00' }}>
                      {passedCount === trainingModules.length ? '✅ All complete!' : 'Continue training →'}
                    </span>
                  </div>

                  {profile?.tier && (
                    <div className="bg-white rounded-2xl p-5 shadow-sm" style={{ border: '1px solid #EBEBEB' }}>
                      <h3 className="font-semibold text-sm mb-3" style={{ color: '#1A2B4A' }}>Certificate</h3>
                      <a href={profile?.id ? api.certificates.downloadUrl(profile.id) : '#'}
                        className="flex items-center gap-2 w-full py-3 px-4 rounded-xl text-sm font-medium text-white"
                        style={{ background: '#1A2B4A', textDecoration: 'none' }}>
                        <Download size={15} /> Download Certificate
                      </a>
                    </div>
                  )}

                  {/* Quick Links — connected to tabs */}
                  <div className="rounded-2xl p-5" style={{ background: 'rgba(26,43,74,0.03)', border: '1px solid #EBEBEB' }}>
                    <h3 className="font-semibold text-sm mb-3" style={{ color: '#1A2B4A' }}>Quick Links</h3>
                    <div className="space-y-1">
                      {[
                        { label: 'Training Modules', tab: 'training' as const },
                        { label: 'Orientation & Checklist', tab: 'orientation' as const },
                        { label: 'My Deployments', tab: 'deployment' as const },
                      ].map(link => (
                        <button key={link.label}
                          onClick={() => setActiveTab(link.tab)}
                          className="flex items-center justify-between text-sm py-2 w-full rounded-lg px-2 hover:bg-white transition-colors"
                          style={{ color: '#666' }}>
                          {link.label} <ChevronRight size={14} />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ── TRAINING TAB ── */}
          {activeTab === 'training' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="font-bold text-xl" style={{ color: '#1A2B4A' }}>Training Modules</h2>
                  <p className="text-sm mt-0.5" style={{ color: '#888' }}>
                    {dept ? `${dept} — role-specific training` : 'General volunteer training'} · Pass each quiz (65%+) to complete
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-black" style={{ color: '#E65C00', fontFamily: 'var(--font-sora),sans-serif' }}>{progressPct}%</div>
                  <div className="text-xs" style={{ color: '#aaa' }}>{passedCount}/{trainingModules.length} passed</div>
                </div>
              </div>

              <div className="h-2 rounded-full mb-6" style={{ background: '#F0F0EE' }}>
                <div className="h-full rounded-full transition-all" style={{ width: `${progressPct}%`, background: 'linear-gradient(90deg, #E65C00, #FF7B2E)' }} />
              </div>

              <div className="space-y-4">
                {trainingModules.map((module, idx) => {
                  const isPassed = quizState[idx] === 'pass'
                  const isFailed = quizState[idx] === 'fail'
                  const isExpanded = expandedModule === idx
                  const isQuizActive = activeQuiz === idx

                  return (
                    <div key={idx} className="bg-white rounded-2xl shadow-sm overflow-hidden"
                      style={{ border: `2px solid ${isPassed ? '#BBF7D0' : isExpanded ? '#E65C00' : '#EBEBEB'}` }}>

                      {/* Module header */}
                      <button className="w-full p-5 flex items-center gap-4 text-left"
                        onClick={() => setExpandedModule(isExpanded ? null : idx)}>
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-sm"
                          style={{ background: isPassed ? '#DCFCE7' : '#FFF1E8', color: isPassed ? '#16A34A' : '#E65C00' }}>
                          {isPassed ? '✓' : idx + 1}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold" style={{ color: '#1A2B4A' }}>{module.title}</h3>
                            {isPassed && <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: '#DCFCE7', color: '#16A34A' }}>✓ Passed</span>}
                            {isFailed && !isQuizActive && <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: '#FEF2F2', color: '#DC2626' }}>Retry quiz</span>}
                          </div>
                          <p className="text-xs mt-0.5" style={{ color: '#aaa' }}>⏱ {module.duration} · {module.lessons.length} key points · 5-question quiz</p>
                        </div>
                        {isExpanded ? <ChevronUp size={18} style={{ color: '#aaa' }} /> : <ChevronDown size={18} style={{ color: '#aaa' }} />}
                      </button>

                      {/* Module content */}
                      {isExpanded && (
                        <div className="px-5 pb-5">
                          {/* Text lessons */}
                          <div className="rounded-xl p-4 mb-4" style={{ background: '#F9F9F7', border: '1px solid #EBEBEB' }}>
                            <h4 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: '#888' }}>📄 Key Learning Points</h4>
                            <ul className="space-y-2">
                              {module.lessons.map((lesson, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm" style={{ color: '#444' }}>
                                  <span className="text-xs font-bold mt-0.5 flex-shrink-0" style={{ color: '#E65C00' }}>{i + 1}.</span>
                                  {lesson}
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Watch video link */}
                          <a href={`https://www.youtube.com/watch?v=${module.youtubeId}`} target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-xl mb-4"
                            style={{ background: '#FFF1E8', color: '#E65C00', textDecoration: 'none' }}>
                            <ExternalLink size={14} /> Watch related video on YouTube
                          </a>

                          {/* Quiz */}
                          {!isQuizActive && !isPassed && (
                            <button onClick={() => startQuiz(idx)}
                              className="w-full py-3 rounded-xl text-sm font-semibold text-white"
                              style={{ background: '#1A2B4A' }}>
                              {isFailed ? '🔄 Retry Quiz' : '📝 Take Quiz to Complete'}
                            </button>
                          )}

                          {isPassed && (
                            <div className="py-3 px-4 rounded-xl text-sm font-medium text-center" style={{ background: '#F0FDF4', color: '#16A34A' }}>
                              ✅ Module completed! Well done.
                            </div>
                          )}

                          {/* Active quiz */}
                          {isQuizActive && (
                            <div className="rounded-xl p-4" style={{ background: '#F9F9F7', border: '1px solid #EBEBEB' }}>
                              <h4 className="text-sm font-semibold mb-4" style={{ color: '#1A2B4A' }}>
                                📝 Quiz — {module.title} <span className="font-normal text-xs" style={{ color: '#888' }}>(Need 65% to pass)</span>
                              </h4>

                              {module.quiz.map((q, qi) => (
                                <div key={qi} className="mb-4">
                                  <p className="text-sm font-medium mb-2" style={{ color: '#1A2B4A' }}>Q{qi + 1}. {q.q}</p>
                                  <div className="space-y-2">
                                    {q.options.map((opt, oi) => {
                                      let bg = 'white'
                                      let border = '#E2E2DC'
                                      let color = '#444'
                                      if (quizSubmitted) {
                                        if (oi === q.answer) { bg = '#F0FDF4'; border = '#16A34A'; color = '#16A34A' }
                                        else if (quizAnswers[qi] === oi && oi !== q.answer) { bg = '#FEF2F2'; border = '#DC2626'; color = '#DC2626' }
                                      } else if (quizAnswers[qi] === oi) {
                                        bg = '#EEF2FF'; border = '#1A56DB'; color = '#1A56DB'
                                      }
                                      return (
                                        <button key={oi} disabled={quizSubmitted}
                                          onClick={() => setQuizAnswers(prev => ({ ...prev, [qi]: oi }))}
                                          className="w-full text-left px-4 py-2.5 rounded-xl text-sm transition-all"
                                          style={{ background: bg, border: `1px solid ${border}`, color }}>
                                          {String.fromCharCode(65 + oi)}. {opt}
                                        </button>
                                      )
                                    })}
                                  </div>
                                </div>
                              ))}

                              {!quizSubmitted ? (
                                <button
                                  disabled={Object.keys(quizAnswers).length < module.quiz.length}
                                  onClick={() => submitQuiz(idx)}
                                  className="w-full py-3 rounded-xl text-sm font-semibold text-white mt-2"
                                  style={{ background: Object.keys(quizAnswers).length < module.quiz.length ? '#ccc' : '#E65C00' }}>
                                  Submit Answers
                                </button>
                              ) : (
                                <div className="mt-3">
                                  {(() => {
                                    const correct = module.quiz.filter((q, i) => quizAnswers[i] === q.answer).length
                                    const pct = Math.round((correct / module.quiz.length) * 100)
                                    const passed = pct >= 65
                                    return (
                                      <div className="text-center py-4 rounded-xl" style={{ background: passed ? '#F0FDF4' : '#FEF2F2' }}>
                                        <div className="text-2xl mb-1">{passed ? '🎉' : '😅'}</div>
                                        <div className="font-bold" style={{ color: passed ? '#16A34A' : '#DC2626' }}>
                                          {correct}/{module.quiz.length} correct ({pct}%) — {passed ? 'PASSED!' : 'Not passed'}
                                        </div>
                                        <p className="text-xs mt-1" style={{ color: '#666' }}>
                                          {passed ? 'Module complete! Move to the next one.' : 'Review the lesson and try again.'}
                                        </p>
                                        {!passed && (
                                          <button onClick={() => startQuiz(idx)} className="mt-3 text-xs font-medium underline" style={{ color: '#E65C00' }}>
                                            Retry Quiz
                                          </button>
                                        )}
                                        {passed && (
                                          <button onClick={() => setActiveQuiz(null)} className="mt-3 text-xs font-medium" style={{ color: '#16A34A' }}>
                                            Close ✓
                                          </button>
                                        )}
                                      </div>
                                    )
                                  })()}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              {passedCount === trainingModules.length && (
                <div className="mt-6 rounded-2xl p-5 text-center" style={{ background: '#F0FDF4', border: '1px solid #BBF7D0' }}>
                  <div className="text-3xl mb-2">🎉</div>
                  <h3 className="font-bold text-lg mb-1" style={{ color: '#16A34A' }}>Training Complete!</h3>
                  <p className="text-sm mb-4" style={{ color: '#166534' }}>You've passed all training modules. Proceed to orientation!</p>
                  <button onClick={() => setActiveTab('orientation')}
                    className="px-6 py-3 rounded-xl text-sm font-semibold text-white"
                    style={{ background: '#16A34A' }}>
                    Proceed to Orientation →
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ── ORIENTATION TAB ── */}
          {activeTab === 'orientation' && (
            <div>
              <h2 className="font-bold text-xl mb-2" style={{ color: '#1A2B4A' }}>Orientation</h2>
              <p className="text-sm mb-6" style={{ color: '#888' }}>Complete this checklist before your first deployment.</p>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Left column */}
                <div className="space-y-4">
                  {/* Checklist */}
                  <div className="bg-white rounded-2xl p-6 shadow-sm" style={{ border: '1px solid #EBEBEB' }}>
                    <h3 className="font-semibold mb-4" style={{ color: '#1A2B4A' }}>📋 Orientation Checklist</h3>
                    {[
                      { item: 'Complete all training modules', done: passedCount === trainingModules.length },
                      { item: 'Receive volunteer ID card from nodal officer', done: false },
                      { item: 'Collect safety vest', done: false },
                      { item: 'Collect event lanyard / badge', done: false },
                      { item: 'Attend pre-deployment briefing', done: false },
                      { item: 'Test QR code check-in below', done: false },
                      { item: 'Save emergency contact numbers', done: false },
                    ].map((c, i) => (
                      <div key={i} className="flex items-center gap-3 py-2.5" style={{ borderBottom: '1px solid #F9F9F7' }}>
                        <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{ background: c.done ? '#DCFCE7' : '#F3F4F6', color: c.done ? '#16A34A' : '#ccc' }}>
                          <span className="text-xs">✓</span>
                        </div>
                        <span className="text-sm" style={{ color: c.done ? '#1A2B4A' : '#888' }}>{c.item}</span>
                      </div>
                    ))}
                  </div>

                  {/* Issued items */}
                  <div className="bg-white rounded-2xl p-6 shadow-sm" style={{ border: '1px solid #EBEBEB' }}>
                    <h3 className="font-semibold mb-4" style={{ color: '#1A2B4A' }}>🎽 Issued Items</h3>
                    <p className="text-xs mb-4" style={{ color: '#888' }}>Collect these from your nodal officer before first deployment</p>
                    {[
                      { item: 'Fluorescent safety vest', icon: '🦺', desc: 'Wear during all outdoor deployments' },
                      { item: 'Volunteer ID card', icon: '🪪', desc: 'Carry at all times during service' },
                      { item: 'Event lanyard / badge', icon: '🏷️', desc: 'Event-specific, issued per deployment' },
                      { item: 'PondySevAi handbook', icon: '📖', desc: 'Code of conduct and guidelines' },
                    ].map((item, i) => (
                      <div key={i} className="flex items-start gap-3 py-3" style={{ borderBottom: '1px solid #F9F9F7' }}>
                        <span className="text-xl">{item.icon}</span>
                        <div>
                          <div className="text-sm font-medium" style={{ color: '#1A2B4A' }}>{item.item}</div>
                          <div className="text-xs" style={{ color: '#aaa' }}>{item.desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* QR code for check-in */}
                  <div className="bg-white rounded-2xl p-6 shadow-sm" style={{ border: '1px solid #EBEBEB' }}>
                    <h3 className="font-semibold mb-3" style={{ color: '#1A2B4A' }}>📱 Your QR Check-in Code</h3>
                    <p className="text-xs mb-4" style={{ color: '#888' }}>Show this to your supervisor at the deployment site</p>
                    <div className="flex flex-col items-center">
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=PONDYSEVAI-${profile?.id || 'VOLUNTEER'}&bgcolor=ffffff&color=1A2B4A&margin=10`}
                        alt="QR Code"
                        className="rounded-xl mb-3"
                        width={180} height={180}
                      />
                      <div className="text-xs font-mono font-semibold px-3 py-1 rounded-full" style={{ background: '#F0F0EE', color: '#1A2B4A' }}>
                        {profile?.id ? profile.id.slice(0, 8).toUpperCase() : 'Loading...'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right column */}
                <div className="space-y-4">
                  {/* Reporting location — dynamic based on upcoming deployment */}
                  <div className="bg-white rounded-2xl p-6 shadow-sm" style={{ border: '1px solid #EBEBEB' }}>
                    <h3 className="font-semibold mb-3" style={{ color: '#1A2B4A' }}>📍 Reporting Location</h3>
                    {deployments.filter(d => d.status === 'scheduled')[0] ? (() => {
                      const upcoming = deployments.filter(d => d.status === 'scheduled')[0]
                      const locationQuery = encodeURIComponent(upcoming.location + ', Puducherry, India')
                      return (
                        <>
                          <div className="rounded-xl overflow-hidden mb-3" style={{ border: '1px solid #EBEBEB' }}>
                            <iframe
                              src={`https://www.openstreetmap.org/export/embed.html?bbox=79.75,11.88,79.92,11.99&layer=mapnik&query=${locationQuery}`}
                              width="100%" height="200" style={{ border: 0 }} />
                          </div>
                          <div className="flex items-start gap-2">
                            <span>📍</span>
                            <div>
                              <div className="text-sm font-medium" style={{ color: '#1A2B4A' }}>{upcoming.location}</div>
                              <div className="text-xs" style={{ color: '#888' }}>Report 30 minutes before: {upcoming.shift}</div>
                              <a href={`https://www.openstreetmap.org/search?query=${locationQuery}`}
                                target="_blank" rel="noopener noreferrer"
                                className="text-xs font-medium" style={{ color: '#E65C00' }}>
                                Open in maps →
                              </a>
                            </div>
                          </div>
                        </>
                      )
                    })() : (
                      <>
                        <div className="rounded-xl overflow-hidden mb-3" style={{ border: '1px solid #EBEBEB' }}>
                          <iframe
                            src="https://www.openstreetmap.org/export/embed.html?bbox=79.82,11.92,79.86,11.96&layer=mapnik&marker=11.9416,79.8083"
                            width="100%" height="200" style={{ border: 0 }} />
                        </div>
                        <p className="text-xs" style={{ color: '#666' }}>📍 Default: Collectorate Office, Puducherry. Your specific location will appear once a deployment is assigned.</p>
                      </>
                    )}
                  </div>

                  {/* Emergency contacts */}
                  <div className="bg-white rounded-2xl p-6 shadow-sm" style={{ border: '1px solid #EBEBEB' }}>
                    <h3 className="font-semibold mb-3" style={{ color: '#1A2B4A' }}>🚨 Emergency Contacts</h3>
                    {[
                      { role: 'Ambulance', number: '108' },
                      { role: 'Police', number: '100' },
                      { role: 'Fire', number: '101' },
                      { role: 'Disaster Helpline', number: '1078' },
                      { role: 'Childline', number: '1098' },
                      { role: 'Volunteer Helpdesk', number: '1800-425-1234' },
                    ].map(c => (
                      <div key={c.role} className="flex justify-between items-center py-2 text-sm" style={{ borderBottom: '1px solid #F9F9F7' }}>
                        <span style={{ color: '#666' }}>{c.role}</span>
                        <a href={`tel:${c.number}`} className="font-semibold" style={{ color: '#E65C00', textDecoration: 'none' }}>{c.number}</a>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── DEPLOYMENT TAB ── */}
          {activeTab === 'deployment' && (
            <div>
              <h2 className="font-bold text-xl mb-2" style={{ color: '#1A2B4A' }}>My Deployments</h2>
              <p className="text-sm mb-6" style={{ color: '#888' }}>
                Total hours: <strong>{deployments.filter(d => d.status === 'completed').length * 8} hrs</strong> · 
                Completed: <strong>{deployments.filter(d => d.status === 'completed').length}</strong> · 
                Upcoming: <strong>{deployments.filter(d => d.status === 'scheduled').length}</strong>
              </p>

              {deployments.length === 0 ? (
                <div className="bg-white rounded-2xl p-8 text-center shadow-sm" style={{ border: '1px solid #EBEBEB' }}>
                  <div className="text-4xl mb-3">📅</div>
                  <p className="text-sm" style={{ color: '#aaa' }}>No deployments yet. Once a nodal officer assigns you a shift, it will appear here.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {deployments.map(d => (
                    <div key={d.id} className="bg-white rounded-2xl shadow-sm overflow-hidden"
                      style={{ border: `2px solid ${d.status === 'active' ? '#E65C00' : '#EBEBEB'}` }}>

                      {/* Deployment header */}
                      <div className="p-5">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="font-semibold text-lg" style={{ color: '#1A2B4A' }}>{d.roles?.name || 'Volunteer Role'}</h3>
                            <p className="text-sm" style={{ color: '#888' }}>{d.roles?.dept_name}</p>
                          </div>
                          <span className="text-xs font-semibold px-3 py-1.5 rounded-full"
                            style={{
                              background: d.status === 'completed' ? '#F0FDF4' : d.status === 'active' ? '#FEF3C7' : '#EEF2FF',
                              color: d.status === 'completed' ? '#16A34A' : d.status === 'active' ? '#D97706' : '#4338CA'
                            }}>
                            {d.status === 'completed' ? '✅ Completed' : d.status === 'active' ? '🟡 Active' : '🔵 Scheduled'}
                          </span>
                        </div>

                        {/* Shift info grid */}
                        <div className="grid grid-cols-2 gap-3 mb-4">
                          <div className="rounded-xl p-3" style={{ background: '#F9F9F7' }}>
                            <div className="text-xs mb-0.5" style={{ color: '#aaa' }}>Date</div>
                            <div className="text-sm font-semibold" style={{ color: '#1A2B4A' }}>📅 {d.scheduled_date}</div>
                          </div>
                          <div className="rounded-xl p-3" style={{ background: '#F9F9F7' }}>
                            <div className="text-xs mb-0.5" style={{ color: '#aaa' }}>Shift</div>
                            <div className="text-sm font-semibold" style={{ color: '#1A2B4A' }}>⏰ {d.shift}</div>
                          </div>
                          <div className="rounded-xl p-3" style={{ background: '#F9F9F7' }}>
                            <div className="text-xs mb-0.5" style={{ color: '#aaa' }}>Location</div>
                            <div className="text-sm font-semibold" style={{ color: '#1A2B4A' }}>📍 {d.location}</div>
                          </div>
                          <div className="rounded-xl p-3" style={{ background: '#F9F9F7' }}>
                            <div className="text-xs mb-0.5" style={{ color: '#aaa' }}>Hours</div>
                            <div className="text-sm font-semibold" style={{ color: '#1A2B4A' }}>⏱ {d.status === 'completed' ? '8 hrs' : 'Pending'}</div>
                          </div>
                        </div>

                        {/* OpenStreetMap for this deployment location */}
                        <div className="rounded-xl overflow-hidden mb-4" style={{ border: '1px solid #EBEBEB' }}>
                          <iframe
                            src={`https://www.openstreetmap.org/export/embed.html?bbox=79.75,11.88,79.92,11.99&layer=mapnik&query=${encodeURIComponent(d.location + ', Puducherry')}`}
                            width="100%" height="160" style={{ border: 0 }} />
                        </div>
                        <a href={`https://www.openstreetmap.org/search?query=${encodeURIComponent(d.location + ', Puducherry, India')}`}
                          target="_blank" rel="noopener noreferrer"
                          className="text-xs font-medium" style={{ color: '#E65C00', textDecoration: 'none' }}>
                          📍 Open location in maps →
                        </a>

                        {/* Supervisor contact placeholder */}
                        <div className="mt-4 rounded-xl p-3 flex items-center gap-3" style={{ background: '#EEF2FA', border: '1px solid rgba(26,86,219,0.15)' }}>
                          <span className="text-xl">👤</span>
                          <div>
                            <div className="text-xs font-semibold" style={{ color: '#1A56DB' }}>Supervisor Contact</div>
                            <div className="text-sm" style={{ color: '#1A2B4A' }}>Contact your assigned nodal officer for supervisor details</div>
                          </div>
                        </div>

                        {/* QR check-in/out buttons */}
                        {(d.status === 'scheduled' || d.status === 'active') && (
                          <div className="mt-4 flex gap-3">
                            <button
                              onClick={() => {
                                window.open(`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=CHECKIN-${d.id}-${profile?.id}&bgcolor=ffffff&color=1A2B4A`, '_blank')
                              }}
                              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white"
                              style={{ background: '#E65C00' }}>
                              <QrCode size={16} /> QR Check-in
                            </button>
                            {d.status === 'active' && (
                              <button
                                onClick={() => {
                                  window.open(`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=CHECKOUT-${d.id}-${profile?.id}&bgcolor=ffffff&color=DC2626`, '_blank')
                                }}
                                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white"
                                style={{ background: '#DC2626' }}>
                                <QrCode size={16} /> QR Check-out
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="mt-6">
            <a href={`/${locale}`} className="text-sm" style={{ color: '#aaa', textDecoration: 'none' }}>← Back to home</a>
          </div>
        </div>
      </main>
    </>
  )
}