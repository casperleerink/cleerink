import { ExternalLinkIcon, GithubIcon } from "lucide-react";

export interface WorkItemProps {
  title: string;
  description: string;
  github?: string;
  website?: string;
}

export const WorkItem: React.FC<WorkItemProps> = ({
  title,
  description,
  github,
  website,
}) => {
  return (
    <li className="flex flex-col p-4 gap-4 rounded-lg md:rounded-xl border border-gray-500/10 bg-gray-800/30">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-lg">
          {website ? (
            <a href={website} target="_blank" rel="noopener noreferrer">
              {title}
            </a>
          ) : (
            title
          )}
        </h3>
        <div className="flex items-center gap-3">
          {github ? (
            <a
              href={github}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Github repo for ${title}`}
            >
              <GithubIcon size={20} />
            </a>
          ) : null}
          {website ? (
            <a
              href={website}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Visit ${title}`}
            >
              <ExternalLinkIcon size={20} />
            </a>
          ) : null}
        </div>
      </div>
      <p className="text-sm text-gray-500">{description}</p>
    </li>
  );
};
