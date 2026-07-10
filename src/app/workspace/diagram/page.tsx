"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  GitBranch,
  Download,
  Copy,
  Check,
  RotateCcw,
  ChevronDown,
} from "lucide-react";
import Link from "next/link";
import mermaid from "mermaid";

const templates = {
  flowchart: `flowchart TD
    A[开始] --> B{条件判断}
    B -->|是| C[执行操作1]
    B -->|否| D[执行操作2]
    C --> E[结束]
    D --> E`,
  sequence: `sequenceDiagram
    participant 客户端
    participant 服务器
    participant 数据库
    客户端->>服务器: 发送请求
    服务器->>数据库: 查询数据
    数据库-->>服务器: 返回结果
    服务器-->>客户端: 响应数据`,
  classDiagram: `classDiagram
    class Animal {
        +String name
        +int age
        +makeSound()
    }
    class Dog {
        +String breed
        +bark()
    }
    class Cat {
        +String color
        +meow()
    }
    Animal <|-- Dog
    Animal <|-- Cat`,
  stateDiagram: `stateDiagram-v2
    [*] --> 待机
    待机 --> 运行中: 开始
    运行中 --> 暂停: 暂停
    暂停 --> 运行中: 继续
    运行中 --> 完成: 结束
    完成 --> [*]`,
  erDiagram: `erDiagram
    USER ||--o{ ORDER : places
    ORDER ||--|{ ITEM : contains
    USER {
        int id PK
        string name
        string email
    }
    ORDER {
        int id PK
        date created_at
        int user_id FK
    }
    ITEM {
        int id PK
        string name
        float price
    }`,
  gantt: `gantt
    title 项目进度
    dateFormat YYYY-MM-DD
    section 规划
        需求分析     :a1, 2024-01-01, 7d
        系统设计     :a2, after a1, 5d
    section 开发
        前端开发     :b1, after a2, 14d
        后端开发     :b2, after a2, 14d
    section 测试
        集成测试     :c1, after b1, 7d`,
  pie: `pie title 技术栈使用占比
    "JavaScript" : 35
    "Python" : 25
    "TypeScript" : 20
    "Rust" : 10
    "其他" : 10`,
  mindmap: `mindmap
  root((知识体系))
    编程语言
      JavaScript
      Python
      Rust
    框架
      React
      Next.js
      Django
    工具
      Git
      Docker
      Linux`,
};

type TemplateKey = keyof typeof templates;

const templateNames: Record<TemplateKey, string> = {
  flowchart: "流程图 Flowchart",
  sequence: "时序图 Sequence",
  classDiagram: "类图 Class",
  stateDiagram: "状态图 State",
  erDiagram: "ER图 Entity",
  gantt: "甘特图 Gantt",
  pie: "饼图 Pie",
  mindmap: "思维导图 Mindmap",
};

