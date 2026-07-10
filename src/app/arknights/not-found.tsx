import { StaticPage } from "@/lib/static-page";

export default function ArknightsNotFound() {
  return (
    <StaticPage
      contentFile="404.html"
      stylesheet="/arknights/css/styles.css"
    />
  );
}
