import Link from "next/link";
export default function Footer() {
  return (
    <footer className="bg-primary-indigo py-10">
      <div className="container">
        <div className="text-center grid grid-cols-1 justify-items-center gap-6 lg:grid-cols-12 lg:gap-0">
          <div className="flex flex-col justify-between lg:justify-self-start lg:col-span-3">
            <h1 className="text-4xl mb-7 text-white">© NoteScribe</h1> {/* This line has been edited */}
            <div className="flex justify-center items-center">
              
              <svg
                className="text-white hover:text-green-400 fill-current cursor-pointer ml-4"
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
              >
                <title>Instagram</title>
                <path d="M10.333 1.802c2.67 0 2.987.01 4.042.059 2.71.123 3.976 1.409 4.1 4.099.048 1.054.057 1.37.057 4.04 0 2.672-.01 2.988-.058 4.042-.124 2.687-1.386 3.975-4.099 4.099-1.055.048-1.37.058-4.042.058-2.67 0-2.986-.01-4.04-.058-2.717-.124-3.976-1.416-4.1-4.1-.048-1.054-.058-1.37-.058-4.041 0-2.67.01-2.986.058-4.04.124-2.69 1.387-3.977 4.1-4.1 1.054-.048 1.37-.058 4.04-.058zm0-1.802C7.618 0 7.278.012 6.211.06 2.579.227.56 2.242.394 5.877.345 6.944.334 7.284.334 10s.011 3.057.06 4.123c.166 3.632 2.181 5.65 5.816 5.817 1.068.048 1.408.06 4.123.06 2.716 0 3.057-.012 4.124-.06 3.628-.167 5.651-2.182 5.816-5.817.049-1.066.06-1.407.06-4.123s-.011-3.056-.06-4.122C20.11 2.249 18.093.228 14.458.06 13.39.01 13.049 0 10.333 0zm0 4.865a5.135 5.135 0 100 10.27 5.135 5.135 0 000-10.27zm0 8.468a3.333 3.333 0 110-6.666 3.333 3.333 0 010 6.666zm5.339-9.87a1.2 1.2 0 10-.001 2.4 1.2 1.2 0 000-2.4z" />
              </svg>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-2 py-1 lg:grid-rows-3 text-white lg:text-left lg:justify-self-start lg:col-span-5 lg:gap-x-24 lg:grid-flow-col-dense">
            <a className="hover:text-green-400" href="mailto:charlie@notescribe.ai">
              Contact
            </a>
            <a className="hover:text-green-400" href="mailto:support@notescribe.ai">
              Support
            </a>
            <a className="hover:text-green-400" href="/privacy-policy.pdf" download>
              Privacy Policy
            </a>
          </div>

          <div className="flex flex-col justify-between items-center lg:items-end lg:justify-self-end lg:col-span-4">
          <Link href="../signup">
              <span style={{ padding: '0.5rem 1rem', border: 'none', borderRadius: '0.25rem', fontSize: '1.25rem', fontWeight: 'normal', color: '#fff', backgroundColor: '#444', cursor: 'pointer' }}>
                Signup
              </span>
            </Link>

            <p className="text-white text-sm">
              © NoteScribe. All Rights Reserved
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
