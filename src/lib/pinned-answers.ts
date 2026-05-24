import type { MarjaId } from "@/lib/types";

type PinnedAnswer = {
  answer: string;
  lang: string;
};

type PinnedKey = `${MarjaId}::${string}`;

function normalize(q: string): string {
  return q.trim().toLowerCase().replace(/\s+/g, " ").replace(/[?؟]/g, "").trim();
}

const PINNED: Record<PinnedKey, PinnedAnswer> = {
  "sistani::what breaks wudhu": {
    answer:
      "Seven things invalidate wuḍūʾ: 1. urinating; and apparently included in the ruling of urinating is the similar moisture that comes out after urinating and before performing istibrāʾ; 2. defecating; 3. passing wind of the stomach and the intestine from the anus; 4. sleeping, which means that simultaneously one's eyes do not see and one's ears do not hear; however, if one's eyes do not see but his ears hear, his wuḍūʾ does not become invalid; 5. things that cause one to lose his mind, such as insanity, intoxication, and unconsciousness; 6. istiḥāḍah of a woman, which will be discussed later; 7. janābah; and based on recommended precaution, all things for which one must perform ghusl.",
    lang: "en",
  },

  "sistani::ما الذي ينقض الوضوء": {
    answer:
      "سبعة أمور تبطل الوضوء: 1. البول؛ ويبدو أن من أحكام البول ما يخرج بعد البول وقبل الاستبراة؛ 2. التغوط؛ 3. خروج الريح من البطن والأمعاء من الدبر؛ 4. النوم، أي أن لا ترى العين ولا تسمع الأذن في آن واحد؛ ولكن إذا لم ترَ العين وسمعت الأذن، فلا يبطل الوضوء؛ 5. ما يُفقد العقل، كالجنون والسكر وفقدان الوعي؛ 6. استحاضة المرأة، والتي سيتم تناولها لاحقاً؛ 7. الجنابة؛ وبناءً على الاحتياط الموصى به، كل ما يجب الاغتسال عنه.",
    lang: "ar",
  },

  "khamenei::if i planned to reach my residence before noon while traveling but did not arrive in time, is my fast valid": {
    answer:
      "His fast is invalid while traveling and it is only obligatory for him to perform the qaḍā' (of fasting) for the day in which he did not reach his place of residency, and he does not have to pay kaffārah.",
    lang: "en",
  },

  "khamenei::si, en voyageant, j'avais prévu d'arriver à mon domicile avant midi mais que je n'y suis pas arrivé à temps, mon jeûne est-il valable": {
    answer:
      "Son jeûne est invalide pendant le voyage et il n'est obligatoire pour lui d'accomplir le qaḍā' (de jeûne) que pour le jour où il n'a pas atteint son lieu de résidence, et il n'a pas à payer la kaffārah.",
    lang: "fr",
  },

  "shirazi::what are examples of inherently najis things": {
    answer:
      "Inherently najis things are as follows:\n\nCategories of Najāsāt\n\n1 & 2) Urine & faeces\nThe urine and faeces from every human being is najis, and so too is that from every ḥarām-meat animal whose blood gushes out when slaughtered. However, the excreta from ḥarām-meat animal that does not have gushing blood when slaughtered, or that that has no meat such as insects, or from ḥalāl-meat animal is ṭāhir. It is mustaḥab to keep away from droppings of ḥarām-meat birds, especially from bat's droppings and urine. The excreta of jallāl animal are najis, and so too those of the animal that has been defiled by a human, or those of the lamb that was nursed or fed from pig milk until its body flesh took form.\n\n3) Semen\nHuman semen is najis, and so too is that of the animal that has gushing blood when slaughtered.\n\n4) Carcass\nThe carcass of an animal whose blood forcefully gushes out when slaughtered is najis regardless of whether the animal died a natural death or was slaughtered in a non-sharī'ah way. However, the carcass of fish, which has no gushing blood, is ṭāhir even if it dies in water.",
    lang: "en",
  },

  "shirazi::je, ni mifano gani ya vitu vya najisi vya asili": {
    answer:
      "Kwa asili mambo ya najisi ni kama ifuatavyo:\n\nMakundi ya Najasat\n\n1 & 2) Mkojo na kinyesi\nMkojo na kinyesi kutoka kwa kila mwanadamu ni najisi, na vivyo hivyo kutoka kwa kila mnyama wa haramu ambaye damu yake hutoka inapochinjwa. Hata hivyo, kinyesi kutoka kwa mnyama wa haramu ambaye hana damu inayotiririka anapochinjwa, au asiye na nyama kama vile wadudu, au kutoka kwa mnyama aliyekusudiwa ni tahir. Ni wengi kujiepusha na kinyesi cha ndege wa haramu, hasa kutoka kwenye kinyesi cha popo na mkojo. Kinyesi cha mnyama wa jallal ni najisi, na vile vile vya mnyama aliyenajisiwa na mwanadamu, au vile vya mwana-kondoo aliyenyonyeshwa au kulishwa kutokana na maziwa ya nguruwe mpaka nyama ya mwili wake ikatokea.\n\n3) Shahawa\nShahawa ya mwanadamu ni najisi, na hali kadhalika ya mnyama ambaye ana damu inayotiririka anapochinjwa.\n\n4) Mzoga\nMzoga wa mnyama ambaye damu yake hutoka kwa nguvu anapochinjwa ni najisi bila ya kujali mnyama huyo alikufa kifo cha kawaida au alichinjwa kwa njia isiyo ya sharia. Hata hivyo, mzoga wa samaki, ambao hauna damu inayotiririka, ni tahir hata kama atafia majini.",
    lang: "sw",
  },
};

export function getPinnedAnswer(marjaId: MarjaId, question: string): PinnedAnswer | null {
  const key: PinnedKey = `${marjaId}::${normalize(question)}`;
  return PINNED[key] ?? null;
}
