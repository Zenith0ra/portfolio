import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "Arknights Terminal | Hou Linzhi",
    template: "%s | Arknights Terminal",
  },
  description:
    "Hou Linzhi 的明日方舟专题站：寻访概率、干员记录、活动档案与个人笔记。",
};

export default function ArknightsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
