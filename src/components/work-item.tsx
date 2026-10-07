import { ExternalLinkIcon, GithubIcon } from "lucide-react";

export interface WorkItemProps {
  title: string;
  description: string;
  github?: string;
  website?: string;
  icon?: () => JSX.Element;
}

export const WorkItem: React.FC<WorkItemProps> = ({
  title,
  description,
  github,
  website,
  icon: Icon,
}) => {
  return (
    <li className="group flex gap-4 p-4 rounded-lg md:rounded-xl border border-gray-500/10 bg-gray-800/30 hover:border-beige/20 transition-colors">
      {Icon ? (
        <div className="shrink-0 grid place-items-center w-16 h-16 rounded-lg bg-gray-900 border border-gray-500/10 text-gray-500 group-hover:text-beige transition-colors">
          <Icon />
        </div>
      ) : null}
      <div className="flex flex-col gap-2 min-w-0 flex-1">
        <div className="flex items-center justify-between gap-4">
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
      </div>
    </li>
  );
};
