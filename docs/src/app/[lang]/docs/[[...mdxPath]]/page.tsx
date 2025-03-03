import { generateStaticParamsFor, importPage } from "nextra/pages";

import { useMDXComponents } from "../../../../../mdx-components";

import { TrackPageView } from "@/tracker";
import { Lang } from "@/lib/types/lang";

export const generateStaticParams = generateStaticParamsFor("mdxPath");

export async function generateMetadata(props: { params: Promise<{ mdxPath: string[]; lang: Lang }> }) {
  const params = await props.params;
  const { metadata } = await importPage(params.mdxPath, params.lang);
  return metadata;
}

// eslint-disable-next-line react-hooks/rules-of-hooks
const Wrapper = useMDXComponents().wrapper;

export default async function Page(props: { params: Promise<{ mdxPath: string[]; lang: Lang }> }) {
  const params = await props.params;
  const result = await importPage(params.mdxPath, params.lang);
  const { default: MDXContent, toc, metadata } = result;

  return (
    <>
      <Wrapper toc={toc} metadata={metadata}>
        <MDXContent {...props} params={params} />
      </Wrapper>
      <TrackPageView params={{ title: metadata.title }} />
    </>
  );
}
