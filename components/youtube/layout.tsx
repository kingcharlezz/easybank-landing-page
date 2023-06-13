const title = "NoteScribe";
const description =
  "Discover NoteScribe, an AI-powered platform that revolutionizes learning by converting uploaded files and YouTube videos into comprehensive notes, making the need to physically attend classes a thing of the past. With NoteScribe, students can enjoy an enriched, flexible learning journey right from the comfort of their home, breaking away from traditional classroom constraints.";

export const metadata = {
  title,
  description,
  openGraph: {
    title,
    description,
    images: [
      {
        url: "/youtube.png",
        width: 800,
        height: 600,
      },
    ],
  },
  twitter: {
    cardType: "summary_large_image",
    title,
    description,
    creator: "@jxnlco",
    images: ["https://magic.jxnl.co/youtube.png"],
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <div className="py-24 sm:py-32 m-auto">{children}</div>;
}
