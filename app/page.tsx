"use client";

import Link from 'next/link';
import Button from '@/components/ui/Button';
import { motion } from 'framer-motion';
import { FaRocket, FaCode, FaDatabase, FaLaptopCode, FaChartLine } from 'react-icons/fa';

// Animation variants
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6 }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

const featureCardVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { duration: 0.5 }
  },
  hover: { 
    scale: 1.05,
    boxShadow: "0px 5px 15px rgba(0,0,0,0.1)",
    transition: { duration: 0.3 }
  }
};

export default function Home() {
  return (
    <div className="bg-background">
      {/* Hero Section */}
      <section className="relative isolate overflow-hidden bg-gradient-to-b from-primary/5">
        <div className="mx-auto max-w-7xl pb-24 pt-10 sm:pb-32 lg:grid lg:grid-cols-2 lg:gap-x-8 lg:px-8 lg:py-40">
          <motion.div 
            className="px-6 lg:px-0 lg:pt-4"
            initial="hidden"
            animate="visible"
            variants={fadeIn}
          >
            <div className="mx-auto max-w-2xl">
              <div className="max-w-lg">
                <motion.h1 
                  className="mt-10 text-4xl font-bold tracking-tight text-primary sm:text-6xl"
                  variants={fadeIn}
                >
                  Dragon's Breath
                </motion.h1>
                <motion.p 
                  className="mt-6 text-xl leading-8 text-foreground"
                  variants={fadeIn}
                >
                  Comprehensive project planning and tracking for software development teams. 
                  Transform how you build software from concept to completion.
                </motion.p>
                <motion.div 
                  className="mt-10 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-x-6"
                  variants={fadeIn}
                >
                  <Link href="/signup">
                    <Button variant="primary" size="lg" className="w-full sm:w-auto">
                      Get started
                    </Button>
                  </Link>
                  <Link href="/login" className="text-sm font-semibold leading-6 text-primary">
                    Log in <span aria-hidden="true">→</span>
                  </Link>
                </motion.div>
                <motion.div 
                  className="mt-4"
                  variants={fadeIn}
                >
                  <Link href="/styleguide" className="text-sm text-accent hover:text-accent/80">
                    View Style Guide
                  </Link>
                </motion.div>
              </div>
            </div>
          </motion.div>
          <motion.div 
            className="mt-20 sm:mt-24 md:mx-auto md:max-w-2xl lg:mx-0 lg:mt-0 lg:w-screen"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <div className="shadow-xl md:rounded-3xl overflow-hidden">
              <div className="bg-primary [clip-path:inset(0)] md:[clip-path:inset(0_round_theme(borderRadius.3xl))]">
                <div className="p-10 sm:p-16 md:p-20 bg-gradient-to-r from-primary to-primary/80 h-full flex items-center justify-center">
                  <div className="text-white text-center">
                    <h2 className="text-2xl font-bold mb-4">Project Management Simplified</h2>
                    <p className="opacity-80">From concept to completion: Define requirements, select technology stacks, design database schemas, and create layouts all in one place.</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={fadeIn}
          >
            <h2 className="text-3xl font-bold text-primary sm:text-4xl mb-4">Why Choose Dragon's Breath?</h2>
            <p className="max-w-3xl mx-auto text-lg text-foreground/80">
              Our platform helps development teams define clear project specifications, establish best practices, and 
              maintain consistent development standards across your organization.
            </p>
          </motion.div>
          
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
          >
            {/* Feature 1 */}
            <motion.div 
              className="bg-white p-8 rounded-xl shadow-sm border border-slate-200"
              variants={featureCardVariants}
              whileHover="hover"
            >
              <div className="text-primary text-3xl mb-4">
                <FaRocket />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-foreground">Project Initialization</h3>
              <p className="text-foreground/70">
                Start new projects with pre-defined templates, technology stacks, and best practices for your organization.
              </p>
            </motion.div>

            {/* Feature 2 */}
            <motion.div 
              className="bg-white p-8 rounded-xl shadow-sm border border-slate-200"
              variants={featureCardVariants}
              whileHover="hover"
            >
              <div className="text-primary text-3xl mb-4">
                <FaDatabase />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-foreground">Database Design</h3>
              <p className="text-foreground/70">
                Define database schemas, relationships, and access patterns with interactive diagram tools.
              </p>
            </motion.div>

            {/* Feature 3 */}
            <motion.div 
              className="bg-white p-8 rounded-xl shadow-sm border border-slate-200"
              variants={featureCardVariants}
              whileHover="hover"
            >
              <div className="text-primary text-3xl mb-4">
                <FaCode />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-foreground">Codebase Standards</h3>
              <p className="text-foreground/70">
                Establish coding conventions, component libraries, and architectural guidelines for your team.
              </p>
            </motion.div>

            {/* Feature 4 */}
            <motion.div 
              className="bg-white p-8 rounded-xl shadow-sm border border-slate-200"
              variants={featureCardVariants}
              whileHover="hover"
            >
              <div className="text-primary text-3xl mb-4">
                <FaLaptopCode />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-foreground">Tech Stack Management</h3>
              <p className="text-foreground/70">
                Select and manage compatible technologies and frameworks for your projects.
              </p>
            </motion.div>

            {/* Feature 5 */}
            <motion.div 
              className="bg-white p-8 rounded-xl shadow-sm border border-slate-200"
              variants={featureCardVariants}
              whileHover="hover"
            >
              <div className="text-primary text-3xl mb-4">
                <FaChartLine />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-foreground">Progress Tracking</h3>
              <p className="text-foreground/70">
                Monitor development progress, identify bottlenecks, and keep stakeholders informed.
              </p>
            </motion.div>

            {/* Feature 6 */}
            <motion.div 
              className="bg-white p-8 rounded-xl shadow-sm border border-slate-200"
              variants={featureCardVariants}
              whileHover="hover"
            >
              <div className="text-primary text-3xl mb-4">
                <FaCode />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-foreground">AI-Assisted Planning</h3>
              <p className="text-foreground/70">
                Get intelligent recommendations for project structure, technology choices, and architecture decisions.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="max-w-3xl mx-auto text-center"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={fadeIn}
          >
            <h2 className="text-3xl font-bold mb-6">Ready to transform your development process?</h2>
            <p className="text-xl mb-8 opacity-90">
              Join teams who are building better software faster with Dragon's Breath.
            </p>
            <Link href="/signup">
              <Button 
                variant="secondary" 
                size="lg" 
                className="inline-block px-8 py-4 text-primary bg-white hover:bg-white/90"
              >
                Get Started Today
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}