import InteractiveModel from '../components/InteractiveModel';

function Home() {
  return (
    <section id="home" className="h-screen flex flex-col items-center justify-center bg-[#121212] text-[#E0E0E0]">
      <div className="text-center">
        <h1 className="text-4xl md:text-6xl font-bold text-[#1DB954] font-['Montserrat']">
          Shubham Mate
        </h1>
        <p className="text-xl md:text-2xl mt-4 text-[#BB86FC] font-['Roboto']">
          Crafting Scalable Code & Innovative Solutions
        </p>
        <button className="mt-6 px-6 py-3 bg-[#03DAC6] text-[#121212] rounded-md hover:bg-[#1DB954] transition">
          Explore My Work
        </button>
      </div>
      <div className="mt-8">
        <InteractiveModel url="https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/Avocado/glTF-Binary/Avocado.glb" />
      </div>
    </section>
  );
}

export default Home;
