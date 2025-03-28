function Portfolio() {
  const projects = [
    {
      title: "Music World Project",
      description: "A web-based music platform developed during my internship at SoftCrowd Tech, featuring an interactive interface for music exploration and playback using HTML, CSS, and JavaScript.",
      image: "/project1.jpg",
      github: "https://github.com/CoderShubhamMate/music-world-project",
      demo: "#",
    },
    {
      title: "Student Attendance Using QR Android App",
      description: "An Android app designed to track student attendance efficiently with QR codes, incorporating dynamic data handling for improved usability and accuracy.",
      image: "/project2.jpg",
      github: "https://github.com/CoderShubhamMate/student-attendance-app",
      demo: "#",
    },
    {
      title: "Personal Portfolio Website",
      description: "This 3D interactive portfolio, built with React, Tailwind CSS, and Three.js, showcasing my full-stack development and design skills.",
      image: "/portfolio-screenshot.jpg",
      github: "https://github.com/CoderShubhamMate/Portfolio",
      demo: "#",
    },
  ];

  return (
    <section id="portfolio" className="py-16 bg-[#121212] text-[#E0E0E0] text-center">
      <h2 className="text-3xl font-['Montserrat'] text-[#03DAC6]">Portfolio</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8 max-w-5xl mx-auto">
        {projects.map((project, index) => (
          <div key={index} className="bg-[#1E1E1E] p-4 rounded-md shadow-md">
            <img
              src={project.image}
              alt={project.title}
              className="w-full h-40 object-cover rounded-md mb-4"
            />
            <h3 className="text-xl text-[#1DB954] font-['Montserrat']">{project.title}</h3>
            <p className="mt-2 font-['Roboto']">{project.description}</p>
            <div className="mt-4 flex justify-center space-x-4">
              <a
                href={project.github}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#BB86FC] hover:text-[#1DB954] transition"
              >
                GitHub
              </a>
              <a
                href={project.demo}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#BB86FC] hover:text-[#1DB954] transition"
              >
                Demo
              </a>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}




export default Portfolio;
