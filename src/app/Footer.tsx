import { ChevronRight, Github, Linkedin, Mail } from "lucide-react";
interface Props {
  className?: string;
}

const Footer: React.FC<Props> = ({ className = "" }) => {
  return (
    <footer className="fixed z-10 bottom-0 inset-x-0 border-t border-gray-800 bg-gray-900 h-12 flex items-center justify-between px-8">
      <div className="flex justify-center items-center gap-4">
        <a
          href="mailto:casperleerink@gmail.com"
          className="hover:text-beige transition-colors"
        >
          <Mail size={16} />
          {/* casperleerink@gmail.com */}
        </a>
        <a
          href="http://github.com/casperleerink/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="My Github"
          className="hover:text-beige transition-colors"
        >
          <Github size={16} />
        </a>
        <a
          href="https://www.linkedin.com/in/casper-leerink/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="My LinkedIn"
          className="hover:text-beige transition-colors"
        >
          <Linkedin size={16} />
        </a>
      </div>
      {/* <form className="flex gap-4 items-center">
        <input
          type="text"
          placeholder="Send me a message or ask a question"
          className="placeholder:text-gray-400/50 border-gray-400/10 border rounded bg-transparent text-gray-100 focus:outline-none px-4 py-1 focus:border-beige text-sm h-8 w-80"
        />
        <button
          role="button"
          className="w-8 rounded aspect-square flex items-center justify-center text-beige border hover:bg-beige hover:text-gray-800 transition-colors group"
        >
          <ChevronRight
            size={24}
            className="group-hover:translate-x-0.5 duration-300 transition-transform"
          />
        </button>
      </form> */}
    </footer>
  );
};

export default Footer;
