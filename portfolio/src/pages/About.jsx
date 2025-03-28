function About() {
  return (
    <section id="about" className="py-16 bg-[#121212] text-[#E0E0E0] text-center">
      <h2 className="text-3xl font-['Montserrat'] text-[#03DAC6]">About Me</h2>
      <p className="mt-4 max-w-2xl mx-auto font-['Roboto'] text-lg">
        Hi, I’m Shubham Mate – a passionate IT engineering student from Nashik, Maharashtra, with a strong focus on full-stack development. I’m currently pursuing my Bachelor's degree in Information Technology Engineering, where I’ve developed skills in Node.js, MongoDB, and NoSQL. Before that, I completed a diploma in Information Technology, mastering programming in C, Database Management System, and Java Programming. My goal is to become a software developer with robust full-stack expertise, building scalable, efficient solutions and driving innovation. I’ve gained hands-on experience through internships, including web designing at SoftCrowd Tech and Android app development. I’m proficient in Java, C, C++, Rust, JavaScript, and familiar with Windows, Linux, MongoDB, MySQL, and Postman. In my free time, I explore emerging technologies, code, optimize algorithms, solve problems, and enjoy Lo-Fi music.
      </p>
      <a
        href="/resume.pdf"
        download
        className="mt-6 inline-block px-6 py-3 bg-[#03DAC6] text-[#121212] rounded-md hover:bg-[#1DB954] transition"
      >
        Download Resume
      </a>
    </section>
  );
}


export default About;
