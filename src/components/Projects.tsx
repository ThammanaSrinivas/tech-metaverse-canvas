import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Smartphone, Globe, Server, Leaf, Brain, Bitcoin, ExternalLink, Github, Play, ArrowRight, Sparkles } from 'lucide-react';

const Projects: React.FC = () => {
  const projects = [
    {
      id: 1,
      title: "Random Android Project",
      description: "Android application demonstrating modern Android development practices and UI/UX design.",
      longDescription: "A comprehensive Android application showcasing modern development practices, Material Design principles, and innovative UI/UX patterns. Features include real-time data synchronization, offline capabilities, and seamless user experience.",
      icon: <Smartphone className="w-16 h-16 text-primary" />,
      technologies: ["Android", "Java", "Kotlin", "XML"],
      github: "https://github.com/randomAndroidProject/randomAndroidProject",
      video: "https://github.com/randomAndroidProject/randomAndroidProject/blob/main/HappyMe%20-%20Promo.mp4",
      featured: true
    },
    {
      id: 2,
      title: "Tech Metaverse Canvas",
      description: "Immersive 3D portfolio website with virtual reality support and modern web technologies.",
      longDescription: "An immersive 3D portfolio website that transports visitors into a digital metaverse. Features include interactive 3D environments, real-time particle effects, responsive design, and seamless navigation through virtual spaces.",
      icon: <Globe className="w-16 h-16 text-primary" />,
      technologies: ["React", "TypeScript", "Three.js", "Vite"],
      github: "https://github.com/ThammanaSrinivas/tech-metaverse-canvas",
      demo: "https://srinivas-t.web.app/",
      featured: true
    },
    {
      id: 3,
      title: "Habitica MCP Server",
      description: "Server implementation for Habitica integration with MCP protocol support.",
      longDescription: "A robust server implementation that bridges Habitica's gamification platform with MCP protocol. Enables seamless integration, real-time data synchronization, and enhanced user experience through protocol standardization.",
      icon: <Server className="w-16 h-16 text-primary" />,
      technologies: ["Node.js", "JavaScript", "MCP", "API"],
      github: "https://github.com/ThammanaSrinivas/habitica-mcp-server",
      featured: true
    },
    {
      id: 4,
      title: "Spring MVC Practice CRUD RESTful API",
      description: "Complete CRUD operations with RESTful API design using Spring MVC framework.",
      longDescription: "A comprehensive RESTful API implementation using Spring MVC framework. Demonstrates best practices in API design, data validation, error handling, and database operations with MySQL integration.",
      icon: <Leaf className="w-16 h-16 text-primary" />,
      technologies: ["Spring", "Java", "REST", "MySQL"],
      github: "https://github.com/ThammanaSrinivas/SpringMVCPracticeCRUDRestfulAPI",
      featured: true
    },
    {
      id: 5,
      title: "RAG_experiment",
      description: "A sophisticated Retrieval-Augmented Generation (RAG) system enabling interactive chat with PDF documents.",
      longDescription: "An advanced RAG system that combines large language models with document retrieval capabilities. Features include PDF processing, vector embeddings, semantic search, and interactive chat interface for document exploration.",
      icon: <Brain className="w-16 h-16 text-primary" />,
      technologies: ["Python", "PyTorch", "Transformers", "ChromaDB", "SentenceTransformers", "PyPDF"],
      github: "https://github.com/ThammanaSrinivas/RAG_experiment",
      featured: true
    },
    {
      id: 6,
      title: "SaiKiCoin",
      description: "Blockchain-based project for decentralized digital currency and smart contract experimentation.",
      longDescription: "A comprehensive blockchain implementation featuring decentralized digital currency, smart contracts, and distributed ledger technology. Demonstrates advanced concepts in cryptography, consensus mechanisms, and peer-to-peer networking.",
      icon: <Bitcoin className="w-16 h-16 text-primary" />,
      technologies: ["Python", "JavaScript", "Django", "Blockchain", "Smart Contracts"],
      github: "https://github.com/ThammanaSrinivas/SaiKiCoin",
      featured: true
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 50, rotateY: -15 },
    visible: {
      opacity: 1,
      y: 0,
      rotateY: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
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
    <section id="projects" className="py-20 px-6 relative overflow-hidden" role="region" aria-label="Projects">
      {/* Animated background elements */}
      <div className="absolute inset-0 grid-bg opacity-5 animate-grid-move"></div>
      <div className="absolute top-20 left-10 w-2 h-2 bg-primary rounded-full animate-pulse"></div>
      <div className="absolute top-40 right-20 w-1 h-1 bg-primary/60 rounded-full animate-pulse delay-1000"></div>
      <div className="absolute bottom-40 left-20 w-1.5 h-1.5 bg-primary/40 rounded-full animate-pulse delay-2000"></div>
      
      <div className="container mx-auto max-w-7xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <div className="mb-4">
            <h2 className="text-5xl font-bold text-foreground heading-primary">
              Featured Projects
            </h2>
          </div>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            A showcase of innovative projects that demonstrate my expertise in modern web technologies, 
            3D graphics, and user-centered design.
          </p>
        </motion.div>

        {/* Projects grid with flip cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          className="grid grid-cols-1 xs:grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 xs:gap-6 sm:gap-6 md:gap-8 lg:gap-8"
        >
          {projects.map((project) => (
            <motion.div
              key={project.id}
              variants={cardVariants}
              className="group perspective-1000"
              style={{ perspective: '1000px' }}
            >
              <div 
                className="relative w-full h-80 xs:h-96 sm:h-96 md:h-[26rem] lg:h-96 cursor-pointer transition-transform duration-700 transform-style-preserve-3d group-hover:rotate-y-180"
                style={{ transformStyle: 'preserve-3d' }}
              >
                {/* Front of card */}
                <motion.div
                  className="absolute inset-0 backface-hidden rounded-xl overflow-hidden bg-primary/10 border-primary/30 border-2 backdrop-blur-sm theme-transition"
                  style={{ backfaceVisibility: 'hidden' }}
                >
                  <div className="relative h-full flex flex-col">
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/10 opacity-20"></div>
                    
                    {/* Header with icon */}
                    <div className="relative p-4 sm:p-6 flex items-center justify-between">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="w-8 h-8 sm:w-12 sm:h-12 flex items-center justify-center">
                          {React.cloneElement(project.icon, { className: "w-4 h-4 sm:w-6 sm:h-6 text-primary" })}
                        </div>
                        <div>
                          <h3 className="text-lg sm:text-xl font-bold text-foreground">{project.title}</h3>
                          {project.featured && (
                            <Badge className="mt-1 text-xs sm:text-sm bg-primary/20 text-primary border-primary/30">
                              Featured
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="text-foreground/60 group-hover:text-primary transition-colors">
                        <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                    </div>

                    {/* Description */}
                    <div className="relative flex-1 p-4 sm:p-6 pt-0">
                      <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                        {project.description}
                      </p>
                    </div>

                    {/* Technologies */}
                    <div className="relative p-4 sm:p-6 pt-0">
                      <div className="flex flex-wrap gap-1 sm:gap-2">
                        {project.technologies.slice(0, 3).map((tech) => (
                          <Badge
                            key={tech}
                            variant="secondary"
                            className="text-xs bg-background/50 border-primary/20 text-foreground"
                          >
                            {tech}
                          </Badge>
                        ))}
                        {project.technologies.length > 3 && (
                          <Badge variant="secondary" className="text-xs bg-background/50 border-primary/20 text-foreground">
                            +{project.technologies.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Hover effect overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="absolute bottom-4 left-4 right-4 text-center">
                        <p className="text-white text-xs sm:text-sm font-medium">Hover to explore</p>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Back of card */}
                <motion.div
                  className="absolute inset-0 backface-hidden rotate-y-180 rounded-xl overflow-hidden bg-background/95 backdrop-blur-md border-2 border-primary/30 theme-transition"
                  style={{ backfaceVisibility: 'hidden' }}
                >
                  <div className="h-full flex flex-col p-4 sm:p-6">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                      <h3 className="text-lg sm:text-xl font-bold text-foreground">{project.title}</h3>
                      <div className="text-muted-foreground">
                        <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 rotate-180" />
                      </div>
                    </div>

                    {/* Long description */}
                    <div className="flex-1 mb-4 sm:mb-6">
                      <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                        {project.longDescription}
                      </p>
                    </div>

                    {/* All technologies */}
                    <div className="mb-4 sm:mb-6">
                      <h4 className="text-xs sm:text-sm font-semibold text-foreground mb-2 sm:mb-3">Technologies Used:</h4>
                      <div className="flex flex-wrap gap-1 sm:gap-2">
                        {project.technologies.map((tech) => (
                          <Badge
                            key={tech}
                            variant="secondary"
                            className="text-xs bg-primary/10 border-primary/20 text-primary"
                          >
                            {tech}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-2">
                      {project.demo ? (
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            openProjectLink(project.demo!);
                          }}
                          className="flex-1 bg-primary hover:bg-primary/80 text-primary-foreground text-xs sm:text-sm"
                        >
                          <Play className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                          Demo
                        </Button>
                      ) : project.video ? (
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            openProjectLink(project.video!);
                          }}
                          className="flex-1 bg-primary hover:bg-primary/80 text-primary-foreground text-xs sm:text-sm"
                        >
                          <Play className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                          Video
                        </Button>
                      ) : (
                        <div className="flex-1 px-2 sm:px-3 py-2 text-xs text-muted-foreground bg-muted/50 rounded-md border border-muted-foreground/20 flex items-center justify-center">
                          Demo Unavailable
                        </div>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          openProjectLink(project.github);
                        }}
                        className="flex-1 border-primary text-primary hover:bg-primary/10 text-xs sm:text-sm"
                      >
                        <Github className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                        Code
                      </Button>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center mt-16"
        >
          <Button
            size="lg"
            variant="outline"
            onClick={openGitHubProfile}
            className="border-primary text-primary hover:bg-primary/10 px-8 py-4 text-lg font-semibold group"
          >
            <span className="flex items-center gap-2">
              View All Projects on GitHub
              <ExternalLink className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </span>
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default Projects;
