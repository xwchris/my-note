import NoteList from "@/components/NoteList";
import Sidebar from "@/components/Sidebar";

export default function Home() {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 p-6">
        <NoteList />
      </div>
    </div>
  );
}
