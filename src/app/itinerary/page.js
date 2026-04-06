import fs from 'node:fs/promises';
import path from 'node:path';
import Link from 'next/link';
import { ArrowLeft, CalendarDays, Clock3 } from 'lucide-react';

function renderInlineMarkdown(text) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);

  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={`${part}-${index}`}>{part.slice(2, -2)}</strong>;
    }

    return part;
  });
}

function parseItinerary(markdown) {
  const lines = markdown.split('\n');
  const title = lines.find((line) => line.startsWith('# '))?.slice(2) || 'Itinerary';
  const sections = [];
  const trailingNotes = [];
  let currentSection = null;

  for (const line of lines) {
    const trimmedLine = line.trim();

    if (!trimmedLine) continue;

    if (trimmedLine.startsWith('## ')) {
      if (currentSection) sections.push(currentSection);
      currentSection = { heading: trimmedLine.slice(3), items: [] };
      continue;
    }

    if (trimmedLine.startsWith('- ') && currentSection) {
      currentSection.items.push(trimmedLine.slice(2));
      continue;
    }

    if (currentSection) {
      trailingNotes.push(trimmedLine);
    }
  }

  if (currentSection) sections.push(currentSection);
  return { title, sections, trailingNotes };
}

export default async function ItineraryPage() {
  const itineraryPath = path.join(process.cwd(), 'src', 'content', 'itinerary.md');
  const markdown = await fs.readFile(itineraryPath, 'utf8');
  const { title, sections, trailingNotes } = parseItinerary(markdown);

  return (
    <div className="min-h-screen bg-[linear-gradient(120deg,_#f8fafc_0%,_#e0f2fe_35%,_#f8fafc_100%)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link href="/dashboard" className="inline-flex items-center text-blue-700 hover:text-blue-600 font-medium">
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Dashboard
          </Link>
        </div>

        <div className="bg-gradient-to-r from-slate-900 to-blue-900 rounded-2xl text-white p-6 sm:p-8 shadow-xl mb-6">
          <div className="flex items-center gap-3">
            <CalendarDays className="h-6 w-6 text-cyan-300" />
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{title}</h1>
          </div>
        </div>

        <div className="space-y-4">
          {sections.map((section) => (
            <section key={section.heading} className="bg-white/95 backdrop-blur-sm border border-white rounded-2xl shadow-md overflow-hidden">
              <div className="px-5 sm:px-6 py-4 border-b border-slate-200 bg-slate-50">
                <h2 className="text-lg sm:text-xl font-semibold text-slate-900">{section.heading}</h2>
              </div>
              <div className="px-5 sm:px-6 py-4 space-y-3">
                {section.items.map((item, index) => {
                  const match = item.match(/^([^-\n]+?)\s-\s(.+)$/);
                  const time = match ? match[1].trim() : '';
                  const detail = match ? match[2].trim() : item;

                  return (
                    <div key={`${section.heading}-${index}`} className="flex gap-3 sm:gap-4">
                      <div className="mt-1 h-2.5 w-2.5 rounded-full bg-blue-600 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-700 bg-blue-50 px-2 py-1 rounded-md">
                          <Clock3 className="h-3 w-3" />
                          {time}
                        </div>
                        <p className="text-slate-700 mt-1 break-words">{renderInlineMarkdown(detail)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          ))}

          {trailingNotes.map((note, index) => (
            <div key={`${note}-${index}`} className="bg-white/95 backdrop-blur-sm border border-white rounded-2xl shadow-md px-6 py-4 text-sm font-semibold text-slate-700 text-center">
              {renderInlineMarkdown(note)}
            </div>
          ))}

          {sections.length === 0 && (
            <div className="bg-white/95 backdrop-blur-sm border border-white rounded-2xl shadow-md px-6 py-10 text-center text-slate-500">
              No itinerary sections found in markdown file.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
