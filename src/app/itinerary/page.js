import fs from 'node:fs/promises';
import path from 'node:path';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

function renderMarkdownLine(line, index) {
  if (line.startsWith('# ')) {
    return <h1 key={index} className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2">{line.slice(2)}</h1>;
  }

  if (line.startsWith('## ')) {
    return <h2 key={index} className="text-xl sm:text-2xl font-semibold text-slate-800 mt-6">{line.slice(3)}</h2>;
  }

  if (line.startsWith('- ')) {
    return (
      <li key={index} className="text-slate-700 leading-7 ml-5 list-disc">
        {line.slice(2)}
      </li>
    );
  }

  if (!line.trim()) {
    return <div key={index} className="h-2" />;
  }

  return <p key={index} className="text-slate-700 leading-7">{line}</p>;
}

export default async function ItineraryPage() {
  const itineraryPath = path.join(process.cwd(), 'src', 'content', 'itinerary.md');
  const markdown = await fs.readFile(itineraryPath, 'utf8');
  const lines = markdown.split('\n');

  return (
    <div className="min-h-screen bg-[linear-gradient(120deg,_#f8fafc_0%,_#e0f2fe_35%,_#f8fafc_100%)]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link href="/dashboard" className="inline-flex items-center text-blue-700 hover:text-blue-600 font-medium">
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Dashboard
          </Link>
        </div>

        <div className="bg-white/95 backdrop-blur-sm border border-white rounded-2xl shadow-xl p-5 sm:p-8">
          <div className="space-y-1">
            {lines.map((line, index) => renderMarkdownLine(line, index))}
          </div>
        </div>
      </div>
    </div>
  );
}
