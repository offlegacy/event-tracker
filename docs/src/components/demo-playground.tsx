import { highlight, Pre } from "codehike/code";
import { DemoButton } from "./demo-button";

const code = `import { createTracker } from "@offlegacy/event-tracker";

const [Track] = createTracker({
  DOMEvents: {
    onClick: (params, context) => {
      toast.success(\`\${context.userId}: \${params.buttonId}\`);
    },
  },
});

function App() {
  return (
    <Track.Provider initialContext={{ userId: "demo-user" }}>
      <Track.Click params={{ buttonId: "click-me" }}>
        <button>Click me</button>
      </Track.Click>
    </Track.Provider>
  );
}`;

export async function DemoCode() {
  const isDark = typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches;
  const theme = isDark ? "github-dark" : "github-light";

  const highlighted = await highlight(
    {
      value: code,
      lang: "tsx",
      meta: "",
    },
    theme,
  );

  return (
    <div className="group relative">
      <div className="relative overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-700 dark:bg-gray-800/50">
          <div className="flex items-center space-x-2">
            <span className="ml-2 text-sm font-medium text-gray-600 dark:text-gray-400">basic-example.tsx</span>
          </div>
        </div>
        <div className="relative p-6">
          <Pre className="relative z-0 !m-0 !bg-transparent !p-0 text-sm leading-relaxed" code={highlighted} />
        </div>
      </div>
      <div className="absolute bottom-4 right-4 z-10">
        <DemoButton>Click me</DemoButton>
      </div>
    </div>
  );
}
