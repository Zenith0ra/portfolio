import type { Metadata } from "next";
import { StaticPage } from "@/lib/static-page";

export const metadata: Metadata = {
  title: "干员档案",
  description: "明日方舟干员档案、练度优先级和个人短评。",
};

export default function OperatorsPage() {
  return (
    <StaticPage
      contentFile="pages/operators.html"
      stylesheet="/arknights/css/styles.css"
      script="/arknights/js/main.js"
    />
  );
}
