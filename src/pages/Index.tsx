import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Camera, 
  Shield, 
  Clock, 
  CheckCircle2, 
  Users, 
  FileCheck, 
  ArrowRight,
  Smartphone,
  Monitor
} from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <FileCheck className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">Circulight</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/circulator">
              <Button variant="ghost">Circulator</Button>
            </Link>
            <Link to="/coordinator">
              <Button variant="ghost">Coordinator</Button>
            </Link>
            <Link to="/circulator">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 lg:py-32">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-accent/10 text-accent px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Shield className="w-4 h-4" />
            Automated Petition Validation
          </div>
          <h1 className="text-4xl lg:text-6xl font-bold mb-6 max-w-4xl mx-auto leading-tight">
            Validate Petitions in{' '}
            <span className="text-accent">Seconds</span>,{' '}
            Not Hours
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Circulight automates petition signature validation using OCR and real-time database verification. 
            Reduce errors, save time, and ensure compliance before mailing.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/circulator">
              <Button size="lg" className="gap-2">
                <Smartphone className="w-5 h-5" />
                Circulator Dashboard
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link to="/coordinator">
              <Button size="lg" variant="outline" className="gap-2">
                <Monitor className="w-5 h-5" />
                Coordinator Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">How It Works</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              From scanning to validation in under 5 seconds
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-2 hover:border-accent/50 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                  <Camera className="w-6 h-6 text-accent" />
                </div>
                <CardTitle>1. Scan Document</CardTitle>
                <CardDescription>
                  Use your device camera to capture petition sheets. Our OCR extracts names, addresses, and signatures automatically.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-accent/50 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-accent" />
                </div>
                <CardTitle>2. Auto-Validate</CardTitle>
                <CardDescription>
                  Each signature is verified against the voter database. Typos and handwriting errors are detected and flagged.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-accent/50 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                  <CheckCircle2 className="w-6 h-6 text-accent" />
                </div>
                <CardTitle>3. Review Results</CardTitle>
                <CardDescription>
                  Get instant feedback on each signature: Valid, Invalid, Duplicate, or Manual Review needed.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Status Codes Explanation */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Validation Status Codes</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Clear, immutable results you can trust
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4 max-w-5xl mx-auto">
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="w-12 h-12 rounded-full bg-status-valid mx-auto mb-3 flex items-center justify-center">
                  <span className="text-white font-bold text-xl">G</span>
                </div>
                <h3 className="font-semibold">Valid</h3>
                <p className="text-sm text-muted-foreground">Verified in database</p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="w-12 h-12 rounded-full bg-status-invalid mx-auto mb-3 flex items-center justify-center">
                  <span className="text-white font-bold text-xl">B</span>
                </div>
                <h3 className="font-semibold">Invalid</h3>
                <p className="text-sm text-muted-foreground">Not found in database</p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="w-12 h-12 rounded-full bg-status-manual mx-auto mb-3 flex items-center justify-center">
                  <span className="text-white font-bold text-xl">X</span>
                </div>
                <h3 className="font-semibold">Manual</h3>
                <p className="text-sm text-muted-foreground">Needs human review</p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="w-12 h-12 rounded-full bg-status-duplicate mx-auto mb-3 flex items-center justify-center">
                  <span className="text-white font-bold text-xl">D</span>
                </div>
                <h3 className="font-semibold">Duplicate</h3>
                <p className="text-sm text-muted-foreground">Already submitted</p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="w-12 h-12 rounded-full bg-status-pending mx-auto mb-3 flex items-center justify-center">
                  <span className="text-white font-bold text-xl">P</span>
                </div>
                <h3 className="font-semibold">Pending</h3>
                <p className="text-sm text-muted-foreground">Awaiting validation</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Dual Dashboard Section */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">Two Dashboards, One Mission</h2>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center shrink-0">
                    <Smartphone className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Circulator Dashboard</h3>
                    <p className="text-muted-foreground">
                      Mobile-first scanning interface. Capture petition sheets, view validation results, and track your submissions.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center shrink-0">
                    <Monitor className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Coordinator Dashboard</h3>
                    <p className="text-muted-foreground">
                      Web-based management console. Review batches, approve mailings, authorize payments, and generate reports.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Card className="bg-primary text-primary-foreground">
                <CardHeader>
                  <Clock className="w-8 h-8 mb-2" />
                  <CardTitle className="text-3xl">&lt;5s</CardTitle>
                  <CardDescription className="text-primary-foreground/80">
                    Scan to validation
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <CheckCircle2 className="w-8 h-8 mb-2 text-accent" />
                  <CardTitle className="text-3xl">99.9%</CardTitle>
                  <CardDescription>
                    Uptime during peaks
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <Users className="w-8 h-8 mb-2 text-primary" />
                  <CardTitle className="text-3xl">100%</CardTitle>
                  <CardDescription>
                    Automated validation
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card className="bg-accent text-accent-foreground">
                <CardHeader>
                  <Shield className="w-8 h-8 mb-2" />
                  <CardTitle className="text-3xl">Secure</CardTitle>
                  <CardDescription className="text-accent-foreground/80">
                    E2E encrypted
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Choose your dashboard and start validating petitions in seconds.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/circulator">
              <Button size="lg" className="gap-2 w-full sm:w-auto">
                <Smartphone className="w-5 h-5" />
                Open Circulator Dashboard
              </Button>
            </Link>
            <Link to="/coordinator">
              <Button size="lg" variant="outline" className="gap-2 w-full sm:w-auto">
                <Monitor className="w-5 h-5" />
                Open Coordinator Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <div className="flex items-center justify-center gap-2 mb-2">
            <FileCheck className="w-5 h-5" />
            <span className="font-semibold">Circulight</span>
          </div>
          <p className="text-sm">Automated Petition Validation Platform</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
