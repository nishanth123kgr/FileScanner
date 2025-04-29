"use client";

import { YaraResults } from "./components/YaraResults";

export default function YaraScan({ file }: { file: File | null }) {
  return <YaraResults file={file} />;
}