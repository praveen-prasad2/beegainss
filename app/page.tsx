import Homepage from "@/Pages/Homepage";
import ModelViewer from "@/Components/ModelViewer";

export default function Home() {
  return (
    <>
    <Homepage />
    <main className="h-[800vh]">
      {/* Big height to allow scrolling */}

      <div className="fixed top-0 left-0 w-full h-screen">
        <ModelViewer />
      </div>

      <div className="relative z-10 text-white p-20">
       
      </div>
    </main>
    </>
  );
}
