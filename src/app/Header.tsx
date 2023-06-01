import Link from "next/link";

interface Props {
  className?: string;
}

const Header: React.FC<Props> = ({ className = "" }) => {
  return (
    <header className="fixed w-full flex items-center justify-center top-8 left-0 z-10 h-16 max-w-screen-2xl mx-auto 2xl:border-l 2xl:border-r 2xl:border-gray-800">
      <div className="flex py-3 px-4 w-fit items-center justify-between md:min-w-[25rem] bg-gray-800 rounded-full shadow-[0px_0px_16px] shadow-white/5">
        <Link href="/" className="flex gap-2 items-center">
          <span className="w-8 h-8 rounded-full bg-gradient-to-br from-beige from-15% to-deepblue to-80%" />
          <span className="text-2xl">Casper</span>
        </Link>
        <nav className="flex items-center gap-4 text-base">
          <Link href="/me">About me</Link>
          <Link href="/work">Work</Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;
