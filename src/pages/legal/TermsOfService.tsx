import { LegalPageLayout } from '@/components/LegalPageLayout';

const TermsOfService = () => (
  <LegalPageLayout
    title="Terms of Service"
    lastUpdated="2026-06-08"
    sections={[
      {
        id: 'agreement',
        title: '1. Agreement to terms',
        content: (
          <p>
            By accessing and using the EduFleet website and application, you accept and agree to be bound by and
            comply with these terms. If you do not agree, please do not use the service.
          </p>
        ),
      },
      {
        id: 'license',
        title: '2. Use license',
        content: (
          <>
            <p>
              Permission is granted to temporarily download one copy of the materials on EduFleet for personal,
              non-commercial transitory viewing only. This is a license, not a transfer of title, and under it you
              may not:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Modify or copy the materials</li>
              <li>Use the materials for any commercial purpose or for public display</li>
              <li>Decompile or reverse engineer any software on the site</li>
              <li>Remove any copyright or proprietary notations from the materials</li>
              <li>Transfer the materials to another person or mirror them on another server</li>
            </ul>
          </>
        ),
      },
      {
        id: 'user-responsibilities',
        title: '3. Your responsibilities',
        content: (
          <ul className="list-disc pl-6 space-y-2">
            <li>Keep your account and password confidential.</li>
            <li>Accept responsibility for all activity that occurs under your account.</li>
            <li>Provide accurate and truthful information when creating your account.</li>
            <li>Do not use the service for any illegal or unauthorized purpose.</li>
          </ul>
        ),
      },
      {
        id: 'disclaimer',
        title: '4. Disclaimer',
        content: (
          <p>
            The materials on EduFleet are provided on an &quot;as is&quot; basis. EduFleet makes no warranties,
            expressed or implied, and disclaims all other warranties including implied warranties of merchantability,
            fitness for a particular purpose, or non-infringement.
          </p>
        ),
      },
      {
        id: 'limitations',
        title: '5. Limitations',
        content: (
          <p>
            In no event shall EduFleet or its suppliers be liable for any damages (including loss of data, profit,
            or business interruption) arising out of the use or inability to use the materials on EduFleet, even if
            EduFleet has been notified of the possibility of such damage.
          </p>
        ),
      },
      {
        id: 'accuracy',
        title: '6. Accuracy of materials',
        content: (
          <p>
            The materials appearing on EduFleet could include technical, typographical, or photographic errors.
            EduFleet does not warrant that any of the materials are accurate, complete, or current, and may change
            them at any time without notice.
          </p>
        ),
      },
      {
        id: 'third-party',
        title: '7. Third-party content',
        content: (
          <p>
            EduFleet has not reviewed every site linked to its website and is not responsible for the contents of
            any linked site. The inclusion of any link does not imply endorsement. Use of any linked website is at
            your own risk.
          </p>
        ),
      },
      {
        id: 'modifications',
        title: '8. Modifications',
        content: (
          <p>
            EduFleet may revise these terms of service at any time. By continuing to use this website you agree to
            be bound by the then-current terms.
          </p>
        ),
      },
      {
        id: 'governing-law',
        title: '9. Governing law',
        content: (
          <p>
            These terms are governed by and construed in accordance with the laws of India, and you irrevocably
            submit to the exclusive jurisdiction of the courts of Bengaluru, Karnataka.
          </p>
        ),
      },
      {
        id: 'contact',
        title: '10. Contact us',
        content: (
          <p>
            Questions about these terms? Email <strong>legal@edufleetexchange.com</strong>.
          </p>
        ),
      },
    ]}
  />
);

export default TermsOfService;
