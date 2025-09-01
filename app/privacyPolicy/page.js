import Link from 'next/link';

export default function PrivacyPolicy() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
      
      <p className="text-sm text-gray-600 mb-8">Last Updated: August 30, 2025</p>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
        <p className="mb-4">
          1.1 This Privacy Policy (&quot;Policy&quot;) sets out the manner in which Eklektik Mama Event Management – L.L.C. – S.P.C. (&quot;Eklektik Mama&quot;, &quot;Company&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) collects, processes, stores, shares and protects Personal Data in connection with the operation of the website located at <a href="https://eklektikmama.com" className="text-blue-600 hover:underline">https://eklektikmama.com</a> (the &quot;Platform&quot;), together with all associated membership services, digital downloads, merchandise sales, community groups, and events, including but not limited to those branded as BYOBaby® (collectively, the &quot;Services&quot;).
        </p>
        <p className="mb-4">
          1.2 This Policy is issued in compliance with Federal Decree-Law No. 45 of 2021 on the Protection of Personal Data (PDPL), the Consumer Protection Law (Federal Law No. 15 of 2020), Cabinet Decision No. 66 of 2023 (Executive Regulations), and applicable international standards.
        </p>
        <p>
          1.3 Use of the Platform is also subject to our <Link href="/terms-of-service" className="text-blue-600 hover:underline">Terms and Conditions</Link>, which must be read in conjunction with this Policy.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">2. Data Controller and Corporate Information</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li><span className="font-semibold">Controller:</span> Eklektik Mama Event Management – L.L.C. – S.P.C.</li>
          <li><span className="font-semibold">Licensing Authority:</span> Abu Dhabi Department of Economic Development (ADDED)</li>
          <li><span className="font-semibold">Trade Licence No.:</span> CN-5428275</li>
          <li><span className="font-semibold">Registered Address:</span> Office 1530, Darussalam Tower, Al Danah E5, Abu Dhabi, United Arab Emirates</li>
          <li><span className="font-semibold">VAT TRN:</span> Not applicable at present</li>
          <li><span className="font-semibold">Privacy Contact:</span> Simone Anahid Mazloumian – <a href="mailto:hello@eklektikmama.com" className="text-blue-600 hover:underline">hello@eklektikmama.com</a></li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">3. Definitions</h2>
        <p className="mb-4">For the purposes of this Policy:</p>
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <dt className="font-semibold">Personal Data</dt>
            <dd className="mb-3">means any information relating to an identified or identifiable natural person.</dd>
            
            <dt className="font-semibold">Membership</dt>
            <dd className="mb-3">means any free or paid subscription to the Services.</dd>
            
            <dt className="font-semibold">Events</dt>
            <dd className="mb-3">includes all in-person and virtual events organised or hosted by the Company.</dd>
          </div>
          <div>
            <dt className="font-semibold">Digital Downloads</dt>
            <dd className="mb-3">means electronic content purchased or accessed via the Platform.</dd>
            
            <dt className="font-semibold">Merchandise</dt>
            <dd className="mb-3">means physical goods offered for sale on the Platform.</dd>
            
            <dt className="font-semibold">Community</dt>
            <dd className="mb-3">means forums, WhatsApp groups, or similar communication channels administered by the Company.</dd>
          </div>
          <div>
            <dt className="font-semibold">Visitor</dt>
            <dd className="mb-3">means any individual accessing the Platform without registration.</dd>
            
            <dt className="font-semibold">Registered User</dt>
            <dd className="mb-3">means any individual who has created an account or subscribed.</dd>
          </div>
          <div>
            <dt className="font-semibold">Wordmarks</dt>
            <dd>refers to the registered and/or protected marks Eklektik Mama® and BYOBaby®.</dd>
          </div>
        </dl>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">4. Categories of Personal Data Collected</h2>
        <h3 className="text-xl font-medium mb-3">4.1 Direct Collection:</h3>
        <ol className="list-decimal pl-6 mb-6 space-y-3">
          <li><span className="font-medium">Registration/Membership:</span> name, email address, password (encrypted), telephone number, subscription status, and profile details.</li>
          <li><span className="font-medium">Events:</span> attendee details (name, email, telephone number); for family events, limited child data (first name/initials, age band, and allergy or medical information) provided by a parent or guardian.</li>
          <li><span className="font-medium">Merchandise:</span> billing and shipping addresses, order history.</li>
          <li><span className="font-medium">Digital Downloads:</span> billing data, IP address, download tokens/logs.</li>
          <li><span className="font-medium">Communications and Community:</span> messages, reports, uploaded content, moderation data.</li>
          <li><span className="font-medium">Photography/Video:</span> images and recordings taken at events, subject to consent obtained at registration.</li>
        </ol>
        <h3 className="text-xl font-medium mb-3">4.2 Automatic Collection:</h3>
        <p>IP address, browser type, operating system, device identifiers, usage data, cookies and analytics information.</p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">5. Purposes and Legal Bases of Processing</h2>
        <p className="mb-4">5.1 We process Personal Data for the following purposes:</p>
        <ol className="list-disc pl-6 space-y-2">
          <li><span className="font-medium">Contractual Necessity:</span> provision of Membership, Events, Merchandise, Digital Downloads and customer support.</li>
          <li><span className="font-medium">Legal Obligation:</span> compliance with accounting, tax, consumer protection, and other statutory requirements.</li>
          <li><span className="font-medium">Legitimate Interests:</span> maintaining Platform security, preventing fraud, enforcing intellectual property rights, investigating misuse, and improving Services.</li>
          <li><span className="font-medium">Vital Interests:</span> protection of the health and safety of event participants.</li>
          <li><span className="font-medium">Consent:</span> marketing communications, non-essential cookies, and photography/video at events.</li>
        </ol>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">6. Children&apos;s Data</h2>
        <p className="mb-4">6.1 The Services are primarily intended for adults. Where child data is collected for event purposes, such data is limited, strictly necessary, and supplied by a parent or guardian.</p>
        <p>6.2 Parents/guardians retain full legal responsibility for their children, even when childcare or sitters are present at events.</p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">7. Disclosures</h2>
        <p className="mb-4">Personal Data may be disclosed to:</p>
        <ol className="list-disc pl-6 space-y-2">
          <li>third-party processors (including Stripe, hosting and analytics providers, mailing platforms);</li>
          <li>event venues and partners, where registration requires;</li>
          <li>community participants in WhatsApp/Facebook groups (your contact number may be visible);</li>
          <li>professional advisers and government authorities as legally required.</li>
        </ol>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">8. International Transfers</h2>
        <p>Cross-border transfers may occur. Where such transfers take place, appropriate safeguards (e.g. contractual clauses, technical protections) are implemented.</p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">9. Data Retention</h2>
        <ol className="list-disc pl-6 space-y-2">
          <li><span className="font-medium">Membership:</span> duration of account plus two (2) years.</li>
          <li><span className="font-medium">Orders/Finance:</span> seven (7) years.</li>
          <li><span className="font-medium">Event safety records:</span> two (2) years, unless longer retention required.</li>
          <li><span className="font-medium">Marketing:</span> until consent withdrawn or twenty-four (24) months of inactivity.</li>
          <li><span className="font-medium">Community records:</span> retained as necessary for enforcement and moderation.</li>
        </ol>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">10. Cookies</h2>
        <p>Essential cookies are required for site operation. Non-essential cookies (e.g. Google Analytics, Meta Pixel) are used only with consent. See our separate Cookie Notice.</p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">11. Security</h2>
        <p>Appropriate administrative, technical, and organisational safeguards are applied, including encryption and access controls. No system is infallible.</p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">12. Rights of Data Subjects</h2>
        <p>Under PDPL, you may request access, rectification, erasure, restriction, portability, objection, and withdrawal of consent. Complaints may be filed with the UAE Data Office. Requests should be directed to <a href="mailto:hello@eklektikmama.com" className="text-blue-600 hover:underline">hello@eklektikmama.com</a>.</p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">13. Event Photography/Video</h2>
        <p>Consent is collected at registration via a checkbox. Attendees who decline consent will be excluded from marketing imagery. Opt-out requests may also be made by email or upon arrival at the event.</p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">14. Breach Notification</h2>
        <p>Any personal data breach that may affect rights or freedoms will be reported to the UAE Data Office and affected individuals without undue delay.</p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">15. Amendments</h2>
        <p>This Policy may be updated periodically. Continued use of the Platform following publication constitutes acceptance of the revised Policy.</p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">16. Contact</h2>
        <p className="font-semibold">Eklektik Mama Event Management – L.L.C. – S.P.C.</p>
        <p>Office 1530, Darussalam Tower, Al Danah E5, Abu Dhabi, UAE</p>
        <p>Email: <a href="mailto:hello@eklektikmama.com" className="text-blue-600 hover:underline">hello@eklektikmama.com</a></p>
      </section>
    </div>
  );
}