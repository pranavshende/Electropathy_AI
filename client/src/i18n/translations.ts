export type Language = 'en' | 'hi' | 'mr';

export interface TranslationSchema {
  common: {
    appTitle: string;
    engineBadge: string;
    loading: string;
    save: string;
    cancel: string;
    close: string;
    back: string;
    submit: string;
    verifiedPatient: string;
    signOut: string;
    search: string;
  };
  navbar: {
    consultations: string;
    records: string;
    dualTable: string;
    optimizer: string;
    accessPortal: string;
    portalShort: string;
  };
  hero: {
    eyebrow: string;
    title1: string;
    title2: string;
    subtitle: string;
    consultationsCount: string;
    precisionSub: string;
    darkCardTitle: string;
    darkCardDesc: string;
    dualTablePill: string;
    optimizerPill: string;
    safetyGate: string;
  };
  auth: {
    patientLogin: string;
    adminLogin: string;
    patientSignInHeader: string;
    patientSignInSub: string;
    signIn: string;
    newPatient: string;
    mobileNumber: string;
    mobilePlaceholder: string;
    password: string;
    passwordPlaceholder: string;
    forgotPassword: string;
    demoBanner: string;
    fillDemo: string;
    fillAdmin: string;
    filled: string;
    signInPatientBtn: string;
    signInAdminBtn: string;
    or: string;
    newPatientPrompt: string;
    alreadyAccount: string;
    sendOtp: string;
    sendingOtp: string;
    resendOtp: string;
    enterOtp: string;
    otpHint: string;
    verifyOtp: string;
    verifying: string;
    fullName: string;
    fullNamePlaceholder: string;
    userType: string;
    patientRole: string;
    practitionerRole: string;
    studentRole: string;
    preferredLanguage: string;
    createAccount: string;
    creatingAccount: string;
    resetPassword: string;
    newPassword: string;
    updatePassword: string;
    securityNotice: string;
    adminEmail: string;
    adminEmailPlaceholder: string;
    adminPassword: string;
    adminNotice: string;
  };
  pathways: {
    eyebrow: string;
    heading: string;
    desc: string;
    card1Title: string;
    card1Desc: string;
    card1Meta: string;
    card2Title: string;
    card2Desc: string;
    card2Meta: string;
    card3Title: string;
    card3Desc: string;
    card3Meta: string;
  };
  disclaimer: {
    noticeTitle: string;
    compactText: string;
    fullNoticeTitle: string;
    fullText: string;
    copyright: string;
  };
  chat: {
    newConsultation: string;
    history: string;
    activeConsultation: string;
    placeholder: string;
    send: string;
    emergencyWarning: string;
    emergencyCall: string;
    groundedNotice: string;
    emptyTitle: string;
    emptySubtitle: string;
    noConversations: string;
    startFirst: string;
  };
  records: {
    title: string;
    subtitle: string;
    searchPlaceholder: string;
    noRecords: string;
    noRecordsSub: string;
    chiefComplaints: string;
    vitals: string;
    lifestyle: string;
    viewDetails: string;
    newIntake: string;
    ageGender: string;
    contact: string;
    city: string;
    allergies: string;
    conditions: string;
    noneReported: string;
  };
  protocol: {
    safetyIntercept: string;
    optionA: string;
    optionB: string;
    bottleTitle: string;
    dilution: string;
    dosageSchedule: string;
    polarity: string;
    externalApplications: string;
    temperamentGuidance: string;
    practitionerNotice: string;
    uniqueRemedies: string;
    uniqueElectricities: string;
  };
  intake: {
    step1Title: string;
    step2Title: string;
    step3Title: string;
    step4Title: string;
    step5Title: string;
    patientName: string;
    age: string;
    gender: string;
    contactNumber: string;
    city: string;
    occupation: string;
    complaint: string;
    duration: string;
    severity: string;
    factors: string;
    presentIllness: string;
    previousTreatments: string;
    treatmentResponse: string;
    chronicConditions: string;
    allergies: string;
    surgeries: string;
    diet: string;
    sleep: string;
    appetite: string;
    stressLevel: string;
    temperament: string;
    notes: string;
    nextStep: string;
    prevStep: string;
    saveRecord: string;
  };
}

