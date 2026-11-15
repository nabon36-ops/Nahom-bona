import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AccessibilityPreferences, LanguageCode } from "../types";
import { LANGUAGES } from "../i18n/translations";
import { apiUrl } from "../services/apiConfig";
import { LiveVisionSession } from "../services/liveVisionClient";
import {
  checkLanguageSpeechSupportPlaceholder,
} from "./blindAssistantHelpers";
import {
  finishCurrentListeningNow,
  inspectLanguageSpeechSupport,
  interpretVisionVoiceCommand,
  LanguageSpeechSupport,
  listenForUserSpeech,
  playAccessibleAudioCue,
  speakEthiopianInstruction,
  stopActiveListening,
  stopAllVoicePlayback,
  VisionVoiceCommandType,
} from "../services/voiceService";
import {
  AlertTriangle,
  Camera,
  CameraOff,
  Eye,
  Gauge,
  Globe,
  HelpCircle,
  LifeBuoy,
  Mic,
  MicOff,
  Play,
  Radio,
  RotateCcw,
  Send,
  ShieldAlert,
  Square,
  Volume2,
  VolumeX,
} from "lucide-react";

interface BlindVisualAssistantViewProps {
  preferences: AccessibilityPreferences;
  onSelectLanguage: (lang: LanguageCode) => void;
  onUpdateSpeechRate: (rate: number) => void;
  onCaptionUpdate?: (caption: string) => void;
}

interface VisionHistoryEntry {
  id: string;
  role: "user" | "assistant" | "warning" | "system";
  text: string;
  ocrText?: string;
  colors?: string[];
  features?: string[];
  timestamp: string;
  mode?: string;
}

interface VisionDescribeResponse {
  description?: string;
  hazardWarning?: string;
  ocrText?: string;
  colorsDetected?: string[];
  detectedFeatures?: string[];
  error?: string;
  missingApiKey?: boolean;
}

const PRIMARY_VISION_LANGUAGES: LanguageCode[] = [
  "en",
  "am",
  "om",
  "ar",
  "fr",
  "sw",
];

interface LocalizedVisionStrings {
  title: string;
  subtitle: string;
  welcomeSpoken: string;
  startBtn: string;
  stopAssistantBtn: string;
  restartBtn: string;
  talkInterruptBtn: string;
  doneTalkingBtn: string;
  captureDescribeBtn: string;
  repeatBtn: string;
  stopSpeakingBtn: string;
  slowerBtn: string;
  normalSpeedBtn: string;
  continuousOn: string;
  continuousOff: string;
  samplingLabel: string;
  cameraPreviewHeading: string;
  micStatusLabel: string;
  cameraStatusLabel: string;
  aiSpeakingLabel: string;
  listeningLabel: string;
  languageHeading: string;
  historyHeading: string;
  quickCommandsHeading: string;
  safetyHeading: string;
  privacyHeading: string;
  emergencyHeading: string;
  safetyPoints: string[];
  privacyBody: string;
  emergencyBody: string;
  askPlaceholder: string;
  sendBtn: string;
  commands: Record<
    | "describe_front"
    | "read_text"
    | "describe_room"
    | "find_door"
    | "what_color",
    string
  >;
}

