import { LanguageCode } from "../types";

export type OnboardingQuestionId =
  | "name"
  | "email"
  | "targetTrack"
  | "targetRole"
  | "experienceLevel"
  | "workStyle"
  | "skills"
  | "goalStatement"
  | "confirmSubmit";

export interface LocalizedVoiceScripts {
  step2BlindIntroAndPrompt: string;
  step3StartNotice: string;
  listeningLabel: string;
  transcribingLabel: string;
  speakingLabel: string;
  doneSpeakingBtn: string;
  answerByVoiceBtn: string;
  repeatBtn: string;
  skipBtn: string;
  pauseVoiceBtn: string;
  resumeVoiceBtn: string;
  voiceReplyPlaceholder: string;
  sendVoiceFallbackBtn: string;
  didNotHearPrompt: string;
  questions: Record<OnboardingQuestionId, string>;
  generalWelcome: (name: string, targetRole: string) => string;
  majorOptionsPrompt: string;
  listeningForChoice: string;
  specificPromptSuffix: string;
}

export const VOICE_SCRIPTS: Record<LanguageCode, LocalizedVoiceScripts> = {
  en: {
    step2BlindIntroAndPrompt:
      "Voice Assistant is now active in English. Say 'continue' to proceed to Sign In and Career Plan form, where I will ask each question aloud and fill your answers.",
    step3StartNotice:
      "Starting voice-guided form. I will ask each question, listen to your spoken answer, and fill it into the form automatically.",
    listeningLabel: "Listening to your voice...",
    transcribingLabel: "Processing your answer...",
    speakingLabel: "Speaking question...",
    doneSpeakingBtn: "Done Speaking",
    answerByVoiceBtn: "Listen Now",
    repeatBtn: "Repeat",
    skipBtn: "Skip / Next",
    pauseVoiceBtn: "Pause Voice Q&A",
    resumeVoiceBtn: "Start Voice Q&A",
    voiceReplyPlaceholder: "Or type/speak answer here if mic is unavailable...",
    sendVoiceFallbackBtn: "Fill Answer",
    didNotHearPrompt:
      "I did not hear a clear response. Press Listen Now, or type your answer in the reply box.",
    questions: {
      name: "Question 1 of 8: What is your full name? Please speak your full name now.",
      email: "Question 2 of 8: What is your email address? You can say, for example, abebe at gmail dot com.",
      targetTrack:
        "Question 3 of 8: Which career field do you want? Options are Full-Stack Web and Accessibility, Cloud and DevOps, Data Science and AI, UI/UX and Accessible Design, or Mobile Engineering.",
      targetRole:
        "Question 4 of 8: What is your target job role title? For example, Junior Frontend Engineer.",
      experienceLevel:
        "Question 5 of 8: What is your experience level? Say Beginner, Entry-Level, Intermediate, or Career Switcher.",
      workStyle:
        "Question 6 of 8: What work style do you prefer? Say Remote, Hybrid, On-site, or Internship.",
      skills:
        "Question 7 of 8: Which skills do you want to build? For example, React, TypeScript, Python, Accessibility, or Cloud.",
      goalStatement:
        "Question 8 of 8: What is your personal career goal? Speak one short sentence.",
      confirmSubmit:
        "All form questions are ready. Say 'submit' or 'enter dashboard' to open your AccessPath dashboard, or say 'repeat' to review.",
    },
    generalWelcome: (name, targetRole) =>
      `General overview: Welcome ${name}. You are signed in to AccessPath. Your Career Plan targets ${targetRole}.`,
    majorOptionsPrompt:
      "Major options on the website: Option 1, Courses. Option 2, Resources. Option 3, Progress and Badges. Option 4, Jobs. Option 5, Job Tracker. Option 6, LinkedIn Profile. Option 7, AI Assistant. Option 8, Settings. Or say Dashboard, or Check In Today. Which option would you like to open?",
    listeningForChoice: "Listening for your choice...",
    specificPromptSuffix:
      "Say 'major options' to hear all sections again, say an item command like 'enroll 1' or 'complete lesson', or say 'stop' to pause.",
  },
  am: {
    step2BlindIntroAndPrompt:
      "የአማርኛ የድምፅ ረዳት አሁን ተጀምሯል። ወደ መግቢያና የሥራ ዕቅድ ቅጽ ለመቀጠል 'ቀጥል' ወይም 'continue' ይበሉ፤ እዚያም እያንዳንዱን ጥያቄ ጠይቄ መልስዎን እሞላለሁ።",
    step3StartNotice:
      "በድምፅ የሚሞላ ቅጽ ተጀምሯል። መጀመሪያ ጥያቄውን እጠይቃለሁ፣ ከዚያ መልስዎን አዳምጬ በቦታው ላይ እጽፋለሁ።",
    listeningLabel: "ድምፅዎን በማዳመጥ ላይ...",
    transcribingLabel: "መልስዎን በመሙላት ላይ...",
    speakingLabel: "ጥያቄውን በማንበብ ላይ...",
    doneSpeakingBtn: "ተናግሬ ጨርሻለሁ",
    answerByVoiceBtn: "አሁን አዳምጥ",
    repeatBtn: "ጥያቄውን ድገም",
    skipBtn: "ዝለል / ቀጣይ",
    pauseVoiceBtn: "የድምፅ ቅጽ አቁም",
    resumeVoiceBtn: "የድምፅ ቅጽ ጀምር",
    voiceReplyPlaceholder: "ማይክሮፎን ከሌለ መልስዎን እዚህ ይጻፉ...",
    sendVoiceFallbackBtn: "መልስ ሙላ",
    didNotHearPrompt: "ግልጽ ድምፅ አልሰማሁም። እንደገና ለመናገር 'አሁን አዳምጥ' ይጫኑ ወይም በሳጥኑ ውስጥ ይጻፉ።",
    questions: {
      name: "ጥያቄ 1 ከ 8፡ ሙሉ ስምዎ ማን ነው? እባክዎ አሁን ስምዎን ይናገሩ።",
      email: "ጥያቄ 2 ከ 8፡ የኢሜይል አድራሻዎ ምንድነው? እባክዎ አሁን ይናገሩ።",
      targetTrack:
        "ጥያቄ 3 ከ 8፡ የሚፈልጉት የሙያ መስክ የቱ ነው? Full-Stack Web፣ Cloud and DevOps፣ Data Science and AI፣ UI/UX Design ወይም Mobile Engineering ይምረጡ።",
      targetRole: "ጥያቄ 4 ከ 8፡ የሚፈልጉት የሥራ መደብ ስም ምንድነው?",
      experienceLevel: "ጥያቄ 5 ከ 8፡ የልምድ ደረጃዎ ምንድነው? Beginner፣ Entry-Level፣ Intermediate ወይም Career Switcher ይበሉ።",
      workStyle: "ጥያቄ 6 ከ 8፡ የትኛውን የሥራ ሁኔታ ይመርጣሉ? Remote፣ Hybrid፣ On-site ወይም Internship ይበሉ።",
      skills: "ጥያቄ 7 ከ 8፡ ማዳበር የሚፈልጓቸው ክህሎቶች የትኞቹ ናቸው? ለምሳሌ React፣ TypeScript፣ Python ወይም Accessibility።",
      goalStatement: "ጥያቄ 8 ከ 8፡ የግል የሙያ ግብዎ ምንድነው? በአጭር ዓረፍተ ነገር ይናገሩ።",
      confirmSubmit: "ሁሉም ጥያቄዎች ተዘጋጅተዋል። ወደ ዳሽቦርድ ለመግባት 'ግባ' ወይም 'submit' ይበሉ።",
    },
    generalWelcome: (name, targetRole) =>
      `አጠቃላይ መግለጫ፡ እንኳን ደህና መጡ ${name}። ወደ AccessPath ገብተዋል። የሥራ ዕቅድዎ ${targetRole} ላይ ያተኩራል።`,
    majorOptionsPrompt:
      "የድረ-ገጹ ዋና አማራጮች፡ 1. ኮርሶች፣ 2. መርጃዎች፣ 3. እድገት እና ባጆች፣ 4. ሥራዎች፣ 5. መከታተያ፣ 6. ሊንክድኢን፣ 7. AI ረዳት፣ 8. ቅንብሮች። የትኛውን መክፈት ይፈልጋሉ?",
    listeningForChoice: "ምርጫዎን በማዳመጥ ላይ...",
    specificPromptSuffix:
      "ዋና አማራጮችን ለመስማት 'major options' ይበሉ፣ ወይም እንደ 'enroll 1' ወይም 'complete lesson' ያለ ትዕዛዝ ይስጡ።",
  },
  om: {
    step2BlindIntroAndPrompt:
      "Gargaaraan sagalee Afaan Oromoo amma banameera. Gara unka seenumsaa fi karoora hojiitti darbuuf 'itti fufi' ykn 'continue' jedhaa; gaaffii hunda gaafadhee deebii keessan nan guuta.",
    step3StartNotice:
      "Unka sagaleedhaan guutamu jalqabameera. Gaaffii nan gaafadha, deebii keessan nan dhaggeeffadha, bakka deebiitti nan barreessa.",
    listeningLabel: "Sagalee keessan dhaggeeffachaa jira...",
    transcribingLabel: "Deebii keessan qindeessaa jira...",
    speakingLabel: "Gaaffii dubbisaa jira...",
    doneSpeakingBtn: "Dubbadhee Xumure",
    answerByVoiceBtn: "Amma Dhaggeeffadhu",
    repeatBtn: "Irra Deebi'i",
    skipBtn: "Irra Darbi / Itti Aanu",
    pauseVoiceBtn: "Sagalee Dhaabi",
    resumeVoiceBtn: "Gaaffii Sagalee Jalqabi",
    voiceReplyPlaceholder: "Maayikroofooniin yoo hin jirre asitti barreessaa...",
    sendVoiceFallbackBtn: "Deebii Guuti",
    didNotHearPrompt: "Sagalee qulqulluu hin dhageenye. 'Amma Dhaggeeffadhu' cuqaasaa ykn asitti barreessaa.",
    questions: {
      name: "Gaaffii 1ffaa: Maqaan guutuun kee eenyu? Maaloo amma dubbadhu.",
      email: "Gaaffii 2ffaa: Teessoon iimeelii kee maal? Maaloo dubbadhu.",
      targetTrack:
        "Gaaffii 3ffaa: Damee ogummaa kam barbaadda? Full-Stack Web, Cloud, Data Science, UI/UX ykn Mobile filadhu.",
      targetRole: "Gaaffii 4ffaa: Gaheen hojii barbaaddu maali?",
      experienceLevel: "Gaaffii 5ffaa: Sadarkaan muuxannoo kee maali? Beginner, Entry-Level, Intermediate ykn Career Switcher jedhi.",
      workStyle: "Gaaffii 6ffaa: Haala hojii kam filatta? Remote, Hybrid, On-site ykn Internship jedhi.",
      skills: "Gaaffii 7ffaa: Ogummaawwan kam horachuu barbaadda? Fakkeenyaaf React, TypeScript, Python.",
      goalStatement: "Gaaffii 8ffaa: Kaayyoon hojii kee maali? Hima gabaabaa tokkoon dubbadhu.",
      confirmSubmit: "Gaaffiiwwan hundi guutamaniiru. Gara daashboordii seenuuf 'submit' ykn 'galchi' jedhi.",
    },
    generalWelcome: (name, targetRole) =>
      `Ibsa waliigalaa: Baga nagaan dhufte ${name}. Gara AccessPath seenteetta. Karoorri hojii kee ${targetRole} irratti xiyyeeffata.`,
    majorOptionsPrompt:
      "Filannoowwan gurguddoo weebsaayitii: 1. Koorsiiwwan, 2. Qabeenya, 3. Guddinaa fi Baajii, 4. Hojiiwwan, 5. Hordoffii, 6. LinkedIn, 7. Gargaaraa AI, 8. Qindaa'ina. Isa kam banuu barbaadda?",
    listeningForChoice: "Filannoo keessan dhaggeeffachaa jira...",
    specificPromptSuffix:
      "Filannoo gurguddoo dhaga'uuf 'major options' jedhi, ykn 'enroll 1' yookiin 'complete lesson' jedhi.",
  },
  so: {
    step2BlindIntroAndPrompt:
      "Kaaliyaha codka ee Af-Soomaaliga hadda waa furan yahay. Si aad ugu gudubto foomka galitaanka iyo qorshaha shaqada dheh 'sii wad' ama 'continue'; halkaas ayaan su'aal kasta ku weydiinayaa oo jawaabtaada ku buuxinayaa.",
    step3StartNotice:
      "Foomka codka lagu buuxiyo waa la bilaabay. Waxaan ku weydiinayaa su'aal kasta, waan dhegeysanayaa jawaabtaada, ka dibna waan ku qorayaa.",
    listeningLabel: "Waa la dhegeysanayaa codkaaga...",
    transcribingLabel: "Jawaabtaada waa la habeynayaa...",
    speakingLabel: "Su'aasha waa la akhrinayaa...",
    doneSpeakingBtn: "Waan Dhammeeyay Hadalka",
    answerByVoiceBtn: "Hadda Dhegeyso",
    repeatBtn: "Ku Celi",
    skipBtn: "Ka Gudub / Xiga",
    pauseVoiceBtn: "Jooji Codka",
    resumeVoiceBtn: "Bilow Su'aalaha Codka",
    voiceReplyPlaceholder: "Haddii makarafoonku maqan yahay halkan ku qor...",
    sendVoiceFallbackBtn: "Buuxi Jawaabta",
    didNotHearPrompt: "Cod cad ma maqlin. Riix 'Hadda Dhegeyso' ama ku qor sanduuqa.",
    questions: {
      name: "Su'aasha 1aad: Magacaaga oo buuxa waa maxay? Fadlan hadda sheeg.",
      email: "Su'aasha 2aad: Cinwaanka iimaylkaagu waa maxay?",
      targetTrack:
        "Su'aasha 3aad: Qaybtee xirfadeed ayaad rabtaa? Dooro Full-Stack Web, Cloud, Data Science, UI/UX, ama Mobile.",
      targetRole: "Su'aasha 4aad: Doorka shaqo ee aad rabto waa maxay?",
      experienceLevel: "Su'aasha 5aad: Heerka khibraddaadu waa maxay? Dheh Beginner, Entry-Level, Intermediate, ama Career Switcher.",
      workStyle: "Su'aasha 6aad: Habkee shaqo ayaad doorbidaa? Dheh Remote, Hybrid, On-site, ama Internship.",
      skills: "Su'aasha 7aad: Xirfadee ayaad rabtaa inaad dhisto? Tusaale React, TypeScript, Python.",
      goalStatement: "Su'aasha 8aad: Hadafkaaga shaqo waa maxay? Hal jumlad oo gaaban ku sheeg.",
      confirmSubmit: "Dhammaan su'aalaha waa la buuxiyay. Dheh 'submit' si aad u gasho dashboard-ka.",
    },
    generalWelcome: (name, targetRole) =>
      `Guudmar guud: Soo dhawoow ${name}. Waxaad ku jirtaa AccessPath. Qorshahaaga shaqo wuxuu beegsanayaa ${targetRole}.`,
    majorOptionsPrompt:
      "Ikhtiyaarrada waaweyn ee bogga: 1. Koorsooyin, 2. Khayraad, 3. Horumar & Calaamadaha, 4. Shaqooyin, 5. Raadraac, 6. LinkedIn, 7. Kaaliyaha AI, 8. Dejinta. Kee baad rabtaa inaad furto?",
    listeningForChoice: "Waa la dhegeysanayaa doorashadaada...",
    specificPromptSuffix:
      "Dheh 'major options' si aad mar kale u maqasho qaybaha waaweyn, ama dheh 'enroll 1' ama 'complete lesson'.",
  },
  ti: {
    step2BlindIntroAndPrompt:
      "ናይ ትግርኛ ድምጺ ሓጋዚ ሕጂ ተጀሚሩ ኣሎ። ናብ መእተዊን መደብ ስራሕን ንምቕጻል 'ቀጽል' ወይ 'continue' በሉ፤ ኣብኡ ነፍሲ ወከፍ ሕቶ ሓቲተ መልስኹም ክመልእ እየ።",
    step3StartNotice:
      "ብድምጺ ዝምላእ ቅጥዒ ተጀሚሩ ኣሎ። ቅድሚ ኹሉ ሕቶ ክሓትት እየ፣ ድሕሪኡ መልስኹም ሰሚዐ ኣብ ቦትኡ ክመልእ እየ።",
    listeningLabel: "ድምጽኹም ይስማዕ ኣሎ...",
    transcribingLabel: "መልስኹም ይስራሕ ኣሎ...",
    speakingLabel: "ሕቶ ይንበብ ኣሎ...",
    doneSpeakingBtn: "ተዛሪበ ወዲአ",
    answerByVoiceBtn: "ሕጂ ስማዕ",
    repeatBtn: "ሕቶ ድገም",
    skipBtn: "ዝለል / ቀጻሊ",
    pauseVoiceBtn: "ድምጺ ደው ኣብል",
    resumeVoiceBtn: "ሕቶታት ድምጺ ጀምር",
    voiceReplyPlaceholder: "ማይክሮፎን እንተዘየለ ኣብዚ ጽሓፉ...",
    sendVoiceFallbackBtn: "መልሲ ምላእ",
    didNotHearPrompt: "ንጹር ድምጺ ኣይሰማዕኩን። 'ሕጂ ስማዕ' ጠውቑ ወይ ኣብ ሳጹን ጽሓፉ።",
    questions: {
      name: "ሕቶ 1 ካብ 8፡ ምሉእ ስምካ መን እዩ? በጃኻ ሕጂ ተዛረብ።",
      email: "ሕቶ 2 ካብ 8፡ ናይ ኢመይል ኣድራሻኻ እንታይ እዩ?",
      targetTrack:
        "ሕቶ 3 ካብ 8፡ ኣየናይ ዓውዲ ስራሕ ትደሊ? Full-Stack Web, Cloud, Data Science, UI/UX, ወይ Mobile ምረጽ።",
      targetRole: "ሕቶ 4 ካብ 8፡ እትደልዮ መደብ ስራሕ እንታይ እዩ?",
      experienceLevel: "ሕቶ 5 ካብ 8፡ ደረጃ ልምድኻ እንታይ እዩ? Beginner, Entry-Level, Intermediate, ወይ Career Switcher በል።",
      workStyle: "ሕቶ 6 ካብ 8፡ ኣየናይ ኣሰራርሓ ትመርጽ? Remote, Hybrid, On-site, ወይ Internship በል።",
      skills: "ሕቶ 7 ካብ 8፡ ኣየኖት ክእለታት ከተማዕብል ትደሊ? ንኣብነት React, TypeScript, Python።",
      goalStatement: "ሕቶ 8 ካብ 8፡ ውልቃዊ ሸቶ ስራሕካ እንታይ እዩ? ብሓጺር ምሉእ ሓሳብ ተዛረብ።",
      confirmSubmit: "ኩሎም ሕቶታት ተመሊኦም ኣለዉ። ናብ ዳሽቦርድ ንምእታው 'submit' በል።",
    },
    generalWelcome: (name, targetRole) =>
      `ሓፈሻዊ መግለጺ፡ እንቋዕ ብደሓን መጻእካ ${name}። ናብ AccessPath ኣቲኻ ኣለኻ። መደብ ስራሕካ ኣብ ${targetRole} የድህብ።`,
    majorOptionsPrompt:
      "ዋና ኣማራጺታት መርበብ ሓበሬታ፡ 1. ኮርሳት፣ 2. ንዋት፣ 3. ዕብየትን ባጃትን፣ 4. ስራሓት፣ 5. መከታተሊ፣ 6. LinkedIn፣ 7. AI ሓጋዚ፣ 8. ቅጥዕታት። ኣየናይ ክትከፍት ትደሊ?",
    listeningForChoice: "ምርጫኻ ይስማዕ ኣሎ...",
    specificPromptSuffix:
      "ዋና ኣማራጺታት ንምስማዕ 'major options' በል፣ ወይ 'enroll 1' ወይ 'complete lesson' በል።",
  },
};
