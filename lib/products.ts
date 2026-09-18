import type { Product } from "@/types/catalog";

const PLACEHOLDER_IMAGE = "/products/placeholder.svg";

/**
 * Static catalog data. No price field exists anywhere on this entity per
 * constitution Principle V — customers request a quote instead.
 */
export const products: Product[] = [
  {
    id: "tb-500",
    name: "TB-500",
    image: PLACEHOLDER_IMAGE,
    purity: "≥ 99%",
    coaUrl: null,
    vials: [{ id: "10mg", label: "10 mg" }],
    active: true,
    translations: {
      en: {
        tagline: "Recovery & tissue research",
        description:
          "TB-500 has attracted research interest in areas related to recovery, tissue movement, and processes associated with tissue repair.",
        researchAreas: [
          "Recovery following physical stress",
          "Tissue repair and regeneration processes",
          "Muscle tissue and movement",
          "Flexibility and return-to-activity research",
        ],
      },
      ar: {
        tagline: "التعافي وتجدد الأنسجة",
        description:
          "يحظى TB-500 باهتمام بحثي في الدراسات المتعلقة بالتعافي، حركة الأنسجة والعمليات المرتبطة بإصلاحها.",
        researchAreas: [
          "التعافي بعد الإجهاد البدني",
          "عمليات إصلاح وتجدد الأنسجة",
          "الأنسجة العضلية والحركة",
          "المرونة والعودة إلى النشاط",
        ],
      },
    },
  },
  {
    id: "ipamorelin",
    name: "Ipamorelin",
    image: PLACEHOLDER_IMAGE,
    purity: null,
    coaUrl: null,
    vials: [{ id: "10mg", label: "10 mg" }],
    active: true,
    translations: {
      en: {
        tagline: "Growth hormone & recovery research",
        description:
          "Ipamorelin is studied within research related to growth hormone secretion, recovery and sleep, as well as areas related to body composition and performance.",
        researchAreas: [
          "Growth hormone secretion pathways",
          "Sleep and recovery research",
          "Body composition and lean mass",
          "Appetite and metabolic pathway research",
        ],
      },
      ar: {
        tagline: "أبحاث هرمون النمو والتعافي",
        description:
          "يُدرس Ipamorelin ضمن أبحاث مرتبطة بإفراز هرمون النمو، التعافي والنوم، إضافة إلى مجالات مرتبطة بتركيب الجسم والأداء.",
        researchAreas: [
          "مسارات إفراز هرمون النمو",
          "أبحاث النوم والتعافي",
          "تركيب الجسم والكتلة الخالية من الدهون",
          "دراسة مسارات الشهية والتمثيل الغذائي",
        ],
      },
    },
  },
  {
    id: "cjc-1295",
    name: "CJC-1295",
    image: PLACEHOLDER_IMAGE,
    purity: null,
    coaUrl: null,
    vials: [{ id: "10mg", label: "10 mg" }],
    active: true,
    translations: {
      en: {
        tagline: "Growth hormone research",
        description:
          "CJC-1295 has attracted research interest in the study of growth hormone pathways and their relationship to recovery, sleep, and body composition.",
        researchAreas: [
          "Growth hormone secretion",
          "Recovery pathways",
          "Sleep research",
          "Body composition and lean mass",
        ],
      },
      ar: {
        tagline: "أبحاث هرمون النمو",
        description:
          "يحظى CJC-1295 باهتمام بحثي في دراسة مسارات هرمون النمو وعلاقتها بالتعافي والنوم وتركيب الجسم.",
        researchAreas: [
          "إفراز هرمون النمو",
          "مسارات التعافي",
          "أبحاث النوم",
          "تركيب الجسم والكتلة الخالية من الدهون",
        ],
      },
    },
  },
  {
    id: "retatrutide",
    name: "Retatrutide",
    image: PLACEHOLDER_IMAGE,
    purity: null,
    coaUrl: null,
    vials: [{ id: "10mg", label: "10 mg" }],
    active: true,
    translations: {
      en: {
        tagline: "Metabolic & weight research",
        description:
          "Retatrutide is an area of growing research interest involving appetite regulation, body weight, and metabolic pathways.",
        researchAreas: [
          "Appetite regulation",
          "Weight-management research",
          "Metabolic pathways",
          "Glucose regulation and insulin sensitivity",
        ],
      },
      ar: {
        tagline: "أبحاث التمثيل الغذائي والتحكم بالوزن",
        description:
          "يمثل Retatrutide موضوعاً بحثياً يحظى باهتمام في مجالات تنظيم الشهية، الوزن والتمثيل الغذائي.",
        researchAreas: [
          "تنظيم الشهية",
          "أبحاث إدارة الوزن",
          "مسارات التمثيل الغذائي",
          "تنظيم الغلوكوز وحساسية الإنسولين",
        ],
      },
    },
  },
  {
    id: "bpc-157",
    name: "BPC-157",
    image: PLACEHOLDER_IMAGE,
    purity: "≥ 99%",
    coaUrl: null,
    vials: [{ id: "10mg", label: "10 mg" }],
    active: true,
    translations: {
      en: {
        tagline: "Recovery & gastrointestinal research",
        description:
          "BPC-157 has attracted research interest in studies involving tissue repair, gastrointestinal research, and recovery-related pathways.",
        researchAreas: [
          "Tissue repair and regeneration research",
          "Gastrointestinal research",
          "Joints and tendons",
          "Recovery and movement pathways",
        ],
      },
      ar: {
        tagline: "أبحاث التعافي والجهاز الهضمي",
        description:
          "يحظى BPC-157 باهتمام بحثي في الدراسات المتعلقة بالأنسجة والجهاز الهضمي ومسارات التعافي.",
        researchAreas: [
          "أبحاث إصلاح وتجدد الأنسجة",
          "الجهاز الهضمي",
          "المفاصل والأوتار",
          "مسارات التعافي والحركة",
        ],
      },
    },
  },
  {
    id: "ghk-cu",
    name: "GHK-Cu",
    image: PLACEHOLDER_IMAGE,
    purity: null,
    coaUrl: null,
    vials: [{ id: "100mg", label: "100 mg" }],
    active: true,
    translations: {
      en: {
        tagline: "Skin, hair & tissue research",
        description:
          "GHK-Cu is studied across research areas involving collagen, tissue biology, skin, and hair-related pathways.",
        researchAreas: [
          "Collagen research",
          "Skin appearance and tissue structure",
          "Hair and scalp research",
          "Tissue regeneration",
        ],
      },
      ar: {
        tagline: "أبحاث البشرة والشعر وتجدد الأنسجة",
        description:
          "يُدرس GHK-Cu في مجالات بحثية مرتبطة بالكولاجين، الأنسجة، البشرة وصحة الشعر.",
        researchAreas: [
          "أبحاث الكولاجين",
          "مظهر البشرة وبنية الأنسجة",
          "الشعر وفروة الرأس",
          "تجدد الأنسجة",
        ],
      },
    },
  },
  {
    id: "mots-c",
    name: "MOTS-C",
    image: PLACEHOLDER_IMAGE,
    purity: null,
    coaUrl: null,
    vials: [{ id: "10mg", label: "10 mg" }],
    active: true,
    translations: {
      en: {
        tagline: "Energy & metabolic research",
        description:
          "MOTS-C has attracted research interest in areas involving cellular energy and metabolic pathways.",
        researchAreas: [
          "Cellular energy pathways",
          "Metabolic research",
          "Energy utilization",
          "Endurance and metabolic performance research",
        ],
      },
      ar: {
        tagline: "أبحاث الطاقة والتمثيل الغذائي",
        description:
          "MOTS-C هو ببتيد يحظى باهتمام بحثي في مجالات مرتبطة بالطاقة الخلوية والتمثيل الغذائي.",
        researchAreas: [
          "مسارات الطاقة الخلوية",
          "التمثيل الغذائي",
          "استخدام الطاقة",
          "التحمل والأداء الأيضي",
        ],
      },
    },
  },
  {
    id: "kpv",
    name: "KPV",
    image: PLACEHOLDER_IMAGE,
    purity: null,
    coaUrl: null,
    vials: [{ id: "10mg", label: "10 mg" }],
    active: true,
    translations: {
      en: {
        tagline: "Gut & inflammation research",
        description:
          "KPV has attracted research interest in studies involving the gastrointestinal system, gut-related pathways, and inflammatory processes.",
        researchAreas: [
          "Gut health and balance research",
          "Gastrointestinal pathways",
          "Inflammatory pathways",
          "Skin and gastrointestinal research",
        ],
      },
      ar: {
        tagline: "أبحاث الأمعاء والالتهاب",
        description:
          "يحظى KPV باهتمام بحثي في الدراسات المتعلقة بالجهاز الهضمي، الأمعاء والمسارات المرتبطة بالالتهاب.",
        researchAreas: [
          "أبحاث صحة وتوازن الأمعاء",
          "الجهاز الهضمي",
          "مسارات الالتهاب",
          "الأبحاث المرتبطة بالجلد والراحة الهضمية",
        ],
      },
    },
  },
  {
    id: "selank",
    name: "Selank",
    image: PLACEHOLDER_IMAGE,
    purity: null,
    coaUrl: null,
    vials: [{ id: "10mg", label: "10 mg" }],
    active: true,
    translations: {
      en: {
        tagline: "Focus & cognitive research",
        description:
          "Selank is studied in research areas involving mental balance, stress-response pathways, and cognitive function.",
        researchAreas: [
          "Stress-response research",
          "Mental balance and calmness",
          "Focus and attention",
          "Cognitive function",
        ],
      },
      ar: {
        tagline: "أبحاث التركيز والتوازن الذهني",
        description:
          "يُدرس Selank في مجالات بحثية مرتبطة بالتوازن الذهني، الاستجابة للتوتر والوظائف المعرفية.",
        researchAreas: [
          "الاستجابة للتوتر",
          "التوازن والهدوء الذهني",
          "التركيز والانتباه",
          "الوظائف المعرفية",
        ],
      },
    },
  },
  {
    id: "semax",
    name: "Semax",
    image: PLACEHOLDER_IMAGE,
    purity: null,
    coaUrl: null,
    vials: [{ id: "10mg", label: "10 mg" }],
    active: true,
    translations: {
      en: {
        tagline: "Focus & cognitive research",
        description:
          "Semax has attracted research interest in areas involving cognitive function, attention, and memory.",
        researchAreas: [
          "Cognitive function",
          "Focus and attention",
          "Memory research",
          "Mental fatigue and cognitive performance",
        ],
      },
      ar: {
        tagline: "أبحاث التركيز والوظائف المعرفية",
        description:
          "يحظى Semax باهتمام بحثي في مجالات مرتبطة بالوظائف المعرفية، الانتباه والذاكرة.",
        researchAreas: [
          "الوظائف المعرفية",
          "التركيز والانتباه",
          "الذاكرة",
          "الإرهاق والأداء الذهني",
        ],
      },
    },
  },
];

export function getActiveProducts(): Product[] {
  return products.filter((p) => p.active);
}

export function getProductById(id: string): Product | undefined {
  return products.find((p) => p.id === id && p.active);
}

export function getVial(productId: string, vialId: string) {
  const product = getProductById(productId);
  return product?.vials.find((v) => v.id === vialId);
}