const VISION_STRINGS: Record<LanguageCode, LocalizedVisionStrings> = {
  en: {
    title: "Multilingual AI Visual Assistant",
    subtitle:
      "Voice-first camera assistance for blind and visually impaired users. Describes surroundings, reads printed text, locates doors and stairs, and warns of visible hazards.",
    welcomeSpoken:
      "Welcome to the AccessPath Visual Assistant in English. Press the large Start Assistant button to activate your rear camera and microphone. Remember, this assistant never replaces a white cane or guide dog.",
    startBtn: "Start Assistant (Camera & Microphone)",
    stopAssistantBtn: "Stop Assistant",
    restartBtn: "Restart",
    talkInterruptBtn: "Speak / Interrupt AI",
    doneTalkingBtn: "Done Speaking",
    captureDescribeBtn: "Capture & Describe Now",
    repeatBtn: "Repeat Last Answer",
    stopSpeakingBtn: "Stop Speaking",
    slowerBtn: "Speak Slower",
    normalSpeedBtn: "Normal Speed",
    continuousOn: "Continuous Camera Mode: ON",
    continuousOff: "Continuous Camera Mode: OFF",
    samplingLabel: "Sampling interval",
    cameraPreviewHeading: "Rear Camera View",
    micStatusLabel: "Microphone",
    cameraStatusLabel: "Camera",
    aiSpeakingLabel: "AI Voice",
    listeningLabel: "Listening",
    languageHeading: "Assistant Language (Spoken & Vision)",
    historyHeading: "Conversation & Scene History",
    quickCommandsHeading: "Voice & One-Tap Scene Commands",
    safetyHeading: "Important Mobility & Safety Notice",
    privacyHeading: "Camera & Microphone Privacy",
    emergencyHeading: "Emergency & Help Instructions",
    safetyPoints: [
      "This assistant does NOT replace a white cane, guide dog, or established mobility techniques.",
      "It CANNOT guarantee obstacle avoidance or confirm that a walking path is safe based on a camera image.",
      "AI visual descriptions may be inaccurate, incomplete, or delayed in low light, motion, or complex scenes.",
    ],
    privacyBody:
      "Your camera and microphone remain inactive until you press Start Assistant. Frames and audio are sent encrypted to the backend server solely for real-time Gemini AI analysis during your active session and are not saved permanently.",
    emergencyBody:
      "If you feel disoriented, hear a hazard warning, or lose your bearings: stop walking immediately, use your white cane or guide dog, and call a trusted contact or local emergency services. Keyboard shortcuts: Alt+S (Start/Stop), Alt+M (Speak/Interrupt), Alt+C (Capture & Describe), Alt+X (Stop Speaking).",
    askPlaceholder: "Ask about what the camera sees or type a command (e.g. 'Find the door')...",
    sendBtn: "Ask AI",
    commands: {
      describe_front: "What is in front of me?",
      read_text: "Read this text",
      describe_room: "Describe this room",
      find_door: "Find the door",
      what_color: "What color is this object?",
    },
  },
  am: {
    title: "ባለብዙ ቋንቋ የእይታ AI ረዳት",
    subtitle:
      "ለዓይነ ስውራን እና የማየት እክል ላለባቸው በድምፅ እና በካሜራ የሚሰራ ረዳት። አካባቢን ይገልጻል፣ ጽሑፍ ያነባል፣ በሮችንና ደረጃዎችን ይለያል።",
    welcomeSpoken:
      "እንኳን ወደ AccessPath የእይታ ረዳት በአማርኛ በደህና መጡ። ካሜራውን እና ማይክሮፎኑን ለማንቀሳቀስ ትልቁን ረዳት ጀምር የሚለውን ቁልፍ ይጫኑ። ይህ መሣሪያ ነጭ ዘንግን ወይም መሪ ውሻን በፍጹም አይተካም።",
    startBtn: "ረዳት ጀምር (ካሜራ እና ማይክሮፎን)",
    stopAssistantBtn: "ረዳት አቁም",
    restartBtn: "እንደገና ጀምር",
    talkInterruptBtn: "ተናገር / AI አቋርጥ",
    doneTalkingBtn: "ተናግሬ ጨርሻለሁ",
    captureDescribeBtn: "አሁን አንሳና ግለጽ",
    repeatBtn: "ያለፈውን ድገም",
    stopSpeakingBtn: "መናገር አቁም",
    slowerBtn: "ቀስ ብለህ ተናገር",
    normalSpeedBtn: "መደበኛ ፍጥነት",
    continuousOn: "ተከታታይ ካሜራ፡ በርቷል",
    continuousOff: "ተከታታይ ካሜራ፡ ጠፍቷል",
    samplingLabel: "የማንሻ ጊዜ",
    cameraPreviewHeading: "የኋላ ካሜራ እይታ",
    micStatusLabel: "ማይክሮፎን",
    cameraStatusLabel: "ካሜራ",
    aiSpeakingLabel: "የAI ድምፅ",
    listeningLabel: "ማዳመጥ",
    languageHeading: "የረዳቱ ቋንቋ",
    historyHeading: "የውይይት እና የእይታ ታሪክ",
    quickCommandsHeading: "የድምፅ እና ፈጣን ትዕዛዞች",
    safetyHeading: "አስፈላጊ የደህንነት እና የእንቅስቃሴ ማሳሰቢያ",
    privacyHeading: "የካሜራ እና ማይክሮፎን ግላዊነት",
    emergencyHeading: "የአደጋ ጊዜ እና የእርዳታ መመሪያ",
    safetyPoints: [
      "ይህ ረዳት ነጭ ዘንግን፣ መሪ ውሻን ወይም የመንቀሳቀስ ዘዴዎችን በፍጹም አይተካም።",
      "በካሜራ ምስል ብቻ መንገዱ ሙሉ በሙሉ ደህንነቱ የተጠበቀ መሆኑን ማረጋገጥ አይችልም።",
      "የAI መግለጫዎች በደካማ ብርሃን ወይም እንቅስቃሴ ላይ ትክክለኛ ላይሆኑ ወይም ሊዘገዩ ይችላሉ።",
    ],
    privacyBody:
      "ረዳት ጀምር እስኪጫኑ ድረስ ካሜራ እና ማይክሮፎን አይከፈቱም። ምስሎችና ድምፅ ለቀጥታ Gemini ትንተና ብቻ ይላካሉ እንጂ በቋሚነት አይቀመጡም።",
    emergencyBody:
      "ግራ ከተጋቡ ወይም የአደጋ ማስጠንቀቂያ ከሰሙ ወዲያውኑ መራመድ ያቁሙ፣ ነጭ ዘንግዎን ይጠቀሙ እና የታመነ ሰው ወይም የአደጋ ጊዜ አገልግሎት ይደውሉ።",
    askPlaceholder: "ስለ ካሜራው እይታ ይጠይቁ ወይም ትዕዛዝ ይጻፉ...",
    sendBtn: "AI ጠይቅ",
    commands: {
      describe_front: "ከፊቴ ምን አለ?",
      read_text: "ይህን ጽሑፍ አንብብ",
      describe_room: "ይህን ክፍል ግለጽ",
      find_door: "በሩን ፈልግ",
      what_color: "የዚህ ዕቃ ቀለም ምንድን ነው?",
    },
  },
  om: {
    title: "Gargaaraa Ijaa AI Afaan Hedduu",
    subtitle:
      "Gargaarsa kaameraa fi sagalee namoota agartuu hin qabneef. Naannoo ibsa, barreeffama dubbisa, balbalaa fi sadarkaa barbaada, balaa akeekkachiisa.",
    welcomeSpoken:
      "Baga gara Gargaaraa Ijaa AccessPath Afaan Oromootiin nagaan dhuftan. Kaameraa fi maayikroofoonii banuuf qabduu guddaa Gargaaraa Jalqabi jedhu cuqaasaa. Meeshaan kun ulee adii ykn saree qajeelchituu hin bakka bu'u.",
    startBtn: "Gargaaraa Jalqabi (Kaameraa & Maayikii)",
    stopAssistantBtn: "Gargaaraa Dhaabi",
    restartBtn: "Irra Deebi'ii Jalqabi",
    talkInterruptBtn: "Dubbadhu / AI Addaan Kuti",
    doneTalkingBtn: "Dubbadhee Xumure",
    captureDescribeBtn: "Amma Kaasiitii Ibsi",
    repeatBtn: "Irra Deebi'i",
    stopSpeakingBtn: "Dubbii Dhaabi",
    slowerBtn: "Suuta Dubbadhu",
    normalSpeedBtn: "Saffisa Idilee",
    continuousOn: "Kaameraa Walitti Fufaa: BANAADHA",
    continuousOff: "Kaameraa Walitti Fufaa: CUFAA",
    samplingLabel: "Giddugaleessa yeroo",
    cameraPreviewHeading: "Mul'ata Kaameraa Duubaa",
    micStatusLabel: "Maayikroofoonii",
    cameraStatusLabel: "Kaameraa",
    aiSpeakingLabel: "Sagalee AI",
    listeningLabel: "Dhaggeeffachaa",
    languageHeading: "Afaan Gargaaraa",
    historyHeading: "Seenaa Haasa'aa fi Naannoo",
    quickCommandsHeading: "Ajaja Sagalee fi Qabduu Saffisaa",
    safetyHeading: "Hubachiisa Nageenyaa fi Sochii Qaamaa",
    privacyHeading: "Iccitii Kaameraa fi Maayikroofoonii",
    emergencyHeading: "Qajeelfama Yeroo Balaa fi Gargaarsaa",
    safetyPoints: [
      "Gargaaraan kun ulee adii, saree qajeelchituu ykn tooftaa sochii idilee hin bakka bu'u.",
      "Suuraa kaameraa qofaan daandiin guutummaatti nagaa ta'uu isaa mirkaneessuu hin danda'u.",
      "Ibsi AI yeroo ifni xiqqaatu dogoggoruu yookiin turuu danda'a.",
    ],
    privacyBody:
      "Hanga Gargaaraa Jalqabi tuqxutti kaameraa fi maayikiin hin banaman. Suuraanii fi sagaleen xiinxala Gemini yeroo sanaa qofaaf ergamu.",
    emergencyBody:
      "Yoo akeekkachiisa balaa dhageesse ykn daandiin si bade hatattamaan dhaabbadhu, ulee adii kee fayyadami, nama amanamtuu ykn tajaajila balaa bilbili.",
    askPlaceholder: "Waa'ee kaameraan arguu gaafadhu ykn ajaja barreessi...",
    sendBtn: "AI Gaafadhu",
    commands: {
      describe_front: "Fuula koo dura maal jira?",
      read_text: "Barreeffama kana dubbisi",
      describe_room: "Kutaa kana ibsi",
      find_door: "Balbala barbaadi",
      what_color: "Halluun meeshaa kanaa maali?",
    },
  },
  ar: {
    title: "المساعد البصري الذكي متعدد اللغات",
    subtitle:
      "مساعد صوتي وكاميرا للمكفوفين وضعاف البصر. يصف المحيط والأشخاص والأثاث، ويقرأ النصوص، ويبحث عن الأبواب والسلالم، ويحذر من المخاطر.",
    welcomeSpoken:
      "مرحباً بك في المساعد البصري من AccessPath باللغة العربية. اضغط على زر بدء المساعد الكبير لتفعيل الكاميرا الخلفية والميكروفون. تذكر أن هذا المساعد لا يغني عن العصا البيضاء أو كلب الإرشاد.",
    startBtn: "بدء المساعد (الكاميرا والميكروفون)",
    stopAssistantBtn: "إيقاف المساعد",
    restartBtn: "إعادة التشغيل",
    talkInterruptBtn: "تحدث / مقاطعة المساعد",
    doneTalkingBtn: "أنهيت التحدث",
    captureDescribeBtn: "التقاط ووصف الآن",
    repeatBtn: "إعادة آخر إجابة",
    stopSpeakingBtn: "إيقاف الكلام",
    slowerBtn: "تحدث ببطء",
    normalSpeedBtn: "السرعة العادية",
    continuousOn: "وضع الكاميرا المستمر: مفعل",
    continuousOff: "وضع الكاميرا المستمر: متوقف",
    samplingLabel: "فاصل الالتقاط",
    cameraPreviewHeading: "معاينة الكاميرا الخلفية",
    micStatusLabel: "الميكروفون",
    cameraStatusLabel: "الكاميرا",
    aiSpeakingLabel: "صوت المساعد",
    listeningLabel: "الاستماع",
    languageHeading: "لغة المساعد",
    historyHeading: "سجل المحادثة والوصف",
    quickCommandsHeading: "الأوامر الصوتية والسريعة",
    safetyHeading: "تنبيه مهم للسلامة والتنقل",
    privacyHeading: "خصوصية الكاميرا والميكروفون",
    emergencyHeading: "تعليمات الطوارئ والمساعدة",
    safetyPoints: [
      "هذا المساعد لا يغني أبداً عن العصا البيضاء أو كلب الإرشاد أو مهارات التنقل المعتمدة.",
      "لا يمكنه ضمان خلو الطريق من العوائق أو تأكيد أمان المسار بناءً على صورة الكاميرا وحدها.",
      "قد تكون الأوصاف غير دقيقة أو متأخرة في الإضاءة المنخفضة أو الحركة السريعة.",
    ],
    privacyBody:
      "لا تعمل الكاميرا أو الميكروفون إلا بعد الضغط على بدء المساعد. تُرسل الإطارات والصوت بشكل آمن لتحليل Gemini الفوري ولا يتم حفظها بشكل دائم.",
    emergencyBody:
      "إذا شعرت بالارتباك أو سمعت تحذيراً من خطر: توقف عن المشي فوراً، واستخدم عصاك البيضاء، واتصل بشخص موثوق أو بخدمات الطوارئ.",
    askPlaceholder: "اسأل عما تراه الكاميرا أو اكتب أمراً...",
    sendBtn: "اسأل AI",
    commands: {
      describe_front: "ماذا يوجد أمامي؟",
      read_text: "اقرأ هذا النص",
      describe_room: "صف هذه الغرفة",
      find_door: "ابحث عن الباب",
      what_color: "ما لون هذا الشيء؟",
    },
  },
  fr: {
    title: "Assistant Visuel IA Multilingue",
    subtitle:
      "Assistance vocale et caméra pour personnes aveugles et malvoyantes. Décrit l'environnement, lit les textes imprimés, localise portes et escaliers et signale les dangers visibles.",
    welcomeSpoken:
      "Bienvenue dans l'Assistant Visuel AccessPath en français. Appuyez sur le grand bouton Démarrer l'assistant pour activer la caméra arrière et le microphone. Cet outil ne remplace jamais une canne blanche ni un chien guide.",
    startBtn: "Démarrer l'assistant (Caméra & Micro)",
    stopAssistantBtn: "Arrêter l'assistant",
    restartBtn: "Redémarrer",
    talkInterruptBtn: "Parler / Interrompre l'IA",
    doneTalkingBtn: "J'ai fini",
    captureDescribeBtn: "Capturer et décrire",
    repeatBtn: "Répéter la réponse",
    stopSpeakingBtn: "Arrêter de parler",
    slowerBtn: "Parler plus lentement",
    normalSpeedBtn: "Vitesse normale",
    continuousOn: "Mode caméra continu : ACTIVÉ",
    continuousOff: "Mode caméra continu : DÉSACTIVÉ",
    samplingLabel: "Intervalle d'analyse",
    cameraPreviewHeading: "Aperçu caméra arrière",
    micStatusLabel: "Microphone",
    cameraStatusLabel: "Caméra",
    aiSpeakingLabel: "Voix IA",
    listeningLabel: "Écoute",
    languageHeading: "Langue de l'assistant",
    historyHeading: "Historique des échanges",
    quickCommandsHeading: "Commandes vocales et rapides",
    safetyHeading: "Avis essentiel de sécurité et mobilité",
    privacyHeading: "Confidentialité caméra et micro",
    emergencyHeading: "Instructions d'aide et d'urgence",
    safetyPoints: [
      "Cet assistant NE remplace PAS la canne blanche, le chien guide ni les techniques de locomotion.",
      "Il NE peut PAS garantir l'évitement des obstacles ni certifier qu'un chemin est sûr à partir d'une image.",
      "Les descriptions peuvent être inexactes, incomplètes ou retardées selon l'éclairage ou le mouvement.",
    ],
    privacyBody:
      "La caméra et le microphone restent inactifs jusqu'à votre autorisation. Les images et la voix sont envoyées au serveur sécurisé uniquement pour l'analyse Gemini en direct.",
    emergencyBody:
      "En cas de doute ou d'alerte de danger : arrêtez-vous immédiatement, utilisez votre canne ou chien guide et contactez un proche ou les secours. Raccourcis : Alt+S, Alt+M, Alt+C, Alt+X.",
    askPlaceholder: "Posez une question sur ce que voit la caméra...",
    sendBtn: "Demander",
    commands: {
      describe_front: "Qu'y a-t-il devant moi ?",
      read_text: "Lire ce texte",
      describe_room: "Décrire cette pièce",
      find_door: "Trouver la porte",
      what_color: "De quelle couleur est cet objet ?",
    },
  },
  sw: {
    title: "Msaidizi wa Kuona wa AI wa Lugha Nyingi",
    subtitle:
      "Msaada wa sauti na kamera kwa wasioona na wenye uoni hafifu. Hueleza mazingira, husoma maandishi, hutafuta milango na ngazi, na huonya kuhusu hatari.",
    welcomeSpoken:
      "Karibu kwenye Msaidizi wa Kuona wa AccessPath kwa Kiswahili. Bonyeza kitufe kikubwa cha Anza Msaidizi kuwasha kamera ya nyuma na maikrofoni. Kumbuka, msaidizi huyu hachukui nafasi ya fimbo nyeupe au mbwa mwongozi.",
    startBtn: "Anza Msaidizi (Kamera & Maikrofoni)",
    stopAssistantBtn: "Simamisha Msaidizi",
    restartBtn: "Anza Upya",
    talkInterruptBtn: "Zungumza / Katiza AI",
    doneTalkingBtn: "Nimemaliza",
    captureDescribeBtn: "Piga Picha & Eleza Sasa",
    repeatBtn: "Rudia Jibu la Mwisho",
    stopSpeakingBtn: "Simamisha Kuzungumza",
    slowerBtn: "Zungumza Polepole",
    normalSpeedBtn: "Kasi ya Kawaida",
    continuousOn: "Kamera Endelevu: IMEWASHWA",
    continuousOff: "Kamera Endelevu: IMEZIMWA",
    samplingLabel: "Muda wa kukagua",
    cameraPreviewHeading: "Kamera ya Nyuma",
    micStatusLabel: "Maikrofoni",
    cameraStatusLabel: "Kamera",
    aiSpeakingLabel: "Sauti ya AI",
    listeningLabel: "Kusikiliza",
    languageHeading: "Lugha ya Msaidizi",
    historyHeading: "Historia ya Mazungumzo",
    quickCommandsHeading: "Amri za Sauti na Kugusa",
    safetyHeading: "Ilani Muhimu ya Usalama na Mwendo",
    privacyHeading: "Faragha ya Kamera na Maikrofoni",
    emergencyHeading: "Maelekezo ya Dharura na Msaada",
    safetyPoints: [
      "Msaidizi huyu HACHUKUI nafasi ya fimbo nyeupe, mbwa mwongozi, au mbinu za mwendo salama.",
      "HAWEZI kuhakikisha njia haina vikwazo au ni salama kwa kutegemea picha ya kamera pekee.",
      "Maelezo ya AI yanaweza kukosea au kuchelewa kwenye mwanga hafifu au mwendo.",
    ],
    privacyBody:
      "Kamera na maikrofoni haziwashwi hadi ubonyeze Anza Msaidizi. Picha na sauti hutumwa kwa usalama kuchakatwa na Gemini pekee na hazihifadhiwi kudumu.",
    emergencyBody:
      "Ukisikia onyo la hatari au ukipoteza mwelekeo: simama mara moja, tumia fimbo yako nyeupe, na piga simu kwa mtu unayemwamini au huduma za dharura.",
    askPlaceholder: "Uliza kamera inaona nini au andika amri...",
    sendBtn: "Uliza AI",
    commands: {
      describe_front: "Kuna nini mbele yangu?",
      read_text: "Soma maandishi haya",
      describe_room: "Elezea chumba hiki",
      find_door: "Tafuta mlango",
      what_color: "Kitu hiki kina rangi gani?",
    },
  },
  so: {
    title: "Kaaliyaha Aragga AI ee Luqadaha Badan",
    subtitle:
      "Kaaliye cod iyo kamarad ah oo loogu talagalay dadka aragga naafada ka ah.",
    welcomeSpoken:
      "Ku soo dhawoow Kaaliyaha Aragga ee AccessPath. Riix badhanka weyn ee Bilow Kaaliyaha. Qalabkani ma beddelo usha cad ama eeyga hagaha.",
    startBtn: "Bilow Kaaliyaha (Kamarad & Makarafoon)",
    stopAssistantBtn: "Jooji Kaaliyaha",
    restartBtn: "Dib u Bilow",
    talkInterruptBtn: "Hadal / Jooji AI",
    doneTalkingBtn: "Waan Dhammeeyay",
    captureDescribeBtn: "Sawir oo Sharax Hadda",
    repeatBtn: "Ku Celi Jawaabta",
    stopSpeakingBtn: "Jooji Hadalka",
    slowerBtn: "Si Tartiiib ah u Hadal",
    normalSpeedBtn: "Xawaare Caadi ah",
    continuousOn: "Kamaradda Joogtada ah: SHIDAN",
    continuousOff: "Kamaradda Joogtada ah: DANSAN",
    samplingLabel: "Muddada sawirka",
    cameraPreviewHeading: "Muuqaalka Kamaradda Dambe",
    micStatusLabel: "Makarafoon",
    cameraStatusLabel: "Kamarad",
    aiSpeakingLabel: "Codka AI",
    listeningLabel: "Dhegeysi",
    languageHeading: "Luqadda Kaaliyaha",
    historyHeading: "Taariikhda Wadahadalka",
    quickCommandsHeading: "Amarada Codka",
    safetyHeading: "Ogeysiis Badbaado oo Muhiim ah",
    privacyHeading: "Sirta Kamaradda iyo Makarafoonka",
    emergencyHeading: "Tilmaamaha Xaaladda Degdegga ah",
    safetyPoints: [
      "Kaaliyahani MA beddelo usha cad ama eeyga hagaha.",
      "MA dammaanad qaadi karo in waddadu ammaan tahay sawir keliya dartii.",
      "Sharaxaadda AI way khaldami kartaa ama way daahi kartaa.",
    ],
    privacyBody:
      "Kamaradda iyo makarafoonku waxay shidmaan keliya marka aad ogolaansho bixiso.",
    emergencyBody:
      "Haddii aad khatar dareento isla markiiba istaag oo wac qof aad ku kalsoon tahay ama gurmadka degdegga ah.",
    askPlaceholder: "Weydii waxa kamaraddu aragto...",
    sendBtn: "Weydii AI",
    commands: {
      describe_front: "Maxaa hortayda yaalla?",
      read_text: "Akhri qoraalkan",
      describe_room: "Sharax qolkan",
      find_door: "Raadi albaabka",
      what_color: "Midabkee buu leeyahay shaygan?",
    },
  },
  ti: {
    title: "ብዙሕ-ቋንቋ AI ሓጋዚ ራእይ",
    subtitle:
      "ንዓይነ ስውራንን ናይ ምርኣይ ጸገም ዘለዎምን ብድምጽን ካሜራን ዝሰርሕ ሓጋዚ።",
    welcomeSpoken:
      "እንቋዕ ናብ AccessPath ሓጋዚ ራእይ ብትግርኛ ብደሓን መጻእኩም። ካሜራን ማይክሮፎንን ንምኽፋት ሓጋዚ ጀምር ዝብል ጠውቑ። እዚ መሳርሒ ጻዕዳ በትሪ ኣይትክእን እዩ።",
    startBtn: "ሓጋዚ ጀምር (ካሜራን ማይክን)",
    stopAssistantBtn: "ሓጋዚ ደው ኣብል",
    restartBtn: "ዳግማይ ጀምር",
    talkInterruptBtn: "ተዛረብ / ኣቋርጽ",
    doneTalkingBtn: "ተዛሪበ ወዲአ",
    captureDescribeBtn: "ሕጂ ስእሊ ኣልዒልካ ግለጽ",
    repeatBtn: "ድገም",
    stopSpeakingBtn: "ምዝራብ ደው ኣብል",
    slowerBtn: "ቀስ ኢልካ ተዛረብ",
    normalSpeedBtn: "ስሩዕ ፍጥነት",
    continuousOn: "ቀጻሊ ካሜራ፡ ክፉት",
    continuousOff: "ቀጻሊ ካሜራ፡ ዕጹው",
    samplingLabel: "ናይ ግዜ ክፍተት",
    cameraPreviewHeading: "ናይ ድሕሪት ካሜራ",
    micStatusLabel: "ማይክሮፎን",
    cameraStatusLabel: "ካሜራ",
    aiSpeakingLabel: "ድምጺ AI",
    listeningLabel: "ምስማዕ",
    languageHeading: "ቋንቋ ሓጋዚ",
    historyHeading: "ታሪኽ ዝርርብ",
    quickCommandsHeading: "ትእዛዛት ድምጺ",
    safetyHeading: "ኣገዳሲ መጠንቀቕታ ድሕነት",
    privacyHeading: "ምስጢራውነት ካሜራን ማይክን",
    emergencyHeading: "ናይ ህጹጽ እዋን መምርሒ",
    safetyPoints: [
      "እዚ ሓጋዚ ጻዕዳ በትሪ ወይ መራሒ ከልቢ ኣይትክእን እዩ።",
      "ብስእሊ ካሜራ ጥራይ መንገዲ ውሑስ ምዃኑ ከረጋግጽ ኣይክእልን እዩ።",
      "መግለጺ AI ኣብ ድኹም ብርሃን ክጋገ ወይ ክድንጕ ይኽእል እዩ።",
    ],
    privacyBody:
      "ሓጋዚ ጀምር ክሳብ ትጠውቑ ካሜራን ማይክን ኣይክፈቱን እዮም።",
    emergencyBody:
      "ሓደጋ እንተተሰሚዑካ ብኡንብኡ ደው በል፣ ጻዕዳ በትርኻ ተጠቐም፣ ናብ ናይ ህጹጽ ረድኤት ደውል።",
    askPlaceholder: "ካሜራ ብዛዕባ ዝርእዮ ሕተት...",
    sendBtn: "ንAI ሕተት",
    commands: {
      describe_front: "ኣብ ቅድመይ እንታይ ኣሎ?",
      read_text: "ነዚ ጽሑፍ ኣንብብ",
      describe_room: "ነዚ ክፍሊ ግለጽ",
      find_door: "ማዕጾ ድለ",
      what_color: "ሕብሪ እዚ ነገር እንታይ እዩ?",
    },
  },
};

