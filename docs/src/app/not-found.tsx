import { NotFoundPage } from "nextra-theme-docs";

export default function NotFound() {
  return (
    <NotFoundPage content="Submit an issue" labels="broken-link">
      <h1 className="text-3xl font-bold">The page is not found</h1>
    </NotFoundPage>
  );
}
