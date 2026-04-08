import Image from "next/image";

export const Story = () => {
  return (
    <main className="flex flex-col  py-20 leading-none">
      {/* Image Section */}
      <section className="w-full h-[500px]">
        <Image
          src="/home/beehive-branch.webp"
          alt="Story Image"
          width={1000}
          height={1000}
        />
      </section>
      {/* Text Section */}
      <section className="w-1/2 h-[500px] px-[110px] flex flex-col gap-4">
        <h2 className="text-left font-clashdisplay text-[60px] font-semibold">
          Our <br /> Story
        </h2>
        <p className="text-left font-normal font-poppins text-[18px] text-black">
          With years of expertise in the IT industry, we pride ourselves on
          delivering innovative and reliable technology solutions to businesses
          of all sizes. From seamless IT infrastructure management to
          cutting-edge software development, our team combines technical
          proficiency with a customer-first approach to meet your unique needs.
        </p>

        <button
          type="button"
          className="rounded-md px-4 py-2 text-black transition-colors hover:bg-(--orange) hover:text-white"
        >
          learn more
        </button>
      </section>
    </main>
  );
};
