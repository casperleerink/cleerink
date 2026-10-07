import { WorkItem } from "@/components/work-item";
import { groups, projects } from "../projects";

export default function Work() {
  return (
    <main className="px-12 py-44">
      <div className="mx-auto max-w-screen-lg flex flex-col gap-12">
        {Object.entries(groups).map(([key, group]) => (
          <section key={key} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <h2 className="font-semibold text-xl">{group.title}</h2>
              {group.description ? (
                <p className="text-gray-500">{group.description}</p>
              ) : null}
            </div>
            <ul className="grid grid-cols-1 sm:grid-cols-2 items-start gap-4 sm:gap-8">
              {projects
                .filter((p) => p.group === key)
                .map((p) => (
                  <WorkItem key={p.title} {...p} />
                ))}
            </ul>
          </section>
        ))}
      </div>
    </main>
  );
}
