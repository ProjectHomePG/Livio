import Link from 'next/link';

import { buildPageMetadata } from '../../lib/seo';

export const metadata = buildPageMetadata({
  title: 'Privacy Policy',
  description:
    'How Livio PG Near Me collects, uses, stores, and protects your personal information when you search, list, or contact us.',
  path: '/privacy-policy',
});

const SECTIONS = [
  {
    heading: '1. Information we collect',
    body: [
      'We collect information you provide directly to us and information generated when you use the platform.',
    ],
    list: [
      'Account details: name, email address, phone number, and role (seeker, owner, or admin) when you register.',
      'Listing and inquiry details: property information you publish as a host, and the name, contact details, and message you send when you submit an inquiry or contact us.',
      'Technical data: browser type, device information, IP address, and pages visited, collected automatically for security and performance.',
      'Preferences: your theme selection and login session are stored locally in your browser.',
    ],
  },
  {
    heading: '2. How we use your information',
    body: ['We use the information we collect to:'],
    list: [
      'Create and manage your account, and keep you signed in securely.',
      'Display listings, respond to inquiries, and connect seekers with hosts.',
      'Send transactional messages related to your account or inquiries.',
      'Detect, prevent, and investigate fraud, abuse, or security incidents.',
      'Improve the platform, including search relevance, performance, and new features.',
    ],
  },
  {
    heading: '3. Sharing your information',
    body: [
      'We do not sell your personal information. We share it only in these situations:',
    ],
    list: [
      'With hosts: when you submit an inquiry on a property, your name, email, phone, and message are shared with that listing\'s owner so they can respond.',
      'With seekers: when you publish a listing, its details and your contact information are visible to users browsing the platform.',
      'With service providers: hosting, analytics, and infrastructure vendors who process data on our behalf under confidentiality obligations.',
      'When required by law: to comply with a legal process, regulation, or enforceable government request.',
    ],
  },
  {
    heading: '4. Cookies and local storage',
    body: [
      'PG Near Me uses local storage to remember your theme preference (light or dark) and to keep you signed in with a session token. We use cookies only where necessary for authentication and basic analytics. You can clear these through your browser settings at any time; doing so will sign you out and reset your preferences.',
    ],
  },
  {
    heading: '5. Data security',
    body: [
      'We protect your information with industry-standard measures, including encrypted transport (HTTPS), hashed passwords, and role-based access controls on our admin and owner dashboards. No method of transmission or storage is completely secure, so we cannot guarantee absolute security.',
    ],
  },
  {
    heading: '6. Data retention',
    body: [
      'We keep account information for as long as your account is active. Inquiry and contact messages are retained so hosts and our support team can follow up. You can request deletion of your account and associated personal data at any time by contacting us.',
    ],
  },
  {
    heading: '7. Your rights',
    body: ['You can:'],
    list: [
      'Access and review the personal data we hold about you.',
      'Correct inaccurate or incomplete information.',
      'Request deletion of your account and personal data.',
      'Opt out of non-essential communications.',
    ],
  },
  {
    heading: '8. Children\'s privacy',
    body: [
      'PG Near Me is not directed at children under 18, and we do not knowingly collect personal information from them. If you believe a child has provided us with data, contact us and we will delete it.',
    ],
  },
  {
    heading: '9. Changes to this policy',
    body: [
      'We may update this Privacy Policy from time to time. The "Last updated" date below shows when it was last revised. Continued use of PG Near Me after changes means you accept the updated policy.',
    ],
  },
];

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <header className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm p-8 sm:p-12 space-y-3">
        <span className="text-xs font-bold uppercase tracking-widest text-primary-600 dark:text-primary-400">
          Legal
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
          Privacy Policy
        </h1>
        <p className="text-xs text-slate-400">Last updated: 3 October 2026</p>
        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          This policy explains what we collect when you use PG Near Me, how we use it, and the choices
          you have. By using the platform, you agree to the practices described here.
        </p>
      </header>

      <article className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm p-6 sm:p-10 space-y-8">
        {SECTIONS.map((section) => (
          <section key={section.heading} className="space-y-3">
            <h2 className="text-base font-black text-slate-900 dark:text-white">
              {section.heading}
            </h2>
            {section.body.map((paragraph) => (
              <p
                key={paragraph}
                className="text-sm leading-relaxed text-slate-600 dark:text-slate-400"
              >
                {paragraph}
              </p>
            ))}
            {section.list && (
              <ul className="list-disc pl-5 space-y-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                {section.list.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            )}
          </section>
        ))}

        <section className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-700">
          <h2 className="text-base font-black text-slate-900 dark:text-white">
            10. Contact us
          </h2>
          <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
            Questions about this policy or your data? Email us at{' '}
            <a href="mailto:support@bestpgnearme.com" className="text-primary-600 hover:underline">
              support@bestpgnearme.com
            </a>{' '}
            or use the{' '}
            <Link href="/contact-us" className="text-primary-600 hover:underline">
              contact form
            </Link>
            .
          </p>
        </section>
      </article>
    </div>
  );
}
