import { useState } from 'react';
import { Section } from '@/lib/types/mylink';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, GripVertical } from 'lucide-react';

interface SectionEditorProps {
  sections: Section[];
  onSectionUpdate: (index: number, section: Section) => void;
}

export function SectionEditor({ sections, onSectionUpdate }: SectionEditorProps) {
  const [selectedSectionIndex, setSelectedSectionIndex] = useState<number>(0);
  
  const selectedSection = sections[selectedSectionIndex];

  const updateSection = (updates: any) => {
    const updatedSection = { ...selectedSection, ...updates } as Section;
    onSectionUpdate(selectedSectionIndex, updatedSection);
  };

  const renderHeroEditor = (section: Extract<Section, { type: 'hero' }>) => (
    <div className="space-y-4">
      <div>
        <Label>뱃지</Label>
        <div className="flex flex-wrap gap-2 mt-2 mb-2">
          {section.badges?.map((badge, index) => (
            <Badge key={index} variant="secondary" className="cursor-pointer">
              {badge}
              <button
                onClick={() => {
                  const newBadges = section.badges?.filter((_, i) => i !== index) || [];
                  updateSection({ badges: newBadges });
                }}
                className="ml-1 text-xs"
              >
                ×
              </button>
            </Badge>
          ))}
        </div>
        <div className="flex gap-2">
          <Input 
            placeholder="뱃지 추가" 
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                const input = e.target as HTMLInputElement;
                const newBadges = [...(section.badges || []), input.value];
                updateSection({ badges: newBadges });
                input.value = '';
              }
            }}
          />
          <Button size="sm" variant="outline">
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );

  const renderExchangesEditor = (section: Extract<Section, { type: 'exchanges' }>) => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Label>거래소 링크</Label>
        <Button 
          size="sm" 
          onClick={() => {
            const newItems = [...section.items, {
              exchangeId: 'bybit',
              chosenMode: 'basic' as const,
              buttonLabel: 'Bybit 시작하기'
            }];
            updateSection({ items: newItems });
          }}
        >
          <Plus className="w-4 h-4 mr-1" />
          추가
        </Button>
      </div>
      
      <div className="space-y-3">
        {section.items.map((item, index) => (
          <Card key={index} className="p-3">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Select 
                  value={item.exchangeId}
                  onValueChange={(value) => {
                    const newItems = [...section.items];
                    newItems[index] = { ...item, exchangeId: value };
                    updateSection({ items: newItems });
                  }}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bybit">Bybit</SelectItem>
                    <SelectItem value="binance">Binance</SelectItem>
                    <SelectItem value="okx">OKX</SelectItem>
                    <SelectItem value="gate">Gate.io</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    const newItems = section.items.filter((_, i) => i !== index);
                    updateSection({ items: newItems });
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              
              <div>
                <Label className="text-xs">연동 모드</Label>
                <Select
                  value={item.chosenMode}
                  onValueChange={(value: 'basic' | 'approved') => {
                    const newItems = [...section.items];
                    newItems[index] = { ...item, chosenMode: value };
                    updateSection({ items: newItems });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="basic">기본 연동 (25%)</SelectItem>
                    <SelectItem value="approved">승인 연동 (85%)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label className="text-xs">버튼 텍스트</Label>
                <Input
                  value={item.buttonLabel || ''}
                  onChange={(e) => {
                    const newItems = [...section.items];
                    newItems[index] = { ...item, buttonLabel: e.target.value };
                    updateSection({ items: newItems });
                  }}
                  placeholder="거래소 시작하기"
                />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderProductsEditor = (section: Extract<Section, { type: 'products' }>) => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Label>마켓플레이스 상품</Label>
        <Button 
          size="sm"
          onClick={() => {
            const newItems = [...section.items, {
              productId: 'product-1',
              highlight: '핵심 혜택',
              ctaLabel: '구매하기'
            }];
            updateSection({ items: newItems });
          }}
        >
          <Plus className="w-4 h-4 mr-1" />
          추가
        </Button>
      </div>
      
      <div className="space-y-3">
        {section.items.map((item, index) => (
          <Card key={index} className="p-3">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Input
                  value={item.productId}
                  onChange={(e) => {
                    const newItems = [...section.items];
                    newItems[index] = { ...item, productId: e.target.value };
                    updateSection({ items: newItems });
                  }}
                  placeholder="상품 ID"
                />
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    const newItems = section.items.filter((_, i) => i !== index);
                    updateSection({ items: newItems });
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              
              <div>
                <Label className="text-xs">핵심 효용</Label>
                <Input
                  value={item.highlight || ''}
                  onChange={(e) => {
                    const newItems = [...section.items];
                    newItems[index] = { ...item, highlight: e.target.value };
                    updateSection({ items: newItems });
                  }}
                  placeholder="한줄로 핵심 혜택 설명"
                />
              </div>
              
              <div>
                <Label className="text-xs">CTA 버튼</Label>
                <Input
                  value={item.ctaLabel || ''}
                  onChange={(e) => {
                    const newItems = [...section.items];
                    newItems[index] = { ...item, ctaLabel: e.target.value };
                    updateSection({ items: newItems });
                  }}
                  placeholder="구매하기"
                />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderLeadEditor = (section: Extract<Section, { type: 'lead' }>) => (
    <div className="space-y-4">
      <div>
        <Label>문의 유형</Label>
        <Select
          value={section.capture.kind}
          onValueChange={(value: 'email' | 'telegram' | 'none') => {
            updateSection({
              capture: { ...section.capture, kind: value }
            });
          }}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">사용 안함</SelectItem>
            <SelectItem value="email">이메일 폼</SelectItem>
            <SelectItem value="telegram">텔레그램 연결</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {section.capture.kind !== 'none' && (
        <>
          <div>
            <Label>섹션 제목</Label>
            <Input
              value={section.capture.title || ''}
              onChange={(e) => {
                updateSection({
                  capture: { ...section.capture, title: e.target.value }
                });
              }}
              placeholder="무료 상담 신청"
            />
          </div>
          
          <div>
            <Label>설명 문구</Label>
            <Textarea
              value={section.capture.note || ''}
              onChange={(e) => {
                updateSection({
                  capture: { ...section.capture, note: e.target.value }
                });
              }}
              placeholder="문의 사항을 남겨주시면 빠르게 답변드리겠습니다."
              rows={3}
            />
          </div>
        </>
      )}
    </div>
  );

  const renderSocialEditor = (section: Extract<Section, { type: 'social' }>) => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Label>소셜 링크</Label>
        <Button 
          size="sm"
          onClick={() => {
            const newLinks = [...section.links, {
              kind: 'telegram' as const,
              url: ''
            }];
            updateSection({ links: newLinks });
          }}
        >
          <Plus className="w-4 h-4 mr-1" />
          추가
        </Button>
      </div>
      
      <div className="space-y-3">
        {section.links.map((link, index) => (
          <Card key={index} className="p-3">
            <div className="flex gap-2">
              <Select
                value={link.kind}
                onValueChange={(value: any) => {
                  const newLinks = [...section.links];
                  newLinks[index] = { ...link, kind: value };
                  updateSection({ links: newLinks });
                }}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="telegram">Telegram</SelectItem>
                  <SelectItem value="youtube">YouTube</SelectItem>
                  <SelectItem value="x">X (Twitter)</SelectItem>
                  <SelectItem value="discord">Discord</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="site">Website</SelectItem>
                </SelectContent>
              </Select>
              
              <Input
                value={link.url}
                onChange={(e) => {
                  const newLinks = [...section.links];
                  newLinks[index] = { ...link, url: e.target.value };
                  updateSection({ links: newLinks });
                }}
                placeholder="URL 입력"
                className="flex-1"
              />
              
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  const newLinks = section.links.filter((_, i) => i !== index);
                  updateSection({ links: newLinks });
                }}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderWalletEditor = (section: Extract<Section, { type: 'wallet' }>) => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>CTOSS 토큰 잔고 표시</Label>
        <input
          type="checkbox"
          checked={section.showCtossBalance || false}
          onChange={(e) => {
            updateSection({ showCtossBalance: e.target.checked });
          }}
          className="rounded"
        />
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Section Selector */}
      <div>
        <Label>편집할 섹션</Label>
        <Select
          value={selectedSectionIndex.toString()}
          onValueChange={(value) => setSelectedSectionIndex(parseInt(value))}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {sections.map((section, index) => (
              <SelectItem key={index} value={index.toString()}>
                {section.type === 'hero' && '프로필'}
                {section.type === 'exchanges' && '거래소'}
                {section.type === 'products' && '상품'}
                {section.type === 'lead' && '문의'}
                {section.type === 'social' && '소셜'}
                {section.type === 'wallet' && '지갑'}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Section Editor */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">
            {selectedSection.type === 'hero' && '프로필 설정'}
            {selectedSection.type === 'exchanges' && '거래소 설정'}
            {selectedSection.type === 'products' && '상품 설정'}
            {selectedSection.type === 'lead' && '문의 설정'}
            {selectedSection.type === 'social' && '소셜 설정'}
            {selectedSection.type === 'wallet' && '지갑 설정'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {selectedSection.type === 'hero' && renderHeroEditor(selectedSection)}
          {selectedSection.type === 'exchanges' && renderExchangesEditor(selectedSection)}
          {selectedSection.type === 'products' && renderProductsEditor(selectedSection)}
          {selectedSection.type === 'lead' && renderLeadEditor(selectedSection)}
          {selectedSection.type === 'social' && renderSocialEditor(selectedSection)}
          {selectedSection.type === 'wallet' && renderWalletEditor(selectedSection)}
        </CardContent>
      </Card>
    </div>
  );
}