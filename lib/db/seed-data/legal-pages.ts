import { CONTACT } from "@/lib/contact";

/**
 * Terms of Service and Privacy Policy text (Markdown), English and Arabic.
 * Drafted under Israeli law; the English version prevails (Terms 18.4).
 * Seeded into the `pages` table; once the admin edits a page, the database
 * copy is the source of truth and this file is no longer read for it.
 */

const EFFECTIVE_EN = "1 October 2026";
const EFFECTIVE_AR = "1 تشرين الأول/أكتوبر 2026";
const EMAIL = CONTACT.email;

export const TERMS_EN = `**Effective date:** ${EFFECTIVE_EN}

## 1. Parties and acceptance

1.1 These Terms of Service (the "Terms") constitute a legally binding agreement between Pep Club, based in Jerusalem ("Pep Club", the "Company", "we", "us" or "our"), and any person or entity who accesses the website located at pepclub.com, in any language version (the "Site"), or who places an order through the Site (the "Buyer", "you" or "your").

1.2 By accessing the Site, placing an order, or ticking the research-use acknowledgment at checkout, you confirm that you have read, understood and agree to be bound by these Terms, together with our [Privacy Policy](/en/legal/privacy), [Cookie Policy](/en/legal/cookies), [Product Disclaimer](/en/legal/product-disclaimer) and [Shipping & Returns Policy](/en/legal/shipping-returns), each of which is incorporated herein by reference. If you do not agree, you must not use the Site or place any order.

1.3 Where you act on behalf of an institution, laboratory or other legal entity, you represent and warrant that you are duly authorised to bind that entity to these Terms, and references to "you" shall include that entity.

## 2. Eligibility

2.1 The Site and all Products are offered exclusively to persons aged eighteen (18) years or older who possess full legal capacity to enter into binding contracts under applicable law.

2.2 The Site is intended solely for independent researchers, laboratory personnel and research institutions. The Company makes no offer to, and does not contract with, members of the public purchasing for personal, therapeutic, cosmetic, athletic or consumption purposes.

2.3 The Company reserves the right, at its sole discretion and without liability, to request evidence of age, professional qualification or institutional affiliation, and to refuse, suspend or cancel any order where such evidence is not provided or is unsatisfactory.

## 3. Research use only

3.1 All products offered on the Site (the "Products") are sold strictly for laboratory and in-vitro research use only. The Products are not intended for human consumption, veterinary use, clinical trials, therapeutic administration, diagnostic purposes, or any form of introduction into the human or animal body.

3.2 The Products have not been evaluated, approved or registered as medicinal products, drugs, food supplements or cosmetics by the Israeli Ministry of Health, the Palestinian Ministry of Health, the U.S. Food and Drug Administration, or any other regulatory authority.

3.3 Nothing on the Site, in any communication from the Company, or on any Product label constitutes medical advice, a therapeutic claim, a dosing instruction, or a recommendation for use. The Company does not provide, and its personnel are prohibited from providing, any such information.

3.4 Any use of the Products contrary to this Section 3 constitutes a material breach of these Terms and is undertaken solely at the Buyer's own risk and responsibility.

## 4. Buyer representations and warranties

By placing an order, you represent, warrant and undertake that:

1. you are at least eighteen (18) years of age;
2. you are purchasing the Products solely for lawful laboratory or in-vitro research purposes;
3. you possess the scientific knowledge, training, facilities and equipment necessary to store, handle and dispose of the Products safely and in accordance with applicable laws and good laboratory practice;
4. you will not administer, or permit or assist any other person to administer, any Product to any human or animal;
5. you will not resell, redistribute, repackage or otherwise supply any Product to any third party for human or animal use, or for any purpose prohibited under these Terms or applicable law;
6. your purchase, possession and use of the Products complies with all laws, regulations and permits applicable in your jurisdiction; and
7. all information you provide to the Company is true, accurate, current and complete.

## 5. Product information

5.1 Product descriptions, specifications, brand information, vial quantities and stated purity percentages are provided for identification purposes only and, where applicable, reflect the manufacturer's batch certificate of analysis ("COA"). The Company does not independently test each batch unless expressly stated.

5.2 Product images are illustrative. Packaging, labelling and appearance may vary from those depicted.

5.3 The Company uses reasonable efforts to ensure the accuracy of information on the Site but does not warrant that descriptions, pricing or other content are complete, current or error-free. The Company reserves the right to correct any error, inaccuracy or omission at any time, including after an order has been submitted.

## 6. Orders and contract formation

6.1 Orders may be placed only through the Site as a guest. No customer account is created. Each order is assigned a unique order number and a confidential access link, which you are responsible for safeguarding.

6.2 Submission of an order constitutes an offer by you to purchase the Products listed therein. A binding contract of sale is formed only when the Company dispatches the Products for delivery. Order confirmation notices do not constitute acceptance.

6.3 The Company may decline or cancel any order, in whole or in part, at any time prior to delivery, including without limitation where: (a) the Product is unavailable; (b) a pricing or descriptive error has occurred; (c) the Company reasonably suspects that the Product is intended for a use prohibited by these Terms; (d) delivery to the stated address is not possible; or (e) the Buyer has previously refused delivery or failed to pay. No liability shall arise from any such cancellation.

6.4 The research-use acknowledgment recorded at checkout, together with its timestamp, shall constitute conclusive evidence of your acceptance of these Terms in respect of that order.

## 7. Prices and payment

7.1 All prices are stated in Israeli New Shekels (ILS / ₪) and are inclusive of value added tax (VAT) at the rate in force, as required by Section 17B of the Consumer Protection Law, 5741-1981. The applicable delivery fee, if any, is displayed prior to order submission.

7.2 Payment is made exclusively by cash on delivery ("COD"), in the full amount stated in the order confirmation, to the courier upon physical handover of the Products. The Company does not accept online card payments and does not collect payment card or bank account data.

7.3 Title to the Products shall pass to the Buyer only upon receipt of full payment. Risk of loss or damage shall pass to the Buyer upon handover.

## 8. Cancellation, refusal and non-payment

8.1 You may cancel an order without charge at any time before its status changes to "out for delivery", by emailing the Company at [${EMAIL}](mailto:${EMAIL}) and quoting your order number.

8.2 Where you refuse delivery, fail to make full payment upon handover, provide an incorrect address or phone number, or are unavailable after two (2) reasonable delivery attempts, the order shall be cancelled. The Company reserves the right to recover from you any delivery costs reasonably incurred and to decline future orders associated with your name, phone number or address.

8.3 Without derogating from Sections 8.1 and 8.2, where you are a consumer within the meaning of the Consumer Protection Law, 5741-1981, you may cancel a distance sale in accordance with Section 14C of that Law and the Consumer Protection (Cancellation of Transaction) Regulations, 5771-2010, from the date of the transaction until fourteen (14) days from receipt of the Products, subject to the statutory exceptions, including goods which by their nature are perishable. Where cancellation is not due to a defect or non-conformity, the Company may charge a cancellation fee not exceeding the lower of five percent (5%) of the transaction price or ₪100. Conditions for the return of Products, including sealed and unopened packaging, are set out in the [Shipping & Returns Policy](/en/legal/shipping-returns).

## 9. Delivery

9.1 Delivery is available only within the areas the Company serves, as confirmed with you before your order is dispatched. Estimated delivery times are indicative only and do not constitute a binding commitment.

9.2 You must inspect the outer packaging upon delivery and note any visible damage or tampering to the courier before accepting the Products. Further terms are set out in the [Shipping & Returns Policy](/en/legal/shipping-returns).

## 10. Storage, handling and safety

10.1 Peptides and related compounds may be sensitive to temperature, light, moisture and contamination. Upon delivery, the Buyer assumes sole responsibility for the proper storage, handling, labelling and disposal of the Products.

10.2 The Company shall not be responsible for any degradation, loss of potency or contamination of the Products occurring after handover.

## 11. Prohibited conduct

You shall not: (a) use the Site for any unlawful purpose; (b) provide false information or impersonate any person; (c) attempt to access orders, data or admin functions not belonging to you, including by guessing or manipulating order links; (d) interfere with, scrape, reverse-engineer or overload the Site or its infrastructure; or (e) use the Site to solicit or share medical, dosing or consumption information.

## 12. Intellectual property

The Pep Club name, logo, Site design, text, graphics and software are owned by or licensed to the Company and are protected by intellectual property laws. Third-party brand names and marks remain the property of their respective owners. No licence is granted to you other than a limited, revocable, non-exclusive right to view the Site for the purpose of placing orders.

## 13. Disclaimer of warranties

13.1 To the maximum extent permitted by law, the Site and the Products are provided "as is" and "as available". The Company expressly disclaims all warranties, express or implied, including any implied warranty of merchantability, fitness for a particular purpose, safety, efficacy or non-infringement.

13.2 Without limiting the foregoing, the Company makes no representation or warranty that any Product is safe or suitable for any use other than laboratory research, or that any research result will be obtained.

## 14. Limitation of liability

14.1 To the maximum extent permitted by applicable law, the Company, its directors, officers, employees, agents and suppliers shall not be liable for any indirect, incidental, special, consequential, exemplary or punitive damages, or for any loss of profits, data, goodwill or business opportunity, arising out of or in connection with these Terms, the Site or the Products, however caused and under any theory of liability.

14.2 Without limiting Section 14.1, the Company shall bear no liability whatsoever for any injury, illness, death, or damage to persons, animals or property resulting from: (a) any human or veterinary administration or consumption of a Product; (b) any use in breach of Sections 3 or 4; (c) improper storage, handling or disposal; or (d) the Buyer's failure to comply with applicable law.

14.3 The Company's total aggregate liability arising out of or in connection with any order shall not exceed the amount actually paid by the Buyer for that order.

14.4 Nothing in these Terms excludes or limits any liability which cannot be excluded or limited under applicable law, including the Consumer Protection Law, 5741-1981, the Defective Products Liability Law, 5740-1980, and the Standard Contracts Law, 5743-1982.

## 15. Indemnification

You shall defend, indemnify and hold harmless the Company and its directors, officers, employees, agents and suppliers from and against any and all claims, demands, losses, liabilities, damages, penalties, fines, costs and expenses (including reasonable legal fees) arising out of or relating to: (a) your breach of these Terms, including any representation or warranty in Section 4; (b) any use, misuse, resale or administration of the Products by you or any person obtaining them through you; or (c) your violation of any law or the rights of any third party.

## 16. Privacy

The collection and processing of personal data in connection with the Site and your orders is governed by our [Privacy Policy](/en/legal/privacy).

## 17. Governing law and jurisdiction

17.1 These Terms and any dispute or claim arising out of or in connection with them shall be governed by and construed in accordance with the laws of the State of Israel, without regard to its conflict-of-laws principles.

17.2 The competent courts in Jerusalem, Israel, shall have exclusive jurisdiction over any such dispute, save where mandatory law, including the Consumer Protection Law, 5741-1981, grants you the right to bring proceedings elsewhere.

## 18. General

18.1 **Amendments.** The Company may amend these Terms at any time by publishing a revised version on the Site. The version in force at the time an order is submitted shall govern that order.

18.2 **Severability.** If any provision of these Terms is held invalid or unenforceable, that provision shall be enforced to the maximum extent permissible and the remaining provisions shall continue in full force and effect.

18.3 **No waiver.** No failure or delay by the Company in exercising any right shall operate as a waiver thereof.

18.4 **Language.** These Terms are published in English and Arabic. In the event of any conflict or inconsistency between the versions, the English version shall prevail, to the extent permitted by law.

18.5 **Entire agreement.** These Terms, together with the policies incorporated by reference, constitute the entire agreement between you and the Company with respect to their subject matter and supersede all prior understandings.

18.6 **Assignment.** You may not assign or transfer any rights or obligations under these Terms without the Company's prior written consent. The Company may assign its rights and obligations to any affiliate or successor.

18.7 **Force majeure.** The Company shall not be liable for any delay or failure to perform resulting from causes beyond its reasonable control, including closures, curfews, checkpoints, road restrictions, security incidents, strikes, natural disasters or acts of government.

## 19. Contact

Pep Club · Jerusalem · [${EMAIL}](mailto:${EMAIL})
`;

