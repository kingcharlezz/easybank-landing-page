const motivationItems = [
  {
    iconPath: '/icons/notes-svgrepo-com.svg',
    title: 'Automated Note Taking',
    subtitle:
      'With our Automated note taking feature, you never have to attend class again! simply upload a video of your lecture and notes will automatically be taken for you.',
  },
  {
    iconPath: '/icons/robot-svgrepo-com.svg',
    title: 'Avoid AI Detection',
    subtitle:
      'Using new advancements in AI technology, we have a tool that is able to rewrite your essays to avoid detection by GPTZero and other AI detection software.',
  },
  {
    iconPath: 'icons/teacher-svgrepo-com.svg',
    title: 'Virtual Professor',
    subtitle:
      'Chat with a bot that is taught on the same material that is in your lecture. It is essentially a digital version of your professor that you can ask questions to.',
  },
  {
    iconPath: 'icons/cash-payment-solid-svgrepo-com.svg',
    title: 'Refferal Program',
    subtitle:
      'Refer a friend and get 1 month free per reffered friend. Join the AI revolution with your friends and get rewarded for it!',
  },
];

export default function Motivation() {
  return (
    <section className="py-14 bg-neutral-light-black lg:py-24">
      <div className="container text-center lg:text-left">
        <div className="grid lg:grid-cols-2 mb-12 lg:mb-16">
          <div className="col-span-1">
            <h2 className="text-3xl lg:text-4xl text-primary-black pb-5">
              Why choose NoteScribe?
            </h2>
            <p className="text-neutral-black lg:text-base leading-5">
              We leverage the latest in AI technology to help you learn and pass classes with less effort 
              than ever required before. We are the future of education.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-9 lg:gap-6 lg:grid-cols-4">
          {motivationItems.map((item) => (
            <div key={item.title} className="justify-center">
              <div className="flex justify-center lg:justify-start">
                <img src={item.iconPath} alt="" />
              </div>

              <h2 className="text-lg text-primary-black py-4 lg:pt-9 lg:pb-6 lg:text-xl lg:font-bold">
                {item.title}
              </h2>
              <p className="text-neutral-black font-light lg:text-base leading-5">
                {item.subtitle}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
