// Text of the legal pages, in both languages. Kept in code (not the message
// catalogs) because these are long documents, not UI strings; a unit test
// checks that both languages have the same structure.
//
// These are drafts written for this site's actual data flows — they must be
// reviewed by a lawyer in the business's jurisdiction before launch.

import type { Locale } from "@/i18n/routing";
import type { Business } from "@/lib/business";

export const LEGAL_SLUGS = ["privacy", "terms", "refunds", "cookies"] as const;
export type LegalSlug = (typeof LEGAL_SLUGS)[number];

export const LAST_UPDATED = "2026-09-20";

export interface LegalSection {
  heading: string;
  paragraphs: string[];
}
export interface LegalDoc {
  title: string;
  sections: LegalSection[];
}

type Builder = (b: Business) => LegalDoc;

const en: Record<LegalSlug, Builder> = {
  privacy: (b) => ({
    title: "Privacy Policy",
    sections: [
      {
        heading: "Who we are",
        paragraphs: [
          `${b.tradeName} is operated by ${b.legalName}, ${b.address}. For anything in this policy, contact us at ${b.email}.`,
        ],
      },
      {
        heading: "What we collect, and why",
        paragraphs: [
          "When you submit a quote request we collect your name, email address, phone number, shipping address, the products, vial sizes and quantities you selected, and any notes you choose to write. We use these only to verify your phone number, prepare and send you a quote, and follow up about your request.",
          "When you send feedback we collect your email address, your name if you give it, and your message, to read and reply to it.",
          "To stop abuse we briefly use your IP address to limit how many codes and requests can be sent. This count is held in memory only and is not stored or logged.",
          "We do not collect payment details — no payment is taken on this site. We do not collect more than this, and we do not use analytics, advertising or tracking tools.",
        ],
      },
      {
        heading: "Who we share it with",
        paragraphs: [
          "We do not sell your data and we do not send marketing. We use three service providers who process data on our behalf: Twilio (sends the one-time verification code by SMS to your phone number), Resend (delivers your quote request or feedback to our inbox by email) and Vercel (hosts this website). We may also disclose information where the law requires it.",
          "These providers may process data outside your country. Where they do, we rely on the safeguards they offer for international transfers.",
        ],
      },
      {
        heading: "How long we keep it",
        paragraphs: [
          "Quote requests and feedback exist only as emails in our inbox; this site stores nothing in a database. We keep them for as long as needed to answer you and to meet legal and accounting obligations, then delete them. You can ask us to delete them sooner.",
          "In your own browser, the site keeps a signed-in cookie for 30 days, your quote cart, and — only if you allow it — your name, email and address for next time. See the Cookie Policy for details and how to erase all of it.",
        ],
      },
      {
        heading: "Your rights",
        paragraphs: [
          "Depending on where you live you can ask us for a copy of your data, to correct it, to delete it, to restrict or object to how we use it, and to withdraw any consent you gave. You also have the right to complain to your local data-protection authority.",
          "Use the Data Request page on this site or write to us at the address above. We will confirm your identity (for example by replying to the email address you used) and respond within 30 days.",
        ],
      },
      {
        heading: "Age",
        paragraphs: [
          "This site is for adults aged 18 or over. We do not knowingly collect information from anyone under 18. If you believe a child has given us information, contact us and we will delete it.",
        ],
      },
      {
        heading: "Security",
        paragraphs: [
          "The site is served over HTTPS, the sign-in cookie is HttpOnly and signed, and we keep the data we hold to a minimum. No online service is perfectly secure, so we cannot guarantee absolute security.",
        ],
      },
      {
        heading: "Changes",
        paragraphs: [
          `We may update this policy; the date at the top shows the latest version (${LAST_UPDATED}).`,
        ],
      },
    ],
  }),
  terms: (b) => ({
    title: "Terms of Service",
    sections: [
      {
        heading: "About these terms",
        paragraphs: [
          `This website is operated by ${b.legalName} (“${b.tradeName}”, “we”), ${b.address}, ${b.email}, ${b.phone}. By using the site or submitting a quote request you agree to these terms.`,
        ],
      },
      {
        heading: "Research use only, adults only",
        paragraphs: [
          "Everything on this site is intended strictly for research and laboratory use by adults aged 18 or over. Products are not drugs, dietary supplements or cosmetics and are not for human or veterinary use, consumption or administration in any form. Nothing here is medical advice or a claim that any product diagnoses, treats, cures or prevents any condition.",
          "Descriptions of “research areas” only describe topics that scientists study. They are not statements about what a product does in people.",
        ],
      },
      {
        heading: "Quote requests, not orders",
        paragraphs: [
          "No prices are published and no payment is taken on this site. A quote request is a request for information, not an order and not a contract. We reply by email with pricing, availability and next steps. A sale exists only once we have confirmed it in writing and you have accepted it.",
          "We may decline or cancel any request, for example if an item is unavailable or we cannot lawfully supply you.",
        ],
      },
      {
        heading: "Your responsibilities",
        paragraphs: [
          "You confirm that the information you give is accurate, that you are 18 or over, and that you will use products only for lawful research and in line with the laws of your country, including any import rules. You are responsible for checking that you may lawfully receive and use the products where you are.",
          "You must not misuse the site: no automated scraping, no attempts to bypass rate limits or phone verification, and no submitting false or another person’s details.",
        ],
      },
      {
        heading: "Intellectual property",
        paragraphs: [
          "The site’s text, logo, design and images belong to us or our licensors. You may view them for your own use but may not copy or reuse them without permission.",
        ],
      },
      {
        heading: "Liability",
        paragraphs: [
          "The site is provided “as is”. To the fullest extent the law allows, we are not liable for indirect or consequential loss arising from use of the site, and our total liability is limited to the amount you paid us for the relevant product. Nothing in these terms limits liability that cannot be limited by law, including for fraud or death or personal injury caused by negligence, or your statutory consumer rights.",
        ],
      },
      {
        heading: "Governing law and changes",
        paragraphs: [
          `These terms are governed by the laws of ${b.jurisdiction}, and its courts have jurisdiction, without removing any mandatory consumer protection in your country of residence.`,
          `We may update these terms; the date at the top shows the latest version (${LAST_UPDATED}).`,
        ],
      },
    ],
  }),
  refunds: (b) => ({
    title: "Refund and Returns Policy",
    sections: [
      {
        heading: "Nothing is charged on this site",
        paragraphs: [
          "This website does not take payment, so submitting a quote request never costs you anything and there is nothing to refund from the site itself. If you decide not to go ahead after receiving a quote, simply do not accept it.",
        ],
      },
      {
        heading: "Once you accept a quote",
        paragraphs: [
          "Payment and delivery are arranged with you directly by email. The written quote you accept is the contract and states the price, shipping cost and any taxes or duties, so there are no hidden fees. This policy applies to every accepted quote unless the quote says otherwise.",
        ],
      },
      {
        heading: "Cancelling",
        paragraphs: [
          "You may cancel an accepted order for a full refund at any time before it is dispatched. Contact us as soon as possible.",
        ],
      },
      {
        heading: "Damaged, wrong or missing items",
        paragraphs: [
          "If your order arrives damaged, is not what you ordered, or is incomplete, email us within 7 days of delivery with your order details and photos. We will replace the item or refund you in full, including shipping, at your choice where stock allows.",
        ],
      },
      {
        heading: "Items we cannot take back",
        paragraphs: [
          "For safety and product-integrity reasons we cannot accept returns of vials that have been opened, reconstituted or stored incorrectly, unless they arrived defective.",
        ],
      },
      {
        heading: "How refunds are paid",
        paragraphs: [
          "Approved refunds are returned by the same method you paid with, within 14 days of us approving them. Your statutory rights under the law of your country are not affected.",
          `Questions: ${b.email}.`,
        ],
      },
    ],
  }),
  cookies: () => ({
    title: "Cookie Policy",
    sections: [
      {
        heading: "The short version",
        paragraphs: [
          "We use no advertising, analytics or tracking cookies and load no third-party trackers. Fonts are served from this site. What we store in your browser is listed below.",
        ],
      },
      {
        heading: "Essential — always on",
        paragraphs: [
          "pepclub_session (cookie, 30 days, HttpOnly): remembers that this browser verified a phone number, so you do not need a new code each time. It holds your verified phone number in a signed token that cannot be forged and cannot be read by scripts on the page. Sign out or use “Delete my data in this browser” below to remove it.",
          "peptides:quote-cart (local storage, until you clear it): the items in your quote request.",
          "pepclub.quoteDraft (session storage, until the tab closes): keeps what you typed while you verify your phone.",
          "pepclub.consent (local storage): remembers the choice you make in the cookie notice.",
        ],
      },
      {
        heading: "Optional — only if you allow it",
        paragraphs: [
          "pepclub.profile (local storage): your name, email, address and phone number from your last quote request, so the form can be pre-filled next time. It is saved only if you chose “Accept optional storage”, and only used while your verified-phone session is active. Choosing “Essential only” later removes it.",
        ],
      },
      {
        heading: "Your choices",
        paragraphs: [
          "Use “Cookie settings” in the page footer to change your choice at any time. You can also block or delete storage in your browser settings; the site still works, but you will need to verify your phone each visit and re-enter your details.",
        ],
      },
    ],
  }),
};

