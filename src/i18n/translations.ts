import { DisabilityType, LanguageCode } from "../types";

export interface LanguageOption {
  code: LanguageCode;
  nativeName: string;
  englishName: string;
  regionNote: string;
  ttsLabel: string;
  voiceSupportNote: string;
}

export const LANGUAGES: LanguageOption[] = [
  {
    code: "en",
    nativeName: "English",
    englishName: "English",
    regionNote: "International & Ethiopian Tech Hubs",
    ttsLabel: "Natural Voice",
    voiceSupportNote: "Full UI translation and speech support",
  },
  {
    code: "am",
    nativeName: "አማርኛ",
    englishName: "Amharic",
    regionNote: "Ethiopia (Ethiopic Script)",
    ttsLabel: "Addis AI · am-hamen",
    voiceSupportNote: "Addis AI Ethiopian voice + translated guidance",
  },
  {
    code: "om",
    nativeName: "Afaan Oromo",
    englishName: "Afaan Oromo",
    regionNote: "Ethiopia (Qubee)",
    ttsLabel: "Addis AI · om-bikila",
    voiceSupportNote: "Addis AI Ethiopian voice + translated guidance",
  },
  {
    code: "ar",
    nativeName: "العربية",
    englishName: "Arabic",
    regionNote: "Middle East & North Africa",
    ttsLabel: "Gemini Live / Browser Arabic",
    voiceSupportNote: "RTL Arabic support, vision guidance, and speech synthesis",
  },
  {
    code: "fr",
    nativeName: "Français",
    englishName: "French",
    regionNote: "International & Francophone Africa",
    ttsLabel: "Natural French Voice",
    voiceSupportNote: "Full UI, voice recognition, and synthesis support",
  },
  {
    code: "sw",
    nativeName: "Kiswahili",
    englishName: "Swahili",
    regionNote: "East Africa",
    ttsLabel: "Gemini Multilingual Voice",
    voiceSupportNote: "Swahili AI voice, vision descriptions & captions",
  },
  {
    code: "so",
    nativeName: "Soomaali",
    englishName: "Somali",
    regionNote: "Horn of Africa",
    ttsLabel: "Multilingual Voice (Experimental)",
    voiceSupportNote: "Translated UI + synchronized audio captions",
  },
  {
    code: "ti",
    nativeName: "ትግርኛ",
    englishName: "Tigrinya",
    regionNote: "Ethiopia (Ethiopic Script)",
    ttsLabel: "Addis AI · ti-berhane",
    voiceSupportNote: "Addis AI Ethiopian voice + translated guidance",
  },
];

export interface UIStrings {
  brand: string;
  onboarding: {
    step1Label: string;
    step2Label: string;
    step3Label: string;
    chooseLanguageTitle: string;
    chooseLanguageSubtitle: string;
    continueBtn: string;
    backBtn: string;
    disabilityTitle: string;
    disabilitySubtitle: string;
    multiSelectHint: string;
    voiceActiveNotice: string;
    replayVoiceBtn: string;
    stopVoiceBtn: string;
    colorQuestion: string;
    signInTitle: string;
    signInSubtitle: string;
    fullNameLabel: string;
    emailLabel: string;
    careerPlanHeading: string;
    careerPlanSubtitle: string;
    targetTrackLabel: string;
    targetRoleLabel: string;
    experienceLabel: string;
    workStyleLabel: string;
    skillsLabel: string;
    goalLabel: string;
    enterDashboardBtn: string;
    quickDemoBtn: string;
  };
  nav: {
    dashboard: string;
    vision: string;
    courses: string;
    resources: string;
    progress: string;
    jobs: string;
    tracker: string;
    linkedin: string;
    assistant: string;
    settings: string;
    careerPlanAction: string;
  };
  dashboard: {
    leftCourses: string;
    leftSkills: string;
    leftJobs: string;
    leftPaths: string;
    centerActiveCourses: string;
    centerProgress: string;
    centerMilestones: string;
    centerTracker: string;
    centerUpdates: string;
    centerAchievements: string;
    rightAssistant: string;
    rightTools: string;
    rightCaptions: string;
    rightUpdates: string;
    rightAppreciation: string;
    completeLesson: string;
    openCatalog: string;
    openJobs: string;
    demoCourseBadge: string;
    demoJobBadge: string;
    matchReason: string;
  };
  signDock: {
    title: string;
    subtitle: string;
    openLabel: string;
    startCamera: string;
    stopCamera: string;
    detectNow: string;
    autoScan: string;
    quickSignsTitle: string;
    languageDisclaimer: string;
    lastDetected: string;
    executedTask: string;
  };
  disabilities: Record<
    DisabilityType,
    { title: string; summary: string; instantVoiceInstruction: string }
  >;
  appreciationMessages: string[];
}

