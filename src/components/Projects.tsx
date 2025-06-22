
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const Projects: React.FC = () => {
  const [filter, setFilter] = useState('all');

  const projects = [
    {
      id: 1,
      title: "Neural Network Visualizer",
      description: "Interactive 3D visualization of neural networks with real-time training data.",
      image: "/placeholder.svg",
      category: "web-app",
      technologies: ["React", "Three.js", "Python", "WebGL"],
      github: "#",
      demo: "#",
      featured: true
    },
    {
      id: 2,
      title: "Metaverse Portfolio",
      description: "Immersive 3D portfolio website with virtual reality support.",
      image: "/placeholder.svg",
      category: "portfolio",
      technologies: ["Next.js", "R3F", "WebXR", "GSAP"],
      github: "#",
      demo: "#",
      featured: true
    },
    {
      id: 3,
      title: "AI Art Generator",
      description: "Web application for generating AI art with custom style transfer.",
      image: "/placeholder.svg",
      category: "web-app",
      technologies: ["TypeScript", "TensorFlow.js", "Canvas API"],
      github: "#",
      demo: "#",
      featured: false
    },
    {
      id: 4,
      title: "Cryptocurrency Dashboard",
      description: "Real-time crypto tracking dashboard with advanced analytics.",
      image: "/placeholder.svg",
      category: "dashboard",
      technologies: ["React", "Node.js", "Socket.io", "Chart.js"],
      github: "#",
      demo: "#",
      featured: false
    },
    {
      id: 5,
      title: "AR Shopping Experience",
      description: "Augmented reality shopping app for furniture placement.",
      image: "/placeholder.svg",
      category: "mobile",
      technologies: ["React Native", "AR.js", "Three.js"],
      github: "#",
      demo: "#",
      featured: true
    },
    {
      id: 6,
      title: "Blockchain Voting System",
      description: "Secure and transparent voting system built on blockchain.",
      image: "/placeholder.svg",
      category: "blockchain",
      technologies: ["Solidity", "Web3.js", "React", "Ethereum"],
      github: "#",
      demo: "#",
      featured: false
    }
  ];

  const categories = [
    { id: 'all', name: 'All Projects' },
    { id: 'web-app', name: 'Web Apps' },
    { id: 'portfolio', name: 'Portfolio' },
    { id: 'dashboard', name: 'Dashboards' },
    { id: 'mobile', name: 'Mobile' },
    { id: 'blockchain', name: 'Blockchain' }
  ];

  const filteredProjects = filter === 'all' 
    ? projects 
    : projects.filter(project => project.category === filter);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <section id="projects" className="py-20 px-6">
      <div className="container mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl font-bold mb-6">
            <span className="gradient-text">Featured Projects</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            A showcase of innovative projects that demonstrate my expertise in modern web technologies, 
            3D graphics, and user-centered design.
          </p>
        </motion.div>

        {/* Filter buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-wrap justify-center gap-4 mb-12"
        >
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={filter === category.id ? "default" : "outline"}
              onClick={() => setFilter(category.id)}
              className={`transition-all duration-300 ${
                filter === category.id 
                  ? 'bg-primary text-primary-foreground neon-glow' 
                  : 'border-primary/50 hover:border-primary hover:bg-primary/10'
              }`}
            >
              {category.name}
            </Button>
          ))}
        </motion.div>

        {/* Projects grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {filteredProjects.map((project) => (
            <motion.div
              key={project.id}
              variants={cardVariants}
              whileHover={{ 
                scale: 1.02,
                transition: { duration: 0.2 }
              }}
              className="group"
            >
              <Card className="glass-card border-primary/20 overflow-hidden h-full hover:border-primary/50 transition-all duration-300">
                <div className="relative overflow-hidden">
                  <img
                    src={project.image}
                    alt={project.title}
                    className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  {project.featured && (
                    <Badge className="absolute top-4 left-4 bg-secondary text-secondary-foreground">
                      Featured
                    </Badge>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-4 left-4 right-4 flex gap-2">
                      <Button size="sm" className="bg-primary hover:bg-primary/80">
                        Demo
                      </Button>
                      <Button size="sm" variant="outline" className="border-white text-white hover:bg-white hover:text-black">
                        Code
                      </Button>
                    </div>
                  </div>
                </div>
                
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-foreground group-hover:text-primary transition-colors duration-300">
                    {project.title}
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    {project.description}
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {project.technologies.map((tech) => (
                      <Badge
                        key={tech}
                        variant="secondary"
                        className="text-xs bg-muted hover:bg-primary hover:text-primary-foreground transition-colors duration-200"
                      >
                        {tech}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center mt-12"
        >
          <Button
            size="lg"
            variant="outline"
            className="border-primary text-primary hover:bg-primary/10 px-8 py-4 text-lg font-semibold"
          >
            View All Projects on GitHub
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default Projects;
