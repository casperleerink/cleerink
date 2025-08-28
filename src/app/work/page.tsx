import { WorkItem } from "@/components/work-item";

export default function Home() {
  return (
    <main>
      <div className="relative w-full h-screen grid place-items-center px-6 max-w-screen-lg mx-auto">
        <div className="flex flex-col gap-8">
          <h2 className="font-semibold text-xl">Open Source</h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 items-start gap-4 sm:gap-8">
            <WorkItem
              title="React Matters"
              description="A helper library for rendering React components as matter.js bodies allowing any react component to be animated by the matter.js physics engine. (Alpha)"
              github="https://github.com/casperleerink/react-matters"
            />
            <WorkItem
              title="Sanity Plugin Icons"
              description="A sanity plugin for picking icons based on the sanity-plugin-icon-picker, but with improved UI and no default loading of icon sets"
              github="https://github.com/casperleerink/sanity-plugin-icons"
            />
          </ul>
          <div className="flex flex-col gap-2">
            <h2 className="font-semibold text-xl">Work Related Projects</h2>
            <p className="text-gray-500">
              Some examples of projects I have helped create during my
              employment.
            </p>
          </div>
          <ul className="grid grid-cols-1 sm:grid-cols-2 items-start gap-4 sm:gap-8">
            <WorkItem
              title="Hooman Dashboard"
              description="Client and project management app for Hooman Studio"
              github="https://github.com/Hooman-studio"
              website="https://hooman.com/dashboard"
            />
            <WorkItem
              title="UnitIQ"
              description="Web Application for real estate investors"
              website="https://unitiq.vercel.app"
            />
            <WorkItem
              title="Contractor Connect"
              description="Web and Mobile Application for contractors to connect with trade workers"
              website="https://app.contractor-connect.net/register"
            />
            <WorkItem
              title="Pulsia"
              description="Mobile Application that tracks your heart data and helps sharing it with your doctor."
              website="https://wellspringdata.ca/"
            />
          </ul>
        </div>
      </div>
    </main>
  );
}
