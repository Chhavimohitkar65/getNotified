import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Bell, CheckCircle, Zap, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Navbar from '../components/layout/Navbar';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 px-4">
          <div className="max-w-5xl mx-auto text-center">
            <div className="inline-flex items-center px-3 py-1 mb-6 text-sm rounded-full bg-primary/10 text-primary">
              <Bell className="w-4 h-4 mr-2" />
              <span>Introducing Get Notified</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Simple, Reliable Notification Delivery
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-3xl mx-auto">
              The easiest way to send notifications across multiple channels from your application.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg" asChild>
                <Link to="/signup">Get Started</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/login">Log In</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 px-4 bg-muted/30">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">Simple by Design</h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Everything you need to send notifications to your users, with more channels coming soon.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-card p-6 rounded-lg border shadow-sm">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <CheckCircle className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Easy Integration</h3>
                <p className="text-muted-foreground">
                  Integrate with our simple API in minutes. Just a few lines of code to send notifications.
                </p>
              </div>

              <div className="bg-card p-6 rounded-lg border shadow-sm">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Multiple Channels</h3>
                <p className="text-muted-foreground">
                  Start with email today, with SMS, push notifications, and WhatsApp coming soon.
                </p>
              </div>

              <div className="bg-card p-6 rounded-lg border shadow-sm">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Reliable Delivery</h3>
                <p className="text-muted-foreground">
                  Track status and delivery of every notification with detailed logs and analytics.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to get started?</h2>
            <p className="text-xl text-muted-foreground mb-8">
              Create an account today and start sending notifications in minutes.
            </p>
            <Button size="lg" asChild>
              <Link to="/signup">
                Sign Up Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-12 px-4 border-t">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center mr-2">
                <Bell className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-bold text-xl">Get Notified</span>
            </div>
            <div className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} Get Notified. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;