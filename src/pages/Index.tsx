import { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { 
  TrendingUp, 
  Bot, 
  Coins,
  BarChart3, 
  Shield, 
  Star,
  ArrowUpRight,
  DollarSign,
  Users,
  Sparkles,
  Building2,
  ExternalLink,
  ShoppingBag,
  CheckCircle,
  Zap,
  Globe,
  Target,
  Award,
  Clock,
  ChevronRight
} from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';
import { exchanges } from '@/lib/data/exchanges';
import { ExchangeLogos } from '@/components/icons/ExchangeLogos';
import { useTranslations } from '@/contexts/I18nContext';

const Index = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const t = useTranslations('home');

  // 번역된 데이터를 직접 사용
  const testimonials = [
    {
      name: t('testimonials.0.name'),
      role: t('testimonials.0.role'),
      company: t('testimonials.0.company'),
      quote: t('testimonials.0.quote'),
      rating: 5
    },
    {
      name: t('testimonials.1.name'),
      role: t('testimonials.1.role'),
      company: t('testimonials.1.company'),
      quote: t('testimonials.1.quote'),
      rating: 5
    },
    {
      name: t('testimonials.2.name'),
      role: t('testimonials.2.role'),
      company: t('testimonials.2.company'),
      quote: t('testimonials.2.quote'),
      rating: 5
    }
  ];

  const features = [
    {
      title: t('features.0.title'),
      description: t('features.0.description'),
      icon: <Building2 className="w-8 h-8" />,
      image: "📊",
      highlights: [
        t('features.0.highlights.0'),
        t('features.0.highlights.1'),
        t('features.0.highlights.2')
      ]
    },
    {
      title: t('features.1.title'),
      description: t('features.1.description'),
      icon: <Bot className="w-8 h-8" />,
      image: "🤖",
      highlights: [
        t('features.1.highlights.0'),
        t('features.1.highlights.1'),
        t('features.1.highlights.2')
      ]
    },
    {
      title: t('features.2.title'),
      description: t('features.2.description'),
      icon: <ExternalLink className="w-8 h-8" />,
      image: "🔗",
      highlights: [
        t('features.2.highlights.0'),
        t('features.2.highlights.1'),
        t('features.2.highlights.2')
      ]
    },
    {
      title: t('features.3.title'),
      description: t('features.3.description'),
      icon: <ShoppingBag className="w-8 h-8" />,
      image: "🛒",
      highlights: [
        t('features.3.highlights.0'),
        t('features.3.highlights.1'),
        t('features.3.highlights.2')
      ]
    }
  ];

  const faqItems = [
    {
      question: t('faq.items.0.question'),
      answer: t('faq.items.0.answer')
    },
    {
      question: t('faq.items.1.question'),
      answer: t('faq.items.1.answer')
    },
    {
      question: t('faq.items.2.question'),
      answer: t('faq.items.2.answer')
    },
    {
      question: t('faq.items.3.question'),
      answer: t('faq.items.3.answer')
    },
    {
      question: t('faq.items.4.question'),
      answer: t('faq.items.4.answer')
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-muted/20"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsl(var(--primary))_0%,transparent_50%)] opacity-10"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,hsl(var(--accent))_0%,transparent_50%)] opacity-5"></div>
        
        <div className="container relative z-10 px-4 text-center">
          <div className="max-w-5xl mx-auto space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium">
              <Sparkles className="w-4 h-4 mr-2" />
              {t('hero.titleHighlight')} • 2,000+ 활성 파트너
            </div>

            {/* Main Headlines */}
            <div className="space-y-6">
              <h1 className="text-6xl md:text-8xl font-bold tracking-tight">
                <span className="block text-foreground">One Hub.</span>
                <span className="block bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-gradient bg-[length:200%_auto]">
                  Infinite Earnings.
                </span>
              </h1>
              
              <div className="max-w-3xl mx-auto space-y-4">
                <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed">
                  {t('hero.subtitle')}
                </p>
                <p className="text-lg text-muted-foreground/80">
                  투명한 정산 • CTOSS 토큰 보상 • 24시간 AI 지원
                </p>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
              <Button 
                size="lg" 
                className="bg-primary text-primary-foreground hover:bg-primary/90 text-lg font-semibold px-8 py-4 h-auto shadow-lg hover:shadow-xl transition-all duration-300"
                onClick={() => navigate(isAuthenticated ? "/dashboard" : "/auth/signup")}
              >
                {isAuthenticated ? "대시보드 가기" : "무료로 시작하기"}
                <ArrowUpRight className="w-5 h-5 ml-2" />
              </Button>
              
              <Button 
                size="lg" 
                variant="outline" 
                className="border-2 text-lg font-medium px-8 py-4 h-auto hover:bg-muted/50 transition-all duration-300"
                onClick={() => navigate("/partner-hub")}
              >
                파트너 허브 둘러보기
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-16 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">85%</div>
                <div className="text-sm text-muted-foreground">최고 커미션율</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-accent">2,000+</div>
                <div className="text-sm text-muted-foreground">활성 파트너</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-400">6개</div>
                <div className="text-sm text-muted-foreground">지원 거래소</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-400">24/7</div>
                <div className="text-sm text-muted-foreground">AI 자동화</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Value Proposition Section */}
      <section className="py-24 border-t border-border/50">
        <div className="container px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="text-foreground">왜 </span>
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">CoinToss</span>
              <span className="text-foreground">인가?</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              차별화된 기술과 서비스로 파트너의 성공을 보장합니다
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="relative group hover:shadow-lg transition-all duration-300 border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-2xl flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <TrendingUp className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="text-xl">업계 최고 커미션</CardTitle>
                <CardDescription>
                  최대 85%의 업계 최고 커미션율로 수익을 극대화하세요
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="relative group hover:shadow-lg transition-all duration-300 border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-accent/10 rounded-2xl flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                  <Shield className="w-8 h-8 text-accent" />
                </div>
                <CardTitle className="text-xl">투명한 정산</CardTitle>
                <CardDescription>
                  실시간 투명한 정산과 매일 자동 지급으로 신뢰를 보장합니다
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="relative group hover:shadow-lg transition-all duration-300 border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-blue-500/10 rounded-2xl flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                  <Bot className="w-8 h-8 text-blue-400" />
                </div>
                <CardTitle className="text-xl">AI 파트너 팀</CardTitle>
                <CardDescription>
                  크레아와 대니가 24시간 콘텐츠 생성과 데이터 분석을 자동 수행
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="relative group hover:shadow-lg transition-all duration-300 border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-purple-500/10 rounded-2xl flex items-center justify-center group-hover:bg-purple-500/20 transition-colors">
                  <Coins className="w-8 h-8 text-purple-400" />
                </div>
                <CardTitle className="text-xl">마켓플레이스 + MyLink</CardTitle>
                <CardDescription>
                  개인 브랜드 구축과 디지털 상품 판매로 다양한 수익원 창출
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="py-24 bg-muted/20">
        <div className="container px-4">
          {/* Exchange Logos */}
          <div className="text-center mb-16">
            <h3 className="text-2xl font-semibold mb-8 text-muted-foreground">
              {t('socialProof.title')}
            </h3>
            <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
              {exchanges.map((exchange) => {
                const LogoComponent = ExchangeLogos[exchange.logoKey];
                return (
                  <div key={exchange.name} className="flex items-center space-x-3 hover:opacity-100 transition-opacity">
                    <LogoComponent size={32} className="transition-transform hover:scale-110" />
                    <span className="text-lg font-medium text-muted-foreground">{exchange.name}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Testimonials */}
          <div className="max-w-4xl mx-auto">
            <h3 className="text-3xl font-bold text-center mb-12">파트너들의 생생한 후기</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <Card key={index} className="bg-card/80 backdrop-blur-sm border-border/50">
                  <CardHeader>
                    <div className="flex items-center space-x-1 mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <CardDescription className="text-base italic">
                      "{testimonial.quote}"
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div>
                      <p className="font-semibold">{testimonial.name}</p>
                      <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                      <p className="text-sm text-muted-foreground">{testimonial.company}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlight Section */}
      <section className="py-24">
        <div className="container px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="text-foreground">올인원 </span>
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">플랫폼</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              모든 기능이 하나의 허브에서, 효율적인 파트너 비즈니스 관리
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {features.map((feature, index) => (
              <div key={feature.title} className={`flex ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} items-center gap-8`}>
                <div className="flex-1 space-y-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                      {feature.icon}
                    </div>
                    <h3 className="text-2xl font-bold">{feature.title}</h3>
                  </div>
                  
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                  
                  <ul className="space-y-2">
                    {feature.highlights.map((highlight, i) => (
                      <li key={i} className="flex items-center space-x-3">
                        <CheckCircle className="w-5 h-5 text-accent shrink-0" />
                        <span className="text-muted-foreground">{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="flex-1 bg-muted/20 rounded-2xl p-8 text-center">
                  <div className="text-8xl mb-4">{feature.image}</div>
                  <p className="text-muted-foreground">실제 인터페이스 미리보기</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 bg-muted/20 relative overflow-hidden">
        <div className="absolute top-4 right-4">
          <Badge className="bg-destructive text-destructive-foreground animate-pulse">
            <Clock className="w-4 h-4 mr-1" />
            Limited Seats
          </Badge>
        </div>
        
        <div className="container px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-8">
              <span className="text-foreground">지금 시작하면 받는 </span>
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">특별 혜택</span>
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              <Card className="bg-card/80 backdrop-blur-sm border-primary/20">
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                    <Award className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-left">보너스 커미션 +10%</CardTitle>
                  <CardDescription className="text-left">
                    첫 3개월간 모든 거래소에서 추가 10% 커미션 보너스
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="bg-card/80 backdrop-blur-sm border-blue-400/20">
                <CardHeader>
                  <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mb-4">
                    <Zap className="w-6 h-6 text-blue-400" />
                  </div>
                  <CardTitle className="text-left">AI 우선 액세스</CardTitle>
                  <CardDescription className="text-left">
                    신규 AI 기능과 업데이트를 가장 먼저 경험할 수 있는 베타 액세스
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="bg-card/80 backdrop-blur-sm border-purple-400/20">
                <CardHeader>
                  <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center mb-4">
                    <Coins className="w-6 h-6 text-purple-400" />
                  </div>
                  <CardTitle className="text-left">1,000 CTOSS 토큰</CardTitle>
                  <CardDescription className="text-left">
                    가입 즉시 1,000 CTOSS 토큰 지급 및 스테이킹 보너스 혜택
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="bg-card/80 backdrop-blur-sm border-accent/20">
                <CardHeader>
                  <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center mb-4">
                    <Target className="w-6 h-6 text-accent" />
                  </div>
                  <CardTitle className="text-left">전담 매니저 배정</CardTitle>
                  <CardDescription className="text-left">
                    성공적인 런칭을 위한 1:1 전담 매니저와 맞춤형 컨설팅 제공
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>

            <div className="bg-primary/5 border border-primary/20 rounded-2xl p-8">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <Globe className="w-6 h-6 text-primary" />
                <span className="text-lg font-semibold">글로벌 런칭 기념</span>
              </div>
              <p className="text-muted-foreground mb-6">
                한정된 얼리 어답터 자격으로 모든 프리미엄 기능을 평생 무료로 이용하세요
              </p>
              <div className="text-2xl font-bold text-primary mb-2">남은 자리: 47/100</div>
              <div className="w-full bg-muted rounded-full h-2 mb-6">
                <div className="bg-primary h-2 rounded-full" style={{ width: '53%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24">
        <div className="container px-4">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-6">자주 묻는 질문</h2>
              <p className="text-xl text-muted-foreground">
                CoinToss에 대해 궁금한 점들을 확인해보세요
              </p>
            </div>

            <Accordion type="single" collapsible className="space-y-4">
              {faqItems.map((item, index) => (
                <AccordionItem 
                  key={index} 
                  value={`item-${index}`} 
                  className="border border-border/50 rounded-lg px-6 bg-card/30 backdrop-blur-sm"
                >
                  <AccordionTrigger className="text-left py-6 hover:no-underline">
                    <span className="text-lg font-medium">{item.question}</span>
                  </AccordionTrigger>
                  <AccordionContent className="pb-6 text-muted-foreground leading-relaxed">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>

            <div className="text-center mt-12">
              <p className="text-muted-foreground mb-4">
                더 궁금한 점이 있으신가요?
              </p>
              <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                문의하기
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-24 bg-gradient-to-br from-primary/5 via-accent/5 to-purple-500/5 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,hsl(var(--primary))_0%,transparent_70%)] opacity-10"></div>
        
        <div className="container px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="space-y-6">
              <h2 className="text-5xl md:text-6xl font-bold leading-tight">
                <span className="block text-foreground">Join</span>
                <span className="block bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                  2,000+ partners
                </span>
                <span className="block text-foreground">already growing with CoinToss</span>
              </h2>
              
              <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                지금 시작하여 업계 최고 수익률과 AI 자동화의 혜택을 누리세요
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center pt-8">
              <Button 
                size="lg" 
                className="bg-primary text-primary-foreground hover:bg-primary/90 text-xl font-bold px-12 py-6 h-auto shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
                onClick={() => navigate(isAuthenticated ? "/dashboard" : "/auth/signup")}
              >
                Start Earning Today
                <ArrowUpRight className="w-6 h-6 ml-3" />
              </Button>
            </div>

            <div className="pt-12 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">85%</div>
                <div className="text-muted-foreground">최고 커미션율</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-accent">24/7</div>
                <div className="text-muted-foreground">AI 자동화</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-400">무료</div>
                <div className="text-muted-foreground">가입 및 이용</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;