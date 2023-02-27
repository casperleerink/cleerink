interface Props {
  className?: string;
}

const Header: React.FC<Props> = ({ className = "" }) => {
  return (
    <header className="fixed z-10 right-6 top-6">
      <button className="block w-10 space-y-3">
        <div className="w-full h-0.5 bg-beige rounded"></div>
        <div className="w-full h-0.5 bg-beige rounded"></div>
      </button>
    </header>
  );
};

export default Header;
