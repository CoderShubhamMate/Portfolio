import InteractiveModel from '../components/InteractiveModel';

function Home() {
  return (
    <section id="home" className="h-screen flex items-center justify-center">
      <InteractiveModel url="https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/Avocado/glTF-Binary/Avocado.glb" />
    </section>
  );
}

export default Home;
