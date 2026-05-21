const fs = require('fs');
const path = require('path');

// 1. Fix Navbar.jsx
const navbarPath = path.join(__dirname, 'frontend/src/components/Navbar.jsx');
let navbar = fs.readFileSync(navbarPath, 'utf8');

// Fix visibility of text in light theme (change text-white to text-textMain when inside bg-card)
navbar = navbar.replace('bg-card transition-colors duration-300 text-white shadow-2xl', 'bg-card transition-colors duration-300 text-textMain shadow-sm');
navbar = navbar.replace('tracking-tight text-white group-hover:text-primary', 'tracking-tight text-textMain group-hover:text-primary');
navbar = navbar.replace('bg-black/40 rounded-3xl p-5 border border-border', 'bg-background/50 rounded-3xl p-5 border border-border');
navbar = navbar.replace('font-black text-white uppercase', 'font-black text-textMain uppercase');

// Re-apply Desktop NavLink highlight (since it was lost in a race condition)
const oldDesktopNav = `                <div className="hidden lg:flex gap-8 text-[11px] font-bold uppercase tracking-widest">
                    {filteredLinks.map((link) => (
                        <NavLink 
                            key={link.path} 
                            to={link.path} 
                            className={({ isActive }) => \`hover:text-primary transition-all duration-300 \${isActive ? 'text-primary transition-all duration-300 border-b-2 border-primary transition-all duration-300 pb-1' : 'text-textMain/50 transition-colors duration-300'}\`}
                        >
                            {link.name}
                        </NavLink>
                    ))}
                </div>`;

const newDesktopNav = `                <div className="hidden lg:flex gap-4 text-[11px] font-bold uppercase tracking-widest">
                    {filteredLinks.map((link) => (
                        <NavLink 
                            key={link.path} 
                            to={link.path} 
                            className={({ isActive }) => \`px-4 py-2.5 rounded-xl transition-all duration-300 \${isActive ? 'bg-primary/15 text-primary border border-primary/20 shadow-[0_0_15px_rgba(180,164,96,0.15)]' : 'text-textMain/50 hover:text-primary hover:bg-primary/5'}\`}
                        >
                            {link.name}
                        </NavLink>
                    ))}
                </div>`;

navbar = navbar.replace(oldDesktopNav, newDesktopNav);
fs.writeFileSync(navbarPath, navbar, 'utf8');
console.log('Fixed Navbar.jsx text visibility and active links.');

// 2. Fix index.css borders to be ultra-low opacity as requested ("opacity adu karala shadows widihata")
const cssPath = path.join(__dirname, 'frontend/src/index.css');
let css = fs.readFileSync(cssPath, 'utf8');

// Replace transparent borders with highly transparent soft borders
css = css.replace('--color-border: transparent;', '--color-border: rgba(0, 0, 0, 0.05);');
css = css.replace('--color-border: transparent;', '--color-border: rgba(255, 255, 255, 0.05);'); // the second match is in .dark

fs.writeFileSync(cssPath, css, 'utf8');
console.log('Fixed index.css borders.');
