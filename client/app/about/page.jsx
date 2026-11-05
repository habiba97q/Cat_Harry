import Link from 'next/link';

export const metadata = {
  title: 'About StudioSpace',
  description: 'Learn how StudioSpace connects independent creative spaces with the people who need them.',
};

export default function AboutPage() {
  return (
    <article className="mx-auto max-w-3xl space-y-12 py-10">
      <header className="space-y-4">
        <p className="font-semibold uppercase tracking-wide text-primary">About StudioSpace</p>
        <h1 className="text-4xl font-extrabold">Space to make something great.</h1>
        <p className="text-lg leading-relaxed text-gray-500">
          StudioSpace helps creators find and request time in independent photography studios, sound stages,
          podcast rooms, music suites, and art workshops.
        </p>
        <Link href="/studios" className="btn btn-primary">Explore studios</Link>
      </header>

      <section className="space-y-3">
        <h2 className="text-2xl font-bold">How bookings work</h2>
        <p className="leading-relaxed text-gray-600">
          A customer selects a date and time and submits a request. The host reviews availability and can
          confirm or cancel the request. Overlapping pending or confirmed requests are not accepted. Booking
          payments are not processed through StudioSpace.
        </p>
      </section>

      <section id="terms" className="space-y-3">
        <h2 className="text-2xl font-bold">Terms of use</h2>
        <p className="leading-relaxed text-gray-600">
          Use accurate account and listing information. Hosts are responsible for the information they publish
          and for coordinating access to their spaces. Customers and hosts should communicate booking changes
          promptly. StudioSpace does not provide payment processing or guarantee third-party listings.
        </p>
      </section>

      <section id="privacy" className="space-y-3">
        <h2 className="text-2xl font-bold">Privacy</h2>
        <p className="leading-relaxed text-gray-600">
          StudioSpace stores account details, studio listings, reviews, and booking requests to operate the
          service. Authentication uses an HTTPOnly session cookie. Do not submit sensitive payment information;
          the service does not process payments.
        </p>
      </section>
    </article>
  );
}