const ar: Record<LegalSlug, Builder> = {
  privacy: (b) => ({
    title: "سياسة الخصوصية",
    sections: [
      {
        heading: "من نحن",
        paragraphs: [
          `يُدار ${b.tradeName} بواسطة ${b.legalName}، ${b.address}. لأي استفسار بخصوص هذه السياسة تواصل معنا على ${b.email}.`,
        ],
      },
      {
        heading: "ما الذي نجمعه ولماذا",
        paragraphs: [
          "عند إرسال طلب عرض سعر نجمع اسمك وبريدك الإلكتروني ورقم هاتفك وعنوان الشحن والمنتجات وأحجام القوارير والكميات التي اخترتها وأي ملاحظات تكتبها. نستخدمها فقط للتحقق من رقم هاتفك وإعداد عرض السعر وإرساله إليك ومتابعة طلبك.",
          "عند إرسال ملاحظاتك نجمع بريدك الإلكتروني واسمك إن أدخلته ورسالتك، وذلك لقراءتها والرد عليها.",
          "لمنع إساءة الاستخدام نستخدم عنوان IP الخاص بك لفترة قصيرة لتحديد عدد الرموز والطلبات المسموح بها. يُحفظ هذا العدّاد في الذاكرة فقط ولا يُخزَّن ولا يُسجَّل.",
          "لا نجمع بيانات الدفع، إذ لا يتم أي دفع عبر هذا الموقع. ولا نجمع أكثر من ذلك، ولا نستخدم أدوات تحليلات أو إعلانات أو تتبّع.",
        ],
      },
      {
        heading: "مع من نشاركها",
        paragraphs: [
          "لا نبيع بياناتك ولا نرسل رسائل تسويقية. نستعين بثلاث جهات تعالج البيانات نيابةً عنا: Twilio (لإرسال رمز التحقق برسالة نصية إلى هاتفك)، وResend (لإيصال طلب عرض السعر أو الملاحظات إلى بريدنا)، وVercel (لاستضافة الموقع). وقد نفصح عن معلومات حيثما يتطلب القانون ذلك.",
          "قد تعالج هذه الجهات البيانات خارج بلدك، وفي هذه الحالة نعتمد على الضمانات التي توفرها لنقل البيانات دوليًا.",
        ],
      },
      {
        heading: "مدة الاحتفاظ بها",
        paragraphs: [
          "توجد طلبات عروض الأسعار والملاحظات فقط كرسائل بريد إلكتروني في صندوقنا؛ ولا يخزّن الموقع شيئًا في قاعدة بيانات. نحتفظ بها للمدة اللازمة للرد عليك والوفاء بالالتزامات القانونية والمحاسبية، ثم نحذفها. ويمكنك أن تطلب حذفها قبل ذلك.",
          "في متصفحك يحتفظ الموقع بملف تعريف ارتباط لتسجيل التحقق لمدة 30 يومًا، وبسلة طلبك، وبالاسم والبريد والعنوان فقط إذا سمحت بذلك. راجع سياسة ملفات تعريف الارتباط للتفاصيل وكيفية مسح كل ذلك.",
        ],
      },
      {
        heading: "حقوقك",
        paragraphs: [
          "بحسب مكان إقامتك، يمكنك أن تطلب نسخة من بياناتك أو تصحيحها أو حذفها أو تقييد استخدامنا لها أو الاعتراض عليه، وسحب أي موافقة أعطيتها. ولك كذلك الحق في تقديم شكوى إلى جهة حماية البيانات في بلدك.",
          "استخدم صفحة «طلب بيانات» في هذا الموقع أو راسلنا على العنوان أعلاه. سنتحقق من هويتك (مثلًا بالرد على البريد الذي استخدمته) ونرد خلال 30 يومًا.",
        ],
      },
      {
        heading: "العمر",
        paragraphs: [
          "هذا الموقع مخصص للبالغين من عمر 18 سنة فأكثر. لا نجمع عن قصد معلومات من أي شخص دون 18 سنة. إذا كنت تعتقد أن طفلًا زوّدنا بمعلومات، تواصل معنا وسنحذفها.",
        ],
      },
      {
        heading: "الأمان",
        paragraphs: [
          "يُقدَّم الموقع عبر HTTPS، وملف تعريف ارتباط تسجيل الدخول موقَّع ومحمي بـ HttpOnly، ونقتصر على أقل قدر من البيانات. لا توجد خدمة إلكترونية آمنة تمامًا، لذا لا يمكننا ضمان أمان مطلق.",
        ],
      },
      {
        heading: "التغييرات",
        paragraphs: [
          `قد نحدّث هذه السياسة، ويبيّن التاريخ في أعلى الصفحة آخر إصدار (${LAST_UPDATED}).`,
        ],
      },
    ],
  }),
  terms: (b) => ({
    title: "شروط الخدمة",
    sections: [
      {
        heading: "عن هذه الشروط",
        paragraphs: [
          `يُدير هذا الموقع ${b.legalName} («${b.tradeName}»، «نحن»)، ${b.address}، ${b.email}، ${b.phone}. باستخدامك الموقع أو إرسالك طلب عرض سعر فإنك توافق على هذه الشروط.`,
        ],
      },
      {
        heading: "للأبحاث فقط وللبالغين فقط",
        paragraphs: [
          "كل ما في هذا الموقع مخصص حصريًا للأبحاث والاستخدام المخبري من قبل البالغين من عمر 18 سنة فأكثر. المنتجات ليست أدوية ولا مكملات غذائية ولا مستحضرات تجميل، وليست للاستخدام أو الاستهلاك أو التناول البشري أو البيطري بأي شكل. لا شيء هنا يُعد نصيحة طبية أو ادعاءً بأن أي منتج يشخّص أو يعالج أو يشفي أو يمنع أي حالة.",
          "أوصاف «مجالات البحث» تصف فقط موضوعات يدرسها العلماء، وليست ادعاءات بما يفعله المنتج في الإنسان.",
        ],
      },
      {
        heading: "طلبات عروض الأسعار وليست طلبات شراء",
        paragraphs: [
          "لا تُنشر أسعار ولا يتم أي دفع عبر هذا الموقع. طلب عرض السعر هو طلب معلومات، وليس طلب شراء ولا عقدًا. نرد عبر البريد الإلكتروني بالسعر والتوفر والخطوات التالية. لا يقوم البيع إلا بعد أن نؤكده كتابةً وتقبله أنت.",
          "يجوز لنا رفض أي طلب أو إلغاؤه، مثلًا إذا كان الصنف غير متوفر أو لم يكن بإمكاننا توريده لك قانونيًا.",
        ],
      },
      {
        heading: "مسؤولياتك",
        paragraphs: [
          "تؤكد أن المعلومات التي تقدمها صحيحة، وأنك في الثامنة عشرة أو أكثر، وأنك ستستخدم المنتجات في أبحاث مشروعة فقط ووفق قوانين بلدك بما فيها قواعد الاستيراد. أنت مسؤول عن التحقق من أنه يحق لك قانونيًا استلام المنتجات واستخدامها في مكان وجودك.",
          "يُحظر إساءة استخدام الموقع: لا كشط آلي للبيانات، ولا محاولة تجاوز حدود الطلبات أو التحقق من الهاتف، ولا تقديم بيانات كاذبة أو بيانات شخص آخر.",
        ],
      },
      {
        heading: "الملكية الفكرية",
        paragraphs: [
          "نصوص الموقع وشعاره وتصميمه وصوره مملوكة لنا أو لمرخّصينا. يمكنك عرضها لاستخدامك الشخصي ولا يجوز نسخها أو إعادة استخدامها دون إذن.",
        ],
      },
      {
        heading: "المسؤولية",
        paragraphs: [
          "يُقدَّم الموقع «كما هو». إلى أقصى حد يسمح به القانون، لا نتحمل أي خسارة غير مباشرة أو تبعية ناشئة عن استخدام الموقع، وتقتصر مسؤوليتنا الإجمالية على المبلغ الذي دفعته لنا مقابل المنتج المعني. لا يقيّد شيء في هذه الشروط مسؤولية لا يجوز تقييدها قانونًا، بما في ذلك الاحتيال أو الوفاة أو الإصابة الشخصية الناتجة عن الإهمال، ولا حقوقك القانونية كمستهلك.",
        ],
      },
      {
        heading: "القانون الواجب التطبيق والتغييرات",
        paragraphs: [
          `تخضع هذه الشروط لقوانين ${b.jurisdiction} وتختص بها محاكمها، دون الإخلال بأي حماية إلزامية للمستهلك في بلد إقامتك.`,
          `قد نحدّث هذه الشروط، ويبيّن التاريخ في أعلى الصفحة آخر إصدار (${LAST_UPDATED}).`,
        ],
      },
    ],
  }),
  refunds: (b) => ({
    title: "سياسة الاسترداد والإرجاع",
    sections: [
      {
        heading: "لا يُخصم أي مبلغ عبر هذا الموقع",
        paragraphs: [
          "لا يقبل هذا الموقع أي دفعات، لذا فإرسال طلب عرض سعر لا يكلّفك شيئًا ولا يوجد ما يُسترد من الموقع نفسه. إذا قررت عدم المتابعة بعد استلام العرض، فما عليك سوى عدم قبوله.",
        ],
      },
      {
        heading: "بعد قبولك عرض السعر",
        paragraphs: [
          "يتم ترتيب الدفع والتسليم معك مباشرة عبر البريد الإلكتروني. العرض المكتوب الذي تقبله هو العقد، ويذكر السعر وتكلفة الشحن وأي ضرائب أو رسوم، فلا توجد رسوم خفية. تسري هذه السياسة على كل عرض مقبول ما لم ينص العرض على خلاف ذلك.",
        ],
      },
      {
        heading: "الإلغاء",
        paragraphs: [
          "يمكنك إلغاء طلب مقبول واسترداد كامل المبلغ في أي وقت قبل شحنه. تواصل معنا في أقرب وقت.",
        ],
      },
      {
        heading: "الأصناف التالفة أو الخاطئة أو الناقصة",
        paragraphs: [
          "إذا وصل طلبك تالفًا أو مختلفًا عمّا طلبت أو ناقصًا، راسلنا خلال 7 أيام من التسليم مع تفاصيل الطلب وصور. سنستبدل الصنف أو نعيد إليك المبلغ كاملًا بما فيه الشحن، حسب اختيارك وبحسب توفر المخزون.",
        ],
      },
      {
        heading: "أصناف لا يمكننا استرجاعها",
        paragraphs: [
          "لأسباب تتعلق بالسلامة وسلامة المنتج، لا نقبل إرجاع القوارير التي فُتحت أو أُذيبت أو خُزّنت بشكل غير صحيح، إلا إذا وصلت معيبة.",
        ],
      },
      {
        heading: "كيف تُدفع المبالغ المستردة",
        paragraphs: [
          "تُعاد المبالغ المستردة المعتمدة بالطريقة نفسها التي دفعت بها، خلال 14 يومًا من اعتمادنا لها. لا تتأثر حقوقك القانونية بموجب قانون بلدك.",
          `للاستفسار: ${b.email}.`,
        ],
      },
    ],
  }),
  cookies: () => ({
    title: "سياسة ملفات تعريف الارتباط",
    sections: [
      {
        heading: "باختصار",
        paragraphs: [
          "لا نستخدم ملفات تعريف ارتباط للإعلانات أو التحليلات أو التتبّع، ولا نحمّل أي أدوات تتبّع من أطراف ثالثة. تُقدَّم الخطوط من هذا الموقع نفسه. فيما يلي ما نخزّنه في متصفحك.",
        ],
      },
      {
        heading: "أساسية — مفعّلة دائمًا",
        paragraphs: [
          "pepclub_session (ملف تعريف ارتباط، 30 يومًا، HttpOnly): يتذكر أن هذا المتصفح تحقق من رقم هاتف، فلا تحتاج إلى رمز جديد في كل مرة. يحتوي على رقم هاتفك الذي تم التحقق منه ضمن رمز موقَّع لا يمكن تزويره ولا يمكن لنصوص الصفحة قراءته. سجّل الخروج أو استخدم «احذف بياناتي في هذا المتصفح» أدناه لإزالته.",
          "peptides:quote-cart (تخزين محلي، حتى تمسحه): الأصناف في طلب عرض السعر.",
          "pepclub.quoteDraft (تخزين الجلسة، حتى إغلاق التبويب): يحفظ ما كتبته أثناء التحقق من هاتفك.",
          "pepclub.consent (تخزين محلي): يتذكر اختيارك في إشعار ملفات تعريف الارتباط.",
        ],
      },
      {
        heading: "اختيارية — فقط إذا سمحت بها",
        paragraphs: [
          "pepclub.profile (تخزين محلي): اسمك وبريدك وعنوانك ورقم هاتفك من آخر طلب، لتعبئة النموذج تلقائيًا في المرة القادمة. لا يُحفظ إلا إذا اخترت «قبول التخزين الاختياري»، ولا يُستخدم إلا أثناء جلسة التحقق من الهاتف. اختيار «الأساسية فقط» لاحقًا يزيله.",
        ],
      },
      {
        heading: "خياراتك",
        paragraphs: [
          "استخدم «إعدادات ملفات تعريف الارتباط» في تذييل الصفحة لتغيير اختيارك في أي وقت. ويمكنك أيضًا حظر التخزين أو حذفه من إعدادات المتصفح؛ سيظل الموقع يعمل لكن ستحتاج إلى التحقق من هاتفك في كل زيارة وإعادة إدخال بياناتك.",
        ],
      },
    ],
  }),
};

export function getLegalDoc(slug: LegalSlug, locale: Locale, business: Business): LegalDoc {
  return (locale === "ar" ? ar : en)[slug](business);
}

export function isLegalSlug(value: string): value is LegalSlug {
  return (LEGAL_SLUGS as readonly string[]).includes(value);
}