export const BlindVisualAssistantView: React.FC<
  BlindVisualAssistantViewProps
> = ({ preferences, onSelectLanguage, onUpdateSpeechRate, onCaptionUpdate }) => {
  const s = VISION_STRINGS[preferences.language];
  const speechRate = preferences.speechRate ?? 0.95;
  const isRtl = preferences.language === "ar";

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const camStreamRef = useRef<MediaStream | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const liveSessionRef = useRef<LiveVisionSession | null>(null);
  const visionInFlightRef = useRef(false);
  const languageRef = useRef<LanguageCode>(preferences.language);
  languageRef.current = preferences.language;
  const speechRateRef = useRef<number>(speechRate);
  speechRateRef.current = speechRate;

  const [assistantActive, setAssistantActive] = useState(false);
  const [starting, setStarting] = useState(false);
  const [connectionMode, setConnectionMode] = useState<
    "standby" | "live-ws" | "turn-based"
  >("standby");
  const [cameraStatus, setCameraStatus] = useState<
    "off" | "requesting" | "active" | "denied" | "unavailable"
  >("off");
  const [micStatus, setMicStatus] = useState<
    "off" | "ready" | "listening" | "transcribing" | "denied" | "unavailable"
  >("off");
  const [aiSpeaking, setAiSpeaking] = useState(false);
  const [analyzingImage, setAnalyzingImage] = useState(false);
  const [continuousMode, setContinuousMode] = useState(false);
  const [samplingSeconds, setSamplingSeconds] = useState<number>(5);

  const [permissionError, setPermissionError] = useState("");
  const [networkError, setNetworkError] = useState("");
  const [hazardAlert, setHazardAlert] = useState("");
  const [voiceSupport, setVoiceSupport] = useState<LanguageSpeechSupport>(() =>
    checkLanguageSpeechSupportPlaceholder(preferences.language)
  );
  const [lastSpokenNotice, setLastSpokenNotice] = useState("");
  const [textInput, setTextInput] = useState("");
  const [showAllLanguages, setShowAllLanguages] = useState(false);

  const [history, setHistory] = useState<VisionHistoryEntry[]>([
    {
      id: "init-welcome",
      role: "assistant",
      text: s.welcomeSpoken,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    },
  ]);

  const lastAssistantTextRef = useRef<string>(s.welcomeSpoken);
  const languageSectionRef = useRef<HTMLElement | null>(null);

  const appendHistory = useCallback(
    (entry: Omit<VisionHistoryEntry, "id" | "timestamp">) => {
      const next: VisionHistoryEntry = {
        ...entry,
        id: `vh-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setHistory((prev) => [...prev.slice(-24), next]);
      if (entry.role === "assistant" && entry.text) {
        lastAssistantTextRef.current = entry.text;
        onCaptionUpdate?.(entry.text);
      }
    },
    [onCaptionUpdate]
  );

  // Inspect real language voice & recognition capabilities on mount & language switch
  useEffect(() => {
    let active = true;
    inspectLanguageSpeechSupport(preferences.language).then((res) => {
      if (active) setVoiceSupport(res);
    });
    return () => {
      active = false;
    };
  }, [preferences.language]);

  const interruptAiSpeech = useCallback(() => {
    stopAllVoicePlayback();
    liveSessionRef.current?.interruptPlayback();
    setAiSpeaking(false);
    playAccessibleAudioCue("stop");
  }, []);

  const speakResponse = useCallback(
    async (text: string, langOverride?: LanguageCode, rateOverride?: number) => {
      const targetLang = langOverride || languageRef.current;
      const targetRate = rateOverride ?? speechRateRef.current;
      if (!text.trim()) return;
      setLastSpokenNotice("");
      setAiSpeaking(true);

      const res = await speakEthiopianInstruction(
        text,
        targetLang,
        (status) => {
          setAiSpeaking(status.playing);
          if (status.caption) onCaptionUpdate?.(status.caption);
        },
        { autoTranslate: false, rate: targetRate }
      );

      setAiSpeaking(false);
      if (res.missingNativeVoice && res.limitationNotice) {
        setLastSpokenNotice(res.limitationNotice);
      }
    },
    [onCaptionUpdate]
  );

  // Spoken welcome when opening the assistant screen
  useEffect(() => {
    const timer = window.setTimeout(() => {
      speakResponse(s.welcomeSpoken, preferences.language).catch(() => {});
    }, 250);
    return () => {
      window.clearTimeout(timer);
    };
    // Only on initial screen mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stopAssistant = useCallback(() => {
    setContinuousMode(false);
    setAssistantActive(false);
    setConnectionMode("standby");
    stopActiveListening();
    interruptAiSpeech();

    if (liveSessionRef.current) {
      liveSessionRef.current.dispose();
      liveSessionRef.current = null;
    }
    if (camStreamRef.current) {
      camStreamRef.current.getTracks().forEach((tr) => tr.stop());
      camStreamRef.current = null;
    }
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach((tr) => tr.stop());
      micStreamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraStatus("off");
    setMicStatus("off");
  }, [interruptAiSpeech]);

  useEffect(() => {
    return () => {
      stopAssistant();
    };
  }, [stopAssistant]);

  const captureVideoFrameBase64 = useCallback((): string | null => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.videoWidth === 0 || video.videoHeight === 0) {
      return null;
    }
    const maxW = 960;
    const scale = Math.min(1, maxW / video.videoWidth);
    canvas.width = Math.round(video.videoWidth * scale);
    canvas.height = Math.round(video.videoHeight * scale);
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", 0.8);
  }, []);

  const analyzeSceneWithVision = useCallback(
    async (
      mode: "front" | "read_text" | "room" | "find_door" | "color" | "continuous" | "question",
      question = ""
    ) => {
      if (visionInFlightRef.current) return;
      setNetworkError("");

      // If Gemini Live WebSocket is connected and user asked a visual question, send fresh frame + text prompt
      const frameDataUrl = captureVideoFrameBase64();
      if (!frameDataUrl) {
        const msg =
          cameraStatus === "denied"
            ? "Camera permission is denied. Please allow camera access in browser settings."
            : "Camera is not active yet. Press Start Assistant to turn on the rear camera.";
        setPermissionError(msg);
        appendHistory({ role: "system", text: msg });
        await speakResponse(msg);
        return;
      }

      if (connectionMode === "live-ws" && liveSessionRef.current) {
        liveSessionRef.current.sendVideoFrame(frameDataUrl);
      }

      visionInFlightRef.current = true;
      setAnalyzingImage(true);
      playAccessibleAudioCue("capture");

      try {
        const res = await fetch(apiUrl("/api/vision/describe"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            imageBase64: frameDataUrl,
            mimeType: "image/jpeg",
            language: preferences.language,
            mode,
            question,
            history: history.slice(-4).map((h) => ({ role: h.role, text: h.text })),
          }),
        });

        const data = (await res.json()) as VisionDescribeResponse;
        if (!res.ok) {
          const errText =
            data.error ||
            "Vision analysis failed due to a backend or network error. Please try again.";
          setNetworkError(errText);
          appendHistory({ role: "system", text: errText });
          await speakResponse(errText);
          return;
        }

        const warning = (data.hazardWarning || "").trim();
        const desc = (data.description || "").trim();
        const ocr = (data.ocrText || "").trim();

        if (warning) {
          setHazardAlert(warning);
          playAccessibleAudioCue("hazard");
        } else {
          setHazardAlert("");
        }

        const spokenFull = warning ? `${warning}. ${desc}` : desc;

        appendHistory({
          role: "assistant",
          text: spokenFull || "No clear details could be identified in this frame.",
          ocrText: ocr,
          colors: data.colorsDetected,
          features: data.detectedFeatures,
          mode,
        });

        if (spokenFull) {
          await speakResponse(spokenFull);
        }
      } catch {
        const msg =
          "Network connection interrupted while sending the camera frame. Check your internet connection and retry.";
        setNetworkError(msg);
        appendHistory({ role: "system", text: msg });
        await speakResponse(msg);
      } finally {
        visionInFlightRef.current = false;
        setAnalyzingImage(false);
      }
    },
    [
      appendHistory,
      cameraStatus,
      captureVideoFrameBase64,
      connectionMode,
      history,
      preferences.language,
      s.commands,
      speakResponse,
    ]
  );

  // Continuous camera sampling interval
  useEffect(() => {
    if (!assistantActive || !continuousMode || cameraStatus !== "active") {
      return;
    }
    const ms = Math.max(3, samplingSeconds) * 1000;
    const id = window.setInterval(() => {
      if (connectionMode === "live-ws" && liveSessionRef.current) {
        const frame = captureVideoFrameBase64();
        if (frame) liveSessionRef.current.sendVideoFrame(frame);
      } else if (!visionInFlightRef.current && !aiSpeaking) {
        analyzeSceneWithVision("continuous");
      }
    }, ms);
    return () => window.clearInterval(id);
  }, [
    aiSpeaking,
    analyzeSceneWithVision,
    assistantActive,
    cameraStatus,
    captureVideoFrameBase64,
    connectionMode,
    continuousMode,
    samplingSeconds,
  ]);

  const startAssistant = useCallback(async () => {
    if (starting) return;
    setStarting(true);
    setPermissionError("");
    setNetworkError("");
    setHazardAlert("");
    playAccessibleAudioCue("start");
    interruptAiSpeech();

    // 1. Request Rear Camera permission
    setCameraStatus("requesting");
    let camStream: MediaStream | null = null;
    try {
      camStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });
      camStreamRef.current = camStream;
      if (videoRef.current) {
        videoRef.current.srcObject = camStream;
        await videoRef.current.play().catch(() => {});
      }
      setCameraStatus("active");
    } catch (err) {
      const denied = err instanceof Error && err.name === "NotAllowedError";
      setCameraStatus(denied ? "denied" : "unavailable");
      const errMsg = denied
        ? "Camera permission was denied. Please enable camera access in your browser settings to describe surroundings."
        : "No rear or front camera was found or camera is in use by another app.";
      setPermissionError(errMsg);
    }

    // 2. Request Microphone permission
    let micStream: MediaStream | null = null;
    try {
      micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStreamRef.current = micStream;
      setMicStatus("ready");
    } catch (err) {
      const denied = err instanceof Error && err.name === "NotAllowedError";
      setMicStatus(denied ? "denied" : "unavailable");
      const micMsg = denied
        ? "Microphone permission was denied. You can still use the large on-screen command buttons or text box."
        : "No microphone detected. You can still use Capture & Describe and quick command buttons.";
      setPermissionError((prev) => (prev ? `${prev} ${micMsg}` : micMsg));
    }

    // 3. Activate Gemini Live WebSocket if supported & mic granted, else Turn-Based Mode
    let liveReady = false;
    if (micStream && voiceSupport.hasLiveApi) {
      const live = new LiveVisionSession({
        onReady: () => {
          setConnectionMode("live-ws");
          setMicStatus("listening");
        },
        onInputTranscript: (txt) => {
          appendHistory({ role: "user", text: txt });
        },
        onOutputTranscript: (txt) => {
          appendHistory({ role: "assistant", text: txt });
        },
        onSpeakingChange: (speaking) => {
          setAiSpeaking(speaking);
        },
        onError: (msg) => {
          setNetworkError(msg);
          setConnectionMode("turn-based");
        },
        onClose: () => {
          setConnectionMode((prev) => (prev === "live-ws" ? "turn-based" : prev));
        },
      });
      live.setPlaybackRate(speechRate);
      liveReady = await live.connect(preferences.language, micStream);
      if (liveReady) {
        liveSessionRef.current = live;
        const firstFrame = captureVideoFrameBase64();
        if (firstFrame) live.sendVideoFrame(firstFrame);
      } else {
        live.dispose();
      }
    }

    if (!liveReady) {
      setConnectionMode("turn-based");
    }

    setAssistantActive(true);
    setStarting(false);

    // Spoken welcome confirmation in user's selected language
    appendHistory({ role: "assistant", text: s.welcomeSpoken });
    await speakResponse(s.welcomeSpoken);
  }, [
    appendHistory,
    captureVideoFrameBase64,
    interruptAiSpeech,
    preferences.language,
    s.welcomeSpoken,
    speakResponse,
    speechRate,
    starting,
    voiceSupport.hasLiveApi,
  ]);

  const executeParsedCommand = useCallback(
    async (
      command: VisionVoiceCommandType,
      targetLanguage: LanguageCode | "",
      rawQuestion: string
    ) => {
      if (command === "stop_speaking") {
        interruptAiSpeech();
        setContinuousMode(false);
        return;
      }
      if (command === "repeat") {
        const last = lastAssistantTextRef.current;
        if (last) await speakResponse(last);
        return;
      }
      if (command === "speak_slower") {
        const nextRate = 0.78;
        onUpdateSpeechRate(nextRate);
        liveSessionRef.current?.setPlaybackRate(nextRate);
        const msg = s.slowerBtn;
        appendHistory({ role: "assistant", text: msg });
        await speakResponse(msg, preferences.language, nextRate);
        return;
      }
      if (command === "speak_faster") {
        const nextRate = 0.96;
        onUpdateSpeechRate(nextRate);
        liveSessionRef.current?.setPlaybackRate(nextRate);
        const msg = s.normalSpeedBtn;
        appendHistory({ role: "assistant", text: msg });
        await speakResponse(msg, preferences.language, nextRate);
        return;
      }
      if (command === "change_language") {
        if (targetLanguage) {
          onSelectLanguage(targetLanguage);
          playAccessibleAudioCue("language");
          const nextWelcome = VISION_STRINGS[targetLanguage].welcomeSpoken;
          appendHistory({ role: "assistant", text: nextWelcome });
          await speakResponse(nextWelcome, targetLanguage);
        } else {
          languageSectionRef.current?.scrollIntoView({ behavior: "smooth" });
          languageSectionRef.current?.focus();
          const msg = `${s.languageHeading}.`;
          appendHistory({ role: "assistant", text: msg });
          await speakResponse(msg);
        }
        return;
      }
      if (command === "describe_front") {
        await analyzeSceneWithVision("front");
        return;
      }
      if (command === "read_text") {
        await analyzeSceneWithVision("read_text");
        return;
      }
      if (command === "describe_room") {
        await analyzeSceneWithVision("room");
        return;
      }
      if (command === "find_door") {
        await analyzeSceneWithVision("find_door");
        return;
      }
      if (command === "what_color") {
        await analyzeSceneWithVision("color");
        return;
      }
      await analyzeSceneWithVision("question", rawQuestion);
    },
    [
      analyzeSceneWithVision,
      appendHistory,
      interruptAiSpeech,
      onSelectLanguage,
      onUpdateSpeechRate,
      preferences.language,
      s.languageHeading,
      s.normalSpeedBtn,
      s.slowerBtn,
      speakResponse,
    ]
  );

  const handleVoiceSpeakOrInterrupt = useCallback(async () => {
    // Allow interrupting AI while it is speaking
    interruptAiSpeech();
    setPermissionError("");
    setNetworkError("");

    if (micStatus === "listening") {
      finishCurrentListeningNow();
      return;
    }

    // If Live WebSocket is active, capture an up-to-date video frame alongside live audio
    if (connectionMode === "live-ws" && liveSessionRef.current) {
      const frame = captureVideoFrameBase64();
      if (frame) liveSessionRef.current.sendVideoFrame(frame);
    }

    const res = await listenForUserSpeech({
      language: preferences.language,
      maxDurationMs: 8500,
      translateToChosenLanguage: false,
      onStateChange: (st) => {
        if (st === "idle") {
          setMicStatus(micStreamRef.current ? "ready" : "off");
        } else {
          setMicStatus(st);
        }
      },
    });

    if (res.micError) {
      setMicStatus("denied");
      setPermissionError(res.micError);
      return;
    }

    const spoken = (res.transcript || "").trim();
    if (!spoken) return;

    appendHistory({ role: "user", text: spoken });
    const parsed = await interpretVisionVoiceCommand(spoken, preferences.language);
    await executeParsedCommand(
      parsed.command,
      parsed.targetLanguage,
      parsed.cleanedQuestion || spoken
    );
  }, [
    appendHistory,
    captureVideoFrameBase64,
    connectionMode,
    executeParsedCommand,
    interruptAiSpeech,
    micStatus,
    preferences.language,
  ]);

  const handleTextCommandSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const msg = textInput.trim();
    if (!msg) return;
    setTextInput("");
    interruptAiSpeech();
    appendHistory({ role: "user", text: msg });
    const parsed = await interpretVisionVoiceCommand(msg, preferences.language);
    await executeParsedCommand(
      parsed.command,
      parsed.targetLanguage,
      parsed.cleanedQuestion || msg
    );
  };

  const handleLanguageChange = async (lang: LanguageCode) => {
    onSelectLanguage(lang);
    playAccessibleAudioCue("language");
    const langStrings = VISION_STRINGS[lang];
    const support = await inspectLanguageSpeechSupport(lang);
    setVoiceSupport(support);

    if (liveSessionRef.current && assistantActive) {
      liveSessionRef.current.dispose();
      liveSessionRef.current = null;
      setConnectionMode("turn-based");
    }

    appendHistory({ role: "assistant", text: langStrings.welcomeSpoken });
    await speakResponse(langStrings.welcomeSpoken, lang);
  };

  // Accessible keyboard shortcuts on this screen: Alt+S, Alt+M, Alt+C, Alt+X
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (!e.altKey) return;
      const k = e.key.toLowerCase();
      if (k === "s") {
        e.preventDefault();
        if (assistantActive) stopAssistant();
        else startAssistant();
      } else if (k === "m") {
        e.preventDefault();
        handleVoiceSpeakOrInterrupt();
      } else if (k === "c") {
        e.preventDefault();
        analyzeSceneWithVision("front");
      } else if (k === "x") {
        e.preventDefault();
        interruptAiSpeech();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [
    analyzeSceneWithVision,
    assistantActive,
    handleVoiceSpeakOrInterrupt,
    interruptAiSpeech,
    startAssistant,
    stopAssistant,
  ]);

  const displayedLanguages = useMemo(() => {
    if (showAllLanguages) return LANGUAGES;
    return LANGUAGES.filter((l) => PRIMARY_VISION_LANGUAGES.includes(l.code));
  }, [showAllLanguages]);

  return (
    <div dir={isRtl ? "rtl" : "ltr"} className="space-y-6 max-w-6xl mx-auto">
      {/* Header & Giant Accessible Primary Action */}
      <section className="surface-card rounded-lg border-2 border-[#1F2328] dark:border-[#E6EDF3] bg-white dark:bg-[#161B22] p-6 space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-2 max-w-3xl">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1F2328] dark:text-white flex items-center gap-3">
              <Eye className="w-7 h-7 text-[#0969DA] dark:text-[#58A6FF] shrink-0" aria-hidden="true" />
              <span>{s.title}</span>
            </h1>
            <p className="text-base text-[#1F2328] dark:text-[#E6EDF3] leading-relaxed">
              {s.subtitle}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {!assistantActive ? (
              <button
                type="button"
                onClick={startAssistant}
                disabled={starting}
                aria-label={s.startBtn}
                className="min-h-[64px] px-7 py-4 text-lg font-bold rounded-lg bg-[#0969DA] hover:bg-[#0550AE] text-white dark:bg-[#238636] dark:hover:bg-[#2EA043] focus-visible:outline-4 flex items-center gap-3"
              >
                <Play className="w-6 h-6 shrink-0" aria-hidden="true" />
                <span>{starting ? "Starting..." : s.startBtn}</span>
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={stopAssistant}
                  aria-label={s.stopAssistantBtn}
                  className="min-h-[56px] px-5 py-3 text-base font-bold rounded-lg border-2 border-[#CF222E] bg-[#CF222E] text-white hover:opacity-90 flex items-center gap-2"
                >
                  <Square className="w-5 h-5" aria-hidden="true" />
                  <span>{s.stopAssistantBtn}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    stopAssistant();
                    window.setTimeout(() => startAssistant(), 150);
                  }}
                  aria-label={s.restartBtn}
                  className="min-h-[56px] px-5 py-3 text-base font-bold rounded-lg border-2 border-[#D0D7DE] dark:border-[#30363D] bg-[#F6F8FA] dark:bg-[#21262D] flex items-center gap-2"
                >
                  <RotateCcw className="w-5 h-5" aria-hidden="true" />
                  <span>{s.restartBtn}</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* High-Visibility Live Status Bar (Explicit Icon + Text, Never Color Only) */}
        <div
          aria-live="polite"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-4 border-t border-[#D0D7DE] dark:border-[#30363D]"
        >
          <div className="p-3 rounded-md border border-[#D0D7DE] dark:border-[#30363D] bg-[#F6F8FA] dark:bg-[#0D1117] flex items-center gap-2.5 text-sm font-semibold">
            <Radio
              className={`w-5 h-5 shrink-0 ${
                connectionMode === "live-ws"
                  ? "text-[#1A7F37] dark:text-[#3FB950]"
                  : "text-[#0969DA] dark:text-[#58A6FF]"
              }`}
              aria-hidden="true"
            />
            <div>
              <div className="text-xs font-normal text-[#656D76] dark:text-[#8B949E]">
                Engine Mode
              </div>
              <div>
                {connectionMode === "live-ws"
                  ? "Gemini Live (Streaming)"
                  : connectionMode === "turn-based"
                  ? "Gemini Vision & Voice"
                  : "Standby"}
              </div>
            </div>
          </div>

          <div className="p-3 rounded-md border border-[#D0D7DE] dark:border-[#30363D] bg-[#F6F8FA] dark:bg-[#0D1117] flex items-center gap-2.5 text-sm font-semibold">
            {micStatus === "listening" ? (
              <Mic className="w-5 h-5 shrink-0 text-[#1A7F37] dark:text-[#3FB950]" aria-hidden="true" />
            ) : micStatus === "denied" ? (
              <MicOff className="w-5 h-5 shrink-0 text-[#CF222E] dark:text-[#F85149]" aria-hidden="true" />
            ) : (
              <Mic className="w-5 h-5 shrink-0 text-[#656D76]" aria-hidden="true" />
            )}
            <div>
              <div className="text-xs font-normal text-[#656D76] dark:text-[#8B949E]">
                {s.micStatusLabel}
              </div>
              <div>
                {micStatus === "listening"
                  ? s.listeningLabel
                  : micStatus === "transcribing"
                  ? "Transcribing..."
                  : micStatus === "ready"
                  ? "Ready"
                  : micStatus === "denied"
                  ? "Permission Denied"
                  : micStatus === "unavailable"
                  ? "Unavailable"
                  : "Off"}
              </div>
            </div>
          </div>

          <div className="p-3 rounded-md border border-[#D0D7DE] dark:border-[#30363D] bg-[#F6F8FA] dark:bg-[#0D1117] flex items-center gap-2.5 text-sm font-semibold">
            {cameraStatus === "active" ? (
              <Camera className="w-5 h-5 shrink-0 text-[#1A7F37] dark:text-[#3FB950]" aria-hidden="true" />
            ) : (
              <CameraOff className="w-5 h-5 shrink-0 text-[#656D76]" aria-hidden="true" />
            )}
            <div>
              <div className="text-xs font-normal text-[#656D76] dark:text-[#8B949E]">
                {s.cameraStatusLabel}
              </div>
              <div>
                {cameraStatus === "active"
                  ? "Rear Camera Active"
                  : cameraStatus === "requesting"
                  ? "Requesting Permission..."
                  : cameraStatus === "denied"
                  ? "Permission Denied"
                  : cameraStatus === "unavailable"
                  ? "No Camera Found"
                  : "Off"}
              </div>
            </div>
          </div>

          <div className="p-3 rounded-md border border-[#D0D7DE] dark:border-[#30363D] bg-[#F6F8FA] dark:bg-[#0D1117] flex items-center gap-2.5 text-sm font-semibold">
            {aiSpeaking ? (
              <Volume2 className="w-5 h-5 shrink-0 text-[#0969DA] dark:text-[#58A6FF]" aria-hidden="true" />
            ) : (
              <VolumeX className="w-5 h-5 shrink-0 text-[#656D76]" aria-hidden="true" />
            )}
            <div>
              <div className="text-xs font-normal text-[#656D76] dark:text-[#8B949E]">
                {s.aiSpeakingLabel}
              </div>
              <div className="tabular-nums">
                {aiSpeaking
                  ? `Speaking (${speechRate.toFixed(2)}x)`
                  : analyzingImage
                  ? "Analyzing Scene..."
                  : `Idle (${speechRate.toFixed(2)}x)`}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Hazard Warning & Error Banners */}
      {hazardAlert && (
        <div
          role="alert"
          aria-live="assertive"
          className="rounded-lg border-2 border-[#CF222E] bg-[#CF222E]/10 px-5 py-4 flex items-start gap-3 text-base font-bold text-[#9A1B24] dark:text-[#FF7B72]"
        >
          <AlertTriangle className="w-6 h-6 shrink-0 mt-0.5" aria-hidden="true" />
          <div>
            <div>Hazard Notice (Camera Observation Only): {hazardAlert}</div>
            <div className="text-sm font-normal mt-1">
              Use your white cane or guide dog to verify your path safely.
            </div>
          </div>
        </div>
      )}

      {(permissionError || networkError) && (
        <div
          role="alert"
          className="rounded-lg border-2 border-[#9A6700] bg-[#9A6700]/10 px-5 py-4 text-sm font-medium text-[#1F2328] dark:text-[#E6EDF3] space-y-1"
        >
          {permissionError && <p>{permissionError}</p>}
          {networkError && <p>{networkError}</p>}
        </div>
      )}

      {/* Primary Large Controls: Microphone, Camera Capture, Repeat, Stop, Speed */}
      <section
        aria-label="Primary microphone, camera, and playback controls"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3"
      >
        <button
          type="button"
          onClick={handleVoiceSpeakOrInterrupt}
          className={`min-h-[64px] px-5 py-4 rounded-lg text-base font-bold border-2 flex items-center justify-center gap-3 ${
            micStatus === "listening"
              ? "bg-[#1A7F37] border-[#1A7F37] text-white"
              : "bg-[#1F2328] border-[#1F2328] text-white dark:bg-[#F0F6FC] dark:text-[#0D1117] dark:border-[#F0F6FC]"
          }`}
        >
          {micStatus === "listening" ? (
            <>
              <MicOff className="w-6 h-6 shrink-0" aria-hidden="true" />
              <span>{s.doneTalkingBtn}</span>
            </>
          ) : (
            <>
              <Mic className="w-6 h-6 shrink-0" aria-hidden="true" />
              <span>{s.talkInterruptBtn}</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={() => analyzeSceneWithVision("front")}
          disabled={analyzingImage}
          className="min-h-[64px] px-5 py-4 rounded-lg text-base font-bold border-2 border-[#0969DA] bg-[#0969DA] text-white hover:bg-[#0550AE] disabled:opacity-60 flex items-center justify-center gap-3"
        >
          <Camera className="w-6 h-6 shrink-0" aria-hidden="true" />
          <span>{analyzingImage ? "Analyzing..." : s.captureDescribeBtn}</span>
        </button>

        <button
          type="button"
          onClick={() => speakResponse(lastAssistantTextRef.current)}
          className="min-h-[64px] px-5 py-4 rounded-lg text-base font-bold border-2 border-[#D0D7DE] dark:border-[#30363D] bg-white dark:bg-[#161B22] hover:border-[#0969DA] flex items-center justify-center gap-3"
        >
          <Volume2 className="w-6 h-6 shrink-0" aria-hidden="true" />
          <span>{s.repeatBtn}</span>
        </button>

        <button
          type="button"
          onClick={interruptAiSpeech}
          className="min-h-[64px] px-5 py-4 rounded-lg text-base font-bold border-2 border-[#CF222E] bg-white dark:bg-[#161B22] text-[#CF222E] dark:text-[#F85149] hover:bg-[#CF222E]/10 flex items-center justify-center gap-3"
        >
          <Square className="w-5 h-5 shrink-0" aria-hidden="true" />
          <span>{s.stopSpeakingBtn}</span>
        </button>
      </section>

      {/* Main Split: Camera & Scene Controls + Conversation History */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Rear Camera Preview, Continuous Mode & Quick Voice Commands */}
        <div className="lg:col-span-5 space-y-5">
          <section className="surface-card rounded-lg border border-[#D0D7DE] dark:border-[#30363D] bg-white dark:bg-[#161B22] p-5 space-y-4">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-lg font-bold">{s.cameraPreviewHeading}</h2>
              <button
                type="button"
                onClick={() => {
                  const nextRate = speechRate < 0.88 ? 0.96 : 0.78;
                  onUpdateSpeechRate(nextRate);
                  liveSessionRef.current?.setPlaybackRate(nextRate);
                  speakResponse(
                    nextRate < 0.88 ? s.slowerBtn : s.normalSpeedBtn,
                    preferences.language,
                    nextRate
                  );
                }}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-md border border-[#D0D7DE] dark:border-[#30363D] bg-[#F6F8FA] dark:bg-[#21262D]"
              >
                <Gauge className="w-4 h-4" aria-hidden="true" />
                <span>{speechRate < 0.88 ? s.normalSpeedBtn : s.slowerBtn}</span>
              </button>
            </div>

            <div className="relative aspect-[4/3] w-full rounded-md overflow-hidden border-2 border-[#D0D7DE] dark:border-[#30363D] bg-[#0D1117] flex items-center justify-center">
              <video
                ref={videoRef}
                playsInline
                muted
                aria-label="Live rear camera preview"
                className={`w-full h-full object-cover ${
                  cameraStatus === "active" ? "block" : "hidden"
                }`}
              />
              {cameraStatus !== "active" && (
                <div className="text-center p-6 text-white space-y-2">
                  <CameraOff className="w-10 h-10 mx-auto opacity-80" aria-hidden="true" />
                  <p className="text-sm font-medium">
                    Camera preview activates when you press Start Assistant.
                  </p>
                </div>
              )}
              <canvas ref={canvasRef} className="hidden" aria-hidden="true" />
            </div>

            {/* Continuous Camera Mode + Adjustable Sampling Interval */}
            <div className="space-y-3 pt-2 border-t border-[#D0D7DE] dark:border-[#30363D]">
              <button
                type="button"
                aria-pressed={continuousMode}
                onClick={() => setContinuousMode((c) => !c)}
                className={`w-full min-h-[48px] px-4 py-3 rounded-md text-sm font-bold border-2 transition-colors ${
                  continuousMode
                    ? "bg-[#1A7F37] border-[#1A7F37] text-white"
                    : "bg-[#F6F8FA] dark:bg-[#21262D] border-[#D0D7DE] dark:border-[#30363D]"
                }`}
              >
                {continuousMode ? s.continuousOn : s.continuousOff}
              </button>

              <div className="flex items-center justify-between gap-3 text-sm">
                <label htmlFor="vision-sampling-select" className="font-semibold">
                  {s.samplingLabel}
                </label>
                <select
                  id="vision-sampling-select"
                  value={samplingSeconds}
                  onChange={(e) => setSamplingSeconds(Number(e.target.value))}
                  className="px-3 py-2 rounded-md border border-[#D0D7DE] dark:border-[#30363D] bg-[#F6F8FA] dark:bg-[#0D1117] font-mono tabular-nums"
                >
                  <option value={3}>Every 3 seconds</option>
                  <option value={5}>Every 5 seconds</option>
                  <option value={8}>Every 8 seconds</option>
                  <option value={12}>Every 12 seconds</option>
                </select>
              </div>
            </div>
          </section>

          {/* One-Tap & Voice Command Shortcuts */}
          <section className="surface-card rounded-lg border border-[#D0D7DE] dark:border-[#30363D] bg-white dark:bg-[#161B22] p-5 space-y-3">
            <h2 className="text-lg font-bold">{s.quickCommandsHeading}</h2>
            <div className="grid grid-cols-1 gap-2.5">
              {(
                [
                  ["front", s.commands.describe_front],
                  ["read_text", s.commands.read_text],
                  ["room", s.commands.describe_room],
                  ["find_door", s.commands.find_door],
                  ["color", s.commands.what_color],
                ] as const
              ).map(([mode, label]) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => analyzeSceneWithVision(mode)}
                  disabled={analyzingImage}
                  className="w-full min-h-[48px] px-4 py-3 text-left text-base font-semibold rounded-md border-2 border-[#D0D7DE] dark:border-[#30363D] bg-[#F6F8FA] dark:bg-[#0D1117] hover:border-[#0969DA] disabled:opacity-60"
                >
                  {label}
                </button>
              ))}
            </div>
          </section>
        </div>

        {/* Right: Language Selector + Capability Check + Conversation History */}
        <div className="lg:col-span-7 space-y-5">
          {/* Language Selection with Honest Voice & Recognition Capability Reporting */}
          <section
            ref={languageSectionRef}
            tabIndex={-1}
            className="surface-card rounded-lg border border-[#D0D7DE] dark:border-[#30363D] bg-white dark:bg-[#161B22] p-5 space-y-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Globe className="w-5 h-5 text-[#0969DA] dark:text-[#58A6FF]" aria-hidden="true" />
                <span>{s.languageHeading}</span>
              </h2>
              <button
                type="button"
                onClick={() => setShowAllLanguages((v) => !v)}
                className="text-xs font-semibold text-[#0969DA] dark:text-[#58A6FF] underline"
              >
                {showAllLanguages ? "Show 6 Core Vision Languages" : "Show All 8 Platform Languages"}
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {displayedLanguages.map((lang) => {
                const active = preferences.language === lang.code;
                return (
                  <button
                    key={lang.code}
                    type="button"
                    aria-pressed={active}
                    onClick={() => handleLanguageChange(lang.code)}
                    className={`min-h-[54px] p-3 rounded-md border-2 text-left transition-colors ${
                      active
                        ? "border-[#0969DA] bg-[#0969DA]/10 font-bold"
                        : "border-[#D0D7DE] dark:border-[#30363D] bg-[#F6F8FA] dark:bg-[#0D1117] hover:border-[#0969DA]"
                    }`}
                  >
                    <div className="text-base">{lang.nativeName}</div>
                    <div className="text-xs text-[#656D76] dark:text-[#8B949E]">
                      {lang.englishName}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Honest Voice & Speech Recognition Availability Report (Never Silently Switches Language) */}
            <div className="rounded-md border border-[#D0D7DE] dark:border-[#30363D] bg-[#F6F8FA] dark:bg-[#0D1117] p-3.5 text-sm space-y-1.5">
              <div className="font-semibold">
                Speech Output:{" "}
                <span className="font-mono text-xs">
                  {voiceSupport.synthesisStatus === "cloud-and-device"
                    ? "Cloud AI Voice + Device Voice Available"
                    : voiceSupport.synthesisStatus === "cloud-only"
                    ? "Cloud AI Voice Available (Gemini / Addis AI)"
                    : voiceSupport.synthesisStatus === "device-only"
                    ? `Device Browser Voice (${voiceSupport.browserVoicesFound[0] || preferences.language})`
                    : "Unavailable on this device — Text fallback active"}
                </span>
              </div>
              <div className="font-semibold">
                Voice Recognition:{" "}
                <span className="font-mono text-xs">
                  {voiceSupport.recognitionStatus === "cloud-and-browser"
                    ? "Gemini Speech Transcription + Browser Speech"
                    : voiceSupport.recognitionStatus === "cloud-only"
                    ? "Gemini Speech Transcription (gemini-3.5-transcribe)"
                    : voiceSupport.recognitionStatus === "browser-only"
                    ? "Browser Speech Recognition Only"
                    : "Unavailable — Use Quick Buttons or Text Input"}
                </span>
              </div>
              {(voiceSupport.limitationNotice || lastSpokenNotice) && (
                <p className="text-xs text-[#9A6700] dark:text-[#D29922] pt-1">
                  {lastSpokenNotice || voiceSupport.limitationNotice}{" "}
                  {voiceSupport.fallbackNotice}
                </p>
              )}
            </div>
          </section>

          {/* Accessible Conversation & Scene Description History */}
          <section className="surface-card rounded-lg border border-[#D0D7DE] dark:border-[#30363D] bg-white dark:bg-[#161B22] p-5 space-y-4">
            <h2 className="text-lg font-bold">{s.historyHeading}</h2>

            <div
              aria-live="polite"
              aria-relevant="additions"
              className="space-y-3 max-h-[420px] overflow-y-auto pr-1"
            >
              {history.map((item) => (
                <article
                  key={item.id}
                  className={`p-4 rounded-md border-2 text-base leading-relaxed space-y-2 ${
                    item.role === "user"
                      ? "border-[#0969DA]/40 bg-[#0969DA]/5"
                      : item.role === "system"
                      ? "border-[#9A6700]/50 bg-[#9A6700]/10"
                      : "border-[#D0D7DE] dark:border-[#30363D] bg-[#F6F8FA] dark:bg-[#0D1117]"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 text-xs text-[#656D76] dark:text-[#8B949E]">
                    <span className="font-bold text-[#1F2328] dark:text-[#E6EDF3]">
                      {item.role === "user"
                        ? "You"
                        : item.role === "system"
                        ? "System Notice"
                        : "Visual Assistant"}
                      {" · "}
                      <span className="tabular-nums">{item.timestamp}</span>
                    </span>
                    {item.role === "assistant" && (
                      <button
                        type="button"
                        onClick={() => speakResponse(item.text)}
                        aria-label={`Repeat message: ${item.text.slice(0, 40)}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-[#D0D7DE] dark:border-[#30363D] bg-white dark:bg-[#161B22] text-[#0969DA] dark:text-[#58A6FF] font-semibold"
                      >
                        <Volume2 className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>Repeat</span>
                      </button>
                    )}
                  </div>
                  <p className="whitespace-pre-wrap">{item.text}</p>
                  {item.ocrText && (
                    <div className="p-2.5 rounded border border-[#D0D7DE] dark:border-[#30363D] bg-white dark:bg-[#161B22] text-sm font-mono">
                      OCR Text: {item.ocrText}
                    </div>
                  )}
                  {(item.colors?.length || item.features?.length) ? (
                    <div className="text-xs text-[#656D76] dark:text-[#8B949E]">
                      {[
                        item.features?.length ? `Features: ${item.features.join(", ")}` : "",
                        item.colors?.length ? `Colors: ${item.colors.join(", ")}` : "",
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </div>
                  ) : null}
                </article>
              ))}
            </div>

            <form onSubmit={handleTextCommandSubmit} className="flex gap-2 pt-2 border-t border-[#D0D7DE] dark:border-[#30363D]">
              <label htmlFor="vision-question-input" className="sr-only">
                {s.askPlaceholder}
              </label>
              <input
                id="vision-question-input"
                type="text"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder={s.askPlaceholder}
                className="flex-1 min-h-[48px] px-4 py-2.5 text-base rounded-md border-2 border-[#D0D7DE] dark:border-[#30363D] bg-[#F6F8FA] dark:bg-[#0D1117]"
              />
              <button
                type="submit"
                disabled={analyzingImage}
                className="min-h-[48px] px-5 py-2.5 text-base font-bold rounded-md bg-[#0969DA] hover:bg-[#0550AE] text-white disabled:opacity-60 flex items-center gap-2 shrink-0"
              >
                <Send className="w-4 h-4" aria-hidden="true" />
                <span>{s.sendBtn}</span>
              </button>
            </form>
          </section>
        </div>
      </div>

      {/* Mandatory Safety, Privacy & Emergency / Help Instructions */}
      <section
        aria-label="Safety, privacy, and emergency instructions"
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        <div className="surface-card rounded-lg border border-[#D0D7DE] dark:border-[#30363D] bg-white dark:bg-[#161B22] p-5 space-y-2.5">
          <h2 className="text-base font-bold flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-[#CF222E] dark:text-[#F85149] shrink-0" aria-hidden="true" />
            <span>{s.safetyHeading}</span>
          </h2>
          <ul className="space-y-1.5 text-sm text-[#656D76] dark:text-[#8B949E] list-disc pl-5">
            {s.safetyPoints.map((pt) => (
              <li key={pt}>{pt}</li>
            ))}
          </ul>
        </div>

        <div className="surface-card rounded-lg border border-[#D0D7DE] dark:border-[#30363D] bg-white dark:bg-[#161B22] p-5 space-y-2.5">
          <h2 className="text-base font-bold flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-[#0969DA] dark:text-[#58A6FF] shrink-0" aria-hidden="true" />
            <span>{s.privacyHeading}</span>
          </h2>
          <p className="text-sm text-[#656D76] dark:text-[#8B949E] leading-relaxed">
            {s.privacyBody}
          </p>
        </div>

        <div className="surface-card rounded-lg border border-[#D0D7DE] dark:border-[#30363D] bg-white dark:bg-[#161B22] p-5 space-y-2.5">
          <h2 className="text-base font-bold flex items-center gap-2">
            <LifeBuoy className="w-5 h-5 text-[#1A7F37] dark:text-[#3FB950] shrink-0" aria-hidden="true" />
            <span>{s.emergencyHeading}</span>
          </h2>
          <p className="text-sm text-[#656D76] dark:text-[#8B949E] leading-relaxed">
            {s.emergencyBody}
          </p>
        </div>
      </section>
    </div>
  );
};
