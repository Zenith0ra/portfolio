import type { Metadata } from "next";
import { StaticPage } from "@/lib/static-page";

export const metadata: Metadata = {
  title: "寻访概率",
  description:
    "明日方舟寻访概率终端：计算下一位 6★期望、目标干员概率、保底与多六星分布。",
};

export default function HeadhuntingPage() {
  return (
    <StaticPage
      contentFile="pages/headhunting.html"
      stylesheet="/arknights/css/headhunting.css"
      script="/arknights/js/headhunting.js"
    />
  );
}
