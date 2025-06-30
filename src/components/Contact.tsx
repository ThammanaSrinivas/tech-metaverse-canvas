import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Mail, Linkedin, Github, MapPin, FileText } from 'lucide-react';
import { validationUtils } from '@/lib/utils';
import ResumeButton from './ui/ResumeButton';

const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form data
    if (!validationUtils.isValidName(formData.name)) {
      toast({
        title: "Invalid Name",
        description: "Please enter a valid name (at least 2 characters).",
        variant: "destructive",
      });
      return;
    }

    if (!validationUtils.isValidEmail(formData.email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    if (!validationUtils.isValidMessage(formData.message)) {
      toast({
        title: "Invalid Message",
        description: "Please enter a message with at least 10 characters.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    // Simulate form submission
    setTimeout(() => {
      toast({
        title: "Message Sent!",
        description: "Thank you for your message. I'll get back to you soon!",
      });
      setFormData({ name: '', email: '', subject: '', message: '' });
      setIsSubmitting(false);
    }, 1000);
  };

  const contactInfo = [
    {
      title: "Email",
      value: "sreenivast84@gmail.com",
      icon: Mail,
      link: "mailto:sreenivast84@gmail.com"
    },
    {
      title: "LinkedIn",
      value: "/evolvedaily",
      icon: Linkedin,
      link: "https://www.linkedin.com/in/evolvedaily/"
    },
    {
      title: "GitHub",
      value: "/ThammanaSrinivas",
      icon: Github,
      link: "https://github.com/ThammanaSrinivas"
    },
    {
      title: "Location",
      value: "Chennai, India",
      icon: MapPin,
      link: null
    }
  ];

  return (
    <section id="contact" className="py-20 px-6">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl font-bold mb-6 text-foreground heading-primary">
            Let's Connect
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Ready to bring your ideas to life? Let's discuss your next project and create something amazing together.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Card className="glass-card border-primary/20">
              <CardHeader className="pb-4 sm:pb-6">
                <CardTitle className="text-xl sm:text-2xl font-bold text-primary heading-secondary">Send a Message</CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-sm sm:text-base">Name</Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="bg-background/50 border-primary/30 focus:border-primary text-sm sm:text-base"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm sm:text-base">Email</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="bg-background/50 border-primary/30 focus:border-primary text-sm sm:text-base"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="subject" className="text-sm sm:text-base">Subject</Label>
                    <Input
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      required
                      className="bg-background/50 border-primary/30 focus:border-primary text-sm sm:text-base"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="message" className="text-sm sm:text-base">Message</Label>
                    <Textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                      rows={4}
                      className="bg-background/50 border-primary/30 focus:border-primary resize-none text-sm sm:text-base"
                    />
                  </div>
                  
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-primary hover:bg-primary/80 text-primary-foreground neon-glow py-3 text-base sm:text-lg font-semibold"
                  >
                    {isSubmitting ? 'Sending...' : 'Send Message'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-6 sm:space-y-8"
          >
            <div>
              <h3 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-foreground heading-secondary">Get in Touch</h3>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-6 sm:mb-8">
                I'm always excited to work on new projects and collaborate with talented individuals. 
                Whether you have a specific project in mind or just want to chat about technology and design, 
                I'd love to hear from you.
              </p>
            </div>

            <div className="grid gap-3 sm:gap-4">
              {contactInfo.map((info, index) => {
                const IconComponent = info.icon;
                return (
                  <motion.div
                    key={info.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <Card className="glass-card border-primary/20 hover:border-primary/50 transition-all duration-300">
                      <CardContent className="p-4 sm:p-6">
                        <div className="flex items-center space-x-3 sm:space-x-4">
                          <div className="text-primary">
                            <IconComponent className="w-5 h-5 sm:w-6 sm:h-6" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="font-semibold text-foreground text-sm sm:text-base">{info.title}</h4>
                            {info.link ? (
                              <a
                                href={info.link}
                                className="text-primary hover:text-primary/80 transition-colors text-sm sm:text-base break-all"
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                {info.value}
                              </a>
                            ) : (
                              <p className="text-muted-foreground text-sm sm:text-base">{info.value}</p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>

            <div className="pt-6 sm:pt-8">
              <h4 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-foreground heading-secondary">Resume</h4>
              <ResumeButton size="lg" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
