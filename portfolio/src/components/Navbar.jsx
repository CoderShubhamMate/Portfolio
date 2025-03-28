function Navbar() {
  return (
    <nav className="bg-[#121212] p-4 sticky top-0 z-10 shadow-md">
      <ul className="flex space-x-6 justify-center text-[#E0E0E0]">
        <li><a href="#home" className="hover:text-[#1DB954] transition">Home</a></li>
        <li><a href="#about" className="hover:text-[#1DB954] transition">About</a></li>
        <li><a href="#portfolio" className="hover:text-[#1DB954] transition">Portfolio</a></li>
        <li><a href="#contact" className="hover:text-[#1DB954] transition">Contact</a></li>
      </ul>
    </nav>
  );
}


export default Navbar;
