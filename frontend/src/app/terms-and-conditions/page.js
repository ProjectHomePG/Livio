import Link from 'next/link';

import { buildPageMetadata } from '../../lib/seo';

export const metadata = buildPageMetadata({
  title: 'Terms & Conditions',
  description:
    'The terms that govern your use of Livio PG Near Me, including accounts, property listings, enquiries, and acceptable conduct.',
  path: '/terms-and-conditions',
});

const SECTIONS = [
  {
    heading: '1. Acceptance of terms',
    body: [
      'By accessing or using PG Near Me, you agree to these Terms & Conditions and our Privacy Policy. If you do not agree, please do not use the platform.',
    ],
  },
  {
    heading: '2. Eligibility and accounts',
    body: [
      'You must be at least 18 years old to use PG Near Me. You are responsible for maintaining the confidentiality of your login credentials and for all activity under your account. Provide accurate information during registration and keep it up to date. Notify us immediately if you suspect unauthorized use of your account.',
    ],
  },
  {
    heading: '3. Our role',
    body: [
      'PG Near Me is a listing and discovery platform. We do not own, operate, or manage any PG or co-living property listed on the site, and we are not a party to any agreement between a seeker and a host. Listings, pricing, availability, and house rules are provided by the hosts themselves.',
    ],
  },
  {
    heading: '4. Listings and inquiries',
    body: [
      'Hosts must have the right to list a property and ensure their content is accurate, current, and not misleading. When a seeker submits an inquiry, their name, email, phone, and message are shared with the host so the host can respond. Any terms for a stay, including rent, deposit, notice period, and house rules, are agreed directly between the seeker and the host.',
    ],
  },
  {
    heading: '5. Acceptable use',
    body: ['You agree not to:'],
    list: [
      'Post false, fraudulent, or infringing listings or inquiries.',
      'Use PG Near Me for spam, phishing, or unsolicited marketing.',
      'Attempt to gain unauthorized access to other accounts, systems, or data.',
      'Scrape, copy, or resell platform content without written permission.',
      'Interfere with the platform\'s operation, including introducing malware or overloading our systems.',
      'Impersonate another person or misrepresent your affiliation.',
    ],
  },
  {
    heading: '6. Intellectual property',
    body: [
      'The PG Near Me name, logo, design, and software are owned by us and protected by applicable intellectual property laws. Hosts retain ownership of the content they upload but grant PG Near Me a worldwide, non-exclusive licence to display, reproduce, and promote that content on the platform.',
    ],
  },
  {
    heading: '7. Termination',
    body: [
      'We may suspend or terminate your access to PG Near Me at any time if you breach these terms, create risk for other users, or if required by law. You may close your account at any time by contacting us.',
    ],
  },
  {
    heading: '8. Disclaimers',
    body: [
      'PG Near Me is provided on an "as is" and "as available" basis. We do not warrant that listings are complete or accurate, that the platform will be uninterrupted or error-free, or that any property will meet your expectations. Any visit, agreement, or payment arranged through a listing is at your own risk.',
    ],
  },
  {
    heading: '9. Limitation of liability',
    body: [
      'To the maximum extent permitted by law, PG Near Me and its team shall not be liable for indirect, incidental, or consequential damages, or for any loss of profits, data, or goodwill arising from your use of the platform. Our total liability for any claim relating to the platform shall not exceed the amount you paid us in the twelve months before the claim.',
    ],
  },
  {
    heading: '10. Indemnity',
    body: [
      'You agree to indemnify and hold PG Near Me harmless from claims, losses, and expenses arising from your listings, your content, your misuse of the platform, or your breach of these terms.',
    ],
  },
  {
    heading: '11. Governing law',
    body: [
      'These terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts in Bengaluru, Karnataka.',
    ],
  },
  {
    heading: '12. Changes to these terms',
    body: [
      'We may revise these terms from time to time. The "Last updated" date below reflects the latest revision. Continued use of PG Near Me after changes means you accept the revised terms.',
    ],
  },
];

export default function TermsAndConditionsPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <header className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm p-8 sm:p-12 space-y-3">
        <span className="text-xs font-bold uppercase tracking-widest text-primary-600 dark:text-primary-400">
          Legal
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
          Terms &amp; Conditions
        </h1>
        <p className="text-xs text-slate-400">Last updated: 3 October 2026</p>
        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          These terms govern your use of PG Near Me. Please read them carefully before creating an
          account, publishing a listing, or submitting an inquiry.
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
            13. Contact us
          </h2>
          <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
            Questions about these terms? Email{' '}
            <a href="mailto:support@bestpgnearme.com" className="text-primary-600 hover:underline">
              support@bestpgnearme.com
            </a>{' '}
            or reach us through the{' '}
            <Link href="/contact-us" className="text-primary-600 hover:underline">
              contact page
            </Link>
            .
          </p>
        </section>
      </article>
    </div>
  );
}