export const PRIVACY_EN = `**Effective date:** ${EFFECTIVE_EN}

## 1. Introduction and scope

1.1 This Privacy Policy describes how Pep Club ("Pep Club", "we", "us" or "our") collects, uses, stores, discloses and protects personal data relating to visitors to and purchasers through pepclub.com (the "Site").

1.2 This Policy is issued in accordance with the Israeli Protection of Privacy Law, 5741-1981, as amended (including by Amendment No. 13), and the regulations promulgated thereunder, including the Protection of Privacy (Data Security) Regulations, 5777-2017.

1.3 By using the Site or placing an order, you acknowledge that you have read and understood this Policy. Capitalised terms not defined herein have the meaning given in our [Terms of Service](/en/legal/terms).

## 2. Data controller

The controller and owner of the database in which your personal data is held is Pep Club, of Jerusalem. Enquiries may be directed to [${EMAIL}](mailto:${EMAIL}).

## 3. Personal data we collect

3.1 We collect only the personal data you actively provide to us, as follows:

### Checkout

- **Data collected:** full name; delivery address; mobile phone number; optional delivery notes; timestamp of research-use and age acknowledgment.
- **Purpose:** fulfilment of cash-on-delivery orders; courier contact; evidence of acceptance of the Terms.
- **Legal basis:** performance of contract; legal obligation; legitimate interest in establishing compliance.
- **Retention:** seven (7) years from the order date, or as required by tax and accounting law.

### Contact / feedback form

- **Data collected:** name (optional); email address; message content.
- **Purpose:** responding to your enquiry.
- **Legal basis:** legitimate interest; your request.
- **Retention:** until the enquiry is resolved, and no longer than twelve (12) months.

### Data request form

- **Data collected:** request type; email address; phone number used on past orders; request details.
- **Purpose:** verifying identity and fulfilling statutory privacy rights.
- **Legal basis:** legal obligation.
- **Retention:** three (3) years from closure of the request, as evidence of compliance.

3.2 We do not collect payment card numbers, bank account details, government identification numbers, health information, or any advertising or cross-site tracking identifiers. We do not create customer accounts or profiles.

3.3 Our hosting provider may automatically process technical data, such as IP address, browser type and request logs, for the limited purposes of delivering the Site, maintaining security and preventing abuse. We do not use such data to identify, profile or track individual visitors.

## 4. How we use personal data

4.1 We use personal data solely to: (a) process, deliver and administer your orders; (b) contact you regarding delivery, cancellation or order issues; (c) respond to enquiries and data requests; (d) comply with legal, tax and accounting obligations; (e) establish, exercise or defend legal claims, including evidence of your acceptance of the Terms; and (f) protect the security and integrity of the Site.

4.2 We do not sell, rent or trade personal data. We do not use personal data for direct marketing, automated decision-making or profiling.

4.3 You are under no legal obligation to provide personal data. However, without your name, address and phone number we are unable to deliver an order.

## 5. Disclosure to third parties

5.1 We disclose personal data only to the extent necessary, and only to the following categories of recipients:

- **Vercel, Inc.**: website hosting, serverless compute, content delivery and image asset storage (Vercel Blob). Data concerned: technical data; data transmitted through the Site.
- **Neon, Inc.**: managed database hosting. Data concerned: order, enquiry and data request records.
- **Resend, Inc.**: transactional email delivery. Data concerned: order and message notification content sent to the store operator.
- **Our delivery courier**: physical delivery and cash collection. Data concerned: name, address, phone number, delivery notes, order amount.

5.2 Each service provider processes personal data on our behalf, under our instructions, and subject to contractual confidentiality and security obligations.

5.3 We may also disclose personal data where required by law, court order or a competent authority, or where necessary to establish, exercise or defend legal claims.

## 6. International transfers

Certain of our service providers store or process data outside Israel, including in the United States. Such transfers are made in accordance with the Protection of Privacy (Transfer of Data to Databases Abroad) Regulations, 5761-2001, and subject to contractual safeguards requiring the recipient to protect the data to a standard not lower than that required by applicable law.

## 7. Data security

7.1 We implement appropriate technical and organisational measures to protect personal data, including: encryption of data in transit (TLS) and at rest; restriction of administrative access to a limited number of authorised personnel using hashed passwords, session timeouts and brute-force lockout; and protection of each order confirmation page by a unique, cryptographically random access token, without which the page cannot be accessed.

7.2 You are responsible for keeping your order confirmation link confidential. Anyone holding the link may view the order details it contains.

7.3 No method of transmission or storage is completely secure. In the event of a security incident affecting your personal data, we will take the measures and make the notifications required by applicable law.

## 8. Data stored in your browser

8.1 To preserve your shopping session, the Site stores in your browser: (a) the products and quantities in your cart; (b) a temporary draft of the checkout details you have entered (name, phone and address), kept only until you close the browser tab; and (c) your cookie choice. This data remains on your device, is not transmitted to us until you submit an order, and does not include prices.

8.2 If you use a shared or public device, you should clear this data after use by selecting "Delete data in this browser" on our [Cookie Policy](/en/legal/cookies) page, where further information is also set out.

## 9. Your rights

9.1 Subject to applicable law, you have the right to: (a) access the personal data we hold about you; (b) request correction of personal data that is inaccurate, incomplete or out of date; and (c) request deletion of your personal data.

9.2 Requests may be submitted through the [Data Request page](/en/data-request), or by email to [${EMAIL}](mailto:${EMAIL}).

9.3 To protect your data from unauthorised disclosure, we will verify your identity before acting on any request by sending a confirmation to the email address or phone number used in connection with the relevant order. We may decline a request that cannot be verified.

9.4 We will respond within the period prescribed by law and in any event within thirty (30) days. We may retain certain data notwithstanding a deletion request where retention is required by law, including tax and accounting obligations, or is necessary to establish, exercise or defend legal claims. In such cases, the data will be restricted to those purposes.

9.5 If you are not satisfied with our response, you may lodge a complaint with the Privacy Protection Authority of the Israeli Ministry of Justice or any other competent supervisory authority.

## 10. Minors

The Site is not directed at, and we do not knowingly collect personal data from, persons under eighteen (18) years of age. Where we become aware that such data has been submitted, we will cancel the related order and delete the data, subject to Section 9.4.

## 11. Changes to this policy

We may update this Policy from time to time. The revised version will be published on this page with an updated effective date. Material changes will be indicated prominently on the Site.

## 12. Contact

Pep Club · Jerusalem · [${EMAIL}](mailto:${EMAIL})
`;

