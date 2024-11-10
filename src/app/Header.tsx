import Image from "next/image";
import Link from "next/link";

interface Props {
  className?: string;
}

const Header: React.FC<Props> = ({ className = "" }) => {
  return (
    <div className="fixed w-full top-8 inset-x-0 z-10">
      <header className="relative px-4 w-full flex items-center justify-center h-16 max-w-screen-2xl mx-auto 2xl:border-l 2xl:border-r 2xl:border-gray-800">
        <div className="flex py-2 px-3 w-full items-center justify-between gap-8 max-w-[25rem] sm:w-[25rem] bg-gray-800 rounded-full border border-beige/5">
          <Link href="/" className="flex gap-2 items-center focus:outline-none">
            <div className="relative w-8 h-8 rounded-full border-2 border-beige/20">
              <Image
                src="https://res.cloudinary.com/casperleerink/image/upload/v1607865933/headshot.jpg"
                alt="Headshot of me!"
                fill
                sizes="64px"
                className="object-cover rounded-full"
              />
            </div>
            <span className="text-xl">Casper</span>
          </Link>
          <nav className="flex items-center gap-4 text-base text-gray-500">
            {/* <Link href="/me" className="hover:text-gray-100 transition-colors">
              Me
            </Link> */}
            <Link
              href="/blog"
              className="hover:text-gray-100 transition-colors"
            >
              Blog
            </Link>
            <Link
              href="/work"
              className="hover:text-gray-100 transition-colors"
            >
              Work
            </Link>
          </nav>
        </div>
      </header>
    </div>
  );
};

export default Header;
