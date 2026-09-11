import Image from "next/image"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Container } from "./container"

const faqs = [
  {
    question: "What types of properties do you sell?",
    answer:
      "Every listing on this board is published directly by a broker, so the mix changes as they add new ones. Each entry carries its own title, city, asking price and photo set, and you can filter the board by location or price before you start reading through them.",
  },
  {
    question: "How do I know if a property is a good investment?",
    answer:
      "Compare the asking price against other listings in the same city using the price sort, then contact the broker for the details that are not on the board, such as documentation, taxes and the condition of the property.",
  },
  {
    question: "Do I need to hire a real estate agent?",
    answer:
      "No. Every listing shows the broker who published it along with their company and phone number, so you can approach them directly once you create a free buyer account.",
  },
  {
    question: "What's the process for buying a property?",
    answer:
      "Browse the public listings, open the ones that interest you, and call the broker listed on the detail page. The board is where the property is advertised; the negotiation and paperwork happen between you and the broker.",
  },
  {
    question: "Can I tour a property before purchasing?",
    answer:
      "Viewings are arranged by the broker who owns the listing. Their contact details sit on the property detail page, which is visible once you sign in as a buyer.",
  },
]

export function FaqSection({ imageUrl }: { imageUrl?: string }) {
  return (
    <section id="faq" className="scroll-mt-20 py-16 md:py-24">
      <Container>
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <h2 className="max-w-sm text-3xl leading-[1.15] font-medium tracking-tight text-neutral-900 sm:text-4xl">
            Frequently asked questions
          </h2>
          <p className="max-w-md text-sm leading-relaxed text-neutral-500">
            Our answers explain how the board works, who publishes the listings,
            and what happens after you find a property worth a closer look.
          </p>
        </div>

        <Accordion
          type="single"
          collapsible
          defaultValue="faq-0"
          className="mt-10 space-y-3"
        >
          {faqs.map((faq, index) => (
            <AccordionItem
              key={faq.question}
              value={`faq-${index}`}
              className="rounded-2xl border border-neutral-200 px-5 data-[state=open]:bg-[#f5f7f3]"
            >
              <AccordionTrigger className="py-5 text-base text-neutral-900 [&>svg]:text-neutral-400">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="pb-5">
                <div className="flex gap-6">
                  <p className="max-w-2xl text-sm leading-relaxed text-neutral-600">
                    {faq.answer}
                  </p>

                  {index === 0 && imageUrl && (
                    <div className="relative hidden h-24 w-40 shrink-0 overflow-hidden rounded-xl lg:block">
                      <Image
                        src={imageUrl}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="160px"
                      />
                    </div>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </Container>
    </section>
  )
}
