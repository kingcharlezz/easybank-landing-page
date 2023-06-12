export default function Hero() {
  return (
    <section id="hero" className="relative">
      <div key="bg-header-mobile" className="bg-header-mobile bg-custom-mobile-header-size absolute w-full h-full bg-no-repeat lg:hidden"></div>
      <div key="bg-header-desktop" className="bg-header-desktop absolute w-full h-full bg-no-repeat hidden lg:block bg-left -right-42.6%"></div>
      <div key="bg-image-mockups" className="bg-image-mockups absolute z-20 w-full h-full bg-no-repeat bg-top -top-12 md:-top-16 bg-custom-mobile-mockup-size lg:hidden"></div>
      <div className="container h-screen relative z-20">
        <div className="h-full flex flex-col justify-end pb-4 lg:pb-0 lg:w-96 lg:justify-center">
          <div className="h-1/2 flex flex-col justify-center items-center text-center lg:items-start lg:text-left">
            <h1 className="text-4xl lg:text-5xl text-primary-black pb-5">
            Revolutionize your learning 
            </h1>
            <p className="text-neutral-black text-xs lg:text-base leading-5 mb-7">
            The Student Ally AI Suite will be your one-stop solution for automated note taking, rewriting AI-composed essays to avoid detection, 
            and answering course-specific questions, plus so much more.
            </p>
            <button className="bg-primary-bright-cyan px-7 py-3 rounded-full text-neutral-white text-xs bg-gradient-to-r from-primary-bright-cyan to-primary-bright-cyan hover:button-brightness mb-7 focus:outline-none focus:ring ring-green-400">
              Request Invite
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}