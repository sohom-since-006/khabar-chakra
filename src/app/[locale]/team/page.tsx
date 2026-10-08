import React from 'react';
import Link from 'next/link';

interface TeamMember {
  name: string;
  role: string;
  bio: string;
}

const teamMembers: TeamMember[] = [
  {
    name: 'Sohom Paul',
    role: '2nd-Year CSE Student at AEC · Full-Stack Developer & Video Editor',
    bio: "I'm a CSE student driven by building functional, visually engaging web applications and crafting compelling video content. Combining a foundation in full-stack web development and creative storytelling as a freelance video editor. Just bringing visual polish to every project I build.",
  },
  {
    name: 'Snehasish Kundu',
    role: '2nd-Year CSE Student at AEC · C Programmer & Emerging Full-Stack Developer',
    bio: "I'm a CSE student passionate about building functional and practical software projects while continuously exploring web development and emerging technologies. With a foundation in C and an interest in Python, AI, and full-stack development, I enjoy turning ideas into real-world projects and learning something new with every build.",
  },
  {
    name: 'Shreyasi Acharya',
    role: '2nd-Year CSE Student at AEC · C & Python Programmer, DSA Enthusiast',
    bio: "I'm a Computer Science student interested in programming, logical problem-solving, and exploring how technology can be used to create useful solutions. I work with C and Python and am developing a strong understanding of Data Structures and Algorithms. I enjoy practicing new programming concepts, working on projects, and continuously improving my technical skills through hands-on learning.",
  },
  {
    name: 'Shuvangi Dutta',
    role: 'CSE Student · Emerging UI/UX designer, Dancer, Creative Content Creator',
    bio: "I'm a CSE student who loves combining technologies. I enjoy expressing myself through creating and crafting things with my own ideas. I'm passionate about working on personal projects as well as collaborating with others on group projects. Always exploring new ideas, creating meaningful Projects, and bringing a creative touch to everything I do.",
  },
];

export default function TeamPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Colophon Title / Header */}
      <div className="text-center max-w-3xl mx-auto mb-12 border-b border-[var(--kc-moss)] pb-8">
        <span className="font-annotation text-[var(--kc-basil)] text-xl">Colophon & Credits</span>
        <h1 className="text-4xl font-bold tracking-tight text-[var(--kc-charcoal)] mt-2">
          The S-QUAD
        </h1>
        <p className="text-sm font-mono uppercase tracking-wider text-[var(--kc-moss)] mt-1">
          Asansol Engineering College (AEC), West Bengal
        </p>
        <p className="text-base text-[var(--kc-charcoal)] leading-relaxed mt-6 font-sans">
          &ldquo;We are students who saw how much good food goes to waste — at home, in hostels and at big family events — and decided to build a free tool to help. Khabar Chakra is our way of closing the food cycle.&rdquo;
        </p>
      </div>

      {/* Member Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        {teamMembers.map((member, idx) => (
          <div
            key={member.name}
            className="almanac-card bg-[var(--kc-cream)] border border-[var(--kc-moss)] p-8 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between border-b border-[var(--kc-moss)] pb-3 mb-4">
                <span className="font-mono text-xs px-2 py-0.5 border border-[var(--kc-moss)] bg-[var(--kc-parchment)] text-[var(--kc-charcoal)]">
                  MEMBER 0{idx + 1}
                </span>
                <span className="font-mono text-xs text-[var(--kc-moss)]">AEC · S-QUAD</span>
              </div>
              <h2 className="text-2xl font-bold text-[var(--kc-charcoal)] mb-1">
                {member.name}
              </h2>
              <p className="text-xs font-mono font-semibold text-[var(--kc-basil)] mb-4">
                {member.role}
              </p>
              <p className="text-sm text-[var(--kc-charcoal)] leading-relaxed font-sans">
                {member.bio}
              </p>
            </div>
            
            <div className="pt-6 mt-6 border-t border-[var(--kc-moss)]/50 text-[11px] font-mono text-[var(--kc-moss)] flex justify-between">
              <span>Plain-text Colophon</span>
              <span>Khabar Chakra v1.0</span>
            </div>
          </div>
        ))}
      </div>

      {/* Public Goods Mission Notice */}
      <div className="p-6 border border-[var(--kc-moss)] bg-[var(--kc-parchment)] text-center max-w-2xl mx-auto">
        <h3 className="text-xs font-mono uppercase tracking-wider text-[var(--kc-charcoal)] font-bold mb-2">
          Public Good Initiative · ₹0 Cost Policy
        </h3>
        <p className="text-xs text-[var(--kc-moss)] leading-relaxed mb-4">
          In strict adherence to Decision D13, team member contacts and personal socials are deliberately omitted. To contact the team regarding the project, food safety, or community partnerships, please submit a dispatch through the official admin correspondence inbox.
        </p>
        <Link
          href="/en/contact"
          className="inline-block px-5 py-2 text-xs font-bold uppercase tracking-wider bg-[var(--kc-basil)] text-white hover:bg-[var(--kc-basil)]/90 transition-colors"
        >
          Contact Administration Inbox →
        </Link>
      </div>
    </div>
  );
}