export default function DiagramPage() {
  const [code, setCode] = useState(templates.flowchart);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);
  const [svgContent, setSvgContent] = useState("");

  // Initialize mermaid
  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: "dark",
      themeVariables: {
        darkMode: true,
        background: "#18181b",
        primaryColor: "#a855f7",
        primaryTextColor: "#fff",
        primaryBorderColor: "#9333ea",
        lineColor: "#71717a",
        secondaryColor: "#27272a",
        tertiaryColor: "#3f3f46",
      },
      flowchart: {
        htmlLabels: true,
        curve: "basis",
      },
      sequence: {
        diagramMarginX: 50,
        diagramMarginY: 10,
        actorMargin: 50,
        width: 150,
        height: 65,
      },
    });
  }, []);

  // Render diagram
  const renderDiagram = useCallback(async () => {
    if (!code.trim() || !previewRef.current) {
      setError("");
      setSvgContent("");
      return;
    }

    try {
      // Clear previous content
      previewRef.current.innerHTML = "";
      
      // Generate unique ID
      const id = `mermaid-${Date.now()}`;
      
      // Render the diagram
      const { svg } = await mermaid.render(id, code);
      
      if (previewRef.current) {
        previewRef.current.innerHTML = svg;
        setSvgContent(svg);
      }
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "语法错误");
      setSvgContent("");
    }
  }, [code]);

  // Debounced render
  useEffect(() => {
    const timer = setTimeout(() => {
      renderDiagram();
    }, 500);

    return () => clearTimeout(timer);
  }, [code, renderDiagram]);

  const loadTemplate = (key: TemplateKey) => {
    setCode(templates[key]);
    setShowTemplates(false);
  };

  const copyCode = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const downloadSVG = () => {
    if (!svgContent) return;
    
    const blob = new Blob([svgContent], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "diagram.svg";
    link.click();
    URL.revokeObjectURL(url);
  };

  const downloadPNG = async () => {
    if (!svgContent) return;
    
    const svg = previewRef.current?.querySelector("svg");
    if (!svg) return;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clone SVG and inline all styles
    const svgClone = svg.cloneNode(true) as SVGElement;
    const svgRect = svg.getBoundingClientRect();
    
    // Set explicit dimensions
    svgClone.setAttribute("width", String(svgRect.width));
    svgClone.setAttribute("height", String(svgRect.height));
    
    const svgData = new XMLSerializer().serializeToString(svgClone);
    // Use data URL instead of Blob URL to avoid tainted canvas
    const svgBase64 = btoa(unescape(encodeURIComponent(svgData)));
    const dataUrl = `data:image/svg+xml;base64,${svgBase64}`;

    const img = new Image();
    img.onload = () => {
      const scale = 2;
      canvas.width = svgRect.width * scale;
      canvas.height = svgRect.height * scale;
      ctx.scale(scale, scale);
      ctx.fillStyle = "#18181b";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, svgRect.width, svgRect.height);
      
      const pngUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = pngUrl;
      link.download = "diagram.png";
      link.click();
    };
    img.src = dataUrl;
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      <main className="relative z-10 mx-auto max-w-7xl px-6 py-12 md:py-16">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }}>
          <Link href="/workspace" className="mb-4 inline-flex items-center gap-2 text-sm text-zinc-500 transition-colors hover:text-white">
            <ArrowLeft className="h-4 w-4" />
            Back to workspace
          </Link>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-purple-500/10 p-3">
                <GitBranch className="h-7 w-7 text-purple-400" />
              </div>
              <div>
                <h1 className="text-white text-2xl font-bold tracking-tight">Diagram Editor</h1>
                <p className="text-sm text-zinc-500">使用 Mermaid 语法绘制图表</p>
              </div>
            </div>
            
            {/* Actions */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <button
                  onClick={() => setShowTemplates(!showTemplates)}
                  className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2 text-sm text-zinc-400 hover:bg-white/10 transition-all"
                >
                  模板
                  <ChevronDown className={`h-4 w-4 transition-transform ${showTemplates ? "rotate-180" : ""}`} />
                </button>
                {showTemplates && (
                  <div className="absolute right-0 mt-2 w-48 rounded-xl bg-zinc-900 border border-white/10 shadow-xl z-50 overflow-hidden">
                    {(Object.keys(templates) as TemplateKey[]).map((key) => (
                      <button
                        key={key}
                        onClick={() => loadTemplate(key)}
                        className="w-full px-4 py-2.5 text-left text-sm text-zinc-400 hover:bg-white/5 hover:text-white transition-colors"
                      >
                        {templateNames[key]}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button
                onClick={copyCode}
                className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2 text-sm text-zinc-400 hover:bg-white/10 transition-all"
              >
                {copied ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
              </button>
              <button
                onClick={() => setCode(templates.flowchart)}
                className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2 text-sm text-zinc-400 hover:bg-white/10 transition-all"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
              <button
                onClick={downloadSVG}
                disabled={!svgContent}
                className="flex items-center gap-2 rounded-lg bg-purple-500/20 px-3 py-2 text-sm text-purple-400 hover:bg-purple-500/30 transition-all disabled:opacity-50"
              >
                <Download className="h-4 w-4" />
                SVG
              </button>
              <button
                onClick={downloadPNG}
                disabled={!svgContent}
                className="flex items-center gap-2 rounded-lg bg-purple-500/20 px-3 py-2 text-sm text-purple-400 hover:bg-purple-500/30 transition-all disabled:opacity-50"
              >
                <Download className="h-4 w-4" />
                PNG
              </button>
            </div>
          </div>
        </motion.div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400"
          >
            {error}
          </motion.div>
        )}

        {/* Editor Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid gap-4 lg:grid-cols-2"
          style={{ minHeight: "calc(100vh - 280px)" }}
        >
          {/* Code Editor */}
          <div className="flex flex-col">
            <div className="mb-2 flex items-center justify-between">
              <label className="text-sm font-medium text-zinc-400">Mermaid 代码</label>
              <a
                href="https://mermaid.js.org/syntax/flowchart.html"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-zinc-500 hover:text-purple-400 transition-colors"
              >
                语法文档 ↗
              </a>
            </div>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="输入 Mermaid 代码..."
              className="flex-1 min-h-[400px] w-full resize-none rounded-xl bg-zinc-900/80 border border-white/10 p-4 font-mono text-sm text-zinc-300 placeholder:text-zinc-600 focus:outline-none focus:border-purple-500/50 transition-colors"
              spellCheck={false}
            />
          </div>

          {/* Preview */}
          <div className="flex flex-col">
            <label className="mb-2 text-sm font-medium text-zinc-400">预览</label>
            <div className="flex-1 min-h-[400px] rounded-xl bg-zinc-900/80 border border-white/10 p-4 overflow-auto">
              <div
                ref={previewRef}
                className="flex items-center justify-center min-h-full [&>svg]:max-w-full"
              />
              {!code.trim() && (
                <div className="flex items-center justify-center h-full text-zinc-600">
                  输入代码后预览图表
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Quick Tips */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-6 rounded-xl bg-white/5 border border-white/10 p-4"
        >
          <h3 className="text-sm font-medium text-zinc-400 mb-2">快速提示</h3>
          <div className="grid gap-2 text-xs text-zinc-500 sm:grid-cols-2 lg:grid-cols-4">
            <div><code className="text-purple-400">flowchart TD</code> 自上而下流程图</div>
            <div><code className="text-purple-400">flowchart LR</code> 从左到右流程图</div>
            <div><code className="text-purple-400">A --&gt; B</code> 连接节点</div>
            <div><code className="text-purple-400">A{`{判断}`}</code> 菱形判断框</div>
          </div>
        </motion.div>

        <motion.footer initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="mt-8 text-center">
          <p className="text-sm text-zinc-600">© {new Date().getFullYear()} Linzhi Hou</p>
        </motion.footer>
      </main>
    </div>
  );
}