export const TRANSLATIONS: Record<LanguageCode, UIStrings> = {
  en: {
    brand: "AccessPath",
    onboarding: {
      step1Label: "1. Language",
      step2Label: "2. Accessibility",
      step3Label: "3. Sign In & Career Plan",
      chooseLanguageTitle: "Choose your preferred language first",
      chooseLanguageSubtitle:
        "Your language powers all menus, Ethiopian voice instructions via Addis AI, captions, and career recommendations.",
      continueBtn: "Continue",
      backBtn: "Back",
      disabilityTitle: "Select your accessibility preferences",
      disabilitySubtitle:
        "Select one or more options. Voice guidance activates immediately in your chosen language when you select your profile.",
      multiSelectHint: "You may select multiple accessibility options.",
      voiceActiveNotice: "Voice Instructor Active",
      replayVoiceBtn: "Replay Voice Guide",
      stopVoiceBtn: "Stop Audio",
      colorQuestion: "Which colors are difficult for you to distinguish?",
      signInTitle: "Sign in and set your Career Plan",
      signInSubtitle:
        "Your Career Plan personalizes Savannah course recommendations, skill gap guidance, and job matches.",
      fullNameLabel: "Full name",
      emailLabel: "Email address",
      careerPlanHeading: "Your Career Plan",
      careerPlanSubtitle:
        "Recommendations across the dashboard will update immediately based on these choices.",
      targetTrackLabel: "Target career field",
      targetRoleLabel: "Target role title",
      experienceLabel: "Experience level",
      workStyleLabel: "Preferred work style",
      skillsLabel: "Skills you want to build",
      goalLabel: "Personal career goal",
      enterDashboardBtn: "Enter AccessPath Dashboard",
      quickDemoBtn: "Use sample learner profile",
    },
    nav: {
      dashboard: "Dashboard",
      vision: "Visual Assistant",
      courses: "Courses",
      resources: "Resources",
      progress: "Progress",
      jobs: "Jobs",
      tracker: "Tracker",
      linkedin: "LinkedIn",
      assistant: "AI Assistant",
      settings: "Settings",
      careerPlanAction: "Career Plan",
    },
    dashboard: {
      leftCourses: "Recommended Savannah Courses",
      leftSkills: "Career & Skill Recommendations",
      leftJobs: "Recommended Jobs & Internships",
      leftPaths: "Learning Paths",
      centerActiveCourses: "Active Courses",
      centerProgress: "Learning Progress",
      centerMilestones: "Completed Learning Milestones",
      centerTracker: "Job Application Tracker",
      centerUpdates: "Career Updates",
      centerAchievements: "Personal Achievements",
      rightAssistant: "AI Career Assistant",
      rightTools: "Accessibility Tools",
      rightCaptions: "Instructor Audio & Captions",
      rightUpdates: "Professional Updates",
      rightAppreciation: "Progress Appreciation",
      completeLesson: "Complete Next Lesson",
      openCatalog: "Browse All Courses",
      openJobs: "View All Opportunities",
      demoCourseBadge: "Savannah Demonstration Catalogue",
      demoJobBadge: "Example Opportunities",
      matchReason: "Aligned with Career Plan",
    },
    signDock: {
      title: "Sign Language Assistant",
      subtitle: "Live visual interpreter & gesture command detector",
      openLabel: "Sign Assistant",
      startCamera: "Start Camera Detection",
      stopCamera: "Stop Camera",
      detectNow: "Detect Sign & Run Task",
      autoScan: "Auto-detect every 5s",
      quickSignsTitle: "Or tap a sign gesture to run task",
      languageDisclaimer:
        "Spoken language does not map 1-to-1 to a single universal sign language. Choose your preferred sign system below.",
      lastDetected: "Detected Sign",
      executedTask: "Executed Task",
    },
    disabilities: {
      blind: {
        title: "Blind or Visually Impaired",
        summary:
          "Activates screen-reader landmarks, instant Ethiopian/English voice guidance, keyboard shortcuts, and text scaling.",
        instantVoiceInstruction:
          "Welcome to AccessPath. Voice-assisted navigation is now active in English. Use Tab and Enter to move cleanly through sections, or press Alt plus R anytime to hear page instructions.",
      },
      deaf: {
        title: "Deaf or Hard of Hearing",
        summary:
          "Activates synchronized visual captions, visual alerts, and the bottom-right Sign Language Assistant with camera gesture execution.",
        instantVoiceInstruction:
          "Deaf and hard of hearing support is now active. Synchronized captions are enabled across the workspace, and your Sign Language Assistant is ready in the bottom-right corner to interpret instructions and detect your sign responses.",
      },
      motor: {
        title: "Physical or Motor Disability",
        summary:
          "Enables large click targets, full keyboard control, reduced repetitive steps, and zero time-limited interactions.",
        instantVoiceInstruction:
          "Motor accessibility mode is enabled. All interactive controls are enlarged and fully keyboard accessible without mouse dependency.",
      },
      color: {
        title: "Color-Vision Deficiency",
        summary:
          "Adapts interface contrast, replaces hue-only signals with icons and text labels, and applies safe palettes.",
        instantVoiceInstruction:
          "Color-vision accessibility is ready. Please select any colors that are difficult to distinguish so we can adapt palettes with clear icons and text labels.",
      },
      standard: {
        title: "Standard Experience",
        summary:
          "Clean accessible workspace with optional voice reading, captions, and full Career Plan personalization.",
        instantVoiceInstruction:
          "Welcome to AccessPath. Your workspace is configured. Next, set up your sign-in profile and Career Plan to receive tailored courses and jobs.",
      },
    },
    appreciationMessages: [
      "Excellent progress! You completed another lesson.",
      "Congratulations! You completed your course.",
      "Your dedication is building new skills.",
      "Another milestone achieved. Keep developing your potential.",
      "You have reached your learning goal!",
    ],
  },
  am: {
    brand: "AccessPath",
    onboarding: {
      step1Label: "1. ቋንቋ",
      step2Label: "2. ተደራሽነት",
      step3Label: "3. መግቢያ እና የሥራ ዕቅድ",
      chooseLanguageTitle: "መጀመሪያ የሚመርጡትን ቋንቋ ይምረጡ",
      chooseLanguageSubtitle:
        "የመረጡት ቋንቋ የመመሪያ ድምፅን (በAddis AI)፣ የጽሑፍ መግለጫዎችን፣ ኮርሶችን እና የሥራ ጥቆማዎችን ያስተካክላል።",
      continueBtn: "ቀጥል",
      backBtn: "ተመለስ",
      disabilityTitle: "የተደራሽነት ፍላጎትዎን ይምረጡ",
      disabilitySubtitle:
        "አንድ ወይም ከዚያ በላይ መምረጥ ይችላሉ። ምርጫዎን ሲነኩ የአማርኛ የድምፅ መምሪያ ወዲያውኑ ይጀምራል።",
      multiSelectHint: "ከአንድ በላይ የተደራሽነት አማራጮችን መምረጥ ይችላሉ።",
      voiceActiveNotice: "የአማርኛ ድምፅ መምሪያ ነቅቷል",
      replayVoiceBtn: "መምሪያውን እንደገና አጫውት",
      stopVoiceBtn: "ድምፅ አቁም",
      colorQuestion: "ለመለየት የሚያስቸግሩዎት ቀለሞች የትኞቹ ናቸው?",
      signInTitle: "ይግቡ እና የሥራ ዕቅድዎን ያዘጋጁ",
      signInSubtitle:
        "የሥራ ዕቅድዎ በሳቫና ኮርሶች፣ በክህሎት ክፍተት ትንተና እና በሥራ ዕድሎች ላይ ትክክለኛ ጥቆማ ይሰጣል።",
      fullNameLabel: "ሙሉ ስም",
      emailLabel: "ኢሜይል አድራሻ",
      careerPlanHeading: "የእርስዎ የሥራ ዕቅድ",
      careerPlanSubtitle:
        "የኮርስ እና የሥራ ጥቆማዎች በዚህ ዕቅድ መሠረት ወዲያውኑ ይዘጋጃሉ።",
      targetTrackLabel: "የሚፈልጉት የሙያ መስክ",
      targetRoleLabel: "የሚፈልጉት የሥራ መደብ",
      experienceLabel: "የልምድ ደረጃ",
      workStyleLabel: "የሥራ ሁኔታ ምርጫ",
      skillsLabel: "ማዳበር የሚፈልጓቸው ክህሎቶች",
      goalLabel: "የግል የሙያ ግብ",
      enterDashboardBtn: "ወደ ዋናው ዳሽቦርድ ግባ",
      quickDemoBtn: "በናሙና መገለጫ ቀጥል",
    },
    nav: {
      dashboard: "ዳሽቦርድ",
      vision: "የእይታ ረዳት",
      courses: "ኮርሶች",
      resources: "መርጃዎች",
      progress: "እድገት",
      jobs: "ሥራዎች",
      tracker: "መከታተያ",
      linkedin: "ሊንክድኢን",
      assistant: "AI ረዳት",
      settings: "ቅንብሮች",
      careerPlanAction: "የሥራ ዕቅድ",
    },
    dashboard: {
      leftCourses: "የተመከሩ የሳቫና ኮርሶች",
      leftSkills: "የሙያ እና ክህሎት ጥቆማዎች",
      leftJobs: "የተመከሩ ሥራዎች እና ልምምዶች",
      leftPaths: "የትምህርት መንገዶች",
      centerActiveCourses: "ንቁ ኮርሶች",
      centerProgress: "የትምህርት እድገት",
      centerMilestones: "የተጠናቀቁ ምዕራፎች",
      centerTracker: "የሥራ ማመልከቻ መከታተያ",
      centerUpdates: "የሙያ ዜናዎች",
      centerAchievements: "የግል ስኬቶች",
      rightAssistant: "AI የሙያ ረዳት",
      rightTools: "የተደራሽነት መሣሪያዎች",
      rightCaptions: "የድምፅ መምሪያ እና መግለጫዎች",
      rightUpdates: "ሙያዊ መረጃዎች",
      rightAppreciation: "የእድገት ማበረታቻ",
      completeLesson: "ቀጣዩን ትምህርት አጠናቅቅ",
      openCatalog: "ሁሉንም ኮርሶች ይመልከቱ",
      openJobs: "ሁሉንም ሥራዎች ይመልከቱ",
      demoCourseBadge: "የሳቫና ማሳያ ካታሎግ",
      demoJobBadge: "የናሙና የሥራ ዕድሎች",
      matchReason: "ከሥራ ዕቅድዎ ጋር የተጣጣመ",
    },
    signDock: {
      title: "የምልክት ቋንቋ ረዳት",
      subtitle: "ምስላዊ አስተርጓሚ እና በካሜራ ምልክት ትዕዛዝ መፈጸሚያ",
      openLabel: "የምልክት ረዳት",
      startCamera: "ካሜራ ጀምር",
      stopCamera: "ካሜራ አቁም",
      detectNow: "ምልክት ለይ እና ሥራ አከናውን",
      autoScan: "በየ5 ሰከንዱ በራስ-ሰር ለይ",
      quickSignsTitle: "ወይም ትዕዛዝ ለመፈጸም የምልክት አዝራር ይጫኑ",
      languageDisclaimer:
        "የንግግር ቋንቋ በቀጥታ ወደ አንድ ዓለም አቀፍ የምልክት ቋንቋ አይተረጎምም። የሚፈልጉትን የምልክት ቋንቋ ይምረጡ።",
      lastDetected: "የተለየው ምልክት",
      executedTask: "የተፈጸመው ተግባር",
    },
    disabilities: {
      blind: {
        title: "ዓይነ ስውር ወይም የማየት እክል ያለባቸው",
        summary: "የድምፅ መምሪያ፣ ስክሪን-ሪደር ምልክቶች፣ የኪቦርድ አቋራጮች እና የጽሑፍ ማጉያ ያነቃል።",
        instantVoiceInstruction:
          "እንኳን ወደ AccessPath በደህና መጡ። የአማርኛ የድምፅ መምሪያ አሁን ተጀምሯል። በገጹ ውስጥ በቀላሉ ለመንቀሳቀስ Tab እና Enter ይጠቀሙ።",
      },
      deaf: {
        title: "መስማት የተሳናቸው ወይም የመስማት እክል ያለባቸው",
        summary:
          "የጽሑፍ መግለጫዎችን፣ ምስላዊ ማሳወቂያዎችን እና ከታች በስተቀኝ ያለውን የምልክት ቋንቋ ረዳት ያነቃል።",
        instantVoiceInstruction:
          "የመስማት ተደራሽነት ድጋፍ ተከፍቷል። የጽሑፍ መግለጫዎች በገጹ ላይ ይታያሉ፤ እንዲሁም ከታች በስተቀኝ ያለው የምልክት ቋንቋ ረዳት ምልክቶችዎን ተቀብሎ ተግባራትን ያከናውናል።",
      },
      motor: {
        title: "የአካል ወይም የእንቅስቃሴ እክል",
        summary: "ትላልቅ መጫኛዎች፣ ሙሉ የኪቦርድ መቆጣጠሪያ እና ያለጊዜ ገደብ አጠቃቀም ያቀርባል።",
        instantVoiceInstruction:
          "የእንቅስቃሴ ተደራሽነት ሁነታ ነቅቷል። ሁሉም አዝራሮች በኪቦርድ እና በቀላል ንክኪ እንዲሰሩ ተዘጋጅተዋል።",
      },
      color: {
        title: "የቀለም እይታ ልዩነት",
        summary: "ቀለምን ብቻ ሳይሆን አዶዎችንና የጽሑፍ መለያዎችን በመጠቀም ግልጽ እይታ ይሰጣል።",
        instantVoiceInstruction:
          "የቀለም ተደራሽነት ተመርጧል። ለመለየት የሚከብዱዎትን ቀለሞች ይምረጡ፤ ስርዓቱ ግልጽ መለያዎችን ያዘጋጃል።",
      },
      standard: {
        title: "መደበኛ አጠቃቀም",
        summary: "ንጹህ ተደራሽ ዳሽቦርድ ከድምፅ ንባብ እና ከሥራ ዕቅድ ጋር።",
        instantVoiceInstruction:
          "እንኳን ወደ AccessPath በደህና መጡ። ቀጥለው መገለጫዎን እና የሥራ ዕቅድዎን በማስገባት የተመከሩ ኮርሶችን እና ሥራዎችን ያግኙ።",
      },
    },
    appreciationMessages: [
      "በጣም ጥሩ እድገት! አንድ ተጨማሪ ትምህርት አጠናቀዋል።",
      "እንኳን ደስ አለዎት! ኮርሱን በተሳካ ሁኔታ አጠናቀዋል።",
      "ትጋትዎ አዳዲስ ክህሎቶችን እየገነባ ነው።",
      "ሌላ ትልቅ ምዕራፍ ደርሰዋል። አቅምዎን ማሳደግዎን ይቀጥሉ።",
      "የትምህርት ግብዎን አሳክተዋል!",
    ],
  },
  om: {
    brand: "AccessPath",
    onboarding: {
      step1Label: "1. Afaan",
      step2Label: "2. Haala Dandeettii",
      step3Label: "3. Seensaa fi Karoora Hojii",
      chooseLanguageTitle: "Duraan afaan filattu filadhu",
      chooseLanguageSubtitle:
        "Afaan filatte qajeelfama sagalee Addis AI, barreeffama ibsaa, koorsiiwwanii fi carraa hojii ni qindeessa.",
      continueBtn: "Itti Fufi",
      backBtn: "Duubatti",
      disabilityTitle: "Filannoo haala dandeettii kee filadhu",
      disabilitySubtitle:
        "Tokko yookiin isaa ol filachuu dandeessa. Yeroo filattu qajeelfamni sagalee Afaan Oromootiin yeroodhuma sana ni jalqaba.",
      multiSelectHint: "Filannoowwan tokkoo ol filachuu dandeessa.",
      voiceActiveNotice: "Qajeelfamni Sagalee Afaan Oromoo Banaadha",
      replayVoiceBtn: "Sagalee Irra Deebi'i",
      stopVoiceBtn: "Sagalee Dhaabi",
      colorQuestion: "Halluuwwan kam adda baasuun si rakkisu?",
      signInTitle: "Seeniitii Karoora Hojii kee qopheessi",
      signInSubtitle:
        "Karoorri hojii kee koorsiiwwan Savannah fi carraa hojii siif malan adda baasee siif dhiyeessa.",
      fullNameLabel: "Maqaa guutuu",
      emailLabel: "Teessoo Iimeelii",
      careerPlanHeading: "Karoora Hojii Kee",
      careerPlanSubtitle:
        "Gorsi koorsii fi hojii karoora kana irratti hundaa'ee yeroodhuma sana ni haaromfama.",
      targetTrackLabel: "Damee ogummaa barbaaddu",
      targetRoleLabel: "Gahee hojii barbaaddu",
      experienceLabel: "Sadarkaa muuxannoo",
      workStyleLabel: "Haala hojii filattu",
      skillsLabel: "Ogummaawwan horachuu barbaaddu",
      goalLabel: "Kaayyoo hojii dhuunfaa",
      enterDashboardBtn: "Gara Daashboordii Seeni",
      quickDemoBtn: "Profaayila fakkeenyaan itti fufi",
    },
    nav: {
      dashboard: "Daashboordii",
      vision: "Gargaaraa Ijaa",
      courses: "Koorsiiwwan",
      resources: "Qabeenya",
      progress: "Guddina",
      jobs: "Hojiiwwan",
      tracker: "Hordoffii",
      linkedin: "LinkedIn",
      assistant: "Gargaaraa AI",
      settings: "Qindaa'ina",
      careerPlanAction: "Karoora Hojii",
    },
    dashboard: {
      leftCourses: "Koorsiiwwan Savannah Gorfaman",
      leftSkills: "Gorsa Ogummaa fi Hojii",
      leftJobs: "Hojiiwwanii fi Shaakala Gorfaman",
      leftPaths: "Daandii Barnootaa",
      centerActiveCourses: "Koorsiiwwan Jalqabaman",
      centerProgress: "Guddina Barnootaa",
      centerMilestones: "Boqonnaawwan Xumuraman",
      centerTracker: "Hordoffii Iyyannoo Hojii",
      centerUpdates: "Odeeffannoo Hojii",
      centerAchievements: "Milkaa'ina Dhuunfaa",
      rightAssistant: "Gargaaraa Hojii AI",
      rightTools: "Meeshaalee Dhaqqabummaa",
      rightCaptions: "Sagalee fi Barreeffama Ibsaa",
      rightUpdates: "Odeeffannoo Ogummaa",
      rightAppreciation: "Jajjabina Guddinaa",
      completeLesson: "Barnoota Itti Aanu Xumuri",
      openCatalog: "Koorsiiwwan Hunda Ilaali",
      openJobs: "Carraa Hojii Hunda Ilaali",
      demoCourseBadge: "Kaataaloogii Fakkeenyaa Savannah",
      demoJobBadge: "Fakkeenya Carraa Hojii",
      matchReason: "Karoora hojii keetiin kan walsimu",
    },
    signDock: {
      title: "Gargaaraa Afaan Mallattoo",
      subtitle: "Hiikaa mul'ataa fi ajaja kaameraa mallattoon raawwatu",
      openLabel: "Gargaaraa Mallattoo",
      startCamera: "Kaameraa Jalqabi",
      stopCamera: "Kaameraa Dhaabi",
      detectNow: "Mallattoo Adda Baasiitii Raawwadhu",
      autoScan: "Sekondii 5 keessatti ofiin sakatta'i",
      quickSignsTitle: "Yookiin mallattoo xuquun ajaja raawwadhu",
      languageDisclaimer:
        "Afaan dubbatamu kallattiin gara afaan mallattoo addunyaa tokkotti hin jijjiiramu. Afaan mallattoo filattu filadhu.",
      lastDetected: "Mallattoo Argamu",
      executedTask: "Hojii Raawwatame",
    },
    disabilities: {
      blind: {
        title: "Agartuu Kan Hin Qabne ykn Hir'ina Agartuu",
        summary: "Qajeelfama sagalee Afaan Oromoo, gabatee kiiboordii fi guddiftuu barreeffamaa ni bana.",
        instantVoiceInstruction:
          "Baga gara AccessPath nagaan dhuftan. Qajeelfamni sagalee Afaan Oromootiin amma jalqabameera. Fuula keessa deemuf Tab fi Enter fayyadamaa.",
      },
      deaf: {
        title: "Dhageettii Kan Hin Qabne ykn Hir'ina Dhageettii",
        summary:
          "Barreeffama ibsaa kallattii, beeksisa mul'ataa fi Gargaaraa Afaan Mallattoo golee mirgaa jalaa ni bana.",
        instantVoiceInstruction:
          "Deeggarsi dhageettii banameera. Barreeffamni ibsaa iskiriinii irratti ni mul'ata; Gargaaraan Afaan Mallattoo golee mirgaa gadii irra jirus mallattoo keessan hubatee hojii ni raawwata.",
      },
      motor: {
        title: "Hir'ina Sochii Qaamaa",
        summary: "Qabduuwwan gurguddoo fi too'annoo kiiboordii guutuu yeroo daangeessaa malee ni kenna.",
        instantVoiceInstruction:
          "Haalli dhaqqabummaa sochii qaamaa banameera. Qabduuwwan hundi kiiboordii qofaan salphaatti ni hojjetu.",
      },
      color: {
        title: "Rakkoo Adda Baasuu Halluu",
        summary: "Mallattoo fi barreeffama ifaa halluu qofa irratti hin hirkanne ni dabalata.",
        instantVoiceInstruction:
          "Dhaqqabummaan halluu filatameera. Halluuwwan adda baasuun si rakkisan filadhu, nutis mallattoo fi barreeffama ifaa siif qopheessina.",
      },
      standard: {
        title: "Muuxannoo Idilee",
        summary: "Daashboordii qulqulluu qajeelfama sagalee fi karoora hojii waliin.",
        instantVoiceInstruction:
          "Baga gara AccessPath dhuftan. Itti aansuun karoora hojii kee galchuun koorsiiwwanii fi hojiiwwan siif malan argadhu.",
      },
    },
    appreciationMessages: [
      "Guddina gaarii! Barnoota dabalataa xumurteetta.",
      "Baga gammaddan! Koorsicha milkaa'inaan xumurteetta.",
      "Ciminni kee ogummaa haaraa ijaaraa jira.",
      "Boqonnaa biraa bira geesseetta. Itti fufi!",
      "Galma barnootaa keetti geesseetta!",
    ],
  },
  so: {
    brand: "AccessPath",
    onboarding: {
      step1Label: "1. Luqadda",
      step2Label: "2. Helitaanka",
      step3Label: "3. Galitaan & Qorshaha Shaqada",
      chooseLanguageTitle: "Marka hore dooro luqadda aad doorbidayso",
      chooseLanguageSubtitle:
        "Luqaddaadu waxay hagtaa dhammaan tilmaamaha codka, qoraallada hoose, koorsooyinka iyo talooyinka shaqada.",
      continueBtn: "Sii wad",
      backBtn: "Dib u noqo",
      disabilityTitle: "Dooro dookhyada helitaankaaga",
      disabilitySubtitle:
        "Waxaad dooran kartaa hal ama ka badan. Tilmaamaha codku isla markiiba ayay ku bilaabmaan Af-Soomaali marka aad doorato.",
      multiSelectHint: "Waxaad dooran kartaa wax ka badan hal dookh.",
      voiceActiveNotice: "Hagaha Codka Af-Soomaaliga waa Firfircoon yahay",
      replayVoiceBtn: "Ku celi Codka",
      stopVoiceBtn: "Jooji Codka",
      colorQuestion: "Midabadee ayaa kugu adag inaad kala saarto?",
      signInTitle: "Soo gal oo deji Qorshahaaga Shaqo",
      signInSubtitle:
        "Qorshahaaga shaqo wuxuu habeeyaa koorsooyinka Savannah iyo fursadaha shaqo ee ku habboon.",
      fullNameLabel: "Magaca oo buuxa",
      emailLabel: "Cinwaanka Iimaylka",
      careerPlanHeading: "Qorshahaaga Shaqo",
      careerPlanSubtitle:
        "Talooyinka koorsooyinka iyo shaqooyinka isla markiiba way isbeddelaan iyadoo lagu saleynayo qorshahan.",
      targetTrackLabel: "Qaybta xirfadda la beegsanayo",
      targetRoleLabel: "Doorka shaqo ee la rabo",
      experienceLabel: "Heerka khibradda",
      workStyleLabel: "Habka shaqo ee la doorbido",
      skillsLabel: "Xirfadaha aad rabto inaad dhisto",
      goalLabel: "Hadafka shaqo ee gaarka ah",
      enterDashboardBtn: "Gal Dashboard-ka AccessPath",
      quickDemoBtn: "Isticmaal profile tusaale ah",
    },
    nav: {
      dashboard: "Dashboard",
      vision: "Kaaliyaha Aragga",
      courses: "Koorsooyin",
      resources: "Khayraad",
      progress: "Horumar",
      jobs: "Shaqooyin",
      tracker: "Raadraac",
      linkedin: "LinkedIn",
      assistant: "Kaaliyaha AI",
      settings: "Dejinta",
      careerPlanAction: "Qorshaha Shaqo",
    },
    dashboard: {
      leftCourses: "Koorsooyinka Savannah ee Lagu Taliyay",
      leftSkills: "Talooyinka Xirfadda & Shaqada",
      leftJobs: "Shaqooyinka & Tababarrada Lagu Taliyay",
      leftPaths: "Waddooyinka Waxbarasho",
      centerActiveCourses: "Koorsooyinka Socda",
      centerProgress: "Horumarka Waxbarashada",
      centerMilestones: "Marxaladaha La Dhammeeyay",
      centerTracker: "Raadraaca Codsiyada Shaqada",
      centerUpdates: "Wararka Xirfadda",
      centerAchievements: "Guulaha Gaarka ah",
      rightAssistant: "Kaaliyaha Shaqada AI",
      rightTools: "Qalabka Helitaanka",
      rightCaptions: "Codka Macallinka & Qoraallada",
      rightUpdates: "Cusbooneysiinta Xirfadeed",
      rightAppreciation: "Dhiirrigelinta Horumarka",
      completeLesson: "Dhammee Casharka Xiga",
      openCatalog: "Eeg Dhammaan Koorsooyinka",
      openJobs: "Eeg Dhammaan Fursadaha",
      demoCourseBadge: "Liiska Tusaalaha Savannah",
      demoJobBadge: "Fursado Tusaale ah",
      matchReason: "La jaanqaadaya Qorshahaaga Shaqo",
    },
    signDock: {
      title: "Kaaliyaha Luqadda Calaamadaha",
      subtitle: "Turjubaan muuqaal ah & ogaanshaha calaamadaha kamaradda",
      openLabel: "Kaaliyaha Calaamadaha",
      startCamera: "Bilow Kamaradda",
      stopCamera: "Jooji Kamaradda",
      detectNow: "Ogow Calaamadda & Fuli",
      autoScan: "Is-baaris 5 ilbiriqsi kasta",
      quickSignsTitle: "Ama taabo calaamad si aad u fuliso hawsha",
      languageDisclaimer:
        "Luqadda lagu hadlo si toos ah uguma tarjumanto hal luqad calaamad ah oo caalami ah. Dooro nidaamka calaamadaha hoose.",
      lastDetected: "Calaamadda La Helay",
      executedTask: "Hawsha La Fuliyay",
    },
    disabilities: {
      blind: {
        title: "Aragga la' ama Aragga Daciifka ah",
        summary: "Wuxuu furaa hagidda codka, tilmaamaha akhristaha shaashadda, iyo furayaasha kiiboodhka.",
        instantVoiceInstruction:
          "Ku soo dhawoow AccessPath. Hagidda codka ee Af-Soomaaliga hadda way furan tahay. Isticmaal Tab iyo Enter si aad ugu dhex socoto bogga.",
      },
      deaf: {
        title: "Maqalka la' ama Maqalka Adag",
        summary:
          "Wuxuu furaa qoraallada hoose ee tooska ah iyo Kaaliyaha Luqadda Calaamadaha ee geeska midig ee hoose.",
        instantVoiceInstruction:
          "Taageerada maqalka la'aanta waa la hawlgeliyay. Qoraallada tooska ah way muuqdaan, Kaaliyaha Luqadda Calaamadaha ee geeska hoose ee midigta ahna wuxuu diyaar u yahay inuu garto calaamadahaaga.",
      },
      motor: {
        title: "Naafanimada Jirka ama Dhaqdhaqaaqa",
        summary: "Badhammo waaweyn iyo koontarool buuxa oo kiiboodh ah oo aan lahayn waqti xaddidan.",
        instantVoiceInstruction:
          "Habka helitaanka dhaqdhaqaaqa waa la furay. Dhammaan badhammada waxaa lagu maamuli karaa kiiboodhka.",
      },
      color: {
        title: "Kala-soocidda Midabada",
        summary: "Wuxuu adeegsadaa calaamado iyo qoraal cad iyadoo aan lagu tiirsanayn midab keliya.",
        instantVoiceInstruction:
          "Helitaanka midabada waa diyaar. Fadlan dooro midabada kugu adag si aan u habeeyno muuqaalka.",
      },
      standard: {
        title: "Khibrad Caadi ah",
        summary: "Dashboard nadiif ah oo leh talooyin shaqo iyo koorsooyin ku saleysan qorshahaaga.",
        instantVoiceInstruction:
          "Ku soo dhawoow AccessPath. Deji Qorshahaaga Shaqo si aad u hesho koorsooyin iyo shaqooyin ku habboon.",
      },
    },
    appreciationMessages: [
      "Horumar aad u wanaagsan! Waxaad dhammaysay cashar kale.",
      "Hambalyo! Waxaad dhammaysay koorsadaada.",
      "Dadaalkaagu wuxuu dhisayaa xirfado cusub.",
      "Marxalad kale ayaad gaartay. Sii wad horumarinta awooddaada.",
      "Waxaad gaartay hadafkaaga waxbarasho!",
    ],
  },
  ti: {
    brand: "AccessPath",
    onboarding: {
      step1Label: "1. ቋንቋ",
      step2Label: "2. ተበጻሕነት",
      step3Label: "3. መእተዊን መደብ ስራሕን",
      chooseLanguageTitle: "መጀመርታ እትመርጾ ቋንቋ ምረጽ",
      chooseLanguageSubtitle:
        "ዝመረጽካዮ ቋንቋ ንኹሉ ናይ ድምጺ መምርሒ Addis AI፣ ጽሑፋዊ መግለጺ፣ ኮርሳትን ዕድላት ስራሕን የዳሉ።",
      continueBtn: "ቀጽል",
      backBtn: "ተመለስ",
      disabilityTitle: "ናይ ተበጻሕነት ምርጫኻ ምረጽ",
      disabilitySubtitle:
        "ሓደ ወይ ልዕሊኡ ክትመርጽ ትኽእል። ምስ መረጽካ ናይ ትግርኛ ድምጺ መምርሒ ብኡንብኡ ይጅምር።",
      multiSelectHint: "ካብ ሓደ ንላዕሊ ምርጫታት ክትመርጽ ትኽእል።",
      voiceActiveNotice: "ናይ ትግርኛ ድምጺ መምርሒ ነቂሑ ኣሎ",
      replayVoiceBtn: "መምርሒ ደጊምካ ስማዕ",
      stopVoiceBtn: "ድምጺ ደው ኣብል",
      colorQuestion: "ንምፍላዮም ዘጸግሙኻ ሕብርታት ኣየኖት እዮም?",
      signInTitle: "እቶ እሞ መደብ ስራሕካ ኣዳሉ",
      signInSubtitle:
        "መደብ ስራሕካ ኣብ ሳቫና ኮርሳትን ዕድላት ስራሕን ብትኽክል ንምምራጽ ይሕግዝ።",
      fullNameLabel: "ምሉእ ስም",
      emailLabel: "ኢመይል ኣድራሻ",
      careerPlanHeading: "ናይ ስራሕ መደብካ",
      careerPlanSubtitle:
        "ኣብ ዳሽቦርድ ዝቀርቡ ኮርሳትን ስራሓትን በዚ መደብ መሰረት ብኡንብኡ ይመዓራረዩ።",
      targetTrackLabel: "ዝድለ ዓውዲ ስራሕ",
      targetRoleLabel: "ዝድለ መደብ ስራሕ",
      experienceLabel: "ደረጃ ልምዲ",
      workStyleLabel: "ዝምረጽ ኣሰራርሓ",
      skillsLabel: "ከተማዕብሎም እትደሊ ክእለታት",
      goalLabel: "ውልቃዊ ሸቶ ስራሕ",
      enterDashboardBtn: "ናብ ዳሽቦርድ እቶ",
      quickDemoBtn: "ብኣብነት መግለጺ ቀጽል",
    },
    nav: {
      dashboard: "ዳሽቦርድ",
      vision: "ሓጋዚ ራእይ",
      courses: "ኮርሳት",
      resources: "ንዋት",
      progress: "ዕብየት",
      jobs: "ስራሓት",
      tracker: "መከታተሊ",
      linkedin: "LinkedIn",
      assistant: "AI ሓጋዚ",
      settings: "ቅጥዕታት",
      careerPlanAction: "መደብ ስራሕ",
    },
    dashboard: {
      leftCourses: "ዝተመርጹ ናይ ሳቫና ኮርሳት",
      leftSkills: "ናይ ሞያን ክእለትን ምኽሪ",
      leftJobs: "ዝተመርጹ ስራሓትን ልምምድን",
      leftPaths: "መንገዲ ትምህርቲ",
      centerActiveCourses: "ዝካየዱ ዘለዉ ኮርሳት",
      centerProgress: "ዕብየት ትምህርቲ",
      centerMilestones: "ዝተዛዘሙ ምዕራፋት",
      centerTracker: "መከታተሊ መመልከቲ ስራሕ",
      centerUpdates: "ሓድሽ ሓበሬታ ስራሕ",
      centerAchievements: "ውልቃዊ ዓወታት",
      rightAssistant: "AI ሓጋዚ ስራሕ",
      rightTools: "ናይ ተበጻሕነት መሳርሒታት",
      rightCaptions: "ድምጺ መምርሕን ጽሑፍን",
      rightUpdates: "ሞያዊ ሓበሬታ",
      rightAppreciation: "ናይ ዕብየት መተባብዒ",
      completeLesson: "ቀጻሊ ትምህርቲ ዛዝም",
      openCatalog: "ኩሎም ኮርሳት ርአ",
      openJobs: "ኩሎም ዕድላት ርአ",
      demoCourseBadge: "ናይ ሳቫና መርኣዪ ካታሎግ",
      demoJobBadge: "ኣብነት ዕድላት ስራሕ",
      matchReason: "ምስ መደብ ስራሕካ ዝሰማማዕ",
    },
    signDock: {
      title: "ሓጋዚ ቋንቋ ምልክት",
      subtitle: "ምስላዊ ተርጓምን ብካሜራ ምልክት መፈጸምን",
      openLabel: "ሓጋዚ ምልክት",
      startCamera: "ካሜራ ጀምር",
      stopCamera: "ካሜራ ደው ኣብል",
      detectNow: "ምልክት ኣለሊኻ ፈጽም",
      autoScan: "በብ5 ሰከንድ ብባዕሉ ኣለሊ",
      quickSignsTitle: "ወይ ትእዛዝ ንምፍጻም ምልክት ጠውቕ",
      languageDisclaimer:
        "ዝዝረብ ቋንቋ ብቀጥታ ናብ ሓደ ዓለምለኻዊ ቋንቋ ምልክት ኣይትርጎምን። እትደልዮ ቋንቋ ምልክት ምረጽ።",
      lastDetected: "ዝተረኽበ ምልክት",
      executedTask: "ዝተፈጸመ ዕዮ",
    },
    disabilities: {
      blind: {
        title: "ዓይነ ስውር ወይ ናይ ምርኣይ ጸገም ዘለዎም",
        summary: "ናይ ትግርኛ ድምጺ መምርሒ፣ ስክሪን-ሪደር ምልክታት፣ ኪቦርድ ኣቋራጮችን የንቅሕ።",
        instantVoiceInstruction:
          "እንቋዕ ናብ AccessPath ብደሓን መጻእኩም። ናይ ትግርኛ ድምጺ መምርሒ ሕጂ ተጀሚሩ ኣሎ። ኣብ ውሽጢ ገጽ ንምንቅስቓስ Tab ከምኡውን Enter ተጠቐሙ።",
      },
      deaf: {
        title: "ምስማዕ ዝተሳእኖም ወይ ናይ ምስማዕ ጸገም",
        summary:
          "ጽሑፋዊ መግለጺታትን ኣብ ታሕቲ ብየማን ዘሎ ሓጋዚ ቋንቋ ምልክትን የንቅሕ።",
        instantVoiceInstruction:
          "ናይ ምስማዕ ተበጻሕነት ደገፍ ተኸፊቱ ኣሎ። ጽሑፋዊ መግለጺታት ኣብ ስክሪን ይረኣዩ፣ ኣብ ታሕቲ ብየማን ዘሎ ሓጋዚ ቋንቋ ምልክት ድማ ምልክታትኩም ተቐቢሉ ዕዮ ይፍጽም።",
      },
      motor: {
        title: "ናይ ኣካል ወይ ምንቅስቓስ ጸገም",
        summary: "ዓበይቲ መጠወቒታትን ምሉእ ናይ ኪቦርድ ምቁጽጻርን ብዘይ ናይ ግዜ ገደብ ይህብ።",
        instantVoiceInstruction:
          "ናይ ምንቅስቓስ ተበጻሕነት ነቂሑ ኣሎ። ኩሎም መጠወቒታት ብኪቦርድ ብቐሊሉ ይሰርሑ።",
      },
      color: {
        title: "ፍልልይ ምርኣይ ሕብሪ",
        summary: "ኣብ ሕብሪ ጥራይ ዘይተመርኮሰ ምልክታትን ጽሑፋዊ መግለጽን የዳሉ።",
        instantVoiceInstruction:
          "ናይ ሕብሪ ተበጻሕነት ተመሪጹ ኣሎ። ንምፍላዮም ዘጸግሙኻ ሕብርታት ምረጽ።",
      },
      standard: {
        title: "ስሩዕ ኣጠቓቕማ",
        summary: "ጽሩይ ተበጻሒ ዳሽቦርድ ምስ ድምጺ ንባብን መደብ ስራሕን።",
        instantVoiceInstruction:
          "እንቋዕ ናብ AccessPath መጻእኩም። ቀጺልኩም መደብ ስራሕኩም ብምምላእ ዝተመርጹ ኮርሳትን ስራሓትን ርኸቡ።",
      },
    },
    appreciationMessages: [
      "ብጣዕሚ ጽቡቕ ዕብየት! ካልእ ትምህርቲ ዛዚምካ ኣለኻ።",
      "እንቋዕ ደስ በለካ! ነዚ ኮርስ ብዓወት ዛዚምካዮ።",
      "ጻዕርኻ ሓደሽቲ ክእለታት ይሃንጽ ኣሎ።",
      "ካልእ ኣገዳሲ ምዕራፍ በጺሕካ ኣለኻ። ቀጽል!",
      "ሸቶ ትምህርትኻ ኣሳኺዕካ ኣለኻ!",
    ],
  },
  ar: {
    brand: "AccessPath",
    onboarding: {
      step1Label: "1. اللغة",
      step2Label: "2. إمكانية الوصول",
      step3Label: "3. تسجيل الدخول وخطة المسار",
      chooseLanguageTitle: "اختر لغتك المفضلة أولاً",
      chooseLanguageSubtitle:
        "تتحكم لغتك في جميع القوائم والمساعد الصوتي والبصري والترجمات النصية وتوصيات المسار المهني.",
      continueBtn: "متابعة",
      backBtn: "رجوع",
      disabilityTitle: "اختر تفضيلات إمكانية الوصول",
      disabilitySubtitle:
        "يمكنك اختيار خيار واحد أو أكثر. يبدأ التوجيه الصوتي فوراً باللغة العربية عند اختيار ملفك.",
      multiSelectHint: "يمكنك تحديد أكثر من خيار.",
      voiceActiveNotice: "المساعد الصوتي نشط",
      replayVoiceBtn: "إعادة تشغيل الدليل الصوتي",
      stopVoiceBtn: "إيقاف الصوت",
      colorQuestion: "ما الألوان التي يصعب عليك التمييز بينها؟",
      signInTitle: "سجّل الدخول وحدد خطتك المهنية",
      signInSubtitle:
        "تساعد خطتك المهنية على تخصيص الدورات والمهارات وفرص العمل المناسبة لك.",
      fullNameLabel: "الاسم الكامل",
      emailLabel: "البريد الإلكتروني",
      careerPlanHeading: "خطتك المهنية",
      careerPlanSubtitle:
        "يتم تحديث التوصيات عبر المنصة مباشرة بناءً على هذه الاختيارات.",
      targetTrackLabel: "المجال المهني المستهدف",
      targetRoleLabel: "المسمى الوظيفي المستهدف",
      experienceLabel: "مستوى الخبرة",
      workStyleLabel: "نمط العمل المفضل",
      skillsLabel: "المهارات التي ترغب في بنائها",
      goalLabel: "هدفك المهني الشخصي",
      enterDashboardBtn: "الدخول إلى لوحة AccessPath",
      quickDemoBtn: "استخدام ملف تجريبي",
    },
    nav: {
      dashboard: "الرئيسية",
      vision: "المساعد البصري",
      courses: "الدورات",
      resources: "الموارد",
      progress: "التقدم",
      jobs: "الوظائف",
      tracker: "المتابعة",
      linkedin: "LinkedIn",
      assistant: "مساعد AI",
      settings: "الإعدادات",
      careerPlanAction: "الخطة المهنية",
    },
    dashboard: {
      leftCourses: "دورات سافانا الموصى بها",
      leftSkills: "توصيات المسار والمهارات",
      leftJobs: "الوظائف والتدريبات الموصى بها",
      leftPaths: "مسارات التعلم",
      centerActiveCourses: "الدورات النشطة",
      centerProgress: "تقدم التعلم",
      centerMilestones: "الإنجازات المكتملة",
      centerTracker: "متابعة طلبات العمل",
      centerUpdates: "تحديثات المسار",
      centerAchievements: "الإنجازات الشخصية",
      rightAssistant: "المساعد المهني بالذكاء الاصطناعي",
      rightTools: "أدوات إمكانية الوصول",
      rightCaptions: "الصوت والترجمة الفورية",
      rightUpdates: "تحديثات مهنية",
      rightAppreciation: "تقدير التقدم",
      completeLesson: "إكمال الدرس التالي",
      openCatalog: "تصفح جميع الدورات",
      openJobs: "عرض جميع الفرص",
      demoCourseBadge: "دليل سافانا التجريبي",
      demoJobBadge: "فرص عمل نموذجية",
      matchReason: "متوافق مع خطتك المهنية",
    },
    signDock: {
      title: "مساعد لغة الإشارة",
      subtitle: "مترجم مرئي وكاشف أوامر الإشارة بالكاميرا",
      openLabel: "مساعد الإشارة",
      startCamera: "تشغيل الكاميرا",
      stopCamera: "إيقاف الكاميرا",
      detectNow: "التعرف على الإشارة وتنفيذ المهمة",
      autoScan: "مسح تلقائي كل 5 ثوانٍ",
      quickSignsTitle: "أو اضغط على إيماءة لتنفيذ المهمة",
      languageDisclaimer:
        "اللغة المنطوقة لا تقابل لغة إشارة عالمية واحدة. اختر نظام الإشارة المفضل أدناه.",
      lastDetected: "الإشارة المكتشفة",
      executedTask: "المهمة المنفذة",
    },
    disabilities: {
      blind: {
        title: "كفيف أو ضعيف البصر",
        summary:
          "يفعّل علامات قارئ الشاشة، والمساعد الصوتي والبصري بالكاميرا بالعربية، واختصارات لوحة المفاتيح.",
        instantVoiceInstruction:
          "مرحباً بك في AccessPath. التوجيه الصوتي باللغة العربية نشط الآن. استخدم Tab و Enter للتنقل أو افتح المساعد البصري.",
      },
      deaf: {
        title: "أصم أو ضعيف السمع",
        summary: "يفعّل التسميات التوضيحية الفورية ومساعد لغة الإشارة في الزاوية السفلية اليمنى.",
        instantVoiceInstruction:
          "تم تفعيل دعم الصم وضعاف السمع مع ترجمة نصية متزامنة ومساعد لغة الإشارة.",
      },
      motor: {
        title: "إعاقة حركية",
        summary: "يوفر أزراراً كبيرة وتحكماً كاملاً بلوحة المفاتيح دون حدود زمنية.",
        instantVoiceInstruction:
          "تم تفعيل وضع الوصول الحركي مع أزرار كبيرة وتحكم كامل بلوحة المفاتيح.",
      },
      color: {
        title: "قصور في تمييز الألوان",
        summary: "يعدل التباين ويضيف أيقونات ونصوصاً واضحة بجانب الألوان.",
        instantVoiceInstruction: "أداة تمييز الألوان جاهزة. اختر الألوان التي يصعب عليك التمييز بينها.",
      },
      standard: {
        title: "تجربة قياسية",
        summary: "مساحة عمل ميسرة مع قراءة صوتية اختيارية وتخصيص المسار المهني.",
        instantVoiceInstruction: "مرحباً بك في AccessPath. يمكنك الآن إعداد ملفك وخطتك المهنية.",
      },
    },
    appreciationMessages: [
      "تقدم ممتاز! لقد أكملت درساً آخر.",
      "تهانينا! لقد أتممت دورتك.",
      "التزامك يبني مهارات جديدة.",
      "تم تحقيق إنجاز جديد. واصل التقدم.",
      "لقد وصلت إلى هدفك التعليمي!",
    ],
  },
  fr: {
    brand: "AccessPath",
    onboarding: {
      step1Label: "1. Langue",
      step2Label: "2. Accessibilité",
      step3Label: "3. Connexion & Projet",
      chooseLanguageTitle: "Choisissez d'abord votre langue préférée",
      chooseLanguageSubtitle:
        "Votre langue pilote les menus, l'assistant vocal et visuel, les sous-titres et les recommandations.",
      continueBtn: "Continuer",
      backBtn: "Retour",
      disabilityTitle: "Sélectionnez vos préférences d'accessibilité",
      disabilitySubtitle:
        "Choisissez une ou plusieurs options. Le guidage vocal démarre immédiatement en français lors de la sélection.",
      multiSelectHint: "Vous pouvez sélectionner plusieurs options.",
      voiceActiveNotice: "Assistant vocal actif",
      replayVoiceBtn: "Rejouer le guide vocal",
      stopVoiceBtn: "Arrêter l'audio",
      colorQuestion: "Quelles couleurs vous sont difficiles à distinguer ?",
      signInTitle: "Connectez-vous et définissez votre plan de carrière",
      signInSubtitle:
        "Votre plan personnalise les cours, les compétences et les offres d'emploi.",
      fullNameLabel: "Nom complet",
      emailLabel: "Adresse e-mail",
      careerPlanHeading: "Votre plan de carrière",
      careerPlanSubtitle:
        "Les recommandations du tableau de bord s'actualisent immédiatement selon ces choix.",
      targetTrackLabel: "Domaine professionnel visé",
      targetRoleLabel: "Poste visé",
      experienceLabel: "Niveau d'expérience",
      workStyleLabel: "Mode de travail préféré",
      skillsLabel: "Compétences à développer",
      goalLabel: "Objectif professionnel personnel",
      enterDashboardBtn: "Entrer dans AccessPath",
      quickDemoBtn: "Utiliser un profil de démonstration",
    },
    nav: {
      dashboard: "Tableau",
      vision: "Assistant Visuel",
      courses: "Cours",
      resources: "Ressources",
      progress: "Progrès",
      jobs: "Emplois",
      tracker: "Suivi",
      linkedin: "LinkedIn",
      assistant: "Assistant IA",
      settings: "Paramètres",
      careerPlanAction: "Plan Carrière",
    },
    dashboard: {
      leftCourses: "Cours Savannah recommandés",
      leftSkills: "Recommandations de compétences",
      leftJobs: "Emplois et stages recommandés",
      leftPaths: "Parcours d'apprentissage",
      centerActiveCourses: "Cours actifs",
      centerProgress: "Progression",
      centerMilestones: "Étapes terminées",
      centerTracker: "Suivi des candidatures",
      centerUpdates: "Actualités carrière",
      centerAchievements: "Réussites personnelles",
      rightAssistant: "Assistant Carrière IA",
      rightTools: "Outils d'accessibilité",
      rightCaptions: "Audio & Sous-titres",
      rightUpdates: "Mises à jour",
      rightAppreciation: "Encouragements",
      completeLesson: "Terminer la leçon suivante",
      openCatalog: "Parcourir les cours",
      openJobs: "Voir les opportunités",
      demoCourseBadge: "Catalogue Savannah",
      demoJobBadge: "Opportunités exemples",
      matchReason: "Aligné avec votre plan",
    },
    signDock: {
      title: "Assistant Langue des Signes",
      subtitle: "Interprète visuel & détection de gestes par caméra",
      openLabel: "Assistant Signes",
      startCamera: "Démarrer la caméra",
      stopCamera: "Arrêter la caméra",
      detectNow: "Détecter le signe",
      autoScan: "Analyse auto toutes les 5s",
      quickSignsTitle: "Ou touchez un geste pour exécuter l'action",
      languageDisclaimer:
        "Une langue parlée ne correspond pas à une langue des signes universelle. Choisissez votre système ci-dessous.",
      lastDetected: "Signe détecté",
      executedTask: "Action exécutée",
    },
    disabilities: {
      blind: {
        title: "Aveugle ou malvoyant",
        summary:
          "Active les repères lecteur d'écran, l'assistant vocal et visuel par caméra en français, et les raccourcis clavier.",
        instantVoiceInstruction:
          "Bienvenue sur AccessPath. La navigation vocale est activée en français. Utilisez Tab et Entrée ou ouvrez l'Assistant Visuel.",
      },
      deaf: {
        title: "Sourd ou malentendant",
        summary: "Active les sous-titres synchronisés et l'assistant langue des signes en bas à droite.",
        instantVoiceInstruction:
          "Le mode sourd et malentendant est actif avec sous-titres et assistant langue des signes.",
      },
      motor: {
        title: "Handicap moteur",
        summary: "Active de larges zones cliquables et un contrôle complet au clavier sans limite de temps.",
        instantVoiceInstruction:
          "Le mode d'accessibilité motrice est activé avec contrôle clavier complet.",
      },
      color: {
        title: "Daltonisme / Vision des couleurs",
        summary: "Adapte les contrastes et ajoute icônes et libellés explicites.",
        instantVoiceInstruction:
          "L'adaptation des couleurs est prête. Sélectionnez les couleurs difficiles à distinguer.",
      },
      standard: {
        title: "Expérience standard",
        summary: "Espace accessible avec lecture vocale optionnelle et plan de carrière.",
        instantVoiceInstruction: "Bienvenue sur AccessPath. Configurez votre profil et votre plan de carrière.",
      },
    },
    appreciationMessages: [
      "Excellent progrès ! Vous avez terminé une autre leçon.",
      "Félicitations ! Vous avez terminé votre cours.",
      "Votre régularité développe de nouvelles compétences.",
      "Nouvelle étape franchie. Continuez ainsi.",
      "Vous avez atteint votre objectif d'apprentissage !",
    ],
  },
  sw: {
    brand: "AccessPath",
    onboarding: {
      step1Label: "1. Lugha",
      step2Label: "2. Ufikivu",
      step3Label: "3. Ingia & Mpango wa Kazi",
      chooseLanguageTitle: "Chagua lugha unayopendelea kwanza",
      chooseLanguageSubtitle:
        "Lugha yako inaongoza menyu, msaidizi wa sauti na kamera, manukuu, na mapendekezo ya kazi.",
      continueBtn: "Endelea",
      backBtn: "Rudi",
      disabilityTitle: "Chagua mapendeleo yako ya ufikivu",
      disabilitySubtitle:
        "Chagua chaguo moja au zaidi. Mwongozo wa sauti huanza mara moja kwa Kiswahili unapochagua.",
      multiSelectHint: "Unaweza kuchagua zaidi ya chaguo moja.",
      voiceActiveNotice: "Msaidizi wa Sauti Amewashwa",
      replayVoiceBtn: "Rudia Mwongozo wa Sauti",
      stopVoiceBtn: "Simamisha Sauti",
      colorQuestion: "Ni rangi zipi zinazokupa shida kutofautisha?",
      signInTitle: "Ingia na uweke Mpango wako wa Kazi",
      signInSubtitle:
        "Mpango wako unabinafsisha kozi za Savannah, ujuzi na nafasi za kazi zinazokufaa.",
      fullNameLabel: "Jina kamili",
      emailLabel: "Barua pepe",
      careerPlanHeading: "Mpango wako wa Kazi",
      careerPlanSubtitle:
        "Mapendekezo yote yatasasishwa mara moja kulingana na machaguo haya.",
      targetTrackLabel: "Uwanja wa kazi unaolengwa",
      targetRoleLabel: "Nafasi ya kazi unayolenga",
      experienceLabel: "Kiwango cha uzoefu",
      workStyleLabel: "Mtindo wa kazi unaopendelea",
      skillsLabel: "Ujuzi unaotaka kujenga",
      goalLabel: "Lengo lako binafsi la kazi",
      enterDashboardBtn: "Ingia kwenye AccessPath",
      quickDemoBtn: "Tumia wasifu wa mfano",
    },
    nav: {
      dashboard: "Dashibodi",
      vision: "Msaidizi wa Kuona",
      courses: "Kozi",
      resources: "Rasilimali",
      progress: "Maendeleo",
      jobs: "Kazi",
      tracker: "Ufuatiliaji",
      linkedin: "LinkedIn",
      assistant: "Msaidizi AI",
      settings: "Mipangilio",
      careerPlanAction: "Mpango wa Kazi",
    },
    dashboard: {
      leftCourses: "Kozi za Savannah Zinazopendekezwa",
      leftSkills: "Mapendekezo ya Ujuzi & Kazi",
      leftJobs: "Kazi na Mafunzo Yanayopendekezwa",
      leftPaths: "Njia za Kujifunza",
      centerActiveCourses: "Kozi Zinazoendelea",
      centerProgress: "Maendeleo ya Kujifunza",
      centerMilestones: "Hatua Zilizokamilika",
      centerTracker: "Ufuatiliaji wa Maombi ya Kazi",
      centerUpdates: "Taarifa za Kazi",
      centerAchievements: "Mafanikio Binafsi",
      rightAssistant: "Msaidizi wa Kazi AI",
      rightTools: "Zana za Ufikivu",
      rightCaptions: "Sauti na Manukuu",
      rightUpdates: "Taarifa za Kitaalamu",
      rightAppreciation: "Pongezi za Maendeleo",
      completeLesson: "Kamilisha Somo Linalofuata",
      openCatalog: "Tazama Kozi Zote",
      openJobs: "Tazama Fursa Zote",
      demoCourseBadge: "Orodha ya Mfano ya Savannah",
      demoJobBadge: "Fursa za Mfano",
      matchReason: "Inalingana na Mpango wa Kazi",
    },
    signDock: {
      title: "Msaidizi wa Lugha ya Ishara",
      subtitle: "Mkalimani wa kuona na kitambuzi cha ishara za kamera",
      openLabel: "Msaidizi Ishara",
      startCamera: "Washa Kamera",
      stopCamera: "Zima Kamera",
      detectNow: "Tambua Ishara & Tekeleza",
      autoScan: "Kagua kila sekunde 5",
      quickSignsTitle: "Au gusa ishara kutekeleza kazi",
      languageDisclaimer:
        "Lugha ya mazungumzo hailingani moja kwa moja na lugha moja ya ishara duniani. Chagua mfumo wako hapa chini.",
      lastDetected: "Ishara Iliyotambuliwa",
      executedTask: "Kazi Iliyotekelezwa",
    },
    disabilities: {
      blind: {
        title: "Asiyeona au Mwenye Uoni Hafifu",
        summary:
          "Huwasha alama za kisoma-skrini, msaidizi wa sauti na kamera kwa Kiswahili, na njia za mkato za kibodi.",
        instantVoiceInstruction:
          "Karibu AccessPath. Mwongozo wa sauti kwa Kiswahili umewashwa. Tumia Tab na Enter kusonga au fungua Msaidizi wa Kuona.",
      },
      deaf: {
        title: "Kiziwi au Mwenye Usikivu Hafifu",
        summary: "Huwasha manukuu ya moja kwa moja na Msaidizi wa Lugha ya Ishara chini kulia.",
        instantVoiceInstruction:
          "Usaidizi wa kiziwi umewashwa na manukuu ya moja kwa moja na msaidizi wa ishara.",
      },
      motor: {
        title: "Ulemavu wa Viungo",
        summary: "Vitufe vikubwa na udhibiti kamili wa kibodi bila kikomo cha muda.",
        instantVoiceInstruction:
          "Hali ya ufikivu wa viungo imewashwa. Vitufe vyote vinaendeshwa kwa urahisi kupitia kibodi.",
      },
      color: {
        title: "Changamoto ya Kutofautisha Rangi",
        summary: "Huongeza utofautishaji na kuweka aikoni na maandishi wazi.",
        instantVoiceInstruction:
          "Usaidizi wa rangi uko tayari. Chagua rangi zinazokupa shida kutofautisha.",
      },
      standard: {
        title: "Matumizi ya Kawaida",
        summary: "Dashibodi safi yenye usomaji wa sauti na mpango wa kazi.",
        instantVoiceInstruction:
          "Karibu AccessPath. Weka wasifu wako na mpango wa kazi ili kupata mapendekezo.",
      },
    },
    appreciationMessages: [
      "Maendeleo mazuri sana! Umekamilisha somo lingine.",
      "Hongera! Umekamilisha kozi yako.",
      "Juhudi zako zinajenga ujuzi mpya.",
      "Hatua nyingine imefikiwa. Endelea kujikuza.",
      "Umefikia lengo lako la kujifunza!",
    ],
  },
};
