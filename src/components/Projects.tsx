import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const Projects: React.FC = () => {
  const projects = [
    {
      id: 1,
      title: "Random Android Project",
      description: "Android application demonstrating modern Android development practices and UI/UX design.",
      image: "/placeholder.svg",
      technologies: ["Android", "Java", "Kotlin", "XML"],
      github: "https://github.com/randomAndroidProject/randomAndroidProject",
      featured: true
    },
    {
      id: 2,
      title: "Tech Metaverse Canvas",
      description: "Immersive 3D portfolio website with virtual reality support and modern web technologies.",
      image: "/placeholder.svg",
      technologies: ["React", "TypeScript", "Three.js", "Vite"],
      github: "https://github.com/ThammanaSrinivas/tech-metaverse-canvas",
      featured: true
    },
    {
      id: 3,
      title: "Habitica MCP Server",
      description: "Server implementation for Habitica integration with MCP protocol support.",
      image: "/placeholder.svg",
      technologies: ["Node.js", "JavaScript", "MCP", "API"],
      github: "https://github.com/ThammanaSrinivas/habitica-mcp-server",
      featured: true
    },
    {
      id: 4,
      title: "Spring MVC Practice CRUD RESTful API",
      description: "Complete CRUD operations with RESTful API design using Spring MVC framework.",
      image: "/placeholder.svg",
      technologies: ["Spring", "Java", "REST", "MySQL"],
      github: "https://github.com/ThammanaSrinivas/SpringMVCPracticeCRUDRestfulAPI",
      featured: false
    },
    {
      id: 5,
      title: "RAG_experiment",
      description: "A sophisticated Retrieval-Augmented Generation (RAG) system enabling interactive chat with PDF documents using advanced language modeling and vector embeddings.",
      image: "/placeholder.svg",
      technologies: ["Python", "PyTorch", "Transformers", "ChromaDB", "SentenceTransformers", "PyPDF"],
      github: "https://github.com/ThammanaSrinivas/RAG_experiment",
      featured: false
    },
    {
      id: 6,
      title: "SaiKiCoin",
      description: "Blockchain-based project for decentralized digital currency and smart contract experimentation.",
      image: "/placeholder.svg",
      technologies: ["Python", "JavaScript", "Django", "Blockchain", "Smart Contracts"],
      github: "https://github.com/ThammanaSrinivas/SaiKiCoin",
      featured: false
    }
  ];

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

  const openProjectLink = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const openGitHubProfile = () => {
    window.open('https://github.com/ThammanaSrinivas', '_blank', 'noopener,noreferrer');
  };

  return (
    <section id="projects" className="py-20 px-6" role="region" aria-label="Projects">
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

        {/* Projects grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {projects.map((project) => (
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
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="border-white text-white hover:bg-white hover:text-black"
                        onClick={() => openProjectLink(project.github)}
                      >
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
            onClick={openGitHubProfile}
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
