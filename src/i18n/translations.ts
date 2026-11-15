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
};