export const translations: Record<Language, TranslationSchema> = {
  en: {
    common: {
      appTitle: 'ElectropathyAI',
      engineBadge: 'v2026 Engine',
      loading: 'Loading Electropathy AI Portal...',
      save: 'Save',
      cancel: 'Cancel',
      close: 'Close',
      back: 'Back',
      submit: 'Submit',
      verifiedPatient: 'Verified Patient',
      signOut: 'Sign out',
      search: 'Search...',
    },
    navbar: {
      consultations: 'AI Consultations',
      records: 'Health Records',
      dualTable: 'Dual-Table Materia Medica',
      optimizer: '4-Bottle Mattei Optimizer',
      accessPortal: 'Access Portal',
      portalShort: 'Portal',
    },
    hero: {
      eyebrow: 'AI-Driven Precision • Count Cesare Mattei System',
      title1: 'Next Era Of Medical',
      title2: 'Advancements',
      subtitle: 'AI-driven diagnostics and personalized plant electropathy converge. Explore a future where cellular polarity balancing, organ-specific botanicals, and real-time clinical safety gates take center stage.',
      consultationsCount: '1.5K+ Verified Clinical Consultations',
      precisionSub: 'Precision Tailoring For Optimal Healing',
      darkCardTitle: 'ARE YOU READY TO REDEFINE YOUR HEALTH JOURNEY?',
      darkCardDesc: 'Experience the fusion of 38 Core Remedy-States, 60 SPG Botanical Organ Actions, and dynamic 4-bottle protocol tailoring as we chart a course into the future of natural medicine.',
      dualTablePill: 'Dual-Table Pharmacopoeia (PDF Verified)',
      optimizerPill: '4-Bottle Mattei Optimizer',
      safetyGate: 'Clinical Safety Gate (7 Red Flags)',
    },
    auth: {
      patientLogin: 'Patient Login',
      adminLogin: 'Admin Login',
      patientSignInHeader: 'Patient Sign In',
      patientSignInSub: 'Sign in with your mobile number to view your private consultations.',
      signIn: 'Sign In',
      newPatient: 'New Patient / OTP',
      mobileNumber: 'Mobile Number',
      mobilePlaceholder: 'Enter 10-digit mobile number',
      password: 'Password',
      passwordPlaceholder: 'Enter your account password',
      forgotPassword: 'Forgot Password?',
      demoBanner: 'Demo: 8421358609 / Password@1234',
      fillDemo: 'Fill Demo',
      fillAdmin: 'Fill Admin',
      filled: 'Filled!',
      signInPatientBtn: 'Sign In to Patient Portal',
      signInAdminBtn: 'Sign In to Admin Console',
      or: 'OR',
      newPatientPrompt: 'New Patient? Verify number & register with OTP',
      alreadyAccount: 'Already have an account? Sign In with Password',
      sendOtp: 'Send OTP via SMS',
      sendingOtp: 'Sending Verification OTP...',
      resendOtp: 'Resend OTP',
      enterOtp: 'Enter 6-Digit OTP',
      otpHint: 'Enter the 6-digit OTP code sent to your mobile device.',
      verifyOtp: 'Verify OTP Code',
      verifying: 'Verifying OTP...',
      fullName: 'Full Name',
      fullNamePlaceholder: 'Enter your full legal name',
      userType: 'Account Type',
      patientRole: 'Patient / Individual',
      practitionerRole: 'Electropathy Practitioner',
      studentRole: 'Medical Student / Researcher',
      preferredLanguage: 'Preferred Language for Consultations',
      createAccount: 'Complete Registration & Access Portal',
      creatingAccount: 'Creating Account...',
      resetPassword: 'Set New Password',
      newPassword: 'New Password',
      updatePassword: 'Update Password & Sign In',
      securityNotice: 'End-to-End Encrypted Session • ElectropathyAI Strict Personal Isolation',
      adminEmail: 'Administrator Email',
      adminEmailPlaceholder: 'admin@electropathy.ai',
      adminPassword: 'Administrator Password',
      adminNotice: '🛡️ Admin console provides full directory oversight, conducts new clinical intakes, and inspects event audit trails.',
    },
    pathways: {
      eyebrow: 'Count Cesare Mattei Principles & Modern AI',
      heading: 'YOUR PATH TO BALANCED POLARITY & CELLULAR HEALING',
      desc: 'A comprehensive clinical knowledge base and state-organ convergence engine designed to restore physiological equilibrium naturally.',
      card1Title: 'Dual-Table Pharmacopoeia',
      card1Desc: 'Integrates 38 Core Remedy-States with 60 SPG Botanical Organ Actions without forced table conflation.',
      card1Meta: '98 Distinct Documented Formulations',
      card2Title: 'State–Organ Convergence',
      card2Desc: 'Cross-references symptoms across 8 body systems, 12 pathological mechanisms, and cellular tissue affinities.',
      card2Meta: 'Category A, B, C Evidence Tiers',
      card3Title: '4-Bottle Protocol Dynamics',
      card3Desc: 'Generates balanced Option A and Option B formulations with exact dilution dynamics and electric polarity matching.',
      card3Meta: 'D1–D3 Acute & D6–D30 Recovery',
    },
    disclaimer: {
      noticeTitle: 'Medical Notice:',
      compactText: 'Electropathy AI is an informational decision-support platform built exclusively from verified datasets authorized by Dr. Ashish Wandhare. Final medical judgment resides solely with the licensed practitioner.',
      fullNoticeTitle: 'Clinical Practice Notice:',
      fullText: 'Electropathy AI is an informational clinical decision-support application built exclusively from verified datasets authorized by Dr. Ashish Wandhare. It does not provide autonomous diagnosis or unsupervised prescription. Final medical judgment resides solely with the licensed practitioner.',
      copyright: '© 2026 Electropathy AI • Developed by NKSKILLEDGE PRIVATE LIMITED for Dr. Ashish Wandhare • All Rights Reserved.',
    },
    chat: {
      newConsultation: 'New Consultation',
      history: 'Consultation History',
      activeConsultation: 'Active Consultation',
      placeholder: 'Describe your symptoms, duration, and feelings...',
      send: 'Send',
      emergencyWarning: 'EMERGENCY RED FLAG ALERT',
      emergencyCall: 'Call 112 / 108 Immediately for Emergency Services',
      groundedNotice: 'Grounded in Dr. Wandhare’s Electropathy Knowledge Base',
      emptyTitle: 'Start Your Clinical Consultation',
      emptySubtitle: 'Describe your symptoms naturally. The AI evaluates organ affinity, bioelectric polarity, and doctor-approved remedy states.',
      noConversations: 'No previous consultations recorded.',
      startFirst: 'Start your first consultation above.',
    },
    records: {
      title: 'Patient Health Records',
      subtitle: 'Historical cases, diagnoses, and electropathy treatment protocols.',
      searchPlaceholder: 'Search records by name, complaint, or contact...',
      noRecords: 'No health records on file.',
      noRecordsSub: 'When your doctor conducts clinical intakes, your verified health profile will appear here.',
      chiefComplaints: 'Chief Complaints',
      vitals: 'Vital Signs',
      lifestyle: 'Lifestyle & Habits',
      viewDetails: 'View Full Case Record',
      newIntake: 'New Patient Intake',
      ageGender: 'Age / Gender',
      contact: 'Contact',
      city: 'City',
      allergies: 'Allergies',
      conditions: 'Chronic Conditions',
      noneReported: 'None reported',
    },
    protocol: {
      safetyIntercept: 'Clinical Safety Intercept Active',
      optionA: 'Option A (Primary Formulation)',
      optionB: 'Option B (Alternative Formulation)',
      bottleTitle: 'Bottle',
      dilution: 'Recommended Dilution',
      dosageSchedule: 'Dosage Schedule',
      polarity: 'Bioelectric Polarity',
      externalApplications: 'External Local Applications',
      temperamentGuidance: 'Constitutional Temperament Guidance',
      practitionerNotice: 'Practitioner Clinical Notice',
      uniqueRemedies: 'Unique Remedies',
      uniqueElectricities: 'Unique Electricities',
    },
    intake: {
      step1Title: 'Patient Identity & Contact',
      step2Title: 'Chief Complaints & History',
      step3Title: 'Medical History & Allergies',
      step4Title: 'Lifestyle & Vital Signs',
      step5Title: 'Temperament & Review',
      patientName: 'Patient Full Name',
      age: 'Age (Years)',
      gender: 'Biological Gender',
      contactNumber: 'Mobile Number',
      city: 'City / Location',
      occupation: 'Occupation',
      complaint: 'Primary Chief Complaint',
      duration: 'Duration (e.g. 5 days, 3 months)',
      severity: 'Severity Scale (1 to 10)',
      factors: 'Aggravating / Relieving Factors',
      presentIllness: 'Present Illness Details',
      previousTreatments: 'Previous Treatments Taken',
      treatmentResponse: 'Response to Past Treatments',
      chronicConditions: 'Known Chronic Conditions',
      allergies: 'Known Drug / Environmental Allergies',
      surgeries: 'Past Surgeries or Major Trauma',
      diet: 'Dietary Regimen',
      sleep: 'Sleep Patterns',
      appetite: 'Appetite Assessment',
      stressLevel: 'Reported Stress Level',
      temperament: 'Constitutional Temperament',
      notes: 'Practitioner Clinical Observations',
      nextStep: 'Continue to Next Step',
      prevStep: 'Back to Previous Step',
      saveRecord: 'Save Patient Intake Record',
    },
  },
  hi: {
    common: {
      appTitle: 'इलेक्ट्रोपैथी एआई',
      engineBadge: 'v2026 इंजन',
      loading: 'इलेक्ट्रोपैथी एआई पोर्टल लोड हो रहा है...',
      save: 'सहेजें',
      cancel: 'रद्द करें',
      close: 'बंद करें',
      back: 'वापस',
      submit: 'जमा करें',
      verifiedPatient: 'प्रमाणित रोगी',
      signOut: 'साइन आउट',
      search: 'खोजें...',
    },
    navbar: {
      consultations: 'एआई परामर्श',
      records: 'स्वास्थ्य रिकॉर्ड',
      dualTable: 'ड्यूल-टेबल मटेरिया मेडिका',
      optimizer: '4-बॉटल मट्टेई ऑप्टिमाइज़र',
      accessPortal: 'पोर्टल प्रवेश',
      portalShort: 'पोर्टल',
    },
    hero: {
      eyebrow: 'एआई-संचालित सटीकता • काउंट सीज़र मट्टेई प्रणाली',
      title1: 'चिकित्सा क्षेत्र का',
      title2: 'नया युग',
      subtitle: 'एआई-संचालित निदान और व्यक्तिगत वनस्पति इलेक्ट्रोपैथी का संगम। सेलुलर ध्रुवीयता संतुलन, अंग-विशिष्ट वानस्पतिक और वास्तविक समय सुरक्षा द्वारों का अनुभव करें।',
      consultationsCount: '1.5K+ प्रमाणित क्लिनिकल परामर्श',
      precisionSub: 'इष्टतम स्वास्थ्य लाभ के लिए सटीक अनुकूलन',
      darkCardTitle: 'क्या आप अपनी स्वास्थ्य यात्रा को नई दिशा देने के लिए तैयार हैं?',
      darkCardDesc: '३८ मुख्य उपाय-अवस्थाओं, ६० एसपीजी वानस्पतिक अंग क्रियाओं और गतिशील ४-बॉटल प्रोटोकॉल अनुकूलन के साथ प्राकृतिक चिकित्सा के भविष्य का अनुभव करें।',
      dualTablePill: 'ड्यूल-टेबल फार्माकोपिया (पीडीएफ प्रमाणित)',
      optimizerPill: '4-बॉटल मट्टेई ऑप्टिमाइज़र',
      safetyGate: 'क्लिनिकल सुरक्षा द्वार (७ रेड फ्लैग)',
    },
    auth: {
      patientLogin: 'रोगी लॉगिन',
      adminLogin: 'प्रशासक लॉगिन',
      patientSignInHeader: 'रोगी साइन इन',
      patientSignInSub: 'अपने निजी परामर्श देखने के लिए अपने मोबाइल नंबर से साइन इन करें।',
      signIn: 'साइन इन',
      newPatient: 'नया रोगी / ओटीपी',
      mobileNumber: 'मोबाइल नंबर',
      mobilePlaceholder: '१० अंकों का मोबाइल नंबर दर्ज करें',
      password: 'पासवर्ड',
      passwordPlaceholder: 'अपना खाता पासवर्ड दर्ज करें',
      forgotPassword: 'पासवर्ड भूल गए?',
      demoBanner: 'डेमो: 8421358609 / Password@1234',
      fillDemo: 'डेमो भरें',
      fillAdmin: 'एडमिन भरें',
      filled: 'भर दिया गया!',
      signInPatientBtn: 'रोगी पोर्टल में प्रवेश करें',
      signInAdminBtn: 'एडमिन कंसोल में साइन इन करें',
      or: 'अथवा',
      newPatientPrompt: 'नए रोगी? नंबर सत्यापित करें और ओटीपी से पंजीकरण करें',
      alreadyAccount: 'पहले से खाता है? पासवर्ड से साइन इन करें',
      sendOtp: 'एसएमएस द्वारा ओटीपी भेजें',
      sendingOtp: 'सत्यापन ओटीपी भेजा जा रहा है...',
      resendOtp: 'ओटीपी पुनः भेजें',
      enterOtp: '६-अंकीय ओटीपी दर्ज करें',
      otpHint: 'आपके मोबाइल पर भेजा गया ६ अंकों का ओटीपी कोड दर्ज करें।',
      verifyOtp: 'ओटीपी सत्यापित करें',
      verifying: 'ओटीपी की पुष्टि की जा रही है...',
      fullName: 'पूरा नाम',
      fullNamePlaceholder: 'अपना पूरा कानूनी नाम दर्ज करें',
      userType: 'खाते का प्रकार',
      patientRole: 'रोगी / व्यक्ति',
      practitionerRole: 'इलेक्ट्रोपैथी चिकित्सक',
      studentRole: 'मेडिकल छात्र / शोधकर्ता',
      preferredLanguage: 'परामर्श के लिए पसंदीदा भाषा',
      createAccount: 'पंजीकरण पूरा करें और प्रवेश करें',
      creatingAccount: 'खाता बनाया जा रहा है...',
      resetPassword: 'नया पासवर्ड सेट करें',
      newPassword: 'नया पासवर्ड',
      updatePassword: 'पासवर्ड अपडेट करें और साइन इन करें',
      securityNotice: 'एंड-टू-एंड एन्क्रिप्टेड सत्र • इलेक्ट्रोपैथी एआई सख्त गोपनीयता अलगाव',
      adminEmail: 'व्यवस्थापक ईमेल',
      adminEmailPlaceholder: 'admin@electropathy.ai',
      adminPassword: 'व्यवस्थापक पासवर्ड',
      adminNotice: '🛡️ एडमिन कंसोल पूर्ण निर्देशिका निरीक्षण, नए क्लिनिकल इनटेक और ऑडिट ट्रेल्स की सुविधा देता है।',
    },
    pathways: {
      eyebrow: 'काउंट सीज़र मट्टेई सिद्धांत और आधुनिक एआई',
      heading: 'संतुलित ध्रुवीयता और कोशिकीय उपचार का आपका मार्ग',
      desc: 'प्राकृतिक रूप से शारीरिक संतुलन बहाल करने के लिए डिज़ाइन किया गया एक व्यापक क्लिनिकल ज्ञान आधार और अवस्था-अंग अभिसरण इंजन।',
      card1Title: 'ड्यूल-टेबल फार्माकोपिया',
      card1Desc: '३८ मुख्य उपाय-अवस्थाओं को ६० एसपीजी वानस्पतिक अंग क्रियाओं के साथ बिना जबरन मिलावट के एकीकृत करता है।',
      card1Meta: '९८ विशिष्ट प्रलेखित फॉर्म्युलेशन',
      card2Title: 'अवस्था–अंग अभिसरण',
      card2Desc: '८ शारीरिक प्रणालियों, १२ पैथोलॉजिकल तंत्रों और ऊतक आत्मीयता के लक्षणों का सटीक मिलान।',
      card2Meta: 'श्रेणी ए, बी, सी साक्ष्य स्तर',
      card3Title: '४-बॉटल प्रोटोकॉल डायनामिक्स',
      card3Desc: 'सटीक डायल्यूशन गतिशीलता और विद्युत ध्रुवीयता मिलान के साथ संतुलित विकल्प ए और बी फॉर्म्युलेशन तैयार करता है।',
      card3Meta: 'डी१–डी३ तीव्र और डी६–डी३० रिकवरी',
    },
    disclaimer: {
      noticeTitle: 'चिकित्सा सूचना:',
      compactText: 'इलेक्ट्रोपैथी एआई डॉ. आशीष वांधारे द्वारा अधिकृत सत्यापित डेटासेट से निर्मित एक सूचनात्मक निर्णय-समर्थन मंच है। अंतिम चिकित्सा निर्णय केवल लाइसेंस प्राप्त चिकित्सक का है।',
      fullNoticeTitle: 'क्लिनिकल अभ्यास सूचना:',
      fullText: 'इलेक्ट्रोपैथी एआई डॉ. आशीष वांधारे द्वारा अधिकृत सत्यापित डेटासेट से निर्मित एक सूचनात्मक नैदानिक निर्णय-समर्थन एप्लिकेशन है। यह स्वायत्त निदान या अप्रशिक्षित नुस्खा प्रदान नहीं करता है। अंतिम चिकित्सा निर्णय केवल लाइसेंस प्राप्त चिकित्सक का है।',
      copyright: '© 2026 इलेक्ट्रोपैथी एआई • डॉ. आशीष वांधारे के लिए NKSKILLEDGE PRIVATE LIMITED द्वारा विकसित • सर्वाधिकार सुरक्षित।',
    },
    chat: {
      newConsultation: 'नया परामर्श',
      history: 'परामर्श इतिहास',
      activeConsultation: 'सक्रिय परामर्श',
      placeholder: 'अपने लक्षणों, अवधि और स्वास्थ्य समस्याओं का वर्णन करें...',
      send: 'भेजें',
      emergencyWarning: 'आपातकालीन चेतावनी (रेड फ्लैग)',
      emergencyCall: 'आपातकालीन सेवाओं के लिए तुरंत 112 / 108 पर कॉल करें',
      groundedNotice: 'डॉ. वांधारे के इलेक्ट्रोपैथी ज्ञान आधार पर आधारित',
      emptyTitle: 'अपना क्लिनिकल परामर्श शुरू करें',
      emptySubtitle: 'अपने लक्षणों का स्वाभाविक रूप से वर्णन करें। एआई अंग आत्मीयता, जैव-विद्युत ध्रुवीयता और डॉक्टर-अनुमोदित उपचार अवस्थाओं का मूल्यांकन करता है।',
      noConversations: 'कोई पिछला परामर्श दर्ज नहीं है।',
      startFirst: 'ऊपर अपना पहला परामर्श शुरू करें।',
    },
    records: {
      title: 'रोगी स्वास्थ्य रिकॉर्ड',
      subtitle: 'पूर्व मामले, निदान और इलेक्ट्रोपैथी उपचार प्रोटोकॉल।',
      searchPlaceholder: 'नाम, शिकायत या संपर्क नंबर से खोजें...',
      noRecords: 'फ़ाइल पर कोई स्वास्थ्य रिकॉर्ड नहीं है।',
      noRecordsSub: 'जब आपके डॉक्टर क्लिनिकल इनटेक पूरा करेंगे, तो आपका सत्यापित प्रोफाइल यहां दिखाई देगा।',
      chiefComplaints: 'मुख्य शिकायतें',
      vitals: 'महत्वपूर्ण संकेत (वाइटल्स)',
      lifestyle: 'जीवनशैली और आदतें',
      viewDetails: 'पूर्ण केस रिकॉर्ड देखें',
      newIntake: 'नया रोगी प्रवेश',
      ageGender: 'आयु / लिंग',
      contact: 'संपर्क',
      city: 'शहर',
      allergies: 'एलर्जी',
      conditions: 'पुरानी बीमारियां',
      noneReported: 'कोई नहीं दर्ज',
    },
    protocol: {
      safetyIntercept: 'क्लिनिकल सुरक्षा इंटरसेप्ट सक्रिय',
      optionA: 'विकल्प ए (प्राथमिक फॉर्म्युलेशन)',
      optionB: 'विकल्प बी (वैकल्पिक फॉर्म्युलेशन)',
      bottleTitle: 'बॉटल',
      dilution: 'अनुशंसित डायल्यूशन',
      dosageSchedule: 'खुराक अनुसूची',
      polarity: 'जैव-विद्युत ध्रुवीयता',
      externalApplications: 'बाहरी स्थानीय अनुप्रयोग',
      temperamentGuidance: 'संवैधानिक स्वभाव मार्गदर्शन',
      practitionerNotice: 'चिकित्सक क्लिनिकल सूचना',
      uniqueRemedies: 'अद्वितीय रेमेडीज',
      uniqueElectricities: 'अद्वितीय विद्युत',
    },
    intake: {
      step1Title: 'रोगी पहचान एवं संपर्क',
      step2Title: 'मुख्य शिकायतें एवं इतिहास',
      step3Title: 'चिकित्सा इतिहास एवं एलर्जी',
      step4Title: 'जीवनशैली एवं व्हाइटल्स',
      step5Title: 'स्वभाव एवं समीक्षा',
      patientName: 'रोगी का पूरा नाम',
      age: 'आयु (वर्ष)',
      gender: 'लिंग',
      contactNumber: 'मोबाइल नंबर',
      city: 'शहर / स्थान',
      occupation: 'व्यवसाय',
      complaint: 'प्राथमिक मुख्य शिकायत',
      duration: 'अवधि (उदा. ५ दिन, ३ महीने)',
      severity: 'गंभीरता पैमाना (१ से १०)',
      factors: 'बढ़ाने/घटाने वाले कारक',
      presentIllness: 'वर्तमान बीमारी का विवरण',
      previousTreatments: 'पूर्व में लिए गए उपचार',
      treatmentResponse: 'उपचार की प्रतिक्रिया',
      chronicConditions: 'दीर्घकालिक बीमारियां',
      allergies: 'दवा या अन्य एलर्जी',
      surgeries: 'पूर्व सर्जरी या आघात',
      diet: 'आहार प्रकार',
      sleep: 'नींद का पैटर्न',
      appetite: 'भूख का स्तर',
      stressLevel: 'तनाव का स्तर',
      temperament: 'संवैधानिक स्वभाव (टेम्परामेंट)',
      notes: 'चिकित्सक क्लिनिकल टिप्पणियाँ',
      nextStep: 'अगले चरण पर जाएं',
      prevStep: 'पिछले चरण पर वापस जाएं',
      saveRecord: 'रोगी इनटेक रिकॉर्ड सहेजें',
    },
  },
  mr: {
    common: {
      appTitle: 'इलेक्ट्रोपॅथी एआय',
      engineBadge: 'v2026 इंजिन',
      loading: 'इलेक्ट्रोपॅथी एआय पोर्टल उघडत आहे...',
      save: 'जतन करा',
      cancel: 'रद्द करा',
      close: 'बंद करा',
      back: 'मागे',
      submit: 'सबमिट करा',
      verifiedPatient: 'प्रमाणित रुग्ण',
      signOut: 'साइन आउट',
      search: 'शोधा...',
    },
    navbar: {
      consultations: 'एआय सल्लामसलत',
      records: 'आरोग्य नोंदी',
      dualTable: 'ड्यूल-टेबल मटेरिया मेडिका',
      optimizer: '४-बाटली मट्टेई ऑप्टिमायझर',
      accessPortal: 'पोर्टल प्रवेश',
      portalShort: 'पोर्टल',
    },
    hero: {
      eyebrow: 'एआय-आधारित अचूकता • काउंट सीझर मट्टेई प्रणाली',
      title1: 'वैद्यकीय क्षेत्राचा',
      title2: 'नवा सुवर्णकाळ',
      subtitle: 'एआय-आधारित निदान आणि वैयक्तिक वनस्पती इलेक्ट्रोपॅथीचा अद्वितीय संगम. पेशींच्या ध्रुवीयतेचे संतुलन, अवयव-विशिष्ट औषधी आणि सुरक्षित क्लिनिकल उपचारांचा अनुभव घ्या.',
      consultationsCount: '1.5K+ प्रमाणित क्लिनिकल सल्ला',
      precisionSub: 'उत्तम आरोग्यासाठी अचूक उपचार नियोजन',
      darkCardTitle: 'तुम्ही तुमचा आरोग्य प्रवास नव्याने घडवण्यासाठी तयार आहात का?',
      darkCardDesc: '३८ मुख्य औषध-अवस्था, ६० एसपीजी वनस्पती क्रिया आणि डायनॅमिक ४-बाटली प्रोटोकॉलसह नैसर्गिक उपचारांच्या भविष्याचा अनुभव घ्या.',
      dualTablePill: 'ड्यूल-टेबल फार्माकोपिया (पीडीएफ प्रमाणित)',
      optimizerPill: '४-बाटली मट्टेई ऑप्टिमायझर',
      safetyGate: 'क्लिनिकल सुरक्षा गेट (७ रेड फ्लॅग)',
    },
    auth: {
      patientLogin: 'रुग्ण लॉगिन',
      adminLogin: 'प्रशासक लॉगिन',
      patientSignInHeader: 'रुग्ण साइन इन',
      patientSignInSub: 'तुमची खाजगी सल्लामसलत पाहण्यासाठी तुमच्या मोबाईल नंबरने साइन इन करा.',
      signIn: 'साइन इन',
      newPatient: 'नवीन रुग्ण / ओटीपी',
      mobileNumber: 'मोबाईल क्रमांक',
      mobilePlaceholder: '१० अंकी मोबाईल क्रमांक टाका',
      password: 'पासवर्ड',
      passwordPlaceholder: 'तुमचा खाते पासवर्ड टाका',
      forgotPassword: 'पासवर्ड विसरलात?',
      demoBanner: 'डेमो: 8421358609 / Password@1234',
      fillDemo: 'डेमो भरा',
      fillAdmin: 'ॲडमिन भरा',
      filled: 'भरले!',
      signInPatientBtn: 'रुग्ण पोर्टलमध्ये प्रवेश करा',
      signInAdminBtn: 'ॲडमिन कन्सोलमध्ये साइन इन करा',
      or: 'किंवा',
      newPatientPrompt: 'नवीन रुग्ण? क्रमांक तपासा आणि ओटीपीने नोंदणी करा',
      alreadyAccount: 'आधीच खाते आहे? पासवर्डने साइन इन करा',
      sendOtp: 'एसएमएसद्वारे ओटीपी पाठवा',
      sendingOtp: 'पडताळणी ओटीपी पाठवत आहे...',
      resendOtp: 'ओटीपी पुन्हा पाठवा',
      enterOtp: '६-अंकी ओटीपी प्रविष्ट करा',
      otpHint: 'तुमच्या मोबाईलवर पाठवलेला ६-अंकी ओटीपी कोड टाका.',
      verifyOtp: 'ओटीपी तपासा',
      verifying: 'ओटीपी पडताळणी सुरू आहे...',
      fullName: 'पूर्ण नाव',
      fullNamePlaceholder: 'तुमचे पूर्ण नाव टाका',
      userType: 'खात्याचा प्रकार',
      patientRole: 'रुग्ण / व्यक्ती',
      practitionerRole: 'इलेक्ट्रोपॅथी तज्ज्ञ',
      studentRole: 'वैद्यकीय विद्यार्थी / संशोधक',
      preferredLanguage: 'सल्ल्यासाठी पसंतीची भाषा',
      createAccount: 'नोंदणी पूर्ण करा आणि प्रवेश करा',
      creatingAccount: 'खाते तयार करत आहे...',
      resetPassword: 'नवीन पासवर्ड सेट करा',
      newPassword: 'नवीन पासवर्ड',
      updatePassword: 'पासवर्ड अपडेट करा आणि साइन इन करा',
      securityNotice: 'एंड-टू-एंड एनक्रिप्टेड सत्र • इलेक्ट्रोपॅथी एआय सुरक्षित गोपनीयता',
      adminEmail: 'प्रशासक ईमेल',
      adminEmailPlaceholder: 'admin@electropathy.ai',
      adminPassword: 'प्रशासक पासवर्ड',
      adminNotice: '🛡️ ॲडमिन कन्सोल सर्व नोंदींचे निरीक्षण, नवीन क्लिनिकल इनटेक आणि ऑडिट ट्रेल तपासणी प्रदान करते.',
    },
    pathways: {
      eyebrow: 'काउंट सीझर मट्टेई तत्त्वे आणि आधुनिक एआय',
      heading: 'संतुलित ध्रुवीयता आणि पेशी उपचाराचा तुमचा मार्ग',
      desc: 'नैसर्गिकरित्या शारीरिक संतुलन पुनर्संचयित करण्यासाठी तयार केलेला सर्वसमावेशक क्लिनिकल ज्ञान आधार आणि अवस्था-अवयव संगम इंजिन.',
      card1Title: 'ड्यूल-टेबल फार्माकोपिया',
      card1Desc: '३८ मुख्य औषध-अवस्था आणि ६० एसपीजी वनस्पती क्रियांचे योग्य आणि अचूक एकत्रीकरण.',
      card1Meta: '९८ विशिष्ट नोंदणीकृत फॉर्म्युलेशन',
      card2Title: 'अवस्था–अवयव संगम',
      card2Desc: '८ शारीरिक प्रणाली, १२ पॅथॉलॉजिकल यंत्रणा आणि ऊती संबंधांचे अचूक लक्षण जुळवणी.',
      card2Meta: 'श्रेणी ए, बी, सी पुरावा स्तर',
      card3Title: '४-बाटली प्रोटोकॉल डायनॅमिक्स',
      card3Desc: 'अचूक डायल्यूशन आणि विद्युत ध्रुवीयतेसह संतुलित पर्याय ए आणि पर्याय बी औषध योजना तयार करते.',
      card3Meta: 'डी१–डी३ तीव्र आणि डी६–डी३० रिकव्हरी',
    },
    disclaimer: {
      noticeTitle: 'वैद्यकीय सूचना:',
      compactText: 'इलेक्ट्रोपॅथी एआय हे डॉ. आशिष वांधारे यांनी अधिकृत केलेल्या प्रमाणित माहितीवर आधारित माहितीपूर्ण सल्लागार व्यासपीठ आहे. अंतिम वैद्यकीय निर्णय परवानाधारक डॉक्टरांचाच राहील.',
      fullNoticeTitle: 'क्लिनिकल सराव सूचना:',
      fullText: 'इलेक्ट्रोपॅथी एआय हे डॉ. आशिष वांधारे यांनी अधिकृत केलेल्या माहितीवर आधारित क्लिनिकल सल्लागार प्रणाली आहे. हे स्वतंत्र निदान किंवा थेट औषधोपचार सुचवत नाही. अंतिम वैद्यकीय निर्णय परवानाधारक डॉक्टरांचाच राहील.',
      copyright: '© 2026 इलेक्ट्रोपॅथी एआय • डॉ. आशिष वांधारे यांच्यासाठी NKSKILLEDGE PRIVATE LIMITED द्वारे विकसित • सर्व हक्क राखीव.',
    },
    chat: {
      newConsultation: 'नवीन सल्लामसलत',
      history: 'सल्लामसलत इतिहास',
      activeConsultation: 'सक्रिय सल्लामसलत',
      placeholder: 'तुमची लक्षणे, कालावधी आणि त्रासाचे वर्णन करा...',
      send: 'पाठवा',
      emergencyWarning: 'तातडीची चेतावणी (रेड फ्लॅग)',
      emergencyCall: 'तातडीच्या वैद्यकीय सेवेसाठी त्वरित 112 / 108 वर संपर्क साधा',
      groundedNotice: 'डॉ. वांधारे यांच्या इलेक्ट्रोपॅथी ज्ञानावर आधारित',
      emptyTitle: 'तुमची क्लिनिकल सल्लामसलत सुरू करा',
      emptySubtitle: 'तुमची लक्षणे नैसर्गिक भाषेत सांगा. एआय अवयव संबंध, जैव-विद्युत ध्रुवीयता आणि डॉक्टरांनी प्रमाणित केलेल्या औषध-अवस्थांचे मूल्यांकन करते.',
      noConversations: 'कोणतीही मागील सल्लामसलत नोंदवलेली नाही.',
      startFirst: 'वर तुमची पहिली सल्लामसलत सुरू करा.',
    },
    records: {
      title: 'रुग्ण आरोग्य नोंदी',
      subtitle: 'मागील केसेस, निदान आणि इलेक्ट्रोपॅथी उपचार पद्धती.',
      searchPlaceholder: 'नाव, तक्रार किंवा संपर्क क्रमांकाद्वारे शोधा...',
      noRecords: 'कोणतीही आरोग्य नोंद उपलब्ध नाही.',
      noRecordsSub: 'जेव्हा तुमचे डॉक्टर क्लिनिकल इनटेक पूर्ण करतील, तेव्हा तुमची अधिकृत आरोग्य माहिती येथे दिसेल.',
      chiefComplaints: 'मुख्य तक्रारी',
      vitals: 'महत्त्वाची लक्षणे (व्हाइटल्स)',
      lifestyle: 'जीवनशैली आणि सवयी',
      viewDetails: 'संपूर्ण केस रेकॉर्ड पहा',
      newIntake: 'नवीन रुग्ण नोंदणी',
      ageGender: 'वय / लिंग',
      contact: 'संपर्क',
      city: 'शहर',
      allergies: 'अ‍ॅलर्जी',
      conditions: 'दीर्घकालीन आजार',
      noneReported: 'नोंदवलेले नाही',
    },
    protocol: {
      safetyIntercept: 'क्लिनिकल सुरक्षा इंटरसेप्ट सक्रिय',
      optionA: 'पर्याय ए (प्राथमिक फॉर्म्युलेशन)',
      optionB: 'पर्याय बी (पर्यायी फॉर्म्युलेशन)',
      bottleTitle: 'बाटली',
      dilution: 'शिफारस केलेले डायल्यूशन',
      dosageSchedule: 'औषध वेळापत्रक',
      polarity: 'जैव-विद्युत ध्रुवीयता',
      externalApplications: 'बाह्य स्थानिक लेप / अनुप्रयोग',
      temperamentGuidance: 'प्रकृती स्वभाव मार्गदर्शन',
      practitionerNotice: 'वैद्यकीय सल्लागार सूचना',
      uniqueRemedies: 'एकूण औषधे',
      uniqueElectricities: 'एकूण विद्युत घटक',
    },
    intake: {
      step1Title: 'रुग्ण ओळख आणि संपर्क',
      step2Title: 'मुख्य तक्रारी आणि आजाराचा इतिहास',
      step3Title: 'वैद्यकीय इतिहास आणि अ‍ॅलर्जी',
      step4Title: 'जीवनशैली आणि महत्त्वाचे घटक',
      step5Title: 'प्रकृती (टेम्परामेंट) आणि पुनरावलोकन',
      patientName: 'रुग्णाचे पूर्ण नाव',
      age: 'वय (वर्षे)',
      gender: 'लिंग',
      contactNumber: 'मोबाईल क्रमांक',
      city: 'शहर / ठिकाण',
      occupation: 'व्यवसाय',
      complaint: 'मुख्य प्राथमिक तक्रार',
      duration: 'कालावधी (उदा. ५ दिवस, ३ महिने)',
      severity: 'तीव्रता प्रमाण (१ ते १०)',
      factors: 'त्रास वाढवणारे/कमी करणारे घटक',
      presentIllness: 'सध्याच्या आजाराचा सविस्तर तपशील',
      previousTreatments: 'यापूर्वी घेतलेले उपचार',
      treatmentResponse: 'उपचारांचा प्रतिसाद',
      chronicConditions: 'दीर्घकालीन आजार',
      allergies: 'औषध किंवा इतर अ‍ॅलर्जी',
      surgeries: 'मागील शस्त्रक्रिया किंवा गंभीर इजा',
      diet: 'आहार पद्धती',
      sleep: 'झोपेचे प्रमाण',
      appetite: 'भूक',
      stressLevel: 'तणावाची पातळी',
      temperament: 'शारीरिक प्रकृती (टेम्परामेंट)',
      notes: 'वैद्यकीय निरीक्षण नोंदी',
      nextStep: 'पुढील टप्प्यावर जा',
      prevStep: 'मागील टप्प्यावर जा',
      saveRecord: 'रुग्ण इनटेक नोंद जतन करा',
    },
  },
};
