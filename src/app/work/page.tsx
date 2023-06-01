import { Github, Link } from "lucide-react";
import Block from "../../components/Block";

export default function Home() {
  return (
    <main>
      <div className="relative w-full h-screen grid place-items-center px-6">
        <ul className="flex flex-col items-start gap-4">
          <li className="flex items-center gap-8">
            <span>React Matters (Library, alpha stage)</span>
            <a
              href="https://github.com/casperleerink/react-matters"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Github />
            </a>
          </li>
          <li className="flex items-center gap-8">
            <span>The Beauty of Places</span>
            <a
              href="https://github.com/casperleerink/places"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Github />
            </a>
            <a
              href="https://thebeautyofplaces.com/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Link />
            </a>
          </li>
          <li className="flex items-center gap-8">
            <span>Hoooman Studio</span>
            <a
              href="https://github.com/Hooman-studio"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Github />
            </a>
            <a
              href="https://hoooman.com/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Link />
            </a>
          </li>
        </ul>
      </div>
    </main>
  );
}
