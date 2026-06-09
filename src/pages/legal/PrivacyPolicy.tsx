import { LegalPageLayout } from '@/components/LegalPageLayout';

const PrivacyPolicy = () => (
  <LegalPageLayout
    title="Privacy Policy"
    lastUpdated="2026-06-08"
    sections={[
      {
        id: 'introduction',
        title: '1. Introduction',
        content: (
          <p>
            EduFleet Exchange (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;, or &quot;Company&quot;) operates
            the EduFleet website and mobile application. This page informs you of our policies regarding the
            collection, use, and disclosure of personal data when you use our Service and the choices you have
            associated with that data.
          </p>
        ),
      },
      {
        id: 'information-collection',
        title: '2. Information collection and use',
        content: (
          <>
            <p>We collect several different types of information for various purposes:</p>
            <h3 className="text-xl font-semibold text-slate-900 mt-4 mb-2">Personal data</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Email address</li>
              <li>First name and last name</li>
              <li>Phone number</li>
              <li>Address, state, ZIP/postal code, city</li>
              <li>Cookies and usage data</li>
              <li>Payment information (processed securely)</li>
            </ul>
            <h3 className="text-xl font-semibold text-slate-900 mt-4 mb-2">Usage data</h3>
            <p>
              We may also collect information on how the Service is accessed and used (&quot;Usage Data&quot;). This
              may include information such as your computer&apos;s Internet Protocol address (e.g. IP address),
              browser type, browser version, the pages you visit, the time and date of your visit, the time spent on
              those pages, and other diagnostic data.
            </p>
          </>
        ),
      },
      {
        id: 'use-of-data',
        title: '3. Use of data',
        content: (
          <>
            <p>EduFleet uses the collected data for various purposes:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>To provide and maintain the Service</li>
              <li>To notify you about changes to our Service</li>
              <li>To allow you to participate in interactive features of our Service</li>
              <li>To provide customer care and support</li>
              <li>To gather analysis or valuable information so that we can improve our Service</li>
              <li>To monitor the usage of our Service</li>
              <li>To detect, prevent and address technical issues and fraud</li>
            </ul>
          </>
        ),
      },
      {
        id: 'security',
        title: '4. Security of data',
        content: (
          <p>
            The security of your data is important to us, but remember that no method of transmission over the
            Internet or method of electronic storage is 100% secure. While we strive to use commercially acceptable
            means to protect your personal data, we cannot guarantee its absolute security.
          </p>
        ),
      },
      {
        id: 'your-rights',
        title: '5. Your rights under the DPDP Act, 2023',
        content: (
          <>
            <p>
              If you are a data principal in India, you have the right to access, correct, erase, and port your
              personal data. To exercise any of these rights, email{' '}
              <strong>privacy@edufleetexchange.com</strong> from the address tied to your account.
            </p>
            <p>
              Where processing is based on consent (e.g. marketing communications), you may withdraw consent at any
              time without affecting the lawfulness of prior processing.
            </p>
          </>
        ),
      },
      {
        id: 'changes',
        title: '6. Changes to this policy',
        content: (
          <p>
            We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new
            Privacy Policy on this page and updating the &quot;Last updated&quot; date at the top.
          </p>
        ),
      },
      {
        id: 'contact',
        title: '7. Contact us',
        content: (
          <p>
            If you have any questions about this Privacy Policy, please contact us at{' '}
            <strong>privacy@edufleetexchange.com</strong>.
          </p>
        ),
      },
    ]}
  />
);

export default PrivacyPolicy;