export const TERMS_AR = `**تاريخ السريان:** ${EFFECTIVE_AR}

## 1. الأطراف والقبول

1.1 تُشكّل شروط الخدمة هذه ("الشروط") اتفاقية ملزمة قانونًا بين Pep Club، ومقرّها القدس ("Pep Club" أو "الشركة" أو "نحن")، وبين أي شخص أو جهة تدخل إلى الموقع الإلكتروني pepclub.com بأي من نسخه اللغوية ("الموقع")، أو تقدّم طلبًا عبر الموقع ("المشتري" أو "أنت").

1.2 بدخولك إلى الموقع، أو تقديمك طلبًا، أو تأشيرك على إقرار الاستخدام البحثي عند إتمام الطلب، فإنك تؤكد أنك قرأت هذه الشروط وفهمتها ووافقت على الالتزام بها، إلى جانب [سياسة الخصوصية](/ar/legal/privacy) و[سياسة ملفات تعريف الارتباط](/ar/legal/cookies) و[إخلاء مسؤولية المنتجات](/ar/legal/product-disclaimer) و[سياسة الشحن والإرجاع](/ar/legal/shipping-returns)، وتُعدّ كل منها جزءًا لا يتجزأ من هذه الشروط بالإحالة. إن لم توافق، فيجب عليك عدم استخدام الموقع أو تقديم أي طلب.

1.3 إذا كنت تتصرف نيابةً عن مؤسسة أو مختبر أو أي كيان قانوني آخر، فإنك تُقرّ وتضمن أنك مخوّل حسب الأصول بإلزام ذلك الكيان بهذه الشروط، وتشمل الإشارات إلى "أنت" ذلك الكيان.

## 2. الأهلية

2.1 يُتاح الموقع وجميع المنتجات حصريًا للأشخاص الذين بلغوا الثامنة عشرة (18) من العمر فأكثر ويتمتعون بالأهلية القانونية الكاملة لإبرام عقود ملزمة وفق القانون المعمول به.

2.2 الموقع مخصص فقط للباحثين المستقلين والعاملين في المختبرات والمؤسسات البحثية. لا تقدّم الشركة أي عرض لأفراد الجمهور، ولا تتعاقد معهم، إذا كان الشراء لأغراض شخصية أو علاجية أو تجميلية أو رياضية أو بغرض الاستهلاك.

2.3 تحتفظ الشركة بالحق، وفق تقديرها المطلق ودون أي مسؤولية، في طلب إثبات العمر أو المؤهل المهني أو الانتماء المؤسسي، وفي رفض أي طلب أو تعليقه أو إلغائه إذا لم يُقدَّم هذا الإثبات أو كان غير مُرضٍ.

## 3. للاستخدام البحثي فقط

3.1 تُباع جميع المنتجات المعروضة على الموقع ("المنتجات") حصريًا للاستخدام البحثي المختبري وفي المختبر (in-vitro) فقط. المنتجات غير مخصصة للاستهلاك البشري أو الاستخدام البيطري أو التجارب السريرية أو الإعطاء العلاجي أو الأغراض التشخيصية أو أي شكل من أشكال إدخالها إلى جسم الإنسان أو الحيوان.

3.2 لم تُقيَّم المنتجات ولم تُعتمد ولم تُسجَّل كمستحضرات طبية أو أدوية أو مكملات غذائية أو مستحضرات تجميل من قِبل وزارة الصحة الإسرائيلية أو وزارة الصحة الفلسطينية أو إدارة الغذاء والدواء الأمريكية (FDA) أو أي جهة تنظيمية أخرى.

3.3 لا يُشكّل أي شيء على الموقع، أو في أي مراسلة من الشركة، أو على ملصق أي منتج، نصيحةً طبية أو ادعاءً علاجيًا أو تعليمات جرعات أو توصيةً بالاستخدام. لا تقدّم الشركة أي معلومات من هذا القبيل، ويُحظر على موظفيها تقديمها.

3.4 أي استخدام للمنتجات يخالف هذا البند 3 يُعدّ إخلالًا جوهريًا بهذه الشروط، ويتم على مسؤولية المشتري وحده وعلى عاتقه.

## 4. إقرارات المشتري وضماناته

بتقديمك طلبًا، فإنك تُقرّ وتضمن وتتعهد بما يلي:

1. أنك بلغت الثامنة عشرة (18) من العمر على الأقل؛
2. أنك تشتري المنتجات فقط لأغراض بحثية مشروعة مختبرية أو في المختبر (in-vitro)؛
3. أنك تمتلك المعرفة العلمية والتدريب والمرافق والمعدات اللازمة لتخزين المنتجات والتعامل معها والتخلص منها بأمان ووفقًا للقوانين المعمول بها والممارسات المختبرية الجيدة؛
4. أنك لن تُعطي أي منتج لأي إنسان أو حيوان، ولن تسمح لأي شخص آخر بذلك أو تساعده عليه؛
5. أنك لن تعيد بيع أي منتج أو توزيعه أو إعادة تعبئته أو تزويده بأي طريقة أخرى لأي طرف ثالث لاستخدامه على الإنسان أو الحيوان، أو لأي غرض محظور بموجب هذه الشروط أو القانون المعمول به؛
6. أن شراءك للمنتجات وحيازتك واستخدامك لها يتوافق مع جميع القوانين واللوائح والتصاريح المعمول بها في نطاق ولايتك القضائية؛
7. أن جميع المعلومات التي تقدّمها للشركة صحيحة ودقيقة وحديثة وكاملة.

## 5. معلومات المنتجات

5.1 تُقدَّم أوصاف المنتجات ومواصفاتها ومعلومات العلامات التجارية وكميات القوارير ونسب النقاء المذكورة لأغراض التعريف فقط، وتعكس، حيثما ينطبق ذلك، شهادة التحليل (COA) الصادرة عن الشركة المصنِّعة للدفعة. لا تختبر الشركة كل دفعة بشكل مستقل ما لم يُذكر ذلك صراحةً.

5.2 صور المنتجات توضيحية. قد يختلف التغليف والملصقات والمظهر عمّا هو معروض.

5.3 تبذل الشركة جهودًا معقولة لضمان دقة المعلومات على الموقع، لكنها لا تضمن أن الأوصاف أو الأسعار أو أي محتوى آخر كامل أو محدّث أو خالٍ من الأخطاء. تحتفظ الشركة بالحق في تصحيح أي خطأ أو عدم دقة أو سهو في أي وقت، بما في ذلك بعد تقديم الطلب.

## 6. الطلبات وانعقاد العقد

6.1 لا يمكن تقديم الطلبات إلا عبر الموقع كزائر. لا يُنشأ أي حساب للعميل. يُخصَّص لكل طلب رقم طلب فريد ورابط وصول سري، وأنت مسؤول عن الحفاظ عليه.

6.2 يُشكّل تقديم الطلب عرضًا منك لشراء المنتجات المدرجة فيه. لا ينعقد عقد بيع ملزم إلا عندما ترسل الشركة المنتجات للتوصيل. إشعارات تأكيد الطلب لا تُشكّل قبولًا.

6.3 يجوز للشركة رفض أي طلب أو إلغاؤه، كليًا أو جزئيًا، في أي وقت قبل التسليم، بما في ذلك على سبيل المثال لا الحصر في الحالات التالية: (أ) عدم توفر المنتج؛ (ب) وقوع خطأ في السعر أو الوصف؛ (ج) اشتباه الشركة، على نحو معقول، بأن المنتج مخصص لاستخدام تحظره هذه الشروط؛ (د) تعذّر التوصيل إلى العنوان المذكور؛ أو (هـ) سبق أن رفض المشتري الاستلام أو امتنع عن الدفع. لا تترتب أي مسؤولية على هذا الإلغاء.

6.4 يُشكّل إقرار الاستخدام البحثي المسجَّل عند إتمام الطلب، مع طابعه الزمني، دليلًا قاطعًا على قبولك لهذه الشروط فيما يخص ذلك الطلب.

## 7. الأسعار والدفع

7.1 جميع الأسعار مذكورة بالشيكل الإسرائيلي الجديد (ILS / ₪) وتشمل ضريبة القيمة المضافة بالنسبة السارية، وفقًا لما يقتضيه البند 17ب من قانون حماية المستهلك، 5741-1981. تُعرض رسوم التوصيل المطبّقة، إن وُجدت، قبل تقديم الطلب.

7.2 يتم الدفع حصريًا نقدًا عند الاستلام، بكامل المبلغ المذكور في تأكيد الطلب، لمندوب التوصيل عند التسليم الفعلي للمنتجات. لا تقبل الشركة الدفع ببطاقات الائتمان عبر الإنترنت ولا تجمع بيانات بطاقات الدفع أو الحسابات المصرفية.

7.3 لا تنتقل ملكية المنتجات إلى المشتري إلا عند استلام كامل المبلغ. تنتقل مخاطر الفقدان أو التلف إلى المشتري عند التسليم.

## 8. الإلغاء والرفض وعدم الدفع

8.1 يمكنك إلغاء الطلب دون أي رسوم في أي وقت قبل أن تتغير حالته إلى "قيد التوصيل"، وذلك بمراسلة الشركة على البريد الإلكتروني [${EMAIL}](mailto:${EMAIL}) مع ذكر رقم طلبك.

8.2 إذا رفضت الاستلام، أو لم تدفع كامل المبلغ عند التسليم، أو قدّمت عنوانًا أو رقم هاتف غير صحيح، أو تعذّر الوصول إليك بعد محاولتَي (2) توصيل معقولتين، يُلغى الطلب. تحتفظ الشركة بالحق في استرداد تكاليف التوصيل التي تكبّدتها على نحو معقول، وفي رفض الطلبات المستقبلية المرتبطة باسمك أو رقم هاتفك أو عنوانك.

8.3 دون المساس بالبندين 8.1 و8.2، إذا كنت مستهلكًا بالمعنى الوارد في قانون حماية المستهلك، 5741-1981، يجوز لك إلغاء صفقة البيع عن بُعد وفقًا للبند 14ج من ذلك القانون وأنظمة حماية المستهلك (إلغاء الصفقة)، 5771-2010، من تاريخ الصفقة وحتى أربعة عشر (14) يومًا من استلام المنتجات، مع مراعاة الاستثناءات القانونية، بما فيها البضائع القابلة للتلف بطبيعتها. إذا لم يكن الإلغاء بسبب عيب أو عدم مطابقة، يجوز للشركة فرض رسوم إلغاء لا تتجاوز خمسة بالمئة (5%) من سعر الصفقة أو 100 ₪، أيهما أقل. شروط إرجاع المنتجات، بما فيها أن يكون التغليف مختومًا وغير مفتوح، مبيّنة في [سياسة الشحن والإرجاع](/ar/legal/shipping-returns).

## 9. التوصيل

9.1 يتوفر التوصيل فقط داخل المناطق التي تخدمها الشركة، وفق ما يُؤكَّد معك قبل إرسال طلبك. مواعيد التوصيل المقدّرة إرشادية فقط ولا تُشكّل التزامًا ملزمًا.

9.2 يجب عليك فحص التغليف الخارجي عند التسليم، وإبلاغ مندوب التوصيل بأي تلف ظاهر أو عبث قبل قبول المنتجات. الشروط الإضافية مبيّنة في [سياسة الشحن والإرجاع](/ar/legal/shipping-returns).

## 10. التخزين والتعامل والسلامة

10.1 قد تكون الببتيدات والمركّبات المرتبطة بها حساسة للحرارة والضوء والرطوبة والتلوث. عند التسليم، يتحمّل المشتري وحده مسؤولية التخزين والتعامل ووضع الملصقات والتخلص من المنتجات على النحو السليم.

10.2 لا تتحمّل الشركة أي مسؤولية عن أي تدهور أو فقدان للفعالية أو تلوث يطرأ على المنتجات بعد التسليم.

## 11. السلوك المحظور

لا يجوز لك: (أ) استخدام الموقع لأي غرض غير مشروع؛ (ب) تقديم معلومات كاذبة أو انتحال صفة أي شخص؛ (ج) محاولة الوصول إلى طلبات أو بيانات أو وظائف إدارية لا تخصك، بما في ذلك عن طريق تخمين روابط الطلبات أو التلاعب بها؛ (د) التدخل في الموقع أو بنيته التحتية أو استخراج بياناته آليًا أو إجراء هندسة عكسية له أو تحميله فوق طاقته؛ أو (هـ) استخدام الموقع لطلب أو تبادل معلومات طبية أو معلومات عن الجرعات أو الاستهلاك.

## 12. الملكية الفكرية

اسم Pep Club وشعارها وتصميم الموقع ونصوصه ورسوماته وبرمجياته مملوكة للشركة أو مرخّصة لها، ومحمية بقوانين الملكية الفكرية. تبقى أسماء العلامات التجارية للأطراف الثالثة وشعاراتها ملكًا لأصحابها. لا يُمنح لك أي ترخيص سوى حق محدود وقابل للإلغاء وغير حصري في تصفّح الموقع لغرض تقديم الطلبات.

## 13. إخلاء المسؤولية عن الضمانات

13.1 إلى أقصى حد يسمح به القانون، يُقدَّم الموقع والمنتجات "كما هي" و"حسب توفرها". تُخلي الشركة صراحةً مسؤوليتها عن جميع الضمانات، الصريحة أو الضمنية، بما فيها أي ضمان ضمني بالقابلية للتسويق أو الملاءمة لغرض معيّن أو السلامة أو الفعالية أو عدم التعدي.

13.2 دون تقييد ما سبق، لا تقدّم الشركة أي إقرار أو ضمان بأن أي منتج آمن أو مناسب لأي استخدام غير البحث المختبري، أو بأنه سيتم التوصل إلى أي نتيجة بحثية.

## 14. تحديد المسؤولية

14.1 إلى أقصى حد يسمح به القانون المعمول به، لا تتحمّل الشركة ولا مديروها أو مسؤولوها أو موظفوها أو وكلاؤها أو مورّدوها أي مسؤولية عن أي أضرار غير مباشرة أو عرضية أو خاصة أو تبعية أو تأديبية أو عقابية، أو عن أي خسارة في الأرباح أو البيانات أو السمعة التجارية أو الفرص التجارية، تنشأ عن هذه الشروط أو الموقع أو المنتجات أو تتعلق بها، أيًا كان سببها ووفق أي نظرية للمسؤولية.

14.2 دون تقييد البند 14.1، لا تتحمّل الشركة أي مسؤولية على الإطلاق عن أي إصابة أو مرض أو وفاة أو ضرر يلحق بالأشخاص أو الحيوانات أو الممتلكات وينتج عن: (أ) أي إعطاء بشري أو بيطري لأي منتج أو استهلاكه؛ (ب) أي استخدام يخالف البندين 3 أو 4؛ (ج) التخزين أو التعامل أو التخلص غير السليم؛ أو (د) عدم امتثال المشتري للقانون المعمول به.

14.3 لا تتجاوز المسؤولية الإجمالية للشركة الناشئة عن أي طلب أو المتعلقة به المبلغ الذي دفعه المشتري فعليًا عن ذلك الطلب.

14.4 ليس في هذه الشروط ما يستثني أو يحدّ من أي مسؤولية لا يجوز استثناؤها أو تحديدها بموجب القانون المعمول به، بما في ذلك قانون حماية المستهلك، 5741-1981، وقانون المسؤولية عن المنتجات المعيبة، 5740-1980، وقانون العقود الموحّدة، 5743-1982.

## 15. التعويض

تلتزم بالدفاع عن الشركة ومديريها ومسؤوليها وموظفيها ووكلائها ومورّديها وتعويضهم وإبراء ذمتهم من أي وجميع المطالبات والمطالب والخسائر والالتزامات والأضرار والجزاءات والغرامات والتكاليف والنفقات (بما فيها أتعاب المحاماة المعقولة) الناشئة عن أو المتعلقة بما يلي: (أ) إخلالك بهذه الشروط، بما في ذلك أي إقرار أو ضمان وارد في البند 4؛ (ب) أي استخدام للمنتجات أو إساءة استخدامها أو إعادة بيعها أو إعطائها من قِبلك أو من قِبل أي شخص يحصل عليها عن طريقك؛ أو (ج) مخالفتك لأي قانون أو لحقوق أي طرف ثالث.

## 16. الخصوصية

يخضع جمع البيانات الشخصية ومعالجتها فيما يتعلق بالموقع وطلباتك لـ[سياسة الخصوصية](/ar/legal/privacy) الخاصة بنا.

## 17. القانون الواجب التطبيق والاختصاص القضائي

17.1 تخضع هذه الشروط وأي نزاع أو مطالبة تنشأ عنها أو تتعلق بها لقوانين دولة إسرائيل وتُفسَّر وفقًا لها، دون اعتبار لمبادئ تنازع القوانين.

17.2 تختص المحاكم المختصة في القدس حصريًا بالنظر في أي نزاع من هذا القبيل، إلا حيث يمنحك قانون إلزامي، بما في ذلك قانون حماية المستهلك، 5741-1981، الحق في رفع الدعوى في مكان آخر.

## 18. أحكام عامة

18.1 **التعديلات.** يجوز للشركة تعديل هذه الشروط في أي وقت بنشر نسخة معدّلة على الموقع. تسري على كل طلب النسخة النافذة وقت تقديمه.

18.2 **قابلية الفصل.** إذا اعتُبر أي حكم من أحكام هذه الشروط باطلًا أو غير قابل للتنفيذ، يُنفَّذ ذلك الحكم إلى أقصى حد مسموح به، وتبقى الأحكام الأخرى سارية المفعول بالكامل.

18.3 **عدم التنازل.** لا يُعدّ أي إخفاق أو تأخير من جانب الشركة في ممارسة أي حق تنازلًا عنه.

18.4 **اللغة.** تُنشر هذه الشروط باللغتين الإنجليزية والعربية. في حال وجود أي تعارض أو عدم اتساق بين النسختين، تسود النسخة الإنجليزية، إلى الحد الذي يسمح به القانون.

18.5 **الاتفاق الكامل.** تُشكّل هذه الشروط، مع السياسات المُدرجة فيها بالإحالة، الاتفاق الكامل بينك وبين الشركة بشأن موضوعها، وتحلّ محل جميع التفاهمات السابقة.

18.6 **التنازل عن الحقوق.** لا يجوز لك التنازل عن أي حقوق أو التزامات بموجب هذه الشروط أو نقلها دون موافقة خطية مسبقة من الشركة. يجوز للشركة التنازل عن حقوقها والتزاماتها لأي شركة تابعة أو خلف.

18.7 **القوة القاهرة.** لا تتحمّل الشركة مسؤولية أي تأخير أو إخفاق في الأداء ينتج عن أسباب خارجة عن سيطرتها المعقولة، بما في ذلك الإغلاقات وحظر التجول والحواجز وقيود الطرق والأحداث الأمنية والإضرابات والكوارث الطبيعية والإجراءات الحكومية.

## 19. التواصل

Pep Club · القدس · [${EMAIL}](mailto:${EMAIL})
`;

