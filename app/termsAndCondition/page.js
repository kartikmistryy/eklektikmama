import React from 'react';
import Link from 'next/link';
import Navbar from '@/app/components/Navbar';

const TermsAndConditions = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 mt-[10em]">
      <Navbar pageType="legal" />
      <h1 className="text-3xl font-bold mb-6">TERMS AND CONDITIONS</h1>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">1. Parties and Corporate Information</h2>
        <p className="mb-4">1.1 These Terms and Conditions (&quot;Terms&quot;) govern access to and use of https://eklektikmama.com (the &quot;Platform&quot;) and the services provided by Eklektik Mama Event Management – L.L.C. – S.P.C. (&quot;Company&quot;, &quot;we&quot;, &quot;us&quot;, &quot;our&quot;).</p>
        <p className="mb-4">1.2 Licensing Authority: Abu Dhabi Department of Economic Development (ADDED).</p>
        <p className="mb-4">1.3 Trade Licence No.: CN-5428275.</p>
        <p className="mb-4">1.4 VAT TRN: Not applicable.</p>
        <p className="mb-4">1.5 Registered Address: Office 1530, Darussalam Tower, Al Danah E5, Abu Dhabi, United Arab Emirates.</p>
        <p className="mb-4">1.6 By using the Platform you confirm that you have read, understood, and agreed to be bound by these Terms and our Privacy Policy.</p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">2. Eligibility</h2>
        <p className="mb-4">2.1 Users must have legal capacity under UAE law (21 lunar years of age or older) or use with valid guardian authority.</p>
        <p>2.2 We may require verification of identity and eligibility and may refuse, suspend, or terminate access where eligibility cannot be established.</p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">3. Licence of Use</h2>
        <p className="mb-4">3.1 We grant a limited, revocable, non-transferable licence for lawful, personal, non-commercial use of the Platform.</p>
        <p>3.2 All rights not expressly granted are reserved by the Company.</p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">4. Prohibited Conduct</h2>
        <p className="mb-4">Users shall not:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>(a) scrape, copy, resell, reverse engineer, decompile, or otherwise interfere with the Platform;</li>
          <li>(b) upload or transmit malware, viruses, or spam, or circumvent security or access controls;</li>
          <li>(c) harass, abuse, threaten, defame, or use slurs or discriminatory language;</li>
          <li>(d) upload obscene, defamatory, infringing, or otherwise unlawful content;</li>
          <li>(e) infringe any intellectual property or proprietary rights;</li>
          <li>(f) redistribute, resell, share, or otherwise disseminate Digital Downloads, merchandise designs, or member-only content;</li>
          <li>(g) misuse Community channels, including unsolicited commercial messages or recruitment without our prior written consent;</li>
          <li>(h) create accounts by automated means or misrepresent identity or affiliation.</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">5. Community Rules and Enforcement</h2>
        <p className="mb-4">5.1 Conduct within Community groups must be respectful, lawful, and consistent with any Code of Conduct we publish.</p>
        <p className="mb-4">5.2 We may monitor, moderate, suspend, or terminate accounts and remove content at our discretion and without prior notice.</p>
        <p>5.3 In serious cases, including but not limited to intellectual property theft, threats of harm, harassment, or fraudulent conduct, we may pursue civil and/or criminal remedies and report such conduct to authorities.</p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">6. Membership</h2>
        <p className="mb-4">6.1 Memberships may renew automatically unless cancelled prior to renewal.</p>
        <p className="mb-4">6.2 Cancellation is effective at the end of the current term; access continues until the term ends.</p>
        <p className="mb-4">6.3 No mid-term refunds are granted, except where required by UAE consumer law.</p>
        <p>6.4 We may modify membership benefits or pricing effective on renewal. Where required by law, we will provide reasonable prior notice and an opportunity to cancel before renewal.</p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">7. Events (including BYOBaby®)</h2>
        <p className="mb-4">7.1 Bookings are confirmed once cleared payment is received.</p>
        <p className="mb-4">7.2 Parents/guardians retain full and exclusive legal responsibility for their children at all times, including where childcare, sitters, or facilitators are present. Sitters act only in a supportive capacity and not as legal guardians.</p>
        <p className="mb-4">7.3 Attendees must comply with all health and safety instructions.</p>
        <p className="mb-4">7.4 Events may be photographed or recorded. Consent for use of images/recordings in our marketing is collected at registration via an opt-out checkbox. Attendees may also opt out by notifying us at hello@eklektikmama.com or upon arrival at the event.</p>
        <p className="mb-4">7.5 If the Company cancels an event, a refund or credit shall be provided. If the user cancels or fails to attend, no refund shall be due unless required by law.</p>
        <p>7.6 Participation is voluntary, and attendees assume all ordinary and foreseeable risks inherent in attending community or family events, to the extent permitted by law.</p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">8. Merchandise</h2>
        <p className="mb-4">8.1 Prices are stated in AED. Banks or card issuers may impose additional charges.</p>
        <p className="mb-4">8.2 If merchandise is defective, damaged, or mis-described, you must notify us at hello@eklektikmama.com within seven (7) days of receipt with proof and photographs.</p>
        <p className="mb-4">8.3 Remedies include repair, replacement, or refund in accordance with UAE consumer law.</p>
        <p className="mb-4">8.4 Claims submitted after seven (7) days may be rejected, given supplier timeframes.</p>
        <p className="mb-4">8.5 Returns for change of mind, incorrect sizing, or user error are not accepted.</p>
        <p>8.6 Title and risk pass on delivery to the address you provide. You are responsible for any applicable customs duties, import taxes, and carrier fees.</p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">9. Digital Downloads</h2>
        <p className="mb-4">9.1 Digital content is licensed for personal, non-transferable, non-commercial use only.</p>
        <p className="mb-4">9.2 Redistribution, resale, unauthorised sharing, public posting, or alteration of watermarks or DRM is prohibited.</p>
        <p className="mb-4">9.3 No refunds are provided once a digital file has been delivered, except where the file is defective and cannot reasonably be remedied.</p>
        <p>9.4 We may deploy technical measures to prevent piracy and enforce licence terms.</p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">10. Payments</h2>
        <p className="mb-4">10.1 Payments are processed via authorised third-party processors (e.g., Stripe). We do not store full card details.</p>
        <p className="mb-4">10.2 Multiple transactions may result in multiple postings to your card statement.</p>
        <p className="mb-4">10.3 You are responsible for any bank or card issuer fees.</p>
        <p>10.4 We may re-present unpaid amounts and set off sums owed, to the extent permitted by law.</p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">11. Service Availability</h2>
        <p className="mb-4">11.1 Services may be interrupted for maintenance, upgrades, or technical reasons. While we will use reasonable efforts to notify users in advance, uninterrupted availability is not guaranteed.</p>
        <p>11.2 We are not liable for temporary downtime, service errors, disruptions, or delays attributable to maintenance, upgrades, or technical issues, to the extent permitted by law.</p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">12. Intellectual Property</h2>
        <p className="mb-4">12.1 All content on the Platform is the property of the Company or its licensors.</p>
        <p className="mb-4">12.2 The marks Eklektik Mama® and BYOBaby® are proprietary wordmarks protected under UAE and international law.</p>
        <p>12.3 Unauthorised use constitutes infringement and may result in injunctive relief, damages, and/or criminal sanctions.</p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">13. Liability</h2>
        <p className="mb-4">13.1 The Services are provided &quot;as is&quot; and &quot;as available&quot; without warranties, except where expressly required by law.</p>
        <p className="mb-4">13.2 To the maximum extent permitted by law, we exclude liability for indirect, incidental, consequential, special, or punitive damages, including loss of profits, goodwill, or data.</p>
        <p className="mb-4">13.3 We are not responsible for user conduct, community content, or third-party websites linked from the Platform.</p>
        <p>13.4 Nothing in these Terms excludes or limits liability that cannot be excluded under UAE law, including liability for death or personal injury caused by negligence.</p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">14. Indemnity</h2>
        <p>You shall indemnify and hold harmless the Company, its officers, employees, agents, and representatives from and against all claims, damages, liabilities, losses, costs, and expenses (including reasonable legal fees) arising out of or in connection with your breach of these Terms, misuse of the Services, or infringement of third-party rights.</p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">15. Governing Law and Dispute Resolution</h2>
        <p className="mb-4">15.1 These Terms are governed by the laws of the United Arab Emirates.</p>
        <p className="mb-4">15.2 Any dispute shall be resolved by arbitration under the Abu Dhabi International Arbitration Centre (ADIAC) Arbitration Rules 2024, with the seat in Abu Dhabi and the language of proceedings being English.</p>
        <p>15.3 Undisputed payment defaults may alternatively be referred to the Abu Dhabi Global Market Small Claims Tribunal.</p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">16. Termination</h2>
        <p className="mb-4">16.1 We may suspend or terminate access immediately upon breach, attempted security compromise, unlawful activity, or regulatory requirement.</p>
        <p className="mb-4">16.2 You may terminate by discontinuing use of the Services and closing your account.</p>
        <p>16.3 Provisions intended to survive termination shall remain enforceable.</p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">17. Notices</h2>
        <p>All notices shall be validly given by email to hello@eklektikmama.com or by publication on the Platform. You consent to receive communications electronically.</p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">18. Amendments</h2>
        <p>We may amend these Terms by publishing a revised version on the Platform. Continued use after publication constitutes acceptance.</p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">19. Entire Agreement</h2>
        <p>These Terms, together with the Privacy Policy, constitute the entire agreement and supersede all prior agreements, representations, and understandings.</p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">20. Force Majeure</h2>
        <p>We shall not be liable for delay or failure to perform due to causes beyond our reasonable control, including but not limited to acts of God, epidemic or pandemic, government action, labour disputes, supplier or carrier failure, utility interruptions, or network outages.</p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">21. Assignment</h2>
        <p>You may not assign or transfer your rights or obligations under these Terms without our prior written consent. We may assign or transfer our rights and obligations to an affiliate or in connection with a merger, acquisition, or sale of assets.</p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">22. Severability</h2>
        <p>If any provision of these Terms is found invalid, illegal, or unenforceable, the remaining provisions shall continue in full force and effect.</p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">23. No Waiver</h2>
        <p>No failure or delay by the Company to exercise any right or remedy shall operate as a waiver thereof, nor shall any single or partial exercise preclude further exercise of any other right or remedy.</p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">24. Language and Precedence</h2>
        <p>These Terms are prepared in English. If an Arabic translation is provided, the English version prevails to the extent permitted by law.</p>
      </section>

      <section className="mt-12 pt-8 border-t border-gray-200">
        <h2 className="text-xl font-semibold mb-4">Contact:</h2>
        <p className="mb-2">Eklektik Mama Event Management – L.L.C. – S.P.C.</p>
        <p className="mb-2">Office 1530, Darussalam Tower, Al Danah E5, Abu Dhabi, UAE</p>
        <p>Email: <a href="mailto:hello@eklektikmama.com" className="text-blue-600 hover:underline">hello@eklektikmama.com</a></p>
      </section>
    </div>
  );
};

export default TermsAndConditions;