import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { ArrowRight, Mail, Zap, BarChart3, Users, Shield, Wand2 } from "lucide-react";
import { getLoginUrl } from "@/const";
import { Link } from "wouter";

export default function Home() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-white text-charcoal selection:bg-primary/20">
      {/* Navigation */}
      <nav className="border-b border-gray-100 py-4 px-6 md:px-12 flex justify-between items-center bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="bg-primary p-1.5 rounded-lg">
            <Mail className="text-white w-6 h-6" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-charcoal">MailCraft</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
          <a href="#features" className="hover:text-primary transition-colors">Features</a>
          <a href="#solutions" className="hover:text-primary transition-colors">Solutions</a>
          <a href="#pricing" className="hover:text-primary transition-colors">Pricing</a>
        </div>
        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <Link href="/dashboard">
              <Button className="bg-primary text-white hover:bg-primary/90 rounded-full px-6">
                Go to Dashboard
              </Button>
            </Link>
          ) : (
            <a href={getLoginUrl()}>
              <Button className="bg-primary text-white hover:bg-primary/90 rounded-full px-6">
                Get Started Free
              </Button>
            </a>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 px-6 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full -z-10">
          <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-primary/5 rounded-full blur-3xl opacity-60 animate-pulse" />
          <div className="absolute bottom-[10%] left-[-10%] w-80 h-80 bg-primary/10 rounded-full blur-3xl opacity-40 animate-pulse" />
        </div>

        <div className="max-w-5xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/5 border border-primary/10 text-primary text-sm font-medium animate-fade-in">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            New: AI-Powered Email Generation
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-charcoal leading-[1.1]">
            Build better emails <br />
            <span className="text-primary">in minutes</span>, not hours.
          </h1>
          
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            MailCraft is the all-in-one email marketing platform designed for modern SaaS companies.
            Scale your growth with intelligent automation and stunning designs.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <a href={getLoginUrl()}>
              <Button className="w-full sm:w-auto h-14 px-8 text-lg bg-primary text-white hover:bg-primary/90 rounded-full gap-2 shadow-lg shadow-primary/25 transition-all hover:scale-105 active:scale-95">
                Start Creating Free <ArrowRight size={20} />
              </Button>
            </a>
            <Button variant="outline" className="w-full sm:w-auto h-14 px-8 text-lg border-gray-200 text-charcoal hover:bg-gray-50 rounded-full transition-all">
              Watch Demo
            </Button>
          </div>

          <div className="pt-12 animate-float">
             <div className="relative mx-auto max-w-4xl rounded-2xl border border-gray-200 bg-white/50 p-2 shadow-2xl backdrop-blur-sm">
                <img 
                  src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2426&auto=format&fit=crop" 
                  alt="MailCraft Dashboard" 
                  className="rounded-xl border border-gray-100 shadow-sm"
                />
             </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-5xl font-bold text-charcoal">Powerful tools for scale</h2>
            <p className="text-gray-600 max-w-xl mx-auto text-lg">Everything you need to run successful email campaigns at any scale.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Zap className="w-6 h-6" />}
              title="Drag & Drop Builder"
              description="Create beautiful, responsive emails without writing a single line of code using our intuitive editor."
            />
            <FeatureCard 
              icon={<Wand2 className="w-6 h-6" />}
              title="AI Content Assistant"
              description="Never face writer's block again. Our AI generates high-converting copy and subject lines instantly."
            />
            <FeatureCard 
              icon={<BarChart3 className="w-6 h-6" />}
              title="Real-time Analytics"
              description="Track opens, clicks, and conversions as they happen with our detailed analytics dashboard."
            />
            <FeatureCard 
              icon={<Users className="w-6 h-6" />}
              title="Smart Segmentation"
              description="Target the right audience with advanced filtering based on user behavior and demographics."
            />
            <FeatureCard 
              icon={<Shield className="w-6 h-6" />}
              title="High Deliverability"
              description="Rest easy knowing your emails reach the inbox with our industry-leading delivery infrastructure."
            />
            <FeatureCard 
              icon={<Mail className="w-6 h-6" />}
              title="Pre-built Templates"
              description="Jumpstart your campaigns with dozens of professional templates designed for every occasion."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto rounded-3xl bg-charcoal p-12 md:p-20 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
          
          <div className="relative z-10 space-y-8">
            <h2 className="text-4xl md:text-5xl font-bold text-white">Ready to transform your email marketing?</h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">Join 10,000+ businesses growing their audience with MailCraft today.</p>
            <a href={getLoginUrl()} className="inline-block">
              <Button className="h-14 px-10 text-lg bg-primary text-white hover:bg-primary/90 rounded-full gap-2 transition-all hover:scale-105 active:scale-95">
                Get Started Now <ArrowRight size={20} />
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="bg-primary p-1 rounded-lg">
              <Mail className="text-white w-4 h-4" />
            </div>
            <span className="text-lg font-bold text-charcoal">MailCraft</span>
          </div>
          <div className="flex gap-8 text-sm text-gray-500">
            <a href="#" className="hover:text-primary transition-colors">Privacy</a>
            <a href="#" className="hover:text-primary transition-colors">Terms</a>
            <a href="#" className="hover:text-primary transition-colors">Contact</a>
          </div>
          <p className="text-sm text-gray-400">© 2025 MailCraft Inc. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="p-8 rounded-2xl bg-white border border-gray-100 hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5 transition-all group">
      <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center text-gray-600 group-hover:bg-primary group-hover:text-white transition-colors mb-6">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-charcoal mb-3">{title}</h3>
      <p className="text-gray-600 leading-relaxed">{description}</p>
    </div>
  );
}

