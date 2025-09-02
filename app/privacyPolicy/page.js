import Link from 'next/link';
import Navbar from '@/app/components/Navbar';

export default function PrivacyPolicy() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4x mt-[10em]">
      <Navbar pageType="legal" />
      <h1 className="text-3xl font-bold mb-6">PRIVACY POLICY</h1>
      
      <p className="text-sm text-gray-600 mb-8">Last Updated: August 30, 2025</p>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
        <p className="mb-4">
          This Privacy Policy (&quot;Policy&quot;) sets out how Eklektik Mama Event Management – L.L.C. – S.P.C. (&quot;Company&quot;, &quot;we&quot;, &quot;us&quot;, &quot;our&quot;) collects, uses, stores, shares, and protects personal data in connection with the website https://eklektikmama.com (the &quot;Platform&quot;), and associated services including membership, events (including BYOBaby®), community groups, merchandise sales, and digital downloads.
        </p>
        <p>
          This Policy complies with Federal Decree-Law No. 45 of 2021 on the Protection of Personal Data (PDPL), the Consumer Protection Law (Federal Law No. 15 of 2020), and applicable international standards. Use of the Platform is also subject to our Terms and Conditions.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">2. Corporate Information and Eligibility</h2>
        <p className="mb-2">Controller: Eklektik Mama Event Management – L.L.C. – S.P.C.</p>
        <p className="mb-2">Licensing Authority: Abu Dhabi Department of Economic Development (ADDED)</p>
        <p className="mb-2">Trade Licence No.: CN-5428275</p>
        <p className="mb-2">VAT TRN: Not applicable</p>
        <p className="mb-2">Registered Address: Office 1530, Darussalam Tower, Al Danah E5, Abu Dhabi, UAE</p>
        <p className="mb-4">Privacy Contact: Simone Anahid Mazloumian – hello@eklektikmama.com</p>
        <p>The Services are intended for users 21 lunar years of age or older. Where minors access Services, guardian consent and responsibility is required.</p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">3. Categories of Data Collected</h2>
        <p className="mb-2">Registration/Membership: name, email, password, contact number.</p>
        <p className="mb-2">Events: attendee details; limited child data (initials, age, allergies/medical information) provided by a parent or guardian.</p>
        <p className="mb-2">Merchandise: billing/shipping address, order details.</p>
        <p className="mb-2">Digital Downloads: billing data, device/IP logs.</p>
        <p className="mb-2">Community: messages, reports, moderation logs.</p>
        <p className="mb-2">Communications: email, customer service correspondence.</p>
        <p className="mb-2">Payments: billing data processed via Stripe (we do not store full card details).</p>
        <p className="mb-2">Photography/Video: images and recordings of events, subject to opt-out consent.</p>
        <p>Automatic Data: IP, browser, device identifiers, cookies, and analytics data.</p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">4. Purposes and Legal Bases</h2>
        <p className="mb-4">Personal data is processed for:</p>
        <p className="mb-2">Contractual necessity (delivery of Services, fulfilment of orders).</p>
        <p className="mb-2">Legal obligation (consumer law, accounting, taxation).</p>
        <p className="mb-2">Legitimate interests (security, community enforcement, IP protection, service improvement).</p>
        <p className="mb-2">Vital interests (health and safety at events).</p>
        <p className="mb-4">Consent (marketing communications, non-essential cookies, photography/recordings).</p>
        <p>We may process user data to investigate, suspend, or terminate accounts for violations of our Terms and Conditions, including abuse of Community channels, harassment, or infringement of intellectual property rights.</p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">5. Children&apos;s Data</h2>
        <p>We only collect limited child data necessary for Events. Parents/guardians remain legally responsible for their children at all times, even when childcare or sitters are present.</p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">6. Disclosures and Transfers</h2>
        <p className="mb-4">Personal data may be shared with:</p>
        <p className="mb-2">Service providers (Stripe, hosting, analytics, email).</p>
        <p className="mb-2">Event partners and venues where required.</p>
        <p className="mb-2">Other users in Community groups (contact number visibility).</p>
        <p className="mb-4">Professional advisers and regulators where legally required.</p>
        <p>Data may be transferred cross-border subject to safeguards.</p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">7. Retention</h2>
        <p className="mb-2">Membership data: account duration plus two years.</p>
        <p className="mb-2">Financial/order records: seven years.</p>
        <p className="mb-2">Event safety records: two years or longer if required.</p>
        <p className="mb-2">Marketing data: until withdrawal of consent or 24 months of inactivity.</p>
        <p className="mb-2">Community/moderation data: as long as reasonably necessary.</p>
        <p>Returns: processed in accordance with our seven (7) day defective-goods notification window.</p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">8. Cookies and Payments</h2>
        <p className="mb-4">Essential cookies are required for functionality. Optional cookies (Google Analytics, Meta Pixel) are used only with consent.</p>
        <p>Payments are processed via authorised providers. Multiple transactions may result in multiple postings to the cardholder&apos;s statement. Users are responsible for any bank or issuer fees.</p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">9. Security</h2>
        <p>We implement technical and organisational safeguards, including encryption and access controls. No system is entirely secure.</p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">10. Intellectual Property and Enforcement</h2>
        <p>We may process data to investigate harassment, abuse, community misuse, or infringement of our protected marks Eklektik Mama® and BYOBaby®.</p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">11. Rights of Data Subjects</h2>
        <p>You may exercise rights under the PDPL including access, rectification, erasure, restriction, portability, objection, and withdrawal of consent. Requests should be sent to hello@eklektikmama.com. You may also lodge complaints with the UAE Data Office.</p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">12. Event Photography and Recordings</h2>
        <p>Consent for photography and video is collected via an opt-out checkbox at registration. Users may also opt out by email or on arrival.</p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">13. Breach Notification</h2>
        <p>We will notify the UAE Data Office and affected individuals without undue delay of any data breach likely to impact rights and freedoms.</p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">14. Liability</h2>
        <p>Nothing in this Policy limits or excludes liability as set out in our Terms and Conditions. Users remain responsible for lawful use of Services and indemnifying the Company against misuse.</p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">15. Governing Law</h2>
        <p>This Policy shall be governed by and construed in accordance with the laws of the United Arab Emirates. Disputes shall be resolved in accordance with the Terms and Conditions.</p>
      </section>

      <section className="mt-12 pt-8 border-t border-gray-200">
        <h2 className="text-xl font-semibold mb-4">Contact:</h2>
        <p className="mb-2">Eklektik Mama Event Management – L.L.C. – S.P.C.</p>
        <p className="mb-2">Office 1530, Darussalam Tower, Al Danah E5, Abu Dhabi, UAE</p>
        <p>Email: <a href="mailto:hello@eklektikmama.com" className="text-blue-600 hover:underline">hello@eklektikmama.com</a></p>
      </section>
    </div>
  );
}