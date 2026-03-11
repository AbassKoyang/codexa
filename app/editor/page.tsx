import CodeEditor from "@/components/CodeEditor";
import Image from "next/image";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function Editor() {
  return (
    <div className="flex h-screen items-center justify-center bg-tokyo-bg font-sans pt-10">
      <CodeEditor />
    </div>
  );
}
