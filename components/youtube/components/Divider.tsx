import {
  ArrowUpOnSquareIcon,
  ClipboardDocumentIcon,
  ClipboardDocumentListIcon,
} from "@heroicons/react/24/outline";
import { toast } from "react-toastify";
import { parseChaptersFromSummary, extractVideoId } from "../utils";

export default function Divider({
  summary,
  url,
  shortenFn,
  darkMode,
}: {
  summary: string;
  url: string;
  shortenFn: (e: any) => void;
  darkMode: boolean;
}): JSX.Element {
  let summaryClean = summary;

  let buttonClass = darkMode
    ? 'bg-dark-gray inline-flex items-center gap-x-1.5 rounded-full px-3 py-1.5 text-sm font-semibold text-neutral-white shadow-sm ring-1 ring-inset ring-gray-300'
    : 'bg-neutral-white inline-flex items-center gap-x-1.5 rounded-full px-3 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300';
  let iconClass = darkMode
    ? '-ml-1 -mr-0.5 h-5 w-5 text-neutral-white'
    : '-ml-1 -mr-0.5 h-5 w-5 text-primary-black';

  return (
    <div className={`relative ${darkMode ? 'bg-dark-900' : 'bg-white'}`}>
      <div className={`absolute inset-0 flex items-center ${darkMode ? 'border-gray-600' : 'border-gray-300'}`} aria-hidden="true" style={{zIndex: 1}}>
        <div className={`w-full border-t ${darkMode ? 'border-gray-600' : 'border-gray-300'}`} />
      </div>
      <div className="relative flex justify-center" style={{zIndex: 10}}>
      <div className={`inline-flex space-x-5 ${darkMode ? 'bg-dark-900' : 'bg-transparent'}`}>
          {summaryClean.length > 0 ? (
            <button
              type="button"
              title="Shorten the summary again"
              className={buttonClass}
              onClick={(e) => {
                toast.success("Shortening the summary again...");
                shortenFn(e);
              }}
            >
              <ClipboardDocumentIcon
                className={iconClass}
                aria-hidden="true"
              />
              Shorten
            </button>
          ) : null}
          <button
            type="button"
            title="Copy the summary markdown to your clipboard"
            className={buttonClass}
            onClick={() => {
              if (summaryClean.length === 0) {
                toast.error("Please generate a summary first");
                return;
              }
              navigator.clipboard.writeText(summaryClean);
              toast.success("Copied the markdown summary to clipboard!");
            }}
          >
            <ClipboardDocumentIcon
              className={iconClass}
              aria-hidden="true"
            />
            Copy Summary
          </button>
          <button
            type="button"
            title="Copy the chapters markdown to your clipboard, leave this as a comment on the video to automatically generate chapters for everyone who watches the video"
            className={buttonClass}
            onClick={() => {
              if (summaryClean.length === 0) {
                toast.error("Please generate a summary first");
                return;
              }
              const chapters = parseChaptersFromSummary(summaryClean);
              navigator.clipboard.writeText(
                chapters +
                  `\n\nPowered by NoteScribe
                    url
                  )}`
              );
              toast.success(
                `Copied formatted chapters for this YouTube video! Share the love and leave them as a comment to help others add structure to the content`
              );
            }}
          >
            <ClipboardDocumentListIcon
              className={iconClass}
              aria-hidden="true"
            />
            Copy Chapters
          </button>
          <button
            type="button"
            title="Copy the link to this summary to your clipboard"
            className={buttonClass}
            onClick={() => {
              if (summaryClean.length === 0) {
                toast.error("Please generate a summary first");
                return;
              }
              const videoId = extractVideoId(url);
              navigator.clipboard.writeText(
                `https://magic.example.com/youtube?v=${videoId}`
              );
              toast.success("Link copied a shareable magic link to clipboard!");
            }}
          >
            <ArrowUpOnSquareIcon
              className={iconClass}
              aria-hidden="true"
            />
            Share
          </button>
        </div>
      </div>
    </div>
  );
}
