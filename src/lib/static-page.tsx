import { readFileSync } from "node:fs";
import path from "node:path";
import Script from "next/script";

const routeRewrites: Array<[RegExp, string]> = [
  [/href="(?:\.\.\/)?index\.html"/g, 'href="/arknights"'],
  [/href="pages\/headhunting\.html"/g, 'href="/arknights/headhunting"'],
  [/href="headhunting\.html"/g, 'href="/arknights/headhunting"'],
  [/href="\/assets\//g, 'href="/arknights/'],
  [/src="(?:\.\.\/)?assets\//g, 'src="/arknights/'],
];

function readContentHtml(contentFile: string) {
  const filePath = path.join(process.cwd(), "src", "content", "arknights", contentFile);
  const html = readFileSync(filePath, "utf8");
  const body = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i)?.[1] ?? html;
  const withoutScripts = body.replace(/<script\b[\s\S]*?<\/script>/gi, "");

  return routeRewrites.reduce(
    (content, [pattern, replacement]) => content.replace(pattern, replacement),
    withoutScripts,
  );
}

type StaticPageProps = {
  contentFile: string;
  script?: string;
  stylesheet: string;
};

export function StaticPage({ contentFile, script, stylesheet }: StaticPageProps) {
  const html = readContentHtml(contentFile);

  return (
    <>
      <link rel="stylesheet" href={stylesheet} />
      <div dangerouslySetInnerHTML={{ __html: html }} />
      {script ? <Script src={script} strategy="afterInteractive" /> : null}
    </>
  );
}
