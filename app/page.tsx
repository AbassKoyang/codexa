import CodeEditor from "@/components/CodeEditor";
import Image from "next/image";

export default function Home() {
  return (
    <div className="flex h-screen items-center justify-center bg-background font-sans pt-10">
      <CodeEditor />
    </div>
  );
}
