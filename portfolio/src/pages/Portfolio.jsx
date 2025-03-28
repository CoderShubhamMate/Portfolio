function Portfolio() {
  return (
    <section id="portfolio" className="py-16 bg-[#121212] text-[#E0E0E0] text-center">
      <h2 className="text-3xl font-['Montserrat'] text-[#03DAC6]">Portfolio</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        <div className="bg-[#1E1E1E] p-4 rounded-md">
          <h3 className="text-xl text-[#1DB954]">Project 1</h3>
          <p className="mt-2">This is a description of Project 1.</p>
        </div>
        <div className="bg-[#1E1E1E] p-4 rounded-md">
          <h3 className="text-xl text-[#1DB954]">Project 2</h3>
          <p className="mt-2">This is a description of Project 2.</p>
        </div>
        <div className="bg-[#1E1E1E] p-4 rounded-md">
          <h3 className="text-xl text-[#1DB954]">Project 3</h3>
          <p className="mt-2">This is a description of Project 3.</p>
        </div>
      </div>
    </section>
  );
}


export default Portfolio;