export const PRIVACY_AR = `**تاريخ السريان:** ${EFFECTIVE_AR}

## 1. مقدمة ونطاق السياسة

1.1 تصف سياسة الخصوصية هذه كيف تجمع Pep Club ("Pep Club" أو "نحن") البيانات الشخصية المتعلقة بزوّار الموقع pepclub.com ("الموقع") والمشترين عبره، وكيف تستخدمها وتخزّنها وتُفصح عنها وتحميها.

1.2 تصدر هذه السياسة وفقًا لقانون حماية الخصوصية الإسرائيلي، 5741-1981، بصيغته المعدّلة (بما في ذلك التعديل رقم 13)، والأنظمة الصادرة بموجبه، بما فيها أنظمة حماية الخصوصية (أمن المعلومات)، 5777-2017.

1.3 باستخدامك الموقع أو تقديمك طلبًا، فإنك تُقرّ بأنك قرأت هذه السياسة وفهمتها. للمصطلحات غير المعرّفة هنا المعنى الوارد في [شروط الخدمة](/ar/legal/terms).

## 2. المسؤول عن البيانات

المسؤول عن قاعدة البيانات التي تُحفظ فيها بياناتك الشخصية ومالكها هي Pep Club، القدس. يمكن توجيه الاستفسارات إلى [${EMAIL}](mailto:${EMAIL}).

## 3. البيانات الشخصية التي نجمعها

3.1 نجمع فقط البيانات الشخصية التي تقدّمها لنا بنفسك، على النحو التالي:

### إتمام الطلب

- **البيانات المجموعة:** الاسم الكامل؛ عنوان التوصيل؛ رقم الهاتف المحمول؛ ملاحظات التوصيل الاختيارية؛ الطابع الزمني لإقرار الاستخدام البحثي والعمر.
- **الغرض:** تنفيذ طلبات الدفع عند الاستلام؛ تواصل مندوب التوصيل؛ إثبات قبول الشروط.
- **الأساس القانوني:** تنفيذ العقد؛ الالتزام القانوني؛ المصلحة المشروعة في إثبات الامتثال.
- **مدة الاحتفاظ:** سبع (7) سنوات من تاريخ الطلب، أو وفق ما تقتضيه قوانين الضرائب والمحاسبة.

### نموذج التواصل / الملاحظات

- **البيانات المجموعة:** الاسم (اختياري)؛ البريد الإلكتروني؛ محتوى الرسالة.
- **الغرض:** الرد على استفسارك.
- **الأساس القانوني:** المصلحة المشروعة؛ طلبك.
- **مدة الاحتفاظ:** حتى حلّ الاستفسار، ولمدة لا تتجاوز اثني عشر (12) شهرًا.

### نموذج طلب البيانات

- **البيانات المجموعة:** نوع الطلب؛ البريد الإلكتروني؛ رقم الهاتف المستخدم في الطلبات السابقة؛ تفاصيل الطلب.
- **الغرض:** التحقق من الهوية وتلبية حقوق الخصوصية المقررة قانونًا.
- **الأساس القانوني:** الالتزام القانوني.
- **مدة الاحتفاظ:** ثلاث (3) سنوات من إغلاق الطلب، كدليل على الامتثال.

3.2 لا نجمع أرقام بطاقات الدفع أو تفاصيل الحسابات المصرفية أو أرقام الهويات الحكومية أو المعلومات الصحية أو أي معرّفات إعلانية أو معرّفات تتبّع عبر المواقع. لا ننشئ حسابات أو ملفات تعريفية للعملاء.

3.3 قد يعالج مزوّد الاستضافة لدينا تلقائيًا بيانات تقنية، مثل عنوان IP ونوع المتصفح وسجلات الطلبات، للأغراض المحدودة المتمثلة في تشغيل الموقع والحفاظ على أمنه ومنع إساءة استخدامه. لا نستخدم هذه البيانات لتحديد هوية الزوار أو تصنيفهم أو تتبّعهم.

## 4. كيف نستخدم البيانات الشخصية

4.1 نستخدم البيانات الشخصية فقط من أجل: (أ) معالجة طلباتك وتوصيلها وإدارتها؛ (ب) التواصل معك بشأن التوصيل أو الإلغاء أو مشكلات الطلب؛ (ج) الرد على الاستفسارات وطلبات البيانات؛ (د) الامتثال للالتزامات القانونية والضريبية والمحاسبية؛ (هـ) إثبات المطالبات القانونية أو ممارستها أو الدفاع عنها، بما في ذلك إثبات قبولك للشروط؛ و(و) حماية أمن الموقع وسلامته.

4.2 لا نبيع البيانات الشخصية ولا نؤجّرها ولا نتاجر بها. لا نستخدم البيانات الشخصية للتسويق المباشر أو اتخاذ القرارات الآلية أو التصنيف.

4.3 لست ملزمًا قانونًا بتقديم بياناتك الشخصية. لكن دون اسمك وعنوانك ورقم هاتفك لا يمكننا توصيل الطلب.

## 5. الإفصاح لأطراف ثالثة

5.1 نُفصح عن البيانات الشخصية فقط بالقدر اللازم، وفقط للفئات التالية من الجهات المتلقية:

- **Vercel, Inc.**: استضافة الموقع والحوسبة السحابية وتوزيع المحتوى وتخزين الصور (Vercel Blob). البيانات المعنية: البيانات التقنية؛ البيانات المرسلة عبر الموقع.
- **Neon, Inc.**: استضافة قاعدة البيانات. البيانات المعنية: سجلات الطلبات والاستفسارات وطلبات البيانات.
- **Resend, Inc.**: إرسال رسائل البريد الإلكتروني التشغيلية. البيانات المعنية: محتوى إشعارات الطلبات والرسائل المرسلة إلى مشغّل المتجر.
- **شركة التوصيل لدينا**: التوصيل الفعلي وتحصيل المبلغ نقدًا. البيانات المعنية: الاسم والعنوان ورقم الهاتف وملاحظات التوصيل ومبلغ الطلب.

5.2 يعالج كل مزوّد خدمة البيانات الشخصية نيابةً عنا ووفق تعليماتنا، مع خضوعه لالتزامات تعاقدية بالسرية والأمن.

5.3 قد نُفصح أيضًا عن البيانات الشخصية حيث يقتضي ذلك القانون أو أمر محكمة أو جهة مختصة، أو حيث يلزم ذلك لإثبات مطالبات قانونية أو ممارستها أو الدفاع عنها.

## 6. النقل الدولي للبيانات

يخزّن بعض مزوّدي الخدمات لدينا البيانات أو يعالجونها خارج إسرائيل، بما في ذلك في الولايات المتحدة. يتم هذا النقل وفقًا لأنظمة حماية الخصوصية (نقل البيانات إلى قواعد بيانات في الخارج)، 5761-2001، ومع ضمانات تعاقدية تُلزم الجهة المتلقية بحماية البيانات بمستوى لا يقل عمّا يقتضيه القانون المعمول به.

## 7. أمن البيانات

7.1 نطبّق تدابير تقنية وتنظيمية مناسبة لحماية البيانات الشخصية، منها: تشفير البيانات أثناء النقل (TLS) وأثناء التخزين؛ قصر الوصول الإداري على عدد محدود من الأشخاص المخوّلين باستخدام كلمات مرور مُشفّرة (hashed) وانتهاء صلاحية الجلسات والقفل عند تكرار محاولات الدخول الفاشلة؛ وحماية كل صفحة تأكيد طلب برمز وصول فريد وعشوائي تشفيريًا لا يمكن الوصول إلى الصفحة بدونه.

7.2 أنت مسؤول عن الحفاظ على سرية رابط تأكيد طلبك. يمكن لأي شخص يملك الرابط الاطلاع على تفاصيل الطلب الواردة فيه.

7.3 لا توجد وسيلة نقل أو تخزين آمنة تمامًا. في حال وقوع حادث أمني يؤثر على بياناتك الشخصية، سنتخذ التدابير ونُجري الإخطارات التي يقتضيها القانون المعمول به.

## 8. البيانات المخزّنة في متصفحك

8.1 للحفاظ على جلسة التسوق، يخزّن الموقع في متصفحك: (أ) المنتجات وكمياتها في سلة التسوق؛ (ب) مسودة مؤقتة لتفاصيل الطلب التي أدخلتها (الاسم والهاتف والعنوان)، تُحفظ فقط حتى إغلاق علامة تبويب المتصفح؛ و(ج) اختيارك بشأن ملفات تعريف الارتباط. تبقى هذه البيانات على جهازك، ولا تُرسل إلينا إلا عند تقديم الطلب، ولا تتضمن الأسعار.

8.2 إذا كنت تستخدم جهازًا مشتركًا أو عامًا، فعليك مسح هذه البيانات بعد الاستخدام بالنقر على "حذف البيانات من هذا المتصفح" في صفحة [سياسة ملفات تعريف الارتباط](/ar/legal/cookies)، حيث تجد أيضًا مزيدًا من المعلومات.

## 9. حقوقك

9.1 مع مراعاة القانون المعمول به، يحق لك: (أ) الاطلاع على البيانات الشخصية التي نحتفظ بها عنك؛ (ب) طلب تصحيح البيانات الشخصية غير الدقيقة أو غير الكاملة أو القديمة؛ و(ج) طلب حذف بياناتك الشخصية.

9.2 يمكن تقديم الطلبات عبر [صفحة طلب البيانات](/ar/data-request)، أو بالبريد الإلكتروني إلى [${EMAIL}](mailto:${EMAIL}).

9.3 لحماية بياناتك من الإفصاح غير المصرّح به، سنتحقق من هويتك قبل تنفيذ أي طلب، وذلك بإرسال تأكيد إلى البريد الإلكتروني أو رقم الهاتف المستخدم في الطلب المعني. يجوز لنا رفض أي طلب يتعذّر التحقق منه.

9.4 سنرد خلال المدة التي يحددها القانون، وفي جميع الأحوال خلال ثلاثين (30) يومًا. يجوز لنا الاحتفاظ ببعض البيانات رغم طلب الحذف حيث يقتضي القانون ذلك، بما في ذلك الالتزامات الضريبية والمحاسبية، أو حيث يلزم ذلك لإثبات مطالبات قانونية أو ممارستها أو الدفاع عنها. في هذه الحالات، يقتصر استخدام البيانات على تلك الأغراض.

9.5 إذا لم تكن راضيًا عن ردّنا، يمكنك تقديم شكوى إلى سلطة حماية الخصوصية في وزارة العدل الإسرائيلية أو إلى أي جهة رقابية مختصة أخرى.

## 10. القاصرون

الموقع غير موجّه للأشخاص دون الثامنة عشرة (18) من العمر، ولا نجمع عن علم بيانات شخصية منهم. إذا علمنا بتقديم مثل هذه البيانات، سنلغي الطلب المرتبط بها ونحذف البيانات، مع مراعاة البند 9.4.

## 11. التغييرات على هذه السياسة

قد نحدّث هذه السياسة من وقت لآخر. تُنشر النسخة المعدّلة على هذه الصفحة مع تاريخ سريان محدّث. سيُشار إلى التغييرات الجوهرية بشكل بارز على الموقع.

## 12. التواصل

Pep Club · القدس · [${EMAIL}](mailto:${EMAIL})
`;

export const LEGAL_PAGES = {
  terms: {
    titleEn: "Terms of Service",
    titleAr: "شروط الخدمة",
    bodyEn: TERMS_EN,
    bodyAr: TERMS_AR,
  },
  privacy: {
    titleEn: "Privacy Policy",
    titleAr: "سياسة الخصوصية",
    bodyEn: PRIVACY_EN,
    bodyAr: PRIVACY_AR,
  },
} as const;
