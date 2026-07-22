import type { ContactContent } from "lib/content";
import ContactForm from "components/ContactForm";

export default function ContactSection({
  contactContent,
}: {
  contactContent: ContactContent;
}) {
  return (
    <section>
      <div className="mx-auto max-w-2xl px-6 py-16">
        <h2 className="text-2xl font-semibold text-primary-foreground">Contact</h2>
        <div className="mt-1 h-1 w-16 bg-accent rounded-none" />
        <p className="mt-4 text-tertiary">
          Get in touch to schedule a consultation or ask any questions.
        </p>
        <ContactForm contactContent={contactContent} />
      </div>
    </section>
  );
}
