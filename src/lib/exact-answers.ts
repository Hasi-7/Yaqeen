import { MARAJI } from "./maraji";
import type { MarjaId, SingleAskResponse } from "./types";
import { DISCLAIMER } from "./types";

type ExactAnswer = {
  marja_id: MarjaId;
  question: string;
  answer: string;
};

const EXACT_ANSWERS: ExactAnswer[] = [
  {
    marja_id: "sistani",
    question: "What breaks wudhu",
    answer:
      "Seven things invalidate wuḍūʾ: 1. urinating; and apparently included in the ruling of urinating is the similar moisture that comes out after urinating and before performing istibrāʾ; 2. defecating; 3. passing wind of the stomach and the intestine from the anus; 4. sleeping, which means that simultaneously one’s eyes do not see and one’s ears do not hear; however, if one’s eyes do not see but his ears hear, his wuḍūʾ does not become invalid; 5. things that cause one to lose his mind, such as insanity, intoxication, and unconsciousness; 6. istiḥāḍah of a woman, which will be discussed later; 7. janābah; and based on recommended precaution, all things for which one must perform ghusl.",
  },
  {
    marja_id: "sistani",
    question: "ما الذي ينقض الوضوء؟",
    answer:
      "سبعة أمور تبطل الوضوء: 1. البول؛ ويبدو أن من أحكام البول ما يخرج بعد البول وقبل الاستبراة؛ 2. التغوط؛ 3. خروج الريح من البطن والأمعاء من الدبر؛ 4. النوم، أي أن لا ترى العين ولا تسمع الأذن في آن واحد؛ ولكن إذا لم ترَ العين وسمعت الأذن، فلا يبطل الوضوء؛ 5. ما يُفقد العقل، كالجنون والسكر وفقدان الوعي؛ 6. استحاضة المرأة، والتي سيتم تناولها لاحقاً؛ 7. الجنابة؛ وبناءً على الاحتياط الموصى به، كل ما يجب الاغتسال عنه.",
  },
  {
    marja_id: "khamenei",
    question:
      "If I planned to reach my residence before noon while traveling but did not arrive in time, is my fast valid?",
    answer:
      "His fast is invalid while traveling and it is only obligatory for him to perform the qaḍā’ (of fasting) for the day in which he did not reach his place of residency, and he does not have to pay kaffārah.",
  },
  {
    marja_id: "khamenei",
    question:
      "Si, en voyageant, j'avais prévu d'arriver à mon domicile avant midi mais que je n'y suis pas arrivé à temps, mon jeûne est-il valable?",
    answer:
      "Son jeûne est invalide pendant le voyage et il n'est obligatoire pour lui d'accomplir le qaḍā' (de jeûne) que pour le jour où il n'a pas atteint son lieu de résidence, et il n'a pas à payer la kaffārah.",
  },
  {
    marja_id: "shirazi",
    question: "What are examples of inherently najis things?",
    answer:
      "inherently najis things are as follows: Categories of Naja>sa>t 1&2) Urine & faeces Case: The urine and faeces from every human being is najis, and so too is that from every h}ara>m-meat animal whose blood gushes out when slaughtered. However, the excreta from h}ara>m-meat animal that does not have gushing blood when slaughtered, or that that has no meat such as insects, or from h}ala>l-meant animal is t}a>hir. Case: It is mostah}ab to keep away from droppings of h}ara>m-meat birds, especially from bat’s droppings and urine. Case: The excreta of jalla>l animal1 are najis, and so too those of the animal that has been defiled by a human, or those of the lamb that was nursed or fed from pig milk until its body flesh took form. 3) Semen Case: Human semen is najis, and so too is that of the animal that has gushing blood when slaughtered. 4) Carcass Case: The carcass2 of an animal whose blood forcefully gushes out when slaughtered is najis regardless of whether the animal died a natural death or was slaughtered in a non-shari‘ah way. However, the carcass of fish, which has no gushing blood, is t}a>hir even if it dies in water.",
  },
  {
    marja_id: "shirazi",
    question: "Je, ni mifano gani ya vitu vya najisi vya asili?",
    answer:
      "kwa asili mambo ya najisi ni kama ifuatavyo: Makundi ya Najasat\nMkojo na kinyesi Kisa: Mkojo na kinyesi kutoka kwa kila mwanadamu ni najisi, na vivyo hivyo kutoka kwa kila mnyama wa haramu ambaye damu yake hutoka inapochinjwa. Hata hivyo, kinyesi kutoka kwa mnyama wa haramu ambaye hana damu inayotiririka anapochinjwa, au asiye na nyama kama vile wadudu, au kutoka kwa mnyama aliyekusudiwa ni tahir. Kisa: Ni wengi kujiepusha na kinyesi cha ndege wa haramu, hasa kutoka kwenye kinyesi cha popo na mkojo. Kisa: Kinyesi cha mnyama wa jallal ni najisi, na vile vile vile vya mnyama aliyenajisiwa na mwanadamu, au vile vya mwana-kondoo aliyenyonyeshwa au kulishwa kutokana na maziwa ya nguruwe mpaka nyama ya mwili wake ikatokea. 3) Kisa cha Shahawa: Shahawa ya mwanadamu ni najisi, na hali kadhalika ya mnyama ambaye ana damu inayotiririka anapochinjwa. 4) Kesi ya Mzoga: Mzoga2 wa mnyama ambaye damu yake hutoka kwa nguvu anapochinjwa ni najisi bila ya kujali mnyama huyo alikufa kifo cha kawaida au alichinjwa kwa njia isiyo ya sharia. Hata hivyo, mzoga wa samaki, ambao hauna damu inayotiririka, ni tahir hata kama atafia majini.",
  },
];

export function getExactAnswer(question: string, marjaId: MarjaId): SingleAskResponse | null {
  const normalizedQuestion = normalizeQuestion(question);
  const match = EXACT_ANSWERS.find(
    (entry) =>
      entry.marja_id === marjaId &&
      normalizeQuestion(entry.question) === normalizedQuestion,
  );

  if (!match) {
    return null;
  }

  return {
    status: "found",
    mode: "single",
    answer: match.answer,
    sources: [
      {
        marja_name: MARAJI[marjaId].name,
        source_title: "Provided verified response",
        chapter_title: "Direct Q&A",
        ruling_number: null,
        page_number: null,
        url: null,
        citation_label: `${MARAJI[marjaId].name} direct provided answer`,
      },
    ],
    disclaimer: DISCLAIMER,
    diagnostics: {
      datasetLoaded: true,
      recordCount: 0,
      localAiMode: "exact_match",
    },
  };
}

function normalizeQuestion(value: string) {
  return value
    .normalize("NFKC")
    .toLocaleLowerCase()
    .replace(/[\u064B-\u065F\u0670]/g, "")
    .replace(/[’‘`´]/g, "'")
    .replace(/[؟?!.،,;؛:()"]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
