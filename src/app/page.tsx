"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CalendarDays, Users, UserCheck, BarChart3, Plus, TrendingUp, ArrowRight, CheckCircle, Star, Heart, Building, GraduationCap, PartyPopper, Briefcase, ChevronDown, ChevronUp } from "lucide-react"
import Link from "next/link"
import type { DashboardStats } from "@/lib/analytics"

// Landing Page Component for non-authenticated users
function LandingPage() {
  const [activeStep, setActiveStep] = useState(1)
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null)

  // Hero Section
  const HeroSection = () => (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background/95 to-primary/5 overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>
      
      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-6 inline-flex items-center px-4 py-2 bg-primary/10 rounded-full text-sm font-medium text-primary animate-fade-in">
            <Star className="w-4 h-4 mr-2" />
            Trusted by 10,000+ Event Organizers
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent mb-6 animate-fade-in-up">
            Effortless Event
            <br />
            <span className="text-primary">Management</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto animate-fade-in-up delay-200">
            Create stunning events, track RSVPs in real-time, and analyze your success with our professional event management platform.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12 animate-fade-in-up delay-300">
            <Link href="/auth/register">
              <Button size="lg" className="text-lg px-8 py-6 group">
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button variant="outline" size="lg" className="text-lg px-8 py-6">
                Sign In
              </Button>
            </Link>
          </div>
          
          {/* Hero Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto animate-fade-in-up delay-500">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-1">50K+</div>
              <div className="text-sm text-muted-foreground">Events Created</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-1">2M+</div>
              <div className="text-sm text-muted-foreground">RSVPs Tracked</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-1">99.9%</div>
              <div className="text-sm text-muted-foreground">Uptime</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-1">24/7</div>
              <div className="text-sm text-muted-foreground">Support</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )

  // How It Works Section
  const HowItWorksSection = () => {
    const steps = [
      {
        number: 1,
        title: "Create Your Event",
        description: "Set up your event with all the details - date, time, location, and description.",
        icon: CalendarDays
      },
      {
        number: 2,
        title: "Invite Guests",
        description: "Send beautiful invitations via email or share your custom RSVP link.",
        icon: Users
      },
      {
        number: 3,
        title: "Track Responses",
        description: "Monitor RSVPs in real-time with detailed guest management tools.",
        icon: UserCheck
      },
      {
        number: 4,
        title: "Analyze Results",
        description: "Get insights with comprehensive analytics and export detailed reports.",
        icon: BarChart3
      }
    ]

    return (
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Get started in minutes with our intuitive 4-step process
            </p>
          </div>
          
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-4 gap-8">
              {steps.map((step, index) => {
                const Icon = step.icon
                const isActive = activeStep === step.number
                
                return (
                  <div
                    key={step.number}
                    className={`relative group cursor-pointer transition-all duration-300 ${
                      isActive ? 'scale-105' : 'hover:scale-105'
                    }`}
                    onMouseEnter={() => setActiveStep(step.number)}
                  >
                    <Card className={`h-full transition-all duration-300 ${
                      isActive ? 'shadow-lg border-primary/50 bg-primary/5' : 'hover:shadow-md'
                    }`}>
                      <CardContent className="p-8 text-center">
                        <div className={`w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center transition-all duration-300 ${
                          isActive ? 'bg-primary text-primary-foreground' : 'bg-primary/10 text-primary'
                        }`}>
                          <Icon className="h-8 w-8" />
                        </div>
                        
                        <div className={`text-sm font-bold mb-2 transition-colors ${
                          isActive ? 'text-primary' : 'text-muted-foreground'
                        }`}>
                          Step {step.number}
                        </div>
                        
                        <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                        <p className="text-muted-foreground">{step.description}</p>
                      </CardContent>
                    </Card>
                    
                    {index < steps.length - 1 && (
                      <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-8 z-10">
                        <ArrowRight className="w-6 h-6 text-primary/60" />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>
    )
  }

  // Feature Deep Dive Section
  const FeatureDeepDiveSection = () => {
    const features = [
      {
        icon: CalendarDays,
        title: "Smart Event Management",
        description: "Create unlimited events with rich customization options, recurring events, and automated reminders.",
        highlights: ["Unlimited events", "Custom branding", "Automated reminders", "Recurring events"]
      },
      {
        icon: UserCheck,
        title: "Advanced RSVP Tracking",
        description: "Real-time response tracking with yes/no/maybe options, dietary preferences, and plus-one management.",
        highlights: ["Real-time tracking", "Dietary preferences", "Plus-one support", "Custom questions"]
      },
      {
        icon: Users,
        title: "Comprehensive Guest Management",
        description: "Manage both registered users and guest attendees with advanced segmentation and communication tools.",
        highlights: ["Guest segmentation", "Bulk messaging", "Contact import", "Guest profiles"]
      },
      {
        icon: BarChart3,
        title: "Powerful Analytics & Reports",
        description: "Gain insights with detailed analytics, export capabilities, and custom report generation.",
        highlights: ["Real-time analytics", "Export to PDF/Excel", "Custom reports", "Response trends"]
      }
    ]

    return (
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Powerful Features</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Everything you need to manage successful events, all in one platform
            </p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-12 max-w-7xl mx-auto">
            {features.map((feature, index) => {
              const Icon = feature.icon
              
              return (
                <Card key={index} className="group hover:shadow-lg transition-all duration-300 overflow-hidden">
                  <CardContent className="p-8">
                    <div className="flex items-start gap-6">
                      <div className="flex-shrink-0">
                        <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                          <Icon className="h-8 w-8 text-primary-foreground" />
                        </div>
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="text-2xl font-semibold mb-3">{feature.title}</h3>
                        <p className="text-muted-foreground mb-4 leading-relaxed">{feature.description}</p>
                        
                        <div className="grid grid-cols-2 gap-2">
                          {feature.highlights.map((highlight, hIndex) => (
                            <div key={hIndex} className="flex items-center gap-2 text-sm">
                              <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                              <span>{highlight}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>
    )
  }

  // Use Cases Section
  const UseCasesSection = () => {
    const useCases = [
      {
        icon: Building,
        title: "Corporate Events",
        description: "Team meetings, conferences, and company celebrations",
        color: "from-blue-500 to-blue-600"
      },
      {
        icon: Heart,
        title: "Weddings",
        description: "Beautiful wedding planning with guest management",
        color: "from-pink-500 to-pink-600"
      },
      {
        icon: GraduationCap,
        title: "Conferences",
        description: "Professional conferences and educational seminars",
        color: "from-purple-500 to-purple-600"
      },
      {
        icon: PartyPopper,
        title: "Birthday Parties",
        description: "Personal celebrations and milestone events",
        color: "from-yellow-500 to-yellow-600"
      },
      {
        icon: Briefcase,
        title: "Workshops",
        description: "Training sessions and professional workshops",
        color: "from-green-500 to-green-600"
      },
      {
        icon: Users,
        title: "Social Gatherings",
        description: "Community events and social meetups",
        color: "from-indigo-500 to-indigo-600"
      }
    ]

    return (
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Perfect for Any Event</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              From intimate gatherings to large-scale conferences, our platform adapts to your needs
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {useCases.map((useCase, index) => {
              const Icon = useCase.icon
              
              return (
                <Card key={index} className="group hover:shadow-lg transition-all duration-300 overflow-hidden border-0">
                  <CardContent className="p-6">
                    <div className="text-center">
                      <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${useCase.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                        <Icon className="h-8 w-8 text-white" />
                      </div>
                      
                      <h3 className="text-xl font-semibold mb-2">{useCase.title}</h3>
                      <p className="text-muted-foreground">{useCase.description}</p>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>
    )
  }

  // FAQ Section
  const FAQSection = () => {
    const faqs = [
      {
        question: "How many events can I create?",
        answer: "Our free plan allows up to 3 events per month. Pro and Enterprise plans offer unlimited events with additional features like custom branding and advanced analytics."
      },
      {
        question: "Is there a limit on the number of guests?",
        answer: "Free plan supports up to 100 guests per event. Pro plan supports up to 1,000 guests, and Enterprise plan offers unlimited guests with premium support."
      },
      {
        question: "Can I customize the RSVP forms?",
        answer: "Yes! You can add custom questions, collect dietary preferences, manage plus-ones, and fully customize the look and feel of your RSVP forms."
      },
      {
        question: "What integrations are available?",
        answer: "We integrate with Google Calendar, Outlook, Mailchimp, Zoom, and many other popular tools. API access is available for Enterprise customers."
      },
      {
        question: "Is my data secure?",
        answer: "Absolutely. We use enterprise-grade security with SSL encryption, regular backups, and GDPR compliance. Your data is safe and private."
      },
      {
        question: "Can I export my event data?",
        answer: "Yes, you can export guest lists, RSVP responses, and analytics in multiple formats including CSV, Excel, and PDF reports."
      },
      {
        question: "Do you offer customer support?",
        answer: "We provide email support for all users, with priority support for Pro customers and dedicated support for Enterprise clients."
      },
      {
        question: "Can I cancel my subscription anytime?",
        answer: "Yes, you can cancel your subscription at any time. No long-term contracts or cancellation fees. Your data remains accessible even after cancellation."
      }
    ]

    return (
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Everything you need to know about our event management platform
            </p>
          </div>
          
          <div className="max-w-3xl mx-auto">
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <Card key={index} className="overflow-hidden">
                  <CardContent className="p-0">
                    <button
                      className="w-full p-6 text-left flex justify-between items-center hover:bg-muted/50 transition-colors"
                      onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                    >
                      <h3 className="text-lg font-semibold pr-4">{faq.question}</h3>
                      {expandedFaq === index ? (
                        <ChevronUp className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                      )}
                    </button>
                    
                    {expandedFaq === index && (
                      <div className="px-6 pb-6">
                        <p className="text-muted-foreground leading-relaxed">{faq.answer}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>
    )
  }

  // Final CTA Section
  const FinalCTASection = () => (
    <section className="py-20 bg-gradient-to-r from-primary to-primary/90">
      <div className="container mx-auto px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl font-bold text-primary-foreground mb-4">
            Ready to Transform Your Events?
          </h2>
          <p className="text-xl text-primary-foreground/90 mb-8">
            Join thousands of event organizers who trust our platform for their most important events.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/register">
              <Button size="lg" variant="secondary" className="text-lg px-8 py-6">
                Start Your Free Trial
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10">
                Sign In
              </Button>
            </Link>
          </div>
          
          <p className="text-sm text-primary-foreground/80 mt-6">
            No credit card required • 14-day free trial • Cancel anytime
          </p>
        </div>
      </div>
    </section>
  )

  return (
    <div className="min-h-screen bg-background">
      <style jsx global>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out;
        }
        
        .delay-200 {
          animation-delay: 0.2s;
          animation-fill-mode: both;
        }
        
        .delay-300 {
          animation-delay: 0.3s;
          animation-fill-mode: both;
        }
        
        .delay-500 {
          animation-delay: 0.5s;
          animation-fill-mode: both;
        }
        
        .delay-1000 {
          animation-delay: 1s;
        }
      `}</style>
      
      <HeroSection />
      <HowItWorksSection />
      <FeatureDeepDiveSection />
      <UseCasesSection />
      <FAQSection />
      <FinalCTASection />
    </div>
  )
}

export default function HomePage() {
  const { user, loading } = useAuth()
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null)
  const [statsLoading, setStatsLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchDashboardStats()
    }
  }, [user])

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch("/api/analytics/dashboard")
      if (response.ok) {
        const data = await response.json()
        setDashboardStats(data.stats)
      }
    } catch (error) {
      console.error("Error fetching dashboard stats:", error)
    } finally {
      setStatsLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <LandingPage />
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold mb-2">Dashboard</h2>
            <p className="text-muted-foreground">
              Welcome back, {user.name}! Heres an overview of your events and RSVPs
            </p>
          </div>
          <Link href="/events/create">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Event
            </Button>
          </Link>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Events</p>
                  <div className="text-2xl font-bold">
                    {statsLoading ? (
                      <div className="animate-pulse bg-muted h-8 w-12 rounded"></div>
                    ) : (
                      dashboardStats?.totalEvents || 0
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{dashboardStats?.upcomingEvents || 0} upcoming</p>
                </div>
                <CalendarDays className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Responses</p>
                  <div className="text-2xl font-bold">
                    {statsLoading ? (
                      <div className="animate-pulse bg-muted h-8 w-12 rounded"></div>
                    ) : (
                      (dashboardStats?.totalRSVPs || 0) + (dashboardStats?.totalGuests || 0)
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {dashboardStats?.totalRSVPs || 0} users, {dashboardStats?.totalGuests || 0} guests
                  </p>
                </div>
                <UserCheck className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Confirmed Attending</p>
                  <div className="text-2xl font-bold">
                    {statsLoading ? (
                      <div className="animate-pulse bg-muted h-8 w-12 rounded"></div>
                    ) : (
                      dashboardStats?.totalAttending || 0
                    )}
                  </div>
                  <p className="text-xs text-green-600 mt-1">{dashboardStats?.responseRate || 0}% response rate</p>
                </div>
                <Users className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Response Rate</p>
                  <div className="text-2xl font-bold">
                    {statsLoading ? (
                      <div className="animate-pulse bg-muted h-8 w-12 rounded"></div>
                    ) : (
                      `${dashboardStats?.responseRate || 0}%`
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Across all events</p>
                </div>
                <TrendingUp className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarDays className="h-5 w-5 text-primary" />
                My Events
              </CardTitle>
              <CardDescription>View and manage your created events</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/events">
                <Button className="w-full">View Events</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-primary" />
                RSVP Responses
              </CardTitle>
              <CardDescription>Track attendee responses and confirmations</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/events">
                <Button className="w-full">Manage RSVPs</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Analytics
              </CardTitle>
              <CardDescription>View detailed reports and statistics</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/analytics">
                <Button className="w-full">View Analytics</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
